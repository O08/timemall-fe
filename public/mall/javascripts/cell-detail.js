import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import {goHome,goLoginPage,goBackAndReload} from "/common/javascripts/pagenav.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import defaultExperienceImage from '/common/images/default-experience.jpg'

import {PriceSbu} from "/common/javascripts/tm-constant.js";
import axios from 'axios';
const RootComponent = {
    data() {
        return {
            defaultExperienceImage,
            profile: {},
            selectedSbu: '',
            total: 0,
            quantity: ""
        }
    },
    methods: {
        loadCellInfoV(){
            const cellId= getQueryVariable("cell_id");
            if(!cellId){
                return;
            }
            getIntroInfoForCell(cellId).then(response=>{
                if(response.data.code == 200){
                    this.profile = response.data.profile;
                }
            });
            if(!this.profile.content){
                this.profile.content = []
            }
        },
        orderNowV(){
            orderNow()
        },
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
        },
        transformInputNumberV(event){
            var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
            var min = Number(event.target.min);
            var max = Number(event.target.max);
            event.target.value = transformInputNumber(val, min, max);
            if(val !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        },
        computeTotalFeeV(){
            computeTotalFee()
        }
    },
    created(){
      this.loadCellInfoV();
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const SellerComponent = {
    data() {
        return {
            brandProfile: {}
        }
    },
    methods: {
       loadBrandInfoV(){
           const brandId= getQueryVariable("brand_id");
            if(!brandId){
                return;
            }
            getBrandProfile(brandId).then(response=>{
                if(response.data.code == 200){
                    this.brandProfile = response.data.profile;
                }
            })
       }
    },
    created(){
        this.loadBrandInfoV();
    }
    
}
const app = createApp(RootComponent);
app.mixin(SellerComponent);
app.mixin(new Auth({need_permission : false}));

const cellDetailPage = app.mount('#app');


window.cellDetail = cellDetailPage;
/**
 * intro -------------
 */
async function getIntroInfoForCell(cellId){
    const url = "/api/v1/web_mall/services/{cell_id}/intro".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function order(cellId){
    const dto= {
        sbu: cellDetailPage.selectedSbu,
        quantity: cellDetailPage.quantity
    }
    const url = "/api/v1/web_mall/services/{cell_id}/order".replace("{cell_id}",cellId);
    return await axios.post(url,dto); 
}


function orderNow(){
    const cellId= getQueryVariable("cell_id");
    if(!cellId || !cellDetailPage.total || !cellDetailPage.quantity 
        || cellDetailPage.total<=0 || cellDetailPage.quantity<=0){
            return
    }
    // 用户未登录，跳到登录页面
    if(!cellDetailPage.user_already_login){
        goLoginPage();
        return
    }
    order(cellId).then(response=>{
        if(response.data.code == 200){
            cellDetailPage.quantity ="";
            cellDetailPage.total = 0;
            alert("成功预约，可在E-pod查看预约记录");
        }
    })
}
function getSbuPrice()
{
   const selectedFee = cellDetailPage.profile.fee.filter(item=>item.sbu===cellDetailPage.selectedSbu)[0];
   return selectedFee.price;
}
function computeTotalFee(){
    if(cellDetailPage.selectedSbu === "" || !cellDetailPage.quantity ){
        cellDetailPage.total = 0;
        return ;
    }
    cellDetailPage.total  = getSbuPrice() * cellDetailPage.quantity;
}


/**
 * about seller ----------------
 */


async function getBrandProfile(brandId)
{
    const url = "/api/v1/web_mall/brand/{brand_id}/profile".replace("{brand_id}",brandId);
    return axios.get(url);
}



function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }