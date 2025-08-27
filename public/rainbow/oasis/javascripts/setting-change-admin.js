import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from "axios";

import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import oasisAvatarDefault from "/rainbow/images/oasis-default-building.jpeg"
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';


let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
      return {
        init_finish: false,
        oasisAvatarDefault,
        oasisId: "",
        announce: {},
        members:[],
        q: "",
        changeAdminModalObj:{
            newManagerBrandName: "",
            newManagerBrandId: "",
            newManagerName: ""
        }
      }
    },
    methods: {

        fetchOasisMemberV(){
            fetchOasisMember(this.oasisId,this.q);
        },

        showChangeAdminModalV(member){
            this.changeAdminModalObj={
                newManagerBrandName: member.memberName,
                newManagerBrandId: member.memberBrandId,
                newManagerName: ""
            }
            $("#changeAdminModal").modal("show"); 

        },
        changeManagerV(){
            changeManager(this.oasisId,this.changeAdminModalObj);
        },
        loadAnnounceV(){
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                window.location.href="/rainbow/teixcalaanli";
                return ;
            }
            OasisApi.loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce || this.announce.initiator!=this.getIdentity().brandId){
                        window.location.href="/rainbow/teixcalaanli";
                    }
                }
            })
        },
        formatDateV(datestr) {
            var date = new Date(datestr);
            var year = date.getFullYear();
        
        
            var month = date.getMonth() + 1;
        
        
            var day = date.getDate();
        
        
            return `${year}年${month}月${day}日`;
        
      
        }
        
    },
    created(){
        this.loadAnnounceV();
        this.oasisId =  getQueryVariable("oasis_id");
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
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingChangeManager = app.mount('#app');

window.settingChangeManagerPage = settingChangeManager;

// init
settingChangeManager.fetchOasisMemberV()

async function doFetchOasisMember(oasisId,q){
    const url = "/api/v1/team/oasis/member/query?current=1&size=100&q=" + q + "&oasisId=" + oasisId;
    return await axios.get(url);
}

async function doChangeOasisAdmin(dto){
    const url = "/api/v1/team/oasis/manager/change";
    return await axios.put(url,dto);
}
async function changeManager(oasisId,changeAdminModalObj){
   const dto={
    oasisId: oasisId,
    newManagerBrandId: changeAdminModalObj.newManagerBrandId,
    newManagerName: changeAdminModalObj.newManagerName
   }
   doChangeOasisAdmin(dto).then(response=>{
        if(response.data.code==200){
            window.location.href="/rainbow/oasis/home?oasis_id="+oasisId;
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function fetchOasisMember(oasisId,q){

    doFetchOasisMember(oasisId,q).then(response => {
        if (response.data.code == 200) {

            settingChangeManager.members = response.data.member.records;
            settingChangeManager.init_finish=true;

        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}


