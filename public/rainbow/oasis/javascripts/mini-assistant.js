import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";

import { Drag, DropList } from "vue-easy-dnd";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js"


import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const oasisAvatarDefault = new URL(
  '/rainbow/images/oasis-default-building.jpeg',
  import.meta.url
);

const RootComponent = {
  components: {
    Drag,
    DropList
  },
    data() {
      return {
        oasisAvatarDefault,
        items : [],
        joinedoases: {},
        oasisId: "",
        announce: {}
      }
    },
    methods: {
      onInsert(event) {
        this.items.splice(event.index, 0, event.data);
      },
      onReOrderCard(event){
        event.apply(this.items);
        this.refreshChannelSortV();
      },
      fetchchannelListV(){
        const oasisId =  getQueryVariable("oasis_id");
        fetchchannelList(oasisId).then(response=>{
          if(response.data.code == 200){
              this.items=response.data.sort;
              this.channelList=response.data.channel;
          }
        })
      },
      doDeleteChnV(och){
        deleteChn(och).then(response=>{
          if(response.data.code == 200){
            this.fetchchannelListV(); // refresh 
          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
          }
        })
      },
      getChannelDataV(och){
       return this.channelList.filter(e=>e.oasisChannelId==och)[0];
      },
      refreshChannelSortV(){
        const oasisId =  getQueryVariable("oasis_id");

        refreshChannelSort(oasisId,JSON.stringify(this.items));
      },
      loadJoinedOases(){
        const brandId =  this.getIdentity().brandId; // Auth.getIdentity();
        OasisApi.getAListOfJoinedOases(brandId).then(response=>{
            if(response.data.code == 200){
                this.joinedoases = response.data.joined;
            }
        })
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
                if(!this.announce){
                    window.location.href="/rainbow/teixcalaanli";
                }
            }
        })
    }
        
    },
    created(){
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
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const miniAssistant = app.mount('#app');

window.miniAssistantPage = miniAssistant;

miniAssistant.userAdapter(); // auth.js
miniAssistant.fetchchannelListV();
miniAssistant.loadJoinedOases();
miniAssistant.loadAnnounceV();

async function doFetchChannelList(oasisId){

  const url="/api/v1/team/oasis/{oasis_id}/oasis_channel/list".replace("{oasis_id}",oasisId);
  return await axios.get(url);

}
async function doDeleteChn(och){
  const url="/api/v1/team/oasis/channel/{oasis_channel_id}/remove".replace("{oasis_channel_id}",och);
  return await axios.delete(url);
}

async function doRefreshChannelSort(oasisId,sortJson){
  const url="/api/v1/team/oasis/channel/sort";
  const  dto={
    oasisId,
    sortJson
  }
  return await axios.put(url,dto);
}
async function refreshChannelSort(oasisId,sortJson){
  return doRefreshChannelSort(oasisId,sortJson);
}
async function deleteChn(och){
  return await doDeleteChn(och);
}

async function fetchchannelList(oasisId){
  return doFetchChannelList(oasisId);
}

