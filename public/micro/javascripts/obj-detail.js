import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import {goHome,goLoginPage,refresh} from "/common/javascripts/pagenav.js";
import { getQueryVariable } from "/common/javascripts/util.js";


import {PriceSbu} from "/common/javascripts/tm-constant.js";
import axios from 'axios';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import defaultAvatarImage from '/avator.webp'
import defaultBrandBannerImage from '/common/images/default-brand-banner.jpg'
import defaultExperienceImage from '/common/images/default-experience.jpg'
const RootComponent = {
    data() {
        return {
            noticeCode: "",
            noticeMsg: "",
            defaultAvatarImage,
            defaultExperienceImage,
            defaultBrandBannerImage,
            profile: {
                content:[]
            },
            selectedSbu: '',
            total: 0,
            quantity: "",
            option: "",
            objInfo: {}
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
                    if(!this.profile.content){
                        this.profile.content = []
                    }
                }
            });
            
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
        },
        retrieveObjInfoV(){
            retrieveObjInfo().then(response=>{
                if(response.data.code==200){
                    this.objInfo=response.data.obj;
                }
            });
        }
    },
    created(){
      this.loadCellInfoV();
      this.retrieveObjInfoV();
      this.option = getQueryVariable("option");
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
app.mixin(DirectiveComponent);
const cellDetailPage = app.mount('#app');


window.cellDetail = cellDetailPage;
/**
 * intro -------------
 */
async function getIntroInfoForCell(cellId){
    const url = "/api/v1/web_mall/services/{cell_id}/intro".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function order(objId){
    var form = new FormData();
    form.append("objId",objId);
   
    const url = "/api/v1/team/obj/order";
    return await axios.post(url,form); 
}
async function getObjInfo(objId){
    const url="/api/v1/team/obj/{obj_id}".replace("{obj_id}",objId);
    return await axios.get(url);
}

function retrieveObjInfo(){
    const objId= getQueryVariable("obj_id");
    return getObjInfo(objId);
}

function orderNow(){
    const objId= getQueryVariable("obj_id");

    // 用户未登录，跳到登录页面
    if(!cellDetailPage.user_already_login){
        goLoginPage();
        return
    }
    order(objId).then(response=>{
        cellDetailPage.noticeCode = response.data.code;
        cellDetailPage.noticeMsg=response.data.message;
        if(response.data.code == 200){
            cellDetailPage.noticeMsg="购买成功，可前往服务互换查看！";
        }
        // if(response.data.code == 40007){
        //     // alert("余额不足,请前往E-Studio 商城充值");
        //     cellDetailPage.noticeMsg=response.data.message;
        // }
        $("#payConfirmModal").modal("hide");
        $("#noticeModal").modal("show");

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