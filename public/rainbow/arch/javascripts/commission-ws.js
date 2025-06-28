import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";



import {CellPlanOrderTag} from "/common/javascripts/tm-constant.js";
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

const chatChannel=getQueryVariable("id");

const RootComponent = {
    data() {
        return {
            maxFileSize: 20971520, // 20M
            deliverFileSizeExceeded: false,
            previewFileSizeExceeded: false,
            delieverOrPreviewFileIsEmpty: true,
            commissionDetail:{

            }
        }
    },
    methods: {
        tagCellPlanOrderAsDeliveringV(){
            const orderId=getQueryVariable("id");
            tagCellPlanOrder(orderId,CellPlanOrderTag.DELIVERING).then(response=>{
                if(response.data.code==200){
                   this.findPlanDetailV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
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

            const file = event.target.files[0];
            if (file.size > this.maxFileSize) {
              this.deliverFileSizeExceeded = true;
              return; // do not process the file if it exceeds the size limit
            }

            this.delieverOrPreviewFileIsEmpty=((!document.querySelector('#inputPreviewFile').value) 
                   || (!document.querySelector('#inputDeliverFile').value));


        },
        handlePreviewFileUpload(event) {
            this.previewFileSizeExceeded = false;

            const file = event.target.files[0];
            if (file.size > this.maxFileSize) {
              this.previewFileSizeExceeded = true;
              return; // do not process the file if it exceeds the size limit
            }
            this.delieverOrPreviewFileIsEmpty=((!document.querySelector('#inputPreviewFile').value) 
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
// app.mixin(new BrandInfoComponent({need_init: true}));

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
async function doTagCellPlanOrder(orderId,dto){
    const url="/api/v1/web_estudio/cell/plan_order/{id}/tag".replace("{id}",orderId);
    return await axios.put(url,dto);
}
function tagCellPlanOrder(orderId,tag){
    const dto={
        tag: tag
    }
    return doTagCellPlanOrder(orderId,dto);
}
function findCommissionDetail(){
    const id=getQueryVariable("id");
    return fetchCommissionDetail(id);
}

$(function(){
	$(".tooltip-nav").tooltip();
});
