import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const PromotionComponent = {
    data() {
        return {
            brandPromotionData: {},
            userPromotionBenefit: {},
            userPromotionBenefitLoadFinish: false,
            brandPromotionDataLoadFinish: false
        }
    },
    methods: {

        loadBrandPromotionDataV(){
            loadBrandPromotionData().then(response=>{

                if(response.data.code == 200){
                   this.brandPromotionData=!response.data.promotion ? {} : response.data.promotion;
                   this.brandPromotionDataLoadFinish=true;
                   this.$nextTick(() => {
                    this.computeFeeV();
                   })
                }
               
            })
        },
        loadUserPromotionBenefitV(){
            loadUserPromotionBenefit().then(response=>{
                if(response.data.code == 200){
                    this.userPromotionBenefit=!response.data.benefit ? {} : response.data.benefit;
                    this.userPromotionBenefitLoadFinish=true;
                    this.$nextTick(() => {
                        this.computeFeeV();
                    })
                 }
            })
        },
        __initPromotionComponentV(){
            this.loadBrandPromotionDataV();
            this.loadUserPromotionBenefitV();
     
        }
    },
    computed:{
        haveDiscount(){
           var a= this.brandPromotionData.creditPointTag=='1' && !this.user_already_login;
           var b= this.brandPromotionData.earlyBirdDiscountTag=='1' && !this.user_already_login;
           var c= this.brandPromotionData.repurchaseDiscountTag=='1' && !this.user_already_login;
           var d= this.user_already_login && !!this.userPromotionBenefit.creditPoint && this.userPromotionBenefit.creditPoint>0;
           var f= this.brandPromotionData.earlyBirdDiscountTag=='1' && this.user_already_login && this.userPromotionBenefit.canUseEarlyBirdCoupon=='1';
           var g= this.brandPromotionData.repurchaseDiscountTag=='1' && this.user_already_login && this.userPromotionBenefit.canUseRepurchaseCoupon=='1';

            return a || b || c|| d || f ||g;
        }
    }

}

async function getBrandPromotionInfo(brandId){
  const url="/api/v1/web_mall/cell/promotion?brandId="+brandId;
  return await axios.get(url);
}
async function getUserPromotionBenefit(supplierBrandId,cellId){
    const url="/api/v1/web_estudio/coupon_benefit?supplierBrandId="+supplierBrandId + "&cellId="+cellId;
    return await axios.get(url);
}
async function loadUserPromotionBenefit(){
    const supplierBrandId=getQueryVariable("brand_id");
    const cellId=getQueryVariable("cell_id");
    if(!supplierBrandId || !cellId){
        return;
    }
    return await getUserPromotionBenefit(supplierBrandId,cellId);
}

async function loadBrandPromotionData(){
    const brandId=getQueryVariable("brand_id");
    if(!brandId){
        return
    }
    return await getBrandPromotionInfo(brandId);
}
export default PromotionComponent;

