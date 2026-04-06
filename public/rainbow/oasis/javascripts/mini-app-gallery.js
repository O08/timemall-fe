import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js";
import OasisAnnounceInterfaceComponent from "/rainbow/javascripts/compoent/OasisAnnounceInterfaceComponent.js"

import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"


import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();


const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,] = segments;


const RootComponent = {
    data() {
      return {
        error: "",
        timer: null,
        viewerProfile: {},
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
          if (response.data.code == 40007) {
            $("#errorModal").modal("show");
            this.error = "源能余额不足，安装失败，每次安装需扣除 1 源能，安装前请确保源能余额充足。";
            return;
          }
          if (response.data.code != 200) {
            $("#errorModal").modal("show");
            this.error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
          }
        }).catch(error=>{
          $("#errorModal").modal("show"); 
          this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
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
app.mixin(OasisAnnounceInterfaceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const miniApp = app.mount('#app');

window.miniAppPage = miniApp;

miniApp.loadAnnounceUseExternalOasisHandleV(currentOasisHandle); // oasis announce component .js init
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