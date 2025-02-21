import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js";
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js";

import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"


import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import defaultAvatarImage from '/common/icon/panda-kawaii.svg';
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();


const RootComponent = {
    data() {
      return {
        timer: null,
        viewerProfile: {},
        defaultAvatarImage,
        currentOptionMember: "",
        currentOptionMemberProfile: {},
        appLibrary: []
      }
    },
    methods: {
       
      findAppListV(){
        findAppList().then(response=>{
          if(response.data.code == 200){
            this.appLibrary = response.data.app;
          }
        })
      },
      installAppV(appId){
        installApp(this.oasisId,appId).then(response=>{
          if(response.data.code == 200){
            customAlert.alert("添加频道成功，可前往【频道概览】操作和使用！")
          }
        });
      }
    },
    created(){
      this.findAppListV();
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
app.mixin(OasisAnnounceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const miniApp = app.mount('#app');

window.miniAppPage = miniApp;

miniApp.loadAnnounceV(); // oasis announce component .js init
miniApp.loadSubNav() // sub nav component .js init 

async function fetchAppList(){
  const url="/api/v1/team/oasis/app/list";
  return axios.get(url);
}

async function doInstallApp(dto){
  const url="/api/v1/team/oasis/app/get";
  return axios.post(url,dto);
}

async function findAppList(){
  return fetchAppList();
}
async function installApp(oasisId,appId){
  const dto={
    oasisId,
    appId
  }
  return doInstallApp(dto);
}