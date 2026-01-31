import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import axios from "axios";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {goErrorByReplace} from "/common/javascripts/pagenav.js";

import { netAge,formatNumber } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const invitationCode = window.location.pathname.split('/').pop();

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const RootComponent = {
    data() {
      return {
        init_finish: false,
        oasisAvatarDefault,
         invitationInfo: {
            oasisName: "",
            inviterName: "",
            inviterAvatar: "",
            oasisCreateAt: "",
            members: "",
            oasisDescription: "",
            linkId: "",
            grandtedRole: "",
            expireTime: ""
         }
      }
    },
    methods: {
        loadInvitationInfoV(){
            loadInvitationInfo(invitationCode).then(response => {
                if (response.data.code == 200 && !response.data.link) {
                    goErrorByReplace();
                    return
                }
                if (response.data.code == 200) {
                    this.invitationInfo = response.data.link;
                    this.init_finish=true;
                }

                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });
        },
        agreeToJoinOasisV() {
            if(!this.user_already_login){
                customAlert.alert("后续操作需要用户授权，请登录/注册账号后继续");
                return;
            }
            joinAOasis(this.invitationInfo.linkId).then(response => {

                const { code, message } = response.data;
                switch (code) {
                    case 200:
                        window.location.href = `/rainbow/oasis/home?oasis_id=${this.invitationInfo.oasisId}`;
                        break;
                
                    case 40030:
                        customAlert.alert("部落已停止招新，加入失败！");
                        break;
                
                    case 40032:
                        customAlert.alert("已转为私密部落，加入失败！");
                        break;
                
                    case 40033:
                        customAlert.alert("已加入部落，请不要重复操作！");
                        break;
                
                    case 40009:
                        customAlert.alert("部落可容纳成员已达最大值，加入失败！");
                        break;
                
                    default:
                        const error = `操作失败，原因：${message}`;
                        customAlert.alert(error);
                        break;
                }
            });
        },
        formatTimeV(date){
            if(!date) return "未知";
            var timespan = (new Date(date)).getTime()/1000;
            return netAge(timespan);
        },
        formatNumberV(num){
            return formatNumber(num);
        },
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);

const linkJoinOasis = app.mount('#app');

window.linkJoinOasisPage = linkJoinOasis;


linkJoinOasis.loadInvitationInfoV();


async function acceptAndJoinAOasis(invitationCodeRecordId){
    const url="/api/v1/oasis/invitation_link/{id}/be_member".replace("{id}",invitationCodeRecordId);
    return await axios.post(url);
}

async function fetchInvitationInfo(invitationCode){
    const url="/api/open/oasis/setting/invitation_link/info?invitationCode="+invitationCode;
    return await axios.get(url);
}

async function loadInvitationInfo(invitationCode){
   return  await fetchInvitationInfo(invitationCode);
}

function joinAOasis(joinId){
  return acceptAndJoinAOasis(joinId);
}

