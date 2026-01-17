import "vue-search-select/dist/VueSearchSelect.css";
import { ModelSelect } from 'vue-search-select';
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
import { transformInputNumberAsPositive, transformInputNumberAsPositiveDecimal } from "/common/javascripts/util.js";

import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
        return {
            btn_ctl: {
                eidtPlanObj_already_change: false
            },
            subsProductsOptions: [],
            subsProductsSelectedItem: "",
            newPlanObj: {
                featuresObj: []
            },
            eidtPlanObj: {
                featuresObj: []
            },
            subs_plan_pagination: {
                url: "/api/v1/web_estudio/brand/subscription/plan/query",
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
                        this.subs_plan_pagination.size = response.plan.size;
                        this.subs_plan_pagination.current = response.plan.current;
                        this.subs_plan_pagination.total = response.plan.total;
                        this.subs_plan_pagination.pages = response.plan.pages;
                        this.subs_plan_pagination.records = response.plan.records;
                        this.subs_plan_pagination.paging = this.doPaging({ current: response.plan.current, pages: response.plan.pages, size: 5 });
                    }
                }
            }
        }
    },
    methods: {
        searchV() {
            this.subs_plan_pagination.param.tag = "";
            this.subs_plan_pagination.current = 1;
            this.subs_plan_pagination.size = 10;
            this.reloadPage(this.subs_plan_pagination);
        },
        filterByStatusV() {
            this.subs_plan_pagination.current = 1;
            this.subs_plan_pagination.size = 10;
            this.reloadPage(this.subs_plan_pagination);
        },
        loadSubsProductListV() {
            loadSubsProductList(this);
        },
        exlpainPlanTypeV(planType) {
            var planTypeDesc = "";
            if (planType == "standard") {
                planTypeDesc = "标准型"
            }
            if (planType == "flex") {
                planTypeDesc = "灵活型"
            }
            return planTypeDesc;
        },

        explainPlanStatusV(stauts) {
            var statusDesc = "";
            if (stauts == "1") {
                statusDesc = "待上架"
            }
            if (stauts == "2") {
                statusDesc = "售卖中"
            }
            if (stauts == "3") {
                statusDesc = "已下架"
            }
            return statusDesc;
        },
        changePlanStatusV(plandId, status) {
            changePlanStatus(plandId, status);
        },
        showNewPlanModalV() {
            this.newPlanObj = {
                productId: "",
                planName: "",
                planType: "standard",
                price: "",
                description: "",
                featuresObj: [{ title: "", description: "" }],
                features: "",
                featuresJson: "",
                trialPeriod: "",
                gracePeriod: ""
            }
            this.subsProductsSelectedItem = "";
            $("#newPlanModal").modal("show");
        },
        addNewPlanFeatureV() {
            this.newPlanObj.featuresObj.push({ title: "", description: "" })
        },
        createOnePlanV() {
            this.newPlanObj.productId = this.subsProductsSelectedItem;
            this.newPlanObj.features = JSON.stringify(this.newPlanObj.featuresObj);
            createOnePlan(this.newPlanObj);
        },
        showEditPlanModalV(id) {
            this.btn_ctl.eidtPlanObj_already_change=false;
            this.eidtPlanObj = {
                featuresObj: []
            },
                fetchPlanInfo(id).then(response => {

                    if (response.data.code == 200) {
                        const plan = response.data.plan;
                        this.eidtPlanObj = {
                            planId: id,
                            planName: plan.planName,
                            price: plan.price,
                            description: plan.description,
                            featuresObj: plan.features,
                            features: "",
                            trialPeriod: plan.trialPeriod,
                            gracePeriod: plan.gracePeriod
                        }
                        $("#editPlanModal").modal("show");
                    }
                    if (response.data.code != 200) {
                        const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                        customAlert.alert(error);
                    }

                }).catch(error => {
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
                });


        },
        addNewEditPlanFeatureV() {
            this.eidtPlanObj.featuresObj.push({ title: "", description: "" })
        },
        changePlanV() {
            this.eidtPlanObj.features = JSON.stringify(this.eidtPlanObj.featuresObj);
            changePlan(this.eidtPlanObj);
        },
        removePlanV(id) {
            removePlan(id);
        },
        transformInputNumberV(event) {
            return transformInputNumberAsPositive(event);
        },
        transformInputNumberAsPositiveDecimalV(event) {
            return transformInputNumberAsPositiveDecimal(event);
        },
        validateNewPlanFormV() {
            if (this.newPlanObj.featuresObj.length == 0) {
                return false;
            }
            var existsFeaturesTitleIsBlank = this.newPlanObj.featuresObj.some(e => !e.title);
            if (existsFeaturesTitleIsBlank) {
                return false;
            }
            var existsFeaturesDescriptionIsBlank = this.newPlanObj.featuresObj.some(e => !e.description);
            if (existsFeaturesDescriptionIsBlank) {
                return false;
            }
            return !!this.subsProductsSelectedItem && !!this.newPlanObj.planName && !!this.newPlanObj.planType && !!this.newPlanObj.price && Number(this.newPlanObj.price)>0 && !!this.newPlanObj.description;
        },
        validateEditPlanFormV() {
            if (this.eidtPlanObj.featuresObj.length == 0) {
                return false;
            }
            var existsFeaturesTitleIsBlank = this.eidtPlanObj.featuresObj.some(e => !e.title);
            if (existsFeaturesTitleIsBlank) {
                return false;
            }
            var existsFeaturesDescriptionIsBlank = this.eidtPlanObj.featuresObj.some(e => !e.description);
            if (existsFeaturesDescriptionIsBlank) {
                return false;
            }

            return !!this.eidtPlanObj.planName && !!this.eidtPlanObj.price && Number(this.eidtPlanObj.price)>0 && !!this.eidtPlanObj.description && this.btn_ctl.eidtPlanObj_already_change;
        },
        copyValueToClipboardV(plan) {
            const innerUrl=this.getPlanViewUrlV(plan);
            const content = currentDomain + innerUrl;
            return copyValueToClipboard(content);
        },
        getPlanViewUrlV(plan){
            const userHandle = this.getIdentity().handle; // from auth.js
            const onePlanContent =  "/" + userHandle + "/" + plan.productCode + "/" + plan.id + "/subscription?planType=" + plan.planType + "&mode=";
            var mode = "hard";
            if (plan.status == '1' || plan.status == '3') {
                mode = "easy";
            }
            return onePlanContent + mode;
        },
        newPlanObjRemoveOneFeatureV(index) {
            this.newPlanObj.featuresObj.splice(index, 1);
        },
        newPlanObjAddOneFeatureBelowV(index) {
            this.newPlanObj.featuresObj.splice(index + 1, 0, { title: "", description: "" });
        },
        newPlanObjAddOneFeatureUpV(index) {
            this.newPlanObj.featuresObj.splice(index, 0, { title: "", description: "" });
        },
        editPlanObjRemoveOneFeatureV(index) {
            this.eidtPlanObj.featuresObj.splice(index, 1);
        },
        editPlanObjAddOneFeatureBelowV(index) {
            this.eidtPlanObj.featuresObj.splice(index + 1, 0, { title: "", description: "" });
        },
        editPlanObjAddOneFeatureUpV(index) {
            this.eidtPlanObj.featuresObj.splice(index, 0, { title: "", description: "" });
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
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(new EventFeed({
    need_fetch_event_feed_signal: true,
    need_fetch_mutiple_event_feed: false,
    scene: EventFeedScene.STUDIO,need_init: false
}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: false}));
app.component("model-select", ModelSelect);

app.mixin(
    new Ssecompoent({
        sslSetting: {
            need_init: false,
            onMessage: (e) => {
                sellerSubsPlanPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

app.mixin(Pagination);

const sellerSubsPlanPage = app.mount('#app');

window.cSellerSubsPlanPagePage = sellerSubsPlanPage;



sellerSubsPlanPage.pageInit(sellerSubsPlanPage.subs_plan_pagination);
sellerSubsPlanPage.loadSubsProductListV();

sellerSubsPlanPage.userAdapter(); // auth.js
sellerSubsPlanPage.fetchPrivateFriendV();// FriendListCompoent.js
sellerSubsPlanPage.sseInitV();// Ssecompoent.js
sellerSubsPlanPage.initEventFeedCompoentV(); // EventFeed.js


async function doChangePlanStatus(dto) {
    const url = "/api/v1/web_estudio/brand/subscription/plan/modify_status";
    return await axios.put(url, dto);
}
async function doChangePlan(dto) {
    const url = "/api/v1/web_estudio/brand/subscription/plan/change";
    return await axios.put(url, dto);
}

async function doFetchOnePlanInfo(id) {
    const url = "/api/v1/web_estudio/brand/subscription/plan/{id}/query".replace("{id}", id);
    return await axios.get(url);
}
async function doNewPlan(dto) {
    const url = "/api/v1/web_estudio/brand/subscription/plan/new";
    return await axios.post(url, dto);
}
async function delOnePlan(id) {
    const url = "/api/v1/web_estudio/brand/subscription/plan/{id}/del".replace("{id}", id);
    return await axios.delete(url);
}
async function fetchSubsProductsArrInfo() {
    const url = "/api/v1/web_estudio/brand/subscription/product/query?current=1&size=10000";
    return await fetch(url);
}
async function loadSubsProductList(appObj) {
    const response = await fetchSubsProductsArrInfo();
    var data = await response.json();
    if (data.code == 200) {
        var subsProductsArr = [];
        data.product.records.forEach(element => {
            subsProductsArr.push({ value: element.id, text: element.productName });
        });
        appObj.subsProductsOptions = subsProductsArr;
    }
}
async function removePlan(id) {
    delOnePlan(id).then(response => {
        if (response.data.code == 200) {

            sellerSubsPlanPage.reloadPage(sellerSubsPlanPage.subs_plan_pagination); // refresh tb

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }

    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function createOnePlan(dto) {
    doNewPlan(dto).then(response => {
        if (response.data.code == 200) {
            sellerSubsPlanPage.reloadPage(sellerSubsPlanPage.subs_plan_pagination); // refresh tb
            $("#newPlanModal").modal("hide");
        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function fetchPlanInfo(id) {
    return doFetchOnePlanInfo(id)
}
async function changePlan(dto) {
    doChangePlan(dto).then(response => {
        if (response.data.code == 200) {
            sellerSubsPlanPage.reloadPage(sellerSubsPlanPage.subs_plan_pagination); // refresh tb
            $("#editPlanModal").modal("hide");
        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }

    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function changePlanStatus(plandId, status) {
    const dto = {
        planId: plandId,
        status: status
    }
    doChangePlanStatus(dto).then(response => {
        if (response.data.code == 200) {
            sellerSubsPlanPage.reloadPage(sellerSubsPlanPage.subs_plan_pagination); // refresh tb
        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }

    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}


$(function () {
    $(".tooltip-nav").tooltip();
});