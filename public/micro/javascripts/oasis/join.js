import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import defaultAvatarImage from '/avator.webp'
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from "axios";


const RootComponent = {
    data() {
      return {
        currentOasis: {}
      }
    },
    methods: {
         loadOasisInfoV(){
            this.currentOasis =  getOasisInfo();
         },
         agreeToJoinOasisV(){
          joinAOasis(this.currentOasis.id);
         }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    },
    created(){
        this.loadOasisInfoV();
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);

const joinOasis = app.mount('#app');

window.joinOasis = joinOasis;

async function acceptAndJoinAOasis(oasisId){
    const url="/api/v1/team/acceptOasisInvitation";
    return await axios.put(url,oasisId);
}

function getOasisInfo(){
    const oasisObj = getQueryVariable("oasis_obj");
    return JSON.parse(decodeURIComponent(oasisObj));
}
function joinAOasis(oasisId){
  return acceptAndJoinAOasis(oasisId);
}
