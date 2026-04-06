import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceInterfaceComponent from "/rainbow/javascripts/compoent/OasisAnnounceInterfaceComponent.js"

import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js'; 


const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,, currentOch] = segments;




const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {


      return {
        isLoadingMiniApp: true,
        currentOch,
        appViewUrl: ""
      }
    },
    watch: {
        oaisiChannelList: {
            async handler(newList) {
                if (newList && newList.length > 0) {
                    const channelMetaInfo = this.getChannelDataV(currentOch, newList);
                    document.title = channelMetaInfo.channelName;
                    this.appViewUrl = channelMetaInfo.appViewUrl + currentOch;
                }
            },
            deep: true, // Necessary if the array content changes but the reference doesn't
            immediate: true // Optional: run immediately on load
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
app.mixin(OasisAnnounceInterfaceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}

const mini = app.mount('#app');

window.oasisGroupMsgPage = mini;

mini.userAdapter(); // auth.js init
mini.loadSubNav(); // sub nav component .js init 
mini.loadAnnounceAndFastLinkAndChannelListUseHandleV(currentOasisHandle);


