import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 


const RootComponent = {
    data() {
        return {
            oasisInd: {}
        }
    },
    methods: {
        retrieveOasisIndexV(){
            retrieveOasisIndex().then(response=>{
                if(response.data.code == 200){
                    this.oasisInd = response.data.index;
                }
            });
        },
        refreshOasisIndV(){
            refreshOasisInd(this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.retrieveOasisIndexV();
                }
            });
        }
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
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
  }

const oasisValPage = app.mount('#app');

window.oasisValPage = oasisValPage;

// init 
oasisValPage.retrieveOasisIndexV();

async function getOasisIndex(oasisId){
    const url ="/api/v1/team/oasis_value_index?oasisId=" + oasisId;
    return await axios.get(url);
}
async function calOasisInd(oasisId){
    const url ="/api/v1/team/oasis/{oasis_id}/cal_index".replace("{oasis_id}",oasisId);
    return await axios.get(url);
}
function refreshOasisInd(oasisId){
    if(!oasisId){
        return ;
    }
    return calOasisInd(oasisId);
}
function retrieveOasisIndex(){
    const oasisId = getQueryVariable("oasis_id");
    return getOasisIndex(oasisId);
}
 

