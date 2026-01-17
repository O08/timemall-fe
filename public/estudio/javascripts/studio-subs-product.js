import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import { EventFeedScene, EnvWebsite } from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination from "/common/javascripts/pagination-vue.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
        return {

            btn_ctl: {
                editProductObj_already_change: false
            },
            newProductObj: {
                productName: "",
                productCode: "",
                productDesc: "",
            },
            editProductObj: {
                productName: "",
                productCode: "",
                productDesc: "",
                productId: ""
            },
            subs_product_pagination: {
                url: "/api/v1/web_estudio/brand/subscription/product/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: ""
                },
                paging: {},
                responesHandler: (response) => {

                    if (response.code == 200) {
                        this.subs_product_pagination.size = response.product.size;
                        this.subs_product_pagination.current = response.product.current;
                        this.subs_product_pagination.total = response.product.total;
                        this.subs_product_pagination.pages = response.product.pages;
                        this.subs_product_pagination.records = response.product.records;
                        this.subs_product_pagination.paging = this.doPaging({ current: response.product.current, pages: response.product.pages, size: 5 });
                    }
                }
            }
        }
    },
    methods: {
        searchV() {
            this.subs_product_pagination.param.tag = "";
            this.subs_product_pagination.current = 1;
            this.subs_product_pagination.size = 10;
            this.reloadPage(this.subs_product_pagination);
        },

        showNewProductModalV() {
            this.newProductObj = {
                productName: "",
                productCode: "",
                productDesc: "",
            }
            $("#newProductModal").modal("show");
        },
        validateNewProductFormV() {
            return !!this.newProductObj.productName && !!this.newProductObj.productCode && !!this.newProductObj.productDesc
        },
        createProductV() {
            createProduct(this.newProductObj);
        },
        showEditProductModalV(product) {
            this.btn_ctl.editProductObj_already_change = false;
            var tm = JSON.parse(JSON.stringify(product));
            this.editProductObj = {
                productName: tm.productName,
                productCode: tm.productCode,
                productDesc: tm.productDesc,
                productId: tm.id
            }
            $("#editProductModal").modal("show");

        },
        validateEditProductFormV() {
            return !!this.editProductObj.productName && !!this.editProductObj.productCode && !!this.editProductObj.productDesc && this.btn_ctl.editProductObj_already_change
        },
        changeProductV() {
            changeProduct(this.editProductObj);
        },
        removeProductV(productId) {
            removeProduct(productId);
        },
        copyValueToClipboardV(productCode) {
            const content = currentDomain + this.getProcutViewUrlV(productCode,'hard');
            return copyValueToClipboard(content);
        },
        getProcutViewUrlV(productCode,mode){
            const userHandle = this.getIdentity().handle; // from auth.js
            const content = "/" + userHandle + "/" + productCode + "/subscription?mode="+mode;
            return content;
        },
        transformInputTextV(e){
            return transformInputText(e);
        }

    },
    updated() {

        $(function () {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({ need_permission: true }));
app.mixin(new EventFeed({
    need_fetch_event_feed_signal: true,
    need_fetch_mutiple_event_feed: false,
    scene: EventFeedScene.STUDIO
}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({ need_init: true }));

app.mixin(
    new Ssecompoent({
        sslSetting: {
            need_init: true,
            onMessage: (e) => {
                sellerSubsPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

app.mixin(Pagination);

const sellerSubsPage = app.mount('#app');

window.cSellerSubsPagePage = sellerSubsPage;



sellerSubsPage.pageInit(sellerSubsPage.subs_product_pagination);


async function doModifyProductInfo(dto) {
    const url = "/api/v1/web_estudio/brand/subscription/product/change";
    return await axios.put(url, dto);
}
async function delOneProduct(id) {
    const url = "/api/v1/web_estudio/brand/subscription/product/{id}/del".replace("{id}", id);
    return await axios.delete(url);
}
async function doCreateProduct(dto) {

    const url = "/api/v1/web_estudio/brand/subscription/product/new";
    return await axios.post(url, dto);

}
async function createProduct(dto) {
    doCreateProduct(dto).then(response => {
        if (response.data.code == 200) {

            sellerSubsPage.reloadPage(sellerSubsPage.subs_product_pagination);
            $("#newProductModal").modal("hide");

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function removeProduct(id) {
    delOneProduct(id).then(response => {
        if (response.data.code == 200) {

            sellerSubsPage.reloadPage(sellerSubsPage.subs_product_pagination);

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }

    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function changeProduct(dto) {
    doModifyProductInfo(dto).then(response => {
        if (response.data.code == 200) {

            sellerSubsPage.reloadPage(sellerSubsPage.subs_product_pagination);
            sellerSubsPage.btn_ctl.editProductObj_already_change = false;
            $("#editProductModal").modal("hide");

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }
    }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
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


$(function () {
    $(".tooltip-nav").tooltip();
});