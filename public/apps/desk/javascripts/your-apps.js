import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
let customAlert = new CustomAlertModal();

const currentOch = window.location.pathname.split('/').pop();

const RootComponent = {
    data() {
      return {
        q: "",
        apps: []
      }
    },
    methods: {
      captueElementDataV(elementId){
        captueElementDataBO(elementId);
      },
      searchAppsV(){
        fetchApps(this.q,currentOch);
       },
      fetchAppsV(){

        fetchApps(this.q,currentOch);

      },
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
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
app.mixin(DirectiveComponent);

const yourApps = app.mount('#app');

window.yourAppsPage = yourApps;

// init
yourApps.fetchAppsV();


async function doFetchApps(q,och){
  const url = "/api/v1/app/desk/yourapps?q="+q+"&chn="+och;
  return await axios.get(url);
}

async function captueElementData(elementId){
  const dto={
  }
  const url="/api/v1/app/desk/element/{id}/data_science".replace("{id}",elementId);;
  return await axios.put(url,dto);
}

async function captueElementDataBO(elementId){
  return await captueElementData(elementId);
}

async function fetchApps(q,och){
  if(!och){
    return;
  }
  doFetchApps(q,och).then(response=>{
    if(response.data.code==200){
      yourApps.apps=response.data.apps;
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}