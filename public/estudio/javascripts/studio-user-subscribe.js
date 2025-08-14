import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { getQueryVariable } from "/common/javascripts/util.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";
import { SubsBillCalendarEnum, SubsOfferStatusEnum, SubsOfferTypeEnum, EnvWebsite, CodeMappingTypeEnum } from "/common/javascripts/tm-constant.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { DspReportApi } from "/common/javascripts/dsp-report-api.js";

import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;
const RootComponent = {
    data() {
        return {
            reportOptions: [],
            reportForm: this.initReportForm(),

            billCalendar: SubsBillCalendarEnum.MONTHLY,
            planFeePredict: [{ period: 1, couponMoney: 0.00, amount: 1, netIncome: 1 }],
            currentPlan: {},
            promoOffer: "",
            promoCode: "",
            promoError: "",
            sellerBrandId: "",
            sellerUserId: "",
            sellerPdOasisId: "",
            productName: "",
            sellerHandle: "",
            plans: [],
            focusModal: {
                message: "",
                confirmHandler: () => {

                }
            }
        }
    },
    methods: {
        newReportCaseV() {
            newReportCase(this.reportForm).then(response => {
                if (response.data.code == 200) {

                    document.querySelector('#caseMaterialFile').value = null;

                    $("#reportOasisModal").modal("hide"); // show success modal

                }
                if (response.data.code != 200) {
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
                }
            })
        },
        showOasisReportModalV() {

            this.reportForm = this.initReportForm();


            showOasisReportModal(
                this.loadReportIssueListV
            );
        },
        loadReportIssueListV() {
            loadReportIssueList(this);
        },
        initReportForm() {

            if (!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value) {
                document.querySelector('#caseMaterialFile').value = null;
            }

            return {
                fraudType: "",
                scene: "订阅专区",
                sceneUrl: currentDomain + window.location.pathname + window.location.search,
                caseDesc: "",
                material: ""
            }
        },
        validateReportFormV() {
            return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
        },


        fetchPlansV() {
            fetchPlans();
        },
        hasOfferTypeV(offerType) {
            if (!this.currentPlan.offers || this.currentPlan.offers.length == 0) {
                return false;
            }
            return this.currentPlan.offers.filter(e => e.offerType == offerType).length > 0;
        },
        queryQuarterlyOrYearlyDiscountPercentageV(offerType) {

            var coupon = this.currentPlan.offers.filter(e => e.offerType == offerType);
            return coupon[0].discountPercentage + "%";
        },
        calMonthlyOrYearlyDiscountsV(offerType) {
            var coupon = this.currentPlan.offers.filter(e => e.offerType == offerType);
            if (coupon.length == 0) {
                return 0.00;
            }
            return (coupon[0].discountPercentage * this.calRegularFeeV() / 100).toFixed(2);
        },
        calPromoCodeDiscountsV() {
            const amount = this.calRegularFeeV();
            return calPromoCodeDiscount(amount, this.promoOffer, this.currentPlan);
        },
        queryPromoCodeInfoV() {
            queryPromoCodeInfo(this.promoCode, this.sellerBrandId)
        },
        changeBillCalendarV() {
            const fees = feePrediction(this.currentPlan, this.billCalendar, this.currentPlan.offers, this.promoOffer);
            this.planFeePredict.length = 0;
            this.planFeePredict.push(...fees);
        },
        reCalFeePreditctionV() {
            const fees = feePrediction(this.currentPlan, this.billCalendar, this.currentPlan.offers, this.promoOffer);
            this.planFeePredict.length = 0;
            this.planFeePredict.push(...fees);
        },
        calRegularFeeV() {
            return calRegularFee(this.currentPlan, this.billCalendar);
        },
        showSubscribePlanModalV() {
            if (!this.user_already_login) {
                customAlert.alert("温馨提示：您还未完成登录，不支持非授权用户订阅！");
                return
            }
            this.focusModal.message = "即将为您订阅服务套餐： " + this.currentPlan.planName + " ,付款金额为：¥" + this.planFeePredict[0].netIncome;
            this.focusModal.confirmHandler = () => {
                this.subscribePlanV();

            };
            $("#focusModal").modal("show"); // show modal
        },
        subscribePlanV() {
            subscribePlan(this.currentPlan.id, this.promoCode, this.billCalendar);
        },
        closeSubscribePlanFocusModalV() {
            $("#focusModal").modal("hide");
        },
        changeToCurrentPlanV(planId) {
            this.currentPlan = this.plans.filter(e => e.id == planId)[0];
            this.reCalFeePreditctionV();
        },
        copyValueToClipboardV() {
            const content = currentDomain + window.location.pathname+window.location.search;
            return copyValueToClipboard(content);
        },
        isEmptyObjectV(obj) {
            return $.isEmptyObject(obj);
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
app.mixin(new Auth({ need_permission: false }));

app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(DirectiveComponent);

app.mixin(CodeExplainComponent);

const userSubscribePage = app.mount('#app');
window.cUserSubscribePage = userSubscribePage;

// init
userSubscribePage.fetchPlansV();

async function doFetchPlans(paramsObj) {
    const searchParams = new URLSearchParams(paramsObj);
    const url = "/api/public/shopping/subscription/plan/query?" + searchParams.toString();
    return await axios.get(url);
}
async function doQueryPromoCodeInfo(promoCode, sellerBrandId) {
    const url = "/api/public/shopping/subscription/offer/query?sellerBrandId=" + sellerBrandId + "&promoCode=" + promoCode;
    return await axios.get(url);

}
async function doSubscribePlan(dto) {
    const url = "/api/v1/web_estudio/shopping/subscription/plan/subscribe"
    return await axios.post(url, dto)
}
async function doFetchSubscriptionMetaInfo(sellerHandle, productCode) {
    const url = "/api/public/shopping/subscription/meta/query?sellerHandle=" + sellerHandle + "&productCode=" + productCode;
    return await axios.get(url);
}
async function fetchSubscriptionMetaInfo() {
    const productCode = window.location.pathname.split('/').at(2);
    const sellerHandle = window.location.pathname.split('/').at(1);
    doFetchSubscriptionMetaInfo(sellerHandle, productCode).then(response => {
        if (response.data.code == 200 && !!response.data.meta) {

            userSubscribePage.sellerBrandId = response.data.meta.sellerBrandId;
            userSubscribePage.productName = response.data.meta.productName;
            userSubscribePage.sellerHandle = response.data.meta.sellerHandle;
            userSubscribePage.sellerUserId = response.data.meta.sellerUserId;
            userSubscribePage.sellerPdOasisId = response.data.meta.sellerPdOasisId;

        }
    });
}
async function subscribePlan(planId, promoCode, billCalendar) {
    const dto = {
        planId: planId,
        promoCode: promoCode,
        billCalendar: billCalendar
    }
    doSubscribePlan(dto).then(response => {

        if (response.data.code == 200) {

            $("#focusModal").modal("hide"); // show modal
            $("#goTopUpModal").modal("show");

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }

    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });

}
async function queryPromoCodeInfo(promoCode, sellerBrandId) {
    userSubscribePage.promoError = "";
    userSubscribePage.promoOffer="";
    if (!promoCode || !sellerBrandId) {
        userSubscribePage.reCalFeePreditctionV();
        return;
    }
    doQueryPromoCodeInfo(promoCode, sellerBrandId).then(response => {
        if (response.data.code == 200) {
            userSubscribePage.promoOffer = response.data.offer;

            userSubscribePage.reCalFeePreditctionV();
        }
        if (response.data.code == 200 && !response.data.offer) {
            userSubscribePage.promoError = "优惠码不可用";
        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    })
}
async function fetchPlans() {
    const plantypeParam = getQueryVariable("planType");
    const productCode = window.location.pathname.split('/').at(2);
    const onlyFetchPlan = window.location.pathname.split('/').at(3) !== 'subscription';
    const planId = onlyFetchPlan ? window.location.pathname.split('/').at(3) : "";
    var planType = onlyFetchPlan ? "flex" : "standard";
    var mode = getQueryVariable("mode");
    if (!!plantypeParam) {
        planType = plantypeParam;
    }
    const sellerHandle = window.location.pathname.split('/').at(1);
    const paramsObj = {
        productCode: productCode,
        planId: planId,
        planType: planType,
        sellerHandle: sellerHandle,
        mode: mode
    }
    doFetchPlans(paramsObj).then(response => {
        if (response.data.code == 200) {
            userSubscribePage.plans = response.data.plan;

            userSubscribePage.sellerBrandId = response.data.plan.length > 0 ? response.data.plan[0].sellerBrandId : "";
            userSubscribePage.productName = response.data.plan.length > 0 ? response.data.plan[0].productName : "";
            userSubscribePage.sellerHandle = response.data.plan.length > 0 ? response.data.plan[0].sellerHandle : "";
            userSubscribePage.sellerUserId = response.data.plan.length > 0 ? response.data.plan[0].sellerUserId : "";
            userSubscribePage.sellerPdOasisId = response.data.plan.length > 0 ? response.data.plan[0].sellerPdOasisId : "";

            userSubscribePage.currentPlan = response.data.plan.length > 0 ? response.data.plan[0] : {};
            const fees = feePrediction(userSubscribePage.currentPlan, userSubscribePage.billCalendar, "", "");
            userSubscribePage.planFeePredict.length = 0;
            userSubscribePage.planFeePredict.push(...fees);
        }
        if (response.data.code == 200 && response.data.plan.length == 0) {
            fetchSubscriptionMetaInfo();
        }
    });
}
function feePrediction(plan, billCalendar, planOffers, promoOffer) {
    const feeArr = [];
    if ($.isEmptyObject(plan) || !billCalendar) {
        return feeArr;
    }
    const firstPeriodFee = calFirstPeriod(plan, billCalendar, planOffers, promoOffer);
    feeArr.push(firstPeriodFee);

    const regularFee = calRegularFee(plan, billCalendar);

    for (let i = 2; i <= 12; i++) feeArr.push({ period: i, couponMoney: 0.00, amount: regularFee, netIncome: regularFee })

    return feeArr;

}
function calRegularFee(plan, billCalendar) {
    var billSpan = 1;
    if (billCalendar == SubsBillCalendarEnum.QUARTERLY) {
        billSpan = 3;
    }
    if (billCalendar == SubsBillCalendarEnum.YEARLY) {
        billSpan = 12;
    }
    const amount = plan.price * billSpan;

    return amount;
}
function calFirstPeriod(plan, billCalendar, planOffers, promoOffer) {

    var billSpan = 1;
    if (billCalendar == SubsBillCalendarEnum.QUARTERLY) {
        billSpan = 3;
    }
    if (billCalendar == SubsBillCalendarEnum.YEARLY) {
        billSpan = 12;
    }
    const amount = plan.price * billSpan;
    var billCalendarCouponMoney = calMonthlyOrYearlyPayDiscount(amount, billCalendar, planOffers).toFixed(2);
    var promoCodeCouponMoney = calPromoCodeDiscount(amount, promoOffer, plan).toFixed(2);
    var maxCouponMoney = Number(billCalendarCouponMoney) + Number(promoCodeCouponMoney);
    // min bill fee is 0.01;
    var netIncome = amount - maxCouponMoney > 0 ? amount - maxCouponMoney : 0.01;
    var couponMoney = (amount - netIncome).toFixed(2);
    return { period: 1, couponMoney: couponMoney, amount: amount, netIncome: netIncome }
}
// var SubsBillCalendarEnum = Object.freeze({
//     "MONTHLY": "monthly", // 月缴
//     "QUARTERLY": "quarterly", // 季缴
//     "YEARLY": "yearly"// 年缴
// });
// var SubsOfferStatusEnum = Object.freeze({
//     "DRAFT": "1", // 待上线
//     "ONLINE": "2", // 发放中
//     "OFFLINE": "3"// 已下线
// });
// "PAY_QUARTERLY_DISCOUNT_COUPON_SP": "pay_quarterly_discount_coupon_sp", //  季缴优惠
// "PAY_YEARLY_DISCOUNT_COUPON_SP": "pay_yearly_discount_coupon_sp", //  年缴优惠
// "FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP": "first_period_discount_promo_code_sp", // 首月折扣
// "FIRST_PERIOD_CASH_PROMO_CODE_SP": "first_period_cash_promo_code_sp", // 首期现金减免
// "FULL_ITEM_DISCOUNT_PROMO_CODE": "full_item_discount_promo_code"// 全店通用折扣
function calMonthlyOrYearlyPayDiscount(amount, billCalendar, planOffers) {

    if (!billCalendar || billCalendar == SubsBillCalendarEnum.MONTHLY || planOffers.length == 0) {
        return 0.00;
    }
    const payYearlyCoupon = planOffers.filter(e => e.offerType == SubsOfferTypeEnum.PAY_YEARLY_DISCOUNT_COUPON_SP);
    const payQuarterlyCoupon = planOffers.filter(e => e.offerType == SubsOfferTypeEnum.PAY_QUARTERLY_DISCOUNT_COUPON_SP);
    if (billCalendar == SubsBillCalendarEnum.QUARTERLY && payQuarterlyCoupon.length > 0) {
        return amount * payQuarterlyCoupon[0].discountPercentage / 100;
    }
    if (billCalendar == SubsBillCalendarEnum.YEARLY && payYearlyCoupon.length > 0) {
        return amount * payYearlyCoupon[0].discountPercentage / 100;
    }
    return 0.00;

}

function calPromoCodeDiscount(amount, promoOffer, plan) {
    if (!promoOffer || !plan) {
        return 0.00;
    }
    // check status
    if (promoOffer.status != SubsOfferStatusEnum.ONLINE) {
        userSubscribePage.promoError = "优惠码不可用";
        return 0.00
    }
    // check claims
    if (promoOffer.capacity <= promoOffer.usage) {
        userSubscribePage.promoError = "优惠码已领完了";
        return 0.00
    }
    if (promoOffer.forProductId != plan.productId && (promoOffer.offerType == SubsOfferTypeEnum.FIRST_PERIOD_CASH_PROMO_CODE_SP || promoOffer.offerType == SubsOfferTypeEnum.FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP)) {
        userSubscribePage.promoError = "优惠码与商品不匹配";
        return 0.00
    }
    if (promoOffer.offerType == SubsOfferTypeEnum.FULL_ITEM_DISCOUNT_PROMO_CODE) {
        return amount * Number(promoOffer.discountPercentage) / 100;
    }
    const validatedProduct = promoOffer.forProductId == plan.productId;
    if (validatedProduct && promoOffer.offerType == SubsOfferTypeEnum.FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP) {
        return Number(plan.price) * Number(promoOffer.discountPercentage) / 100;
    }
    if (validatedProduct && promoOffer.offerType == SubsOfferTypeEnum.FIRST_PERIOD_CASH_PROMO_CODE_SP) {
        return Number(promoOffer.discountAmount);
    }
    return 0.00;


}



// report feature


async function newReportCase(reportForm) {

    const materialFile = $('#caseMaterialFile')[0].files[0];

    var form = new FormData();
    if (!!materialFile) {
        form.append("material", materialFile);
    }
    form.append("fraudType", reportForm.fraudType);
    form.append("scene", reportForm.scene);
    form.append("sceneUrl", reportForm.sceneUrl);
    form.append("caseDesc", reportForm.caseDesc);
    return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj) {
    const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE, "");
    var data = await response.json();
    if (data.code == 200) {

        appObj.reportOptions = data.codes.records;

    }
}

async function showOasisReportModal(loadReportIssueListV) {
    await loadReportIssueListV();
    $("#reportOasisModal").modal("show");
}


$(function () {
    $(".tooltip-nav").tooltip();
});