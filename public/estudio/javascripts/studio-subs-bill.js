import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import { EventFeedScene } from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination from "/common/javascripts/pagination-vue.js";
import { Api } from "/common/javascripts/common-api.js";

import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            subsBillRefundObj: {
                billId: "",
                term: ""
            },
            hostingPartner: "",
            subs_bill_pagination: {
                url: "/api/v1/web_estudio/brand/subscription/bill/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    tag: ""
                },
                paging: {},
                responesHandler: (response) => {

                    if (response.code == 200) {
                        this.subs_bill_pagination.size = response.bill.size;
                        this.subs_bill_pagination.current = response.bill.current;
                        this.subs_bill_pagination.total = response.bill.total;
                        this.subs_bill_pagination.pages = response.bill.pages;
                        this.subs_bill_pagination.records = response.bill.records;
                        this.subs_bill_pagination.paging = this.doPaging({ current: response.bill.current, pages: response.bill.pages, size: 5 });
                    }
                }
            }
        }
    },
    methods: {
        searchV() {
            this.subs_bill_pagination.param.tag = "";
            this.subs_bill_pagination.current = 1;
            this.subs_bill_pagination.size = 10;
            this.reloadPage(this.subs_bill_pagination);
        },

        filterByStatusV() {
            this.subs_bill_pagination.current = 1;
            this.subs_bill_pagination.size = 10;
            this.reloadPage(this.subs_bill_pagination);
        },
        showSubsBillRefundModalV(bill) {
            this.subsBillRefundObj = {
                billId: bill.billId,
                transNo: bill.transNo,
                term: ""
            };
            $("#subsBillRefundModal").modal("show"); // show modal
        },
        subsBillRefundV() {

            Api.subscriptionBillRefund(this.subsBillRefundObj.billId, this.subsBillRefundObj.term).then(response => {
                if (response.data.code == 200) {
                    this.reloadPage(this.subs_bill_pagination);
                    $("#subsBillRefundModal").modal("hide");
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }

            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });
        },
        fetchBluvarrierV() {
            fetchBluvarrier();
        },
        explianStatusV(status) {
            return explianStatus(status);
        },
        exlpainWhereStoreMoneyV(mark) {
            return exlpainWhereStoreMoney(mark)
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
                sellerSubsBillPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

app.mixin(Pagination);

const sellerSubsBillPage = app.mount('#app');

window.cSellerSubsBillPagePage = sellerSubsBillPage;



sellerSubsBillPage.pageInit(sellerSubsBillPage.subs_bill_pagination);

async function doFetchBluvarrier() {
    const url = "/api/v1/web_mall/bluvarrier";
    return await axios.get(url);
}
async function fetchBluvarrier() {
    doFetchBluvarrier().then(response => {
        if (response.data.code == 200) {
            sellerSubsBillPage.hostingPartner = response.data.bluvarrier.customerId;
        }
    })
}

sellerSubsBillPage.fetchBluvarrierV();

function exlpainWhereStoreMoney(mark) {
    var markDesc = "";
    switch (mark) {
        case "mid":
            markDesc = "平台托管中";
            break;
        case "seller":
            markDesc = "已收回货款";
            break;
        case "buyer":
            markDesc = "已退回款项";
            break;
    }
    return markDesc;
}



function explianStatus(status) {
    var statusDesc = "";
    switch (status) {
        case "freeze":
            statusDesc = "试用中";
            break;
        case "open":
            statusDesc = "支付中";
            break;
        case "void":
            statusDesc = "已失效";
            break;
        case "paid":
            statusDesc = "已支付";
            break;
        case "refunded":
            statusDesc = "已退款";
            break;
    }
    return statusDesc;
}

$(function () {
    $(".tooltip-nav").tooltip();
});