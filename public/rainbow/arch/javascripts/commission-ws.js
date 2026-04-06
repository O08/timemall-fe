import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';



import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import CommissionWSDeliverCompoent from "/rainbow/arch/javascripts/CommissionWSDeliverCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import DefaultChatCompoent from "/rainbow/arch/javascripts/DefaultChatCompoent.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,, chatChannel] = segments;

const commissionId=chatChannel;

const RootComponent = {
    data() {
        return {
            maxFileSize: 20971520, // 20M
            deliverFileSizeExceeded: false,
            previewFileSizeExceeded: false,
            delieverOrPreviewFileIsEmpty: true,
            previewFileSelected: false,
            deliverFileSelected: false,
            previewFileName: '',
            deliverFileName: '',
            uploadingDeliverMaterial: false,
            commissionDetail:{

            }
        }
    },
    methods: {
        findCommissionDetailV(){
            findCommissionDetail().then(response=>{
                if(response.data.code==200){
                    this.commissionDetail=response.data.detail;
                    // this.fetchHaveNewMpsMsgRoomV();
                    // this.joinMpsRoomsV();
                }
            });
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        },
        handleDeliverFileUpload(event) {
            this.deliverFileSizeExceeded = false;
            this.deliverFileSelected = false;
            this.deliverFileName = '';

            const file = event.target.files[0];
            if (!file) return;
            
            if (file.size > this.maxFileSize) {
              this.deliverFileSizeExceeded = true;
              customAlert.alert("文件最大20M!");
              return;
            }

            this.deliverFileSelected = true;
            this.deliverFileName = file.name;
            this.delieverOrPreviewFileIsEmpty = ((!document.querySelector('#inputPreviewFile').value) 
                   || (!document.querySelector('#inputDeliverFile').value));
        },
        handlePreviewFileUpload(event) {
            this.previewFileSizeExceeded = false;
            this.previewFileSelected = false;
            this.previewFileName = '';

            const file = event.target.files[0];
            if (!file) return;
            
            if (file.size > this.maxFileSize) {
              this.previewFileSizeExceeded = true;
              customAlert.alert("文件最大20M!");
              return;
            }
            
            this.previewFileSelected = true;
            this.previewFileName = file.name;
            this.delieverOrPreviewFileIsEmpty = ((!document.querySelector('#inputPreviewFile').value) 
                   || (!document.querySelector('#inputDeliverFile').value));
        }
  
    },
    created(){
        this.findCommissionDetailV();
        this.fetchPaperDeliverDetailV();
    },
    updated(){
        document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));

app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CommissionWSDeliverCompoent);
app.mixin(RtmCompoent);
app.mixin(CodeExplainComponent);
app.mixin(new DefaultChatCompoent({
    chatSetting: {
        fetchMessageUrl: "/api/v1/ms/commission_ws/{channel}/event".replace("{channel}",chatChannel),
        sendTextMessageUrl: "/api/v1/ms/commission_ws/{channel}/storeText".replace("{channel}",chatChannel),
        sendImageMessageUrl: "/api/v1/ms/commission_ws/{channel}/storeImage".replace("{channel}",chatChannel),
        sendAttachmentUrl: "/api/v1/ms/commission_ws/{channel}/storeAttachment".replace("{channel}",chatChannel),
        rtcChannel: chatChannel,
        rtcPrefix: "commission_ws",
        enableRtc: true
    }
}));
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                tobActionPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
  }
    
const tobActionPage = app.mount('#app');
window.cTobActionPage = tobActionPage;
tobActionPage.joinRoomInitV(); // rtm.js

async function fetchCommissionDetail(commissionId){
    const url="/api/v1/team/commission_ws/{id}/detail".replace("{id}",commissionId);
    return await axios.get(url);
}

function findCommissionDetail(){
     return fetchCommissionDetail(commissionId);
}

$(function(){
	$(".tooltip-nav").tooltip();
});
