import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {EventFeedScene, ProductStatus} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import Pagination  from "/common/javascripts/pagination-vue.js";

import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { transformInputText,transformInputNumberAsPositiveDecimal,transformInputNumberAsPositive } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            publishProduct: initPublishProduct(),
            editProduct: initEditProduct(),
            editProductOrigin: initEditProduct(),
            productList_pagination: {
                url: "/api/v1/web_estudio/physical_product/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {
                  q: '',
                  status: ""
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.productList_pagination.size = response.product.size;
                        this.productList_pagination.current = response.product.current;
                        this.productList_pagination.total = response.product.total;
                        this.productList_pagination.pages = response.product.pages;
                        this.productList_pagination.records = response.product.records;
                        this.productList_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, size: 5});
        
                    }
                }
            },
        }
    },
    methods: {
        transformInputNumberAsPositiveDecimalV(e){
            return transformInputNumberAsPositiveDecimal(e);
         },
         transformInputNumberAsPositiveV(e){
            return transformInputNumberAsPositive(e);
         },
         transformInputTextV(e){
            return transformInputText(e);
         },
        initProductListV(){
            this.productList_pagination.param.q = "";
            this.productList_pagination.param.status = "";
            this.productList_pagination.current = 1;
            this.productList_pagination.size = 10;
            this.reloadPage(this.productList_pagination);

        },
        reloadProductListV(){
            this.reloadPage(this.productList_pagination);
        },
        filterProductListV(){
            this.productList_pagination.current = 1;
            this.productList_pagination.size = 10;
            this.reloadPage(this.productList_pagination);
        },
        retrieveProductListV(){
            this.productList_pagination.param.status = "";
            this.productList_pagination.current = 1;
            this.productList_pagination.size = 10;
            this.reloadPage(this.productList_pagination);
        },
        delProductV(productId){
            delProduct(productId);
        },
        canEditProductV(product){
            return product.status != ProductStatus.Online;
        },
        productOnlineV(product){
            return product.status == ProductStatus.Online;
        },
        productDraftV(product){
            return product.status == ProductStatus.Draft;
        },
        productTakeOnlineV(product){
            changeProductStatus(product.productId, ProductStatus.Online);
        },
        productTakeOfflineV(product){
            changeProductStatus(product.productId, ProductStatus.Offline);
        },
        openPublishProductModalV(){
            releaseThumbnailPreview(this.publishProduct.thumbnailUrl);
            this.publishProduct = initPublishProduct();
        },
        previewPublishThumbnailV(e){
            previewPublishThumbnail(e, this);
        },
        triggerPublishThumbnailV(){
            $("#publishCoverFile").val(null);
            $("#publishCoverFile").trigger("click");
        },
        removePublishThumbnailV(){
            releaseThumbnailPreview(this.publishProduct.thumbnailUrl);
            this.publishProduct.thumbnailUrl = "";
            this.publishProduct.thumbnailFile = null;
            $("#publishCoverFile").val(null);
        },
        publishProductV(){
            publishProduct(this);
        },
        showEditProductModalV(product){
            releaseThumbnailPreview(this.editProduct.thumbnailUrl);
            this.editProduct = fillEditProductFrom(product);
            this.editProductOrigin = { ...this.editProduct }; // 打开弹窗时的基础信息基线，用于识别变更
            $("#editProductModal").modal("show"); // show modal
        },
        previewEditThumbnailV(e){
            previewEditThumbnail(e, this);
        },
        saveEditProductV(){
            saveEditProduct(this);
        }

    },
    computed: {
        canPublishProduct(){
            return publishProductIsValid(this.publishProduct);
        },
        canEditProduct(){
            return editProductIsValid(this.editProduct)
                && editProductBaseInfoChanged(this.editProduct, this.editProductOrigin);
        },
    },
    created() {
    },
    updated(){
        
        $(function() {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                physicalStorePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(CodeExplainComponent);

const physicalStorePage = app.mount('#app');
window.cPhysicalStorePage = physicalStorePage;

physicalStorePage.pageInit(physicalStorePage.productList_pagination);


async function doDelProduct(productId){
    const url ="/api/v1/web_estudio/physical_product/{product_id}/remove".replace("{product_id}",productId);
    return await axios.delete(url);
}

async function doChangeProductStatus(dto){
    const url = "/api/v1/web_estudio/physical_product/change_status";
    return await axios.put(url, dto);
}

async function doCreateProduct(formData){
    const url = "/api/v1/web_estudio/physical_product/create_product";
    return await axios.post(url, formData);
}

async function doEditProduct(dto){
    const url = "/api/v1/web_estudio/physical_product/edit";
    return await axios.put(url, dto);
}

async function doChangeThumbnail(productId, thumbnailFile){
    const url = "/api/v1/web_estudio/physical_product/thumbnail/change";
    const fd = new FormData();
    fd.append('productId', productId);
    fd.append('thumbnail', thumbnailFile);
    return await axios.put(url, fd);
}

async function delProduct(productId){
    doDelProduct(productId).then(response=>{
        if(response.data.code==200){
            physicalStorePage.reloadPage(physicalStorePage.productList_pagination);
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

function changeProductStatus(productId, status){
    const dto = { productId, status };
    doChangeProductStatus(dto).then(response=>{
        if(response.data.code==200){
            physicalStorePage.reloadPage(physicalStorePage.productList_pagination);
            customAlert.alert(status == ProductStatus.Online ? "商品已上架" : "商品已下架");
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}



$(function(){
	$(".tooltip-nav").tooltip();
});

function initPublishProduct(){
    return {
        productName: "",
        productCode: "",
        price: "",
        inventory: "",
        productDesc: "",
        warmReminder: "",
        thumbnailUrl: "",
        thumbnailFile: null
    };
}

// 预览图用的是 blob URL，丢掉预览时得 revoke，否则那张图片的文件句柄会被 URL 一直引用到页面卸载；
function releaseThumbnailPreview(url){
    if(url && url.startsWith("blob:")){
        URL.revokeObjectURL(url)
    }
}

function previewPublishThumbnail(e, appObj){
    const file = e.target.files && e.target.files[0];
    if(!file){
        return
    }
    if(file.size > 6 * 1024 * 1024){
        customAlert.alert("图片大小不能超过 6MB");
        e.target.value = null;
        return
    }
    // 一个 blob URL 同时用来量尺寸和当预览，不必先把整张图编码成 base64
    const previewUrl = URL.createObjectURL(file);
    // OSS 对图片像素有硬限制，先本地量一遍，免得上传到一半才被服务端打回
    const thumbnailImg = new Image();
    thumbnailImg.onload = () => {
        if(!(thumbnailImg.width >= 99 && thumbnailImg.height >= 99 && thumbnailImg.width < 4096 && thumbnailImg.height < 4096 && thumbnailImg.width * thumbnailImg.height < 9437184)){
            console.log("current image: width=" + thumbnailImg.width + "  height=" + thumbnailImg.height);
            customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
            URL.revokeObjectURL(previewUrl); // 这张不合格图不会进预览，URL 就地释放
            return
        }
        releaseThumbnailPreview(appObj.publishProduct.thumbnailUrl); // 重新选图，旧预览不再引用
        appObj.publishProduct.thumbnailUrl = previewUrl;
        appObj.publishProduct.thumbnailFile = file;
    };
    thumbnailImg.src = previewUrl;
    e.target.value = null; // 释放 input，保证下次选同一个文件仍能触发 change
}

function publishProductIsValid(p){
    return !!(p.thumbnailFile
        && p.productName
        && p.productCode
        && p.productDesc
        && p.warmReminder
        && Number(p.price) > 0
        && p.inventory !== "" && Number(p.inventory) >= 0);
}

function publishProduct(appObj){
    const p = appObj.publishProduct;
    if(!publishProductIsValid(p)){
        customAlert.alert("请先完整填写带 * 的必填项");
        return
    }

    const fd = new FormData();
    fd.append('thumbnail', p.thumbnailFile);
    fd.append('productName', p.productName);
    fd.append('productCode', p.productCode);
    fd.append('price', p.price);
    fd.append('inventory', p.inventory);
    fd.append('productDesc', p.productDesc);
    fd.append('warmReminder', p.warmReminder);

    doCreateProduct(fd).then(response=>{
        if(response.data.code==200){
            $("#publishProductModal").modal("hide");
            releaseThumbnailPreview(appObj.publishProduct.thumbnailUrl);
            appObj.publishProduct = initPublishProduct();
            appObj.initProductListV();
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}


function initEditProduct(){
    return {
        productId: null,
        productName: "",
        productCode: "",
        price: "",
        inventory: "",
        productDesc: "",
        warmReminder: "",
        thumbnailUrl: ""
    };
}

function fillEditProductFrom(product){
    const form = initEditProduct();
    form.productId = product.productId;
    form.productCode = product.productCode;
    form.productName = product.productName;
    form.price = product.price;
    form.thumbnailUrl = product.thumbnail;
    form.inventory = product.inventory;
    form.warmReminder = product.warmReminder;
    form.productDesc = product.productDesc;
    return form;
}

function previewEditThumbnail(e, appObj){
    const file = e.target.files && e.target.files[0];
    if(!file){
        return
    }
    if(file.size > 6 * 1024 * 1024){
        customAlert.alert("图片大小不能超过 6MB");
        e.target.value = null;
        return
    }
    const productId = appObj.editProduct.productId;
    if(!productId){
        customAlert.alert("商品标识缺失，无法上传主图");
        e.target.value = null;
        return
    }

    const errPrefix = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：";
    // 一个 blob URL 同时用来量尺寸和当预览，不必先把整张图编码成 base64
    const previewUrl = URL.createObjectURL(file);
    // 与发布主图同一套 OSS 像素限制：量不过就不白跑一次上传，也不让服务端的旧主图被不合格图片顶掉
    const thumbnailImg = new Image();
    thumbnailImg.onload = () => {
        if(!(thumbnailImg.width >= 99 && thumbnailImg.height >= 99 && thumbnailImg.width < 4096 && thumbnailImg.height < 4096 && thumbnailImg.width * thumbnailImg.height < 9437184)){
            console.log("current image: width=" + thumbnailImg.width + "  height=" + thumbnailImg.height);
            customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
            URL.revokeObjectURL(previewUrl); // 这张不合格图不会上传也不会进预览，URL 就地释放
            return
        }
        doChangeThumbnail(productId, file).then(response=>{
            if(response.data.code==200){
                releaseThumbnailPreview(appObj.editProduct.thumbnailUrl); // 换掉弹窗里原本的预览
                appObj.editProduct.thumbnailUrl = previewUrl;
                appObj.reloadProductListV();
                customAlert.alert("主图已更新");
            }else{
                URL.revokeObjectURL(previewUrl); // 上传没成，这张不会出现在界面上
                customAlert.alert(errPrefix + response.data.message);
            }
        }).catch(error=>{
            URL.revokeObjectURL(previewUrl);
            customAlert.alert(errPrefix + error);
        });
    };
    thumbnailImg.src = previewUrl;
    e.target.value = null; // 释放 input，保证下次选同一个文件仍能触发 change
}

function editProductIsValid(p){
    return !!(p.productId
        && p.productName
        && p.productCode
        && p.productDesc
        && p.warmReminder
        && Number(p.price) > 0
        && p.inventory !== "" && Number(p.inventory) >= 0);
}


function editProductBaseInfoChanged(p, origin){
    return p.productName != origin.productName
        || p.productCode != origin.productCode
        || p.price != origin.price
        || p.inventory != origin.inventory
        || p.productDesc != origin.productDesc
        || p.warmReminder != origin.warmReminder;
}

// 编辑商品基础信息
async function saveEditProduct(appObj){
    const p = appObj.editProduct;
    if(!editProductIsValid(p)){
        customAlert.alert("请先完整填写带 * 的必填项");
        return
    }

    const errPrefix = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：";
    const dto = {
        productId: p.productId,
        productName: p.productName,
        productCode: p.productCode,
        price: p.price,
        inventory: p.inventory,
        productDesc: p.productDesc,
        warmReminder: p.warmReminder
    };
  
    await doEditProduct(dto).then(response=>{
        if(response.data.code==200){
            $("#editProductModal").modal("hide");
            releaseThumbnailPreview(appObj.editProduct.thumbnailUrl);
            appObj.editProduct = initEditProduct();
            appObj.editProductOrigin = initEditProduct();
            appObj.reloadProductListV();
            customAlert.alert("商品修改已保存");
        }
        if(response.data.code!=200){
            customAlert.alert(errPrefix + response.data.message);
        }
   }).catch(error=>{
        customAlert.alert(errPrefix + error);
    });
   

}
