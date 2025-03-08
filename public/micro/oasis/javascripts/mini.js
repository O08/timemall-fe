import "/common/javascripts/import-jquery.js";
import { createApp,watch } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"

import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";

import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";
import {OasisOptionCtlComponent} from '/micro/oasis/javascripts/oasis-option-ctl-component.js'; 
import {OasisFastLinkComponent} from '/micro/oasis/javascripts/oasis-fast-link-component.js'; 

const currentOasisId = getQueryVariable("oasis_id");
const currentOch=getQueryVariable('och');

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);



const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {


      return {
        currentOasisId,
        currentOch,
        channelSort, oaisiChannelList,getChannelDataV,
        appViewUrl: ""
      }
    },
    methods: {
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
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
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(OasisAnnounceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}

const mini = app.mount('#app');

window.oasisGroupMsgPage = mini;

mini.userAdapter(); // auth.js init
mini.loadAnnounceV(); // oasis announce component .js init
mini.loadSubNav() // sub nav component .js init 
mini.loadFastLink() // announce  component .js init 

watch(oaisiChannelList, async (newQuestion, oldQuestion) => {
    if (!!oaisiChannelList) {
        const channelMetaInfo=getChannelDataV(currentOch,oaisiChannelList.value);
        document.title = channelMetaInfo.channelName;
        mini.appViewUrl = channelMetaInfo.appViewUrl+ currentOch;
    }
  })


