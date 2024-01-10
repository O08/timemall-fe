import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable,getSecondsBetween } from "/common/javascripts/util.js";
import  PrivateApi from "/micro/arch/javascripts/PrivateApi.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {SseEventBusScene} from "/common/javascripts/tm-constant.js";
import defaultAvatarImage from '/avator.png';
import StemChatCompoent from "/micro/arch/javascripts/StemChatCompoent.js";









const RootComponent = {
    data() {
      return {
        timer: null,
        defaultAvatarImage,
        currentFriendForOption: "",
        currentChatFriendId: "",
        friends:{records: []},
        friendProfile: {}
      }
    },
    methods: {
        beNewFriendV(){
          var _that=this;
          return !!_that.friendProfile && !!_that.friendProfile.id && !!_that.friends.records && _that.friends.records.filter(e=>e.id===_that.friendProfile.id).length==0;
        },
        fetchFriendProfileV(){
          const friend = getQueryVariable("friend");
          if(!friend){
            return;
          }
          PrivateApi.fetchFriendProfile(friend).then(response=>{
            if(response.data.code==200){
               this.friendProfile=response.data.profile;
            }
         });
        },
        fetchPrivateFriendV(){

            PrivateApi.fetchPrivateFriend().then(response=>{
               if(response.data.code==200){
                  this.friends=response.data.friend;
               }
            });

        },
        privateMarkAllMsgAsReadV(){
            const friend = getQueryVariable("friend");
            PrivateApi.markAllMsgAsRead(friend);
        },
        fetchPrivateFriendAndMarkAsReadV(){
            this.fetchPrivateFriendV();
            this.privateMarkAllMsgAsReadV();
        },
        deleteAllMsgV(){
            PrivateApi.delAllFriendMsg(this.currentFriendForOption).then(response=>{
              if(response.data.code==200){
                 if(this.currentFriendForOption==this.currentChatFriendId){
                  goPrivatePageWithoutFriendQueryVariable();

                 }else{
                  this.fetchPrivateFriendV();
                 }
                // this.retrieveMessageV();
              }
          });
        },
        recallMessageV(messageId){
            PrivateApi.recallOneMessage(messageId).then(response=>{
                if(response.data.code==200){
                  this.removeOneMessageFromLocalV(messageId); // from chat compoent
                }
            });
        },
        showFriendOptionV(e,friend){
            this.currentFriendForOption=friend;
            showFriendOtpion(e);
        },
        canRecallMessageV(msgSendTime){
          var seconds=  getSecondsBetween(new Date(),new Date(msgSendTime));
          return seconds < 60;
        }
         
    },
    created(){
        this.currentChatFriendId=getQueryVariable("friend");
        if(!!this.currentChatFriendId && this.currentChatFriendId==this.getIdentity().userId){
          goPrivatePageWithoutFriendQueryVariable();
          return ;
        }

        this.fetchPrivateFriendAndMarkAsReadV();
        this.fetchFriendProfileV();
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

        // document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        
    }
}

const chatChannel=getQueryVariable("friend");

let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(RtmCompoent);
app.mixin(new StemChatCompoent({
    chatSetting: {
        fetchMessageUrl: "/api/v1/ms/private/{friend}/event".replace("{friend}",chatChannel),
        sendTextMessageUrl: "/api/v1/ms/private/{friend}/event/storeText".replace("{friend}",chatChannel),
        sendImageMessageUrl: "/api/v1/ms/private/{friend}/event/storeImage".replace("{friend}",chatChannel),
        sendAttachmentUrl: "/api/v1/ms/private/{friend}/event/storeAttachment".replace("{friend}",chatChannel),
        rtcChannel: chatChannel,
        rtcPrefix: "private",
        sendMessageOkHandler: ()=>{
            PrivateApi.markAllMsgAsRead(chatChannel);
        },
        enableRtc: false
      }
}));
app.mixin(
    new Ssecompoent({
        sslSetting:{
            onMessage: (e)=>{
               console.log("msg is :" + e.data);
               var data= JSON.parse(e.data);
               if(data.scene===SseEventBusScene.PRIVATE){
                 sseEventBusPrivateSeceneHandler(data);
               }
            }
        }
    })
);



const privateChatApp = app.mount('#app');

window.privateChatAppPage = privateChatApp;


function sseEventBusPrivateSeceneHandler(data){
  if(data.from===chatChannel){
    privateChatApp.privateMarkAllMsgAsReadV();
    privateChatApp.fetchIncrementMessageV();
  }
  if(data.from!=chatChannel){
    privateChatApp.fetchPrivateFriendV();
  }
}

// friend option menu

//refer menu div
let contextMenu = document.getElementById("context-menu");

function showFriendOtpion(e){
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
    });

function goPrivatePageWithoutFriendQueryVariable(){
  window.location.href="/micro/arch/channel-0002.html";
}
