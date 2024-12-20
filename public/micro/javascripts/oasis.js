import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";



const currentOasisId = getQueryVariable("oasis_id");

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);

const RootComponent = {
    data() {

    
        return {
            channelSort, oaisiChannelList,getChannelDataV,
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
                    this.retrieveOasisFinInfoV();
                    this.retrieveBrandFinInfoV();
                    this.amount="";
                    alert("充值成功");
                }else{
                    alert(response.data.message);
                }
            });
        },
        collectAccountV(){
            collectAccount(this.collectAccountAmount,this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.retrieveOasisFinInfoV();
                    this.retrieveBrandFinInfoV();
                    this.retrieveBrandPointV();
                    this.collectAccountAmount="";
                    alert("收账成功");
                }else{
                    alert(response.data.message);
                }
            });
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
            OasisApi.followOasis(this.oasisId,brandId).then(response=>{
                if(response.data.code==200){
                    this.loadJoinedOases();
                }
            });
        },
        unfollowOasisV(){
            const currentOasisId = getQueryVariable("oasis_id");
            unfollowOasisB(currentOasisId).then(response=>{
                if(response.data.code==200){
                    this.loadJoinedOases();
                }
            });
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
        inOasisV(){
            return inOasisB(this.joinedoases);
        }

    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
        if(!!this.announce.title){
            document.title = this.announce.title + " | 部落";
        }

    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}


const teamOasis = app.mount('#app');

window.teamOasis = teamOasis;

// init 
teamOasis.retrieveOasisFinInfoV();
teamOasis.retrieveBrandFinInfoV();
teamOasis.retrieveBrandPointV();


async function topUp2Oasis(dto){
  const url="/api/v1/team/top_up_to_oasis";
  return axios.post(url,dto);
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

async function unfollowOasis(oasisId){
    const url ="/api/v1/team/oasis/unfollow?oasisId="+oasisId;
    return await axios.delete(url);
}
function inOasisB(joinedoases){
    if($.isEmptyObject(joinedoases)){
        return;
    }
    const currentOasisId = getQueryVariable("oasis_id");
   return  !!joinedoases.records.filter(e=>e.id === currentOasisId)[0]
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
function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }
