import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"

const RootComponent = {
    data() {
        return {
            brandAccount:{
                drawable: 0.00
            },
            oasisAccount:{
                drawable: 0.00
            },
            amount: "",
            collectAccountAmount: "",
            point: ""
        }
    },
    methods: {
        closeTopUpOasisModelV(){
            closeTopUpOasisModel();
        },
        topUptoOasisV(){
            topUptoOasis(this.amount,this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.closeTopUpOasisModelV();
                }
            });
        },
        collectAccountV(){
            collectAccount(this.collectAccountAmount,this.oasisId);
        },
        retrieveOasisFinInfoV(){
            retrieveOasisFinInfo(this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.oasisAccount.drawable = response.data.billboard.drawable;
                }
            });
        },
        retrieveBrandFinInfoV(){
            retrieveBrandFinInfo().then(response=>{
                if(response.data.code == 200){
                    this.brandAccount.drawable = response.data.billboard.drawable;
                }
            });
        },
        retrieveBrandPointV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            retrieveBrandPoint(this.oasisId,brandId).then(response=>{
                if(response.data.code == 200){
                    this.point = response.data.point;
                }
            });
        },
        followOasisV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            followOasis(this.oasisId,brandId);
        },
        unfollowOasisV(){
            unfollowOasisB();
        }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);


const teamOasis = app.mount('#app');

window.teamOasis = teamOasis;

// init 
teamOasis.retrieveBrandFinInfoV();
teamOasis.retrieveBrandFinInfoV();
teamOasis.retrieveBrandPointV();


async function topUp2Oasis(dto){
  const url="/api/v1/team/top_up_to_oasis";
  return axios.put(url,dto);
}
async function oasisCollectAccount(dto){
    const url="/api/v1/team/oasis/collect_account";
    return await axios.put(url,dto);
}
async function getOasisFinInfo(oasisId){
    const url="/api/v1/team/oasis_finance_board?oasisId=" + oasisId;
    return await axios.get(url);
}
async function getBrandFinInfo(){
    const url= "/api/v1/team/finance_board";
    return await axios.get(url);
}
async function getBrandPintInOasis(oasisId,brandId){
   const url="/api/v1/team/point_in_oasis?oasisId="+ oasisId + "&brandId="+brandId;
   return await axios.get(url);
}
async function joinOasis(dto){
    const url="/api/v1/team/be_oasis_member";
    return await axios.put(url,dto);
}
async function unfollowOasis(oasisId){
    const url ="/api/v1/team/oasis/unfollow";
    return await axios.delete(url,oasisId);
}
function unfollowOasisB(oasisId){

    return unfollowOasis(oasisId);
}

function retrieveOasisFinInfo(oasisId){
    return getOasisFinInfo(oasisId);
}
function retrieveBrandFinInfo(){
    return getBrandFinInfo();
}
function retrieveBrandPoint(oasisId,brandId){
   return getBrandPintInOasis(oasisId,brandId);
}
function followOasis(oasisId,brandId){
    const dto={
        oasisId:oasisId,
        brandId: brandId
    }
    return joinOasis(dto);

}

function topUptoOasis(amount,oasisId){
   const dto={
    amount: amount,
    oasisId: oasisId
   }
   return topUp2Oasis(dto);
}
function collectAccount(amount,oasisId){
    const dto={
        amount: amount,
        oasisId: oasisId
       }
    return oasisCollectAccount(dto);
}
function closeTopUpOasisModel(){
    $("#topUpToOasisModal").modal("hide");
}
 

