import Tribute from "tributejs";
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import StemChatCompoent from "/micro/arch/javascripts/StemChatCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const sandboxEnv= getQueryVariable("sandbox");
const currentOch = window.location.pathname.split('/').pop();

const RootComponent = {
    data() {
        return {
            sandbox: !sandboxEnv ? "0" : sandboxEnv
        }
    },
    methods: {
        removeMessageV(messageId){
            removeMessage(messageId).then(response=>{
                if(response.data.code==200){
                    this.removeOneMessageFromLocalV(messageId); // from chat compoent
                }
                if(response.data.code==40038){
                    customAlert.alert(response.data.message);
                }
            });
        },
        mentioMemberV(member){
            const mentionHtml= (
                '<span contenteditable="false" class="mention-role"><a  title="user_' +
                member.authorUserId +
                '">@' + 
                member.author +
                "</a></span>&nbsp;"
              );
            document.querySelector(".chat-input").innerHTML += mentionHtml;
        },
       
        
    },

}

const chatChannel=currentOch;

let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(RtmCompoent);
app.mixin(new StemChatCompoent({
    chatSetting: {
        fetchMessageUrl: "/api/v1/app/group_chat/{channel}/feed".replace("{channel}",chatChannel),
        sendTextMessageUrl: "/api/v1/app/group_chat/feed/storeText",
        sendImageMessageUrl: "/api/v1/app/group_chat/feed/storeImage",
        sendAttachmentUrl: "/api/v1/app/group_chat/feed/storeAttachment",
        rtcChannel: chatChannel,
        rtcPrefix: "gca",
        enableRtc: true
    }
}))

const chatApp = app.mount('#app');

window.chatAppPage = chatApp;

chatApp.joinRoomInitV(); // rtm.js
chatApp.userAdapter(); // auth.js init
// oasisGroupMsg.sseInitV();// Ssecompoent.js
chatApp.initMessageRecordV(); // stemchatcomponent.js

async function doDelOneGroupMessage(messageId){
    const url ="/api/v1/app/group_chat/feed/{id}/del".replace("{id}",messageId);
    return await axios.delete(url);
}

function removeMessage(messageId){
    return doDelOneGroupMessage(messageId);
}



 // @mention

 var tribute = new Tribute({
    // menuContainer: document.getElementById('content'),
    values: function (text, cb) {
        remoteSearch(text, users => cb(users));
    },
    lookup: 'brandName',
    fillAttr: 'brandName',
    noMatchTemplate: function () {
        return '<span style="font-size:12px">未找到匹配项!</span>';
    },
    selectTemplate: function(item) {
      if (typeof item === "undefined") return null;
      if (this.range.isContentEditable(this.current.element)) {
        return (
          '<span contenteditable="false" class="mention-role"><a  target="_blank" title="' +
          item.original.brandId +
          '">@' + 
          item.original.brandName +
          "</a></span>"
        );
      }

      return "@" + item.original.brandName;
    },
    menuItemTemplate: function (item) {
        const avatarUrl=  (!item.original.avatar ? "https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/panda-kawaii.svg" :item.original.avatar );

        return '<img src="'+ chatApp.adaptiveImageUriV(avatarUrl) + '">' + item.original.brandName;
    },
    requireLeadingSpace: false
  });

  tribute.attach(document.getElementById("twemoji-picker"));



var ce = document.querySelector('[contenteditable]')
ce.addEventListener('paste', function (e) {
  e.preventDefault()
  navigator.clipboard
  .readText()
  .then((clipText) => {
    e.target.innerText +=  clipText
  });

})


function remoteSearch(text, cb) {
    var URL = "/api/v1/app/group_chat/channel/{id}/member".replace("{id}",currentOch );
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          cb(data.member.records);
        } else if (xhr.status === 403) {
          cb([]);
        }
      }
    };
    xhr.open("GET", URL + "?q=" + text, true);
    xhr.send();
  }