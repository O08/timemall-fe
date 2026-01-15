import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";

import {goErrorByReplace} from "/common/javascripts/pagenav.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
      return {
        generalHadChange: false,
        general: {
            channelName: "",
            channelDesc: ""
        },
        guide: {
            layout: "",
            postStrategy: ""
        }
      }
    },
    methods: {
        fetchChannelGeneralInfoV(){
            const och=getQueryVariable("och");
            AppApi.fetchChannelGeneralInfo(och).then(response=>{
                if(response.data.code==200 && !response.data.channel){
                    goErrorByReplace();
                    return
                }
                if(response.data.code == 200){
                    this.general= !response.data.channel ? {} : response.data.channel;
                    document.title = this.general.channelName + " | 频道设置";

                }
            });
        },
        modifyChannelGeneralInfoV(){
            const och=getQueryVariable("och");

            AppApi.modifyChannelGeneralInfo(och,this.general.channelName,this.general.channelDesc).then(response=>{
                if(response.data.code == 200){
                    document.title = this.general.channelName + " | 频道设置";
                    this.generalHadChange=false;
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            })
        }

    },
    created(){
        this.fetchChannelGeneralInfoV();
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const viberAppAdmin = app.mount('#app');

window.viberAppAdminPage = viberAppAdmin;

