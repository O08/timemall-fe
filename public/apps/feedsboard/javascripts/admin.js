import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
const RootComponent = {
    data() {
      return {
        generalHadChange: false,
        general: {
            channelName: "",
            channelDesc: ""
        },
        guide: {
            layout: "1"
        }
      }
    },
    methods: {
        fetchChannelGeneralInfoV(){
            const och=getQueryVariable("och");
            fetchChannelGeneralInfo(och).then(response=>{
                if(response.data.code == 200){
                    this.general= !response.data.channel ? {} : response.data.channel;
                    document.title = this.general.channelName + " | Feed 设置";

                }
            });
        },
        modifyChannelGeneralInfoV(){
            const och=getQueryVariable("och");

            modifyChannelGeneralInfo(och,this.general.channelName,this.general.channelDesc).then(response=>{
                if(response.data.code == 200){
                    document.title = this.general.channelName + " | Feed 设置";
                    this.generalHadChange=false;
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

            modifyChannelGuideInfo(och,this.guide.layout);

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

const feedAdminPage = app.mount('#app');

window.feedAdminPage = feedAdminPage;


async function getChannelGiudeInfo(channel){
    const url="/api/v1/app/feed_channel/{channel}/guide".replace("{channel}",channel);
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
    const url="/api/v1/app/feed_channel/setting";
    return await axios.put(url,dto);
}

async function modifyChannelGuideInfo(channel, layout){
    const dto={
        channelId: channel,
        layout: layout
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
