import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"

import { getQueryVariable } from "/common/javascripts/util.js";

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


const oasisValPage = app.mount('#app');

window.oasisValPage = oasisValPage;

// init 
oasisValPage.retrieveOasisIndexV();

async function getOasisIndex(oasisId){
    const url ="/api/v1/team/oasis_value_index?oasisId=" + oasisId;
    return await axios.get(url);
}
function retrieveOasisIndex(){
    const oasisId = getQueryVariable("oasis_id");
    return getOasisIndex(oasisId);
}
 

