import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";



import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene,CellPlanOrderTag} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  CellPlanOrderChatCompoent from "/estudio/javascripts/compoent/CellPlanOrderChatCompoent.js";
import CellPlanOrderDeliverCompoent from "/estudio/javascripts/compoent/CellPlanOrderDeliverCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
const RootComponent = {
    data() {
        return {
            maxFileSize: 20971520, // 20M
            deliverFileSizeExceeded: false,
            previewFileSizeExceeded: false,
            delieverOrPreviewFileIsEmpty: true,
            orderDetail:{

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
        findPlanDetailV(){
            findPlanDetail().then(response=>{
                if(response.data.code==200){
                    this.orderDetail=response.data.order;
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
        this.findPlanDetailV();
        this.doFetchPaperDeliverDetailV();
    },
    updated(){

        if(document.getElementById("event-tab").ariaSelected=='true'){
            document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new BrandInfoComponent({need_init: true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CellPlanOrderChatCompoent);
app.mixin(CellPlanOrderDeliverCompoent);
app.mixin(RtmCompoent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
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
    
const tobActionPage = app.mount('#app');
window.cTobActionPage = tobActionPage;

async function fetchPlanDetail(planOrderId){
    const url="/api/v1/web_estudio/cell/plan_order/{id}".replace("{id}",planOrderId);
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
function findPlanDetail(){
    const orderId=getQueryVariable("id");
    return fetchPlanDetail(orderId);
}

$(function(){
	$(".tooltip-nav").tooltip();
});
