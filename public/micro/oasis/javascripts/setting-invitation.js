import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

import oasisAvatarDefault from "/micro/images/oasis-default-building.jpeg"

let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
      return {
        oasisAvatarDefault,
        oasisId: "",
        announce: {},
        putAnnounce: {}
      }
    },
    methods: {
        saveSettingV(){
            saveSetting(this.announce);
        },
        resetV(){
            this.putAnnounce=JSON.parse(JSON.stringify(this.announce));
        },
        saveSettingV(){
            this.putAnnounce.id=this.oasisId;
            saveSetting(this.putAnnounce).then(response=>{
                if(response.data.code==200){
                    // reload oasis info
                    this.loadAnnounceV();
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            });
        },
        loadAnnounceV(){
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                window.location.href="/micro/teixcalaanli";
                return ;
            }
            OasisApi.loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce){
                        window.location.href="/micro/teixcalaanli";
                    }
                    this.putAnnounce=JSON.parse(JSON.stringify(this.announce));
                }
            })
        },
        settingAlreadyChangeV(){
            return this.announce.title!=this.putAnnounce.title || this.announce.subTitle!=this.putAnnounce.subTitle || this.announce.risk!=this.putAnnounce.risk
             || this.announce.canAddMember!=this.putAnnounce.canAddMember || this.announce.forPrivate!=this.putAnnounce.forPrivate || this.announce.privateCode!=this.putAnnounce.privateCode;
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

     

        // document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        
    }
}



let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingInvitation = app.mount('#app');

window.oasisSettingInvitationPage = settingInvitation;



function saveSetting(announce){
    if(!announce){
        return
    }
    if(!announce.title){
        customAlert.alert("名称为空，操作失败！");
        return
    }
    if(!announce.subTitle){
        customAlert.alert("简介为空，操作失败！");
        return
    }
    if(!announce.privateCode){
        customAlert.alert("邀请码为空，操作失败！");
        return
    }
    if(!announce.canAddMember){
        customAlert.alert("部落招新选项出错，操作失败！");
        return
    }
    if(!announce.forPrivate){
        customAlert.alert("私密部落选项出错，操作失败！");
        return
    }
    const dto={
        canAddMember: announce.canAddMember,
        forPrivate: announce.forPrivate,
        id: announce.id ,
        privateCode: announce.privateCode,
        risk: announce.risk,
        subTitle: announce.subTitle,
        title: announce.title
    }
   return OasisApi.oasisSetting(dto);
}