import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js"


import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";









const RootComponent = {
    data() {
      return {
        htmlcode: ""
      }
    },
    methods: {
       
        fetchHtmlCodeV(){
            const och=window.location.pathname.split('/').pop();
            fetchHtmlCode(och).then(response=>{
                if(response.data.code == 200){

                    this.htmlcode=response.data.htmlCode;
                    x = document.getElementById('inner-page').contentWindow;
                    x.document.open();
                    x.document.write(this.htmlcode);
                    x.document.close();

                }
            })
        },
        fetchChannelGeneralInfoV(){
            const och=window.location.pathname.split('/').pop();
            fetchChannelGeneralInfo(och).then(response=>{
                if(response.data.code == 200){
                    var title = !response.data.channel ? "" : response.data.channel.channelName;
                    var desc = !response.data.channel ? "" : response.data.channel.channelDesc;
                    document.title = desc + " | " + title ;
                }
            });
        },
    },
    created(){
        
        this.fetchHtmlCodeV();
        this.fetchChannelGeneralInfoV();
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
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const htmlIdea = app.mount('#app');

window.htmlIdeaPage = htmlIdea;

async function doFetchHtmlCode(och){
    const url= "/api/public/team/app/html/{oasis_channel_id}/info".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}
async function doFetchChannelGeneralInfo(och){
    const url= "/api/public/team/oasis/channel/{oasis_channel_id}/general".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}

async function fetchHtmlCode(och){
   return doFetchHtmlCode(och);
}

async function fetchChannelGeneralInfo(och){
    return doFetchChannelGeneralInfo(och);
}