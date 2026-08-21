import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

const currentOch = window.location.pathname.split('/').pop();

const RootComponent = {
    data() {
      return {
        init_finish: false,
        general: {
            channelName: "",
            channelDesc: "",
            webUri: ""
        }
      }
    },
    methods: {
        fetchChannelGeneralInfoV(){
            fetchChannelGeneralInfo(currentOch).then(response=>{
                if(response.data.code == 200){
                    this.general= !response.data.channel ? {} : response.data.channel;
                    document.title = this.general.channelName + " | 快应用";
                }
            }).finally(() => {
                this.init_finish = true;
            });
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

const embedWebAppBridge = app.mount('#app');

window.embedWebAppBridgePage = embedWebAppBridge;








async function doFetchChannelGeneralInfo(och){
    const url= `/api/v1/app/embed_web/info?channelId=${och}`;
    return await axios.get(url);
}
async function fetchChannelGeneralInfo(och){
    return await doFetchChannelGeneralInfo(och);
}

