import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"

import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import StemChatCompoent from "/micro/arch/javascripts/StemChatCompoent.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {GroupChatPolicyRel} from "/common/javascripts/tm-constant.js";

import axios from "axios";
import defaultAvatarImage from '/common/icon/panda-kawaii.svg';
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";

const currentOasisId = getQueryVariable("oasis_id");

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);







const RootComponent = {
    data() {
      return {
        channelSort, oaisiChannelList,getChannelDataV,
        timer: null,
        viewerProfile: {},
        defaultAvatarImage,
        currentOptionMember: "",
        currentOptionMemberProfile: {}
      }
    },
    methods: {
        followOasisV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            OasisApi.followOasis(this.oasisId,brandId).then(response=>{
                if(response.data.code==200){
                    this.fetchViewerProfileV();
                    this.loadJoinedOases();
                    this.initMessageRecordV();
                }
            });
        },
        fetchViewerProfileV(){
            const channel=getQueryVariable("oasis_id");
            const member=this.getIdentity().userId; // Auth.getIdentity();
            fetchGroupMemberProfile(channel,member).then(response=>{
                if(response.data.code==200){
                    this.viewerProfile=response.data.profile;
                }
            })
        },
        showMemberOptionV(e,member){
            this.currentOptionMember = member;
            const channel=getQueryVariable("oasis_id");

            fetchGroupMemberProfile(channel,member).then(response=>{
                if(response.data.code==200){
                    this.currentOptionMemberProfile=response.data.profile;
                    if(!!this.currentOptionMemberProfile){
                        showMemberOtpion(e);
                    }
                }
            })
        },
        removeMessageV(messageId){
            const channel=getQueryVariable("oasis_id");
            removeMessage(channel,messageId).then(response=>{
                if(response.data.code==200){
                    this.removeOneMessageFromLocalV(messageId); // from chat compoent
                }
            });
        },
        banMemberV(){
            banMember(this.currentOptionMember).then(response=>{
                if(response.data.code==200){
                    this.currentOptionMemberProfile.policyRel=GroupChatPolicyRel.READ;
                }
            });
        },
        contextMenuMoblieHanderOnStartV(e,member){
            this.timer = setTimeout(() => {
                this.timer = null; // 清除计时器
                this.showMemberOptionV(e,member); // 触发删除事件
            }, 1000); // 设置长按时间为1秒
        },
        contextMenuMoblieHanderOnEndV(){

            if (this.timer) {
                clearTimeout(this.timer); // 清除计时器
            }
        }
        
    },
    created(){
        this.fetchViewerProfileV();
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
app.mixin(RtmCompoent);
app.mixin(new StemChatCompoent({
    chatSetting: {
        fetchMessageUrl: "/api/v1/ms/group/{channel}/event".replace("{channel}",chatChannel),
        sendTextMessageUrl: "/api/v1/ms/group/{channel}/storeText".replace("{channel}",chatChannel),
        sendImageMessageUrl: "/api/v1/ms/group/{channel}/storeImage".replace("{channel}",chatChannel),
        sendAttachmentUrl: "/api/v1/ms/group/{channel}/storeAttachment".replace("{channel}",chatChannel),
        rtcChannel: chatChannel,
        rtcPrefix: "group",
        enableRtc: true
    }
}))

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const oasisGroupMsg = app.mount('#app');

window.oasisGroupMsgPage = oasisGroupMsg;

// member option menu

//refer menu div
let contextMenu = document.getElementById("context-menu");

function showMemberOtpion(e){
    // e.preventDefault();
    let mouseX = e.clientX || e.touches[0].clientX;
//mouseY represents the y-coordinate of the mouse.
  let mouseY = e.clientY || e.touches[0].clientY;
  //height and width of menu
//getBoundingClientRect() method returns the size of an element and its position relative to the viewport
  let menuHeight = contextMenu.getBoundingClientRect().height;
  let menuWidth = contextMenu.getBoundingClientRect().width;
  //width and height of screen
//innerWidth returns the interior width of the window in pixels
  let width = window.innerWidth;
  let height = window.innerHeight;
  //If user clicks/touches near right corner
  if (width - mouseX <= 200) {
    contextMenu.style.borderRadius = "5px 0 5px 5px";
    contextMenu.style.left = width - menuWidth + "px";
    contextMenu.style.top = mouseY + "px";
    //right bottom
    if (height - mouseY <= 200) {
      contextMenu.style.top = mouseY - menuHeight + "px";
      contextMenu.style.borderRadius = "5px 5px 0 5px";
    }
  }
  //left
  else {
    contextMenu.style.borderRadius = "0 5px 5px 5px";
    contextMenu.style.left = mouseX + "px";
    contextMenu.style.top = mouseY + "px";
    //left bottom
    if (height - mouseY <= 200) {
      contextMenu.style.top = mouseY - menuHeight + "px";
      contextMenu.style.borderRadius = "5px 5px 5px 0";
    }
  }
  //display the menu
  contextMenu.style.visibility = "visible";
}

//click outside the menu to close it (for click devices)
document.addEventListener("click", function (e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.visibility = "hidden";
    }
    }
);

async function doDelOneGroupMessage(channel,messageId){
   const url ="/api/v1/ms/group/{channel}/event/{message_id}/del".replace("{channel}",channel).replace("{message_id}",messageId);
   return await axios.delete(url);
}
async function doBanMember(channel,member){
    const url="/api/v1/ms/group/{channel}/member/{user_id}/ban".replace("{channel}",channel).replace("{user_id}",member);
    return await axios.put(url);
}
async function doFetchGroupMemberProfile(channel,memberId){
    const url="/api/v1/ms/group/{channel}/member/{id}/profile".replace("{channel}",channel).replace("{id}",memberId);
    return await axios.get(url);
}

function fetchGroupMemberProfile(channel,memberId){
    return doFetchGroupMemberProfile(channel,memberId);
}

function removeMessage(channel,messageId){
    return doDelOneGroupMessage(channel,messageId);
}
function banMember(member){
    const channel=getQueryVariable("oasis_id");
    return doBanMember(channel,member);
}
