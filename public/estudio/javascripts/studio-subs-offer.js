import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene,SubsOfferTypeEnum} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";


import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            btn_ctl:{
                eidtOfferObj_already_change: false
            },
            subsProductsOptions: [],
            subsProductsSelectedItem: "",
            newOfferObj:{},
            eidtOfferObj:{},
            subs_offer_pagination:{
                url: "/api/v1/web_estudio/brand/subscription/offer/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    tag: "",
                    type: ""
                },
                paging: {},
                responesHandler: (response)=>{

                    if(response.code == 200){
                        this.subs_offer_pagination.size = response.offer.size;
                        this.subs_offer_pagination.current = response.offer.current;
                        this.subs_offer_pagination.total = response.offer.total;
                        this.subs_offer_pagination.pages = response.offer.pages;
                        this.subs_offer_pagination.records = response.offer.records;
                        this.subs_offer_pagination.paging = this.doPaging({current: response.offer.current, pages: response.offer.pages, size: 5});
                    }
                }
            }
        }
    },
    methods: {
        searchV(){
            this.subs_offer_pagination.param.tag = "";
            this.subs_offer_pagination.param.type = "";
            this.subs_offer_pagination.current = 1;
            this.subs_offer_pagination.size = 10;
            this.reloadPage(this.subs_offer_pagination);
        },
        filterV(){
            this.subs_offer_pagination.current = 1;
            this.subs_offer_pagination.size = 10;
            this.reloadPage(this.subs_offer_pagination);
        },
        showNewOfferModalV(){
            this.newOfferObj={};
            this.subsProductsSelectedItem="";

            $("#newOfferModal").modal("show");
        },
        createNewOfferV(){
            this.newOfferObj.forProductId=this.subsProductsSelectedItem;
            createNewOffer(this.newOfferObj);
        },
        changeOfferStatusV(offerId,status){
            changeOfferStatus(offerId,status);
        },
        showEditOfferModalV(offer){
            this.eidtOfferObj={
                offerId: offer.offerId,
                offerType: offer.offerType,
                name: offer.name,
                description: offer.description,
                discountAmount: offer.discountAmount,
                discountPercentage: offer.discountPercentage,
                capacity: offer.capacity
            }
            this.btn_ctl.eidtOfferObj_already_change=false;

            $("#editOfferModal").modal("show");

        },
        changeOfferV(){
            changeOffer(this.eidtOfferObj);
        },
        removeOfferV(id){
            removeOffer(id);
        },
        loadSubsProductListV(){
            loadSubsProductList(this);
        },
        renderOfferStatsV(coupon){
          if(!coupon.capacity){
            return ""
          }
          return (!coupon.claims?"0":coupon.claims) + "/"+ coupon.capacity;
        },
        copyValueToClipboardV(productCode){
            return copyValueToClipboard(productCode);
        },
        transformInputNumberV(event){
            return transformInputNumberAsPositive(event);
        },
        validateAddOfferFormV(){
            var checkedGerneral=!!this.newOfferObj.name && !!this.newOfferObj.description && !!this.newOfferObj.offerType ;
            var checkedPromoCodeAndCapacity=!!this.newOfferObj.promoCode && !!this.newOfferObj.capacity;

            var checkedQuarterlOrMonthlyCoupon=!!this.newOfferObj.discountPercentage && !!this.subsProductsSelectedItem;
            var checkedCashCoupon=!!this.subsProductsSelectedItem && !!this.newOfferObj.discountAmount && checkedPromoCodeAndCapacity;
            var checkedFullItemCoupon=!!this.newOfferObj.discountPercentage && checkedPromoCodeAndCapacity;
            var checkedFirstPeriodDiscountCoupon=!!this.subsProductsSelectedItem && !!this.newOfferObj.discountPercentage && checkedPromoCodeAndCapacity;

            var checkedResult = "";
            switch(this.newOfferObj.offerType){
        
                case SubsOfferTypeEnum.PAY_QUARTERLY_DISCOUNT_COUPON_SP:
                    checkedResult=checkedGerneral && checkedQuarterlOrMonthlyCoupon;
                    break; 
                case SubsOfferTypeEnum.PAY_YEARLY_DISCOUNT_COUPON_SP:
                    checkedResult=checkedGerneral && checkedQuarterlOrMonthlyCoupon;
                    break; 
                case SubsOfferTypeEnum.FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP:
                    checkedResult=checkedGerneral && checkedFirstPeriodDiscountCoupon;
                    break;  
                case SubsOfferTypeEnum.FIRST_PERIOD_CASH_PROMO_CODE_SP:
                    checkedResult=checkedGerneral && checkedCashCoupon;
                    break; 
                case SubsOfferTypeEnum.FULL_ITEM_DISCOUNT_PROMO_CODE:
                    checkedResult=checkedGerneral && checkedFullItemCoupon;
                    break;       
            }
            return checkedResult;

        },
        validateEditOfferV(){
            var checkedGerneral=!!this.eidtOfferObj.name && !!this.eidtOfferObj.description && !!this.eidtOfferObj.offerType && this.btn_ctl.eidtOfferObj_already_change;
            var checkedCapacity=!!this.eidtOfferObj.capacity;

            var checkedQuarterlOrMonthlyCoupon=!!this.eidtOfferObj.discountPercentage ;
            var checkedCashCoupon=!!this.eidtOfferObj.discountAmount && checkedCapacity;
            var checkedFullItemCoupon=!!this.eidtOfferObj.discountPercentage && checkedCapacity;
            var checkedFirstPeriodDiscountCoupon=!!this.eidtOfferObj.discountPercentage && checkedCapacity;

            var checkedResult = "";
            switch(this.eidtOfferObj.offerType){
        
                case SubsOfferTypeEnum.PAY_QUARTERLY_DISCOUNT_COUPON_SP:
                    checkedResult=checkedGerneral && checkedQuarterlOrMonthlyCoupon;
                    break; 
                case SubsOfferTypeEnum.PAY_YEARLY_DISCOUNT_COUPON_SP:
                    checkedResult=checkedGerneral && checkedQuarterlOrMonthlyCoupon;
                    break; 
                case SubsOfferTypeEnum.FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP:
                    checkedResult=checkedGerneral && checkedFirstPeriodDiscountCoupon;
                    break;  
                case SubsOfferTypeEnum.FIRST_PERIOD_CASH_PROMO_CODE_SP:
                    checkedResult=checkedGerneral && checkedCashCoupon;
                    break; 
                case SubsOfferTypeEnum.FULL_ITEM_DISCOUNT_PROMO_CODE:
                    checkedResult=checkedGerneral && checkedFullItemCoupon;
                    break;       
            }
            return checkedResult;
        },
        transformInputTextV(e){
            return transformInputText(e);
        }
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
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.component("model-select",ModelSelect);

app.mixin(new FriendListCompoent({need_init: false}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: false,
            onMessage: (e)=>{
                sellerSubsOfferPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

app.mixin(Pagination);

const sellerSubsOfferPage = app.mount('#app');

window.cSellerSubsOfferPage = sellerSubsOfferPage;


// init
sellerSubsOfferPage.pageInit(sellerSubsOfferPage.subs_offer_pagination);
sellerSubsOfferPage.loadSubsProductListV();

sellerSubsOfferPage.userAdapter(); // auth.js
sellerSubsOfferPage.fetchPrivateFriendV();// FriendListCompoent.js
sellerSubsOfferPage.sseInitV();// Ssecompoent.js
sellerSubsOfferPage.initEventFeedCompoentV(); // EventFeed.js


async function doCreateNewOffer(dto){
    const url = "/api/v1/web_estudio/brand/subscription/offer/new";
    return await axios.post(url,dto);
}
async function doChangeoOfferStatus(dto){
    const url = "/api/v1/web_estudio/brand/subscription/offer/modify_status";
    return await axios.put(url,dto);
}
async function doChangeOffer(dto){
    const url = "/api/v1/web_estudio/brand/subscription/offer/change";
    return await axios.put(url,dto);
}
async function delOneOffer(id){
    const url = "/api/v1/web_estudio/brand/subscription/offer/{id}/del".replace("{id}",id);
    return await axios.delete(url);
}
async function fetchSubsProductsArrInfo(){
    const url="/api/v1/web_estudio/brand/subscription/product/query?current=1&size=10000";
    return await fetch(url);
}
async function loadSubsProductList(appObj){
    const response = await fetchSubsProductsArrInfo();
    var data = await response.json();
    if(data.code==200){
       var subsProductsArr=[];
       data.product.records.forEach(element => {
        subsProductsArr.push({value: element.id,text: element.productName});
       });
       appObj.subsProductsOptions=subsProductsArr;
    }
}

async function removeOffer(id){
    delOneOffer(id).then(response=>{
        if(response.data.code==200){
       
            sellerSubsOfferPage.reloadPage(sellerSubsOfferPage.subs_offer_pagination); // refresh tb

        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }

    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

async function changeOffer(dto){
    doChangeOffer(dto).then(response=>{
        if(response.data.code==200){
            sellerSubsOfferPage.reloadPage(sellerSubsOfferPage.subs_offer_pagination); // refresh tb
            $("#editOfferModal").modal("hide");
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
        }

    }).catch(error=>{
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}
async function changeOfferStatus(offerId,status){
    const dto={
        offerId: offerId,
        status: status
    }
    doChangeoOfferStatus(dto).then(response=>{
        if(response.data.code==200){
            sellerSubsOfferPage.reloadPage(sellerSubsOfferPage.subs_offer_pagination); // refresh tb
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
        }

    }).catch(error=>{
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

async function createNewOffer(dto){
    doCreateNewOffer(dto).then(response=>{
        if(response.data.code==200){
            sellerSubsOfferPage.reloadPage(sellerSubsOfferPage.subs_offer_pagination); // refresh tb
            $("#newOfferModal").modal("hide");
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
        }
    }).catch(error=>{
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}


function  transformInputText(e){
    var val = e.target.value.replace(/[^\a-\z\A-\Z0-9\_]/g,'');// type int
    const needUpdate = (val !== e.target.value);
    if(needUpdate){
        e.target.value=val;
        e.currentTarget.dispatchEvent(new Event('input')); // update v-model
    }
}

$(function(){
	$(".tooltip-nav").tooltip();
});