import "/common/javascripts/import-jquery.js";
import { createApp,watch } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"

import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";

import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";



const currentOasisId = getQueryVariable("oasis_id");
const currentOch=getQueryVariable('och');

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);



const RootComponent = {
    data() {


      return {
        currentOasisId,
        currentOch,
        channelSort, oaisiChannelList,getChannelDataV,
        appViewUrl: "/idea/"+currentOch
      }
    },
    methods: {
       
        
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

     

        // document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        
    }
}

const chatChannel=getQueryVariable("oasis_id");

let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(OasisAnnounceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const mini = app.mount('#app');

window.oasisGroupMsgPage = mini;



watch(oaisiChannelList, async (newQuestion, oldQuestion) => {
    if (!!oaisiChannelList) {
        document.title = getChannelDataV(currentOch,oaisiChannelList.value).channelName;
    }
  })


