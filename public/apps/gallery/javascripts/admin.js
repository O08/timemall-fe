import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
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
            fetchChannelGeneralInfo(och).then(response=>{
                if(response.data.code == 200){
                    this.general= !response.data.channel ? {} : response.data.channel;
                    document.title = this.general.channelName + " | 频道设置";

                }
            });
        },
        modifyChannelGeneralInfoV(){
            const och=getQueryVariable("och");

            modifyChannelGeneralInfo(och,this.general.channelName,this.general.channelDesc).then(response=>{
                if(response.data.code == 200){
                    document.title = this.general.channelName + " | 频道设置";
                    this.generalHadChange=false;
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            })
        },
        fetchChannelGiudeInfoV(){
            const och=getQueryVariable("och");
            fetchChannelGiudeInfo(och).then(response=>{
                if(response.data.code == 200){
                    this.guide=response.data.guide;
                }
            })
        },
        modifyChannelGuideInfoV(){
            const och=getQueryVariable("och");

            modifyChannelGuideInfo(och,this.guide.layout,this.guide.postStrategy);

        }

    },
    created(){
        this.fetchChannelGiudeInfoV();
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

const galleryAppAdmin = app.mount('#app');

window.galleryAppAdminPage = galleryAppAdmin;


async function getChannelGiudeInfo(channel){
    const url="/api/v1/app/card/channel_guide/{id}".replace("{id}",channel);
    return await axios.get(url);
}

async function doFetchChannelGeneralInfo(och){
    const url= "/api/public/team/oasis/channel/{oasis_channel_id}/general".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}
async function doModifyChannelGeneralInfo(dto){
    const url="/api/v1/team/oasis/channel/general";
    return await axios.put(url,dto);
}

async function doModifyChannelGuideInfo(dto){
    const url="/api/v1/app/card/channel/setting";
    return await axios.put(url,dto);
}

async function modifyChannelGuideInfo(channel, layout, postStrategy){
    const dto={
        channelId: channel,
        layout: layout,
        postStrategy: postStrategy
    }
    return doModifyChannelGuideInfo(dto);
}
async function fetchChannelGiudeInfo(channel){
  return await getChannelGiudeInfo(channel);
}
async function fetchChannelGeneralInfo(och){
    return await doFetchChannelGeneralInfo(och);
}
async function modifyChannelGeneralInfo(och,channelName,channelDesc){
    const dto={
        oasisChannelId: och,
        channelName,
        channelDesc
    }
    return doModifyChannelGeneralInfo(dto);
}
