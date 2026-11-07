import axios from 'axios';
import { goLoginPage } from "/common/javascripts/pagenav.js";
import {ProductStatus} from "/common/javascripts/tm-constant.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const REQUEST_FAIL_TIP = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：";

// 购物车数据按商家分桶存储，key 为「前缀:brandId」，进入商家店铺页只能查看当前商家对购物数据
// 桶里存 {items, accessedAt}：accessedAt 在每次打开该商家页面时刷新，超过 24 小时没被访问的桶整体回收
const CART_STORAGE_KEY = "mall-physical-cart";
const CHECKOUT_INFO_STORAGE_KEY = "mall-physical-checkout-info";

// 每种商品最多买 99 件，
const MAX_QUANTITY = 99;

// 每次订单最多可以购买 50 种商品
const MAX_ITEMS = 50;

// 库存只在 ≤ 5 件时报数（稀缺提醒），常规库存不向买家暴露商家的备货深度
const LOW_STOCK_TIP_MAX = 5;

const CART_STALE_MS = 24 * 60 * 60 * 1000;

// 单笔交易金额最多支持
const MAX_ORDER_AMOUNT = 999999.99;

function loadFromStorage(key){
    try {
        return JSON.parse(localStorage.getItem(key)) || null;
    } catch (e) {
        return null;
    }
}
function saveToStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

// 客户端没有定时任务，“没访问”的商家购物车数据只能在下一次有人打开页面时才能被发现，
// 所以回收放在加载自己的桶之前：顺带扫掉其他商家 24 小时没人回的残留桶
function pruneStaleCarts(){
    const now = Date.now();
    Object.keys(localStorage)
        .filter(key => key.startsWith(CART_STORAGE_KEY + ":"))
        .forEach(key => {
            const cart = loadFromStorage(key);
            if(!cart || now - (cart.accessedAt || 0) > CART_STALE_MS){
                localStorage.removeItem(key);
            }
        });
}


async function fetchPhysicalProducts(queryParam){
    const query = new URLSearchParams({
        brandId: queryParam.brandId,
        size: queryParam.size,
        current: queryParam.current,
        q: queryParam.q
    });
    const url = "/api/v1/web_mall/brand/physical_product?" + query.toString();
    return await axios.get(url);
}
async function fetchPhysicalProductProfile(productId){
    const url = "/api/v1/web_mall/physical_product/{product_id}/info".replace("{product_id}",productId);
    return await axios.get(url);
}
async function submitPhysicalOrder(payload){
    const url = "/api/v1/mall/physical_product/new_order";
    return await axios.post(url, payload);
}

// 精致好物：列表、商品弹窗、购物车与结算这条链路的状态与动作，整体挂在 mixin 上，

const PhysicalGoodsComponent = {
    data() {
        return {
            bubbles: [],
            productModalObj: {
                product: null,
                quantity: 1
            },
            editingCartId: null,
            // 购物车数据
            cartItems: [],
            checkoutModalObj: {
                form: Object.assign({recipient: "", recipientPhone: "", shippingAddress: ""}, loadFromStorage(CHECKOUT_INFO_STORAGE_KEY)),
                submitting: false,
                done: false,
                // 40007（余额不足）置 true：指导下一步用户行为
                pendingPayment: false,
                validated: false,
                orderInfo: { recipient: "", recipientPhone: "", shippingAddress: "" },
                orderAmount: "0.00"
            },
            physical: {
                records: [],
                queryParam: {
                    brandId: "",
                    q: "",
                    current: 1,
                    size: 12,
                    loading: false,
                    pages: ""
                }
            }
        }
    },
    computed: {
        // 当前商家的购物车桶，读写都以这个 key 为准
        cartStorageKey(){
            return CART_STORAGE_KEY + ":" + this.physical.queryParam.brandId;
        },
        cartCount(){
            return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        },
        cartTotal(){
            return this.cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2);
        },
        purchasable(){
            const product = this.productModalObj.product;
            if(!product){
                return false
            }
            // 列表不回在架状态，详情未到位前只按库存拦截
            return product.status !== ProductStatus.Offline && !this.isSoldOutV(product);
        },
        statusOnline(){
            return this.productModalObj.product && this.productModalObj.product.status === ProductStatus.Online;
        },
        inCart(){
            const product = this.productModalObj.product;
            if(!product){
                return false
            }
            return this.cartItems.some(item => item.productId === product.productId);
        },
        submitLabel(){
            if(this.productModalObj.product && this.productModalObj.product.status === ProductStatus.Offline){
                return "已下架"
            }
            if(!this.purchasable){
                return "已售罄"
            }
            // 已加入时cta描述变为「再加 N 件」，与在购物车里的件数无关，不会让用户误以为可撤销
            return this.inCart ? "再加 " + this.productModalObj.quantity + " 件" : "加入购物车";
        },
        modalSubtotal(){
            if(!this.productModalObj.product){
                return "0.00"
            }
            return (Number(this.productModalObj.product.price) * this.productModalObj.quantity).toFixed(2);
        },
        // 只有“快卖完了”才值得占一行：常规库存数对买家没有决策价值，对商家又是备货隐私；
        // 卖完的情形不从这里出口，走 purchasable → 已售罄 与列表的售罄标签
        lowStockRemaining(){
            const product = this.productModalObj.product;
            if(!product){
                return false
            }
            const inventory = Number(product.inventory);
            return inventory > 0 && inventory <= LOW_STOCK_TIP_MAX ? inventory : false;
        }
    },
    methods: {
        isSoldOutV(product){
            return Number(product.inventory) <= 0;
        },
        productMaxQty(product){
            return Math.min(MAX_QUANTITY, Number(product.inventory));
        },
        lineSubtotalV(item){
            return (Number(item.price) * item.quantity).toFixed(2);
        },
        async showProductModalV(product){
            this.productModalObj.quantity = 1;
            this.productModalObj.product = null;
            this.bubbles=[];
            try {
                const response = await fetchPhysicalProductProfile(product.productId);
                if(response.data.code != 200){
                    customAlert.alert(REQUEST_FAIL_TIP + response.data.message);
                    return
                }
                this.productModalObj.product = response.data.profile;
                $("#productModal").modal("show");
            } catch (error) {
                customAlert.alert(REQUEST_FAIL_TIP + error);
            }
        },
        pushCartV(product, quantity){
            const maxItems= this.cartItems.length;
            if(maxItems>=MAX_ITEMS) {
                customAlert.alert("一次最多下单 50 种商品，购物车已加满，请先结算或移除部分商品。")
                return;
            }
            const maxQty = this.productMaxQty(product);
            const existed = this.cartItems.find(item => item.productId === product.productId);
            if(existed){
                existed.quantity = Math.min(maxQty, existed.quantity + quantity);
            } else {
                // 购物车行就是商品本体加一个数量，不重建字段
                this.cartItems.push({ ...product, quantity: Math.min(maxQty, quantity) });
            }
            this.persistCartV();
            this.handleBubbleV();
        },
        addToCartV(){
            if(!this.purchasable){
                return
            }
            this.pushCartV(this.productModalObj.product, this.productModalObj.quantity);
        },
        handleBubbleV(){
            const bubbleId = Date.now() + Math.random();
            
            const randomX = Math.floor(Math.random() * 25) - 12; 
            
            this.bubbles.push({
                id: bubbleId,
                count: this.productModalObj.quantity,
                style: {
                    left: `calc(74% + ${randomX}px)` 
                }
            });

            setTimeout(() => {
                this.bubbles = this.bubbles.filter(b => b.id !== bubbleId);
            }, 700); 
        },
        increaseCartItemQuantityV(index){
            const item = this.cartItems[index];
            if(item.quantity < this.productMaxQty(item)){
                item.quantity++;
                this.persistCartV();
            }
        },
        decreaseCartItemQuantityV(index){
            if(this.cartItems[index].quantity > 1){
                this.cartItems[index].quantity--;
                this.persistCartV();
            }
        },
        removeCartItemV(index){
            const [removed] = this.cartItems.splice(index, 1);
            // 行处于数量调整态时被移除，同时退出调整态，避免编辑一个已不存在的 productId
            if(removed && this.editingCartId === removed.productId){
                this.editingCartId = null;
            }
            this.persistCartV();
        },
        checkoutV(){
            if(!this.user_already_login){
                goLoginPage();
                return
            }
            // 起送价在开结算弹窗前就拦
            const minDeliveryAmount = Number(this.homeInfo.minDeliveryAmount);
            if(Number.isFinite(minDeliveryAmount) && Number(this.cartTotal) < minDeliveryAmount){
                customAlert.alert("订单金额 ￥" + this.cartTotal + "，未达本店 ￥" + minDeliveryAmount + " 起送标准，请继续挑选商品。");
                return
            }
            
            if(Number(this.cartTotal) > MAX_ORDER_AMOUNT){
                customAlert.alert("订单总额已超过单笔交易上限 ￥" + MAX_ORDER_AMOUNT + "，请调整需要购买的商品或分多次下单。");
                return
            }
            this.checkoutModalObj.validated = false;
            this.checkoutModalObj.done = false;
            // 上一单是不是待支付只对那一次结果视图有意义，每次开弹窗从头算，不拿旧状态渲染新单
            this.checkoutModalObj.pendingPayment = false;
            this.checkoutModalObj.submitting = false;
            $("#cartPanel").offcanvas("hide");
            $("#checkoutModal").modal("show");
        },
        backToCartV(){
            // modal 隐藏带过渡，立刻开 offcanvas 会和背景层、body 滚动条补偿相互干扰，
            // 所以等 hidden.bs.modal；用 one() 触发即注销，不会被之后的关闭动作误命中
            $('#checkoutModal').one('hidden.bs.modal', () => {
                $('#cartPanel').offcanvas('show');
            });
            $('#checkoutModal').modal('hide');
        },
        async submitOrderV(){
            if(this.checkoutModalObj.submitting){
                return
            }
            this.checkoutModalObj.validated = true;
            const form = document.getElementById('checkout-form');
            if(!form.checkValidity()){
                return
            }
    
            if(this.cartItems.length === 0){
                return
            }
            this.checkoutModalObj.submitting = true;
            try {
                saveToStorage(CHECKOUT_INFO_STORAGE_KEY, this.checkoutModalObj.form);
                const payload = {
                    items: this.cartItems.map(item => ({productId: item.productId, quantity: String(item.quantity)})),
                    ...this.checkoutModalObj.form
                };
                const response = await submitPhysicalOrder(payload);
                // 40007 = 账户余额不足，后端已经建好订单并预留了商品，只是这一笔没扣成功。
                // 收尾与下单成功完全一致（快照 → 清车 → 切结果视图 → 重拉列表刷库存），
                // 因为购物车必须清空：订单已落库，留着让顾客再点一次「提交订单」就是重复下单；
                // 待支付单的付款动作在【履约中心】的「继续支付」里完成
                const pendingPayment = response.data.code == 40007;
                if(response.data.code != 200 && !pendingPayment){
                    customAlert.alert(REQUEST_FAIL_TIP + response.data.message);
                    return
                }
                // 成功页展示提交那一刻的金额与收货信息快照；订单已落库，购物车即时清空
                this.checkoutModalObj.pendingPayment = pendingPayment;
                this.checkoutModalObj.orderAmount = this.cartTotal;
                this.checkoutModalObj.orderInfo = { ...this.checkoutModalObj.form };
                this.cartItems = [];
                this.editingCartId = null;
                this.persistCartV();
                this.checkoutModalObj.done = true;
                // 下单已消耗库存，请求最新的商品列表
                this.clearPhysicalSearchV();
            } catch (error) {
                customAlert.alert(REQUEST_FAIL_TIP + error);
            } finally {
                this.checkoutModalObj.submitting = false;
            }
        },
        finishCheckoutV(){
            this.checkoutModalObj.done = false;
            $("#checkoutModal").modal("hide");
        },
        clearPhysicalSearchV(){
            this.physical.queryParam.q = "";
            this.refreshPhysicalListV();
        },
        refreshPhysicalListV(){
            // loading 是这条链路的互斥锁（与 infinitePhysicalProduct、首屏加载共用）：只允许一个请求在飞，
            // 撞上在飞请求时这一次不执行，输入框文字还在，再按一次回车就行；
            // 不清 records、不清 pages：旧列表原地顶住高度，由第一页的响应直接替换，先清空会闪
            if(this.physical.queryParam.loading){
                return
            }
            this.physical.queryParam.current = 1;
            this.physical.queryParam.loading = true;
            this.loadPhysicalProducts(this.physical.queryParam);
        },
        loadBrandCartV(){
            pruneStaleCarts();
            this.cartItems = loadFromStorage(this.cartStorageKey)?.items || [];
            // 打开页面就算一次访问，当场回写时间戳重新计时；空车不留桶
            this.persistCartV();
        },
        persistCartV(){
            if(this.cartItems.length === 0){
                localStorage.removeItem(this.cartStorageKey);
                return;
            }
            saveToStorage(this.cartStorageKey, {items: this.cartItems, accessedAt: Date.now()});
        },
        infinitePhysicalHandler(){
            this.infinitePhysicalProduct();
        },
        infinitePhysicalProduct(){
            if(!this.physical.queryParam.brandId || this.physical.queryParam.loading ){
                return
            }
            if(this.physical.queryParam.current +1 > this.physical.queryParam.pages){
                return ;
            }
            // loading data
            this.physical.queryParam.loading = true;
            this.physical.queryParam.current = this.physical.queryParam.current + 1;
            this.loadPhysicalProducts(this.physical.queryParam);
        },
        // loading 由调用方掌握；
        // 第一页整体替换（首屏 / 搜索 / 下单后重拉），往后翻页才是追加
        async loadPhysicalProducts(queryParam){
            fetchPhysicalProducts(queryParam).then(response=>{
                if(response.data.code == 200){
                    if(queryParam.current === 1){
                        this.physical.records = [...response.data.product.records];
                    } else {
                        this.physical.records.push(...response.data.product.records);
                    }
                    this.physical.queryParam.pages=response.data.product.pages;
                }
            }).catch(error=>{
                customAlert.alert(REQUEST_FAIL_TIP + error);
            }).finally(()=>{
                // 网络异常也必须释放 loading，否则「显示更多」与搜索/下单后的重拉会永久失效
                this.physical.queryParam.loading = false;
            });
        }
    }
}
export default PhysicalGoodsComponent;
