import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"

import defaultAvatarImage from '/common/icon/panda-kawaii.svg'
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from "axios";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

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
            if(response.data.code==40030){
              customAlert.alert("部落已停止招新，加入失败！"); 
            }
            if(response.data.code==40032){
              customAlert.alert("已转为私密部落，加入失败！"); 
            }
            if(response.data.code==40033){
              customAlert.alert("已加入部落，请不要重复操作！"); 
           }
            if(response.data.code==40009){
              customAlert.alert("部落可容纳成员已达最大值，加入失败！"); 
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

joinOasis.loadSubNav() // sub nav component .js init 

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
