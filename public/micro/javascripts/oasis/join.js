import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import defaultAvatarImage from '/avator.webp'
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from "axios";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 


const RootComponent = {
    data() {
      return {
        currentOasis: {},
        disableAcceptBtn: false,
        disableDelBtn: false
      }
    },
    methods: {
         loadOasisInfoV(){
            this.currentOasis =  getOasisInfo();
         },
         agreeToJoinOasisV(){
          joinAOasis(this.currentOasis.id).then(response=>{
            if(response.data.code==200){
               this.disableAcceptBtn = true;
               this.disableDelBtn = true;
            }
          });
         },
         removeOasisInvitationV(){
          removeOasisInvitation(this.currentOasis.id).then(response=>{
            if(response.data.code==200){
              this.disableAcceptBtn = true;
              this.disableDelBtn = true;
           }
          })
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
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}
const joinOasis = app.mount('#app');

window.joinOasis = joinOasis;

async function acceptAndJoinAOasis(joinId){
    const url="/api/v1/team/acceptOasisInvitation?id="+joinId;
    return await axios.put(url);
}
async function delOasisInvitation(joinId){
    const url="/api/v1/team/oasis_join/{id}/remove".replace("{id}",joinId);
    return await axios.delete(url);
}
function getOasisInfo(){
    const oasisObj = getQueryVariable("oasis_obj");
    return JSON.parse(decodeURIComponent(oasisObj));
}
function joinAOasis(joinId){
  return acceptAndJoinAOasis(joinId);
}
function removeOasisInvitation(joinId){
  return delOasisInvitation(joinId);
}
