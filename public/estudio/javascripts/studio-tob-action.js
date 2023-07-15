import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";



import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene,CommercialPaperTag} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  TobChatCompoent from "/estudio/javascripts/compoent/TobChatCompoent.js";
import MpsPaperDeliverCompoent from "/estudio/javascripts/compoent/MpsPaperDeliverCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";


const RootComponent = {
    data() {
        return {
            maxFileSize: 20971520, // 20M
            deliverFileSizeExceeded: false,
            previewFileSizeExceeded: false,
            delieverOrPreviewFileIsEmpty: true,
            paperDetail:{

            }
        }
    },
    methods: {
        findPaperDetailV(){
            findPaperDetail().then(response=>{
                if(response.data.code==200){
                    this.paperDetail=response.data.detail;
                    this.fetchHaveNewMpsMsgRoomV();
                    this.joinMpsRoomsV();
                }
            });
        },
        explainPaperTagV(tag){
            return explainPaperTag(tag);
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
        this.findPaperDetailV();
        this.doFetchPaperDeliverDetailV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(TobChatCompoent);
app.mixin(MpsPaperDeliverCompoent);
app.mixin(RtmCompoent);


    
const tobActionPage = app.mount('#app');
window.cTobActionPage = tobActionPage;

async function fetchPaperDetail(paperId){
    const url="/api/v1/web_estudio/commercial_paper/{id}/detail".replace("{id}",paperId);
    return await axios.get(url);
}

function findPaperDetail(){
    const paperId=getQueryVariable("paper_id");
    return fetchPaperDetail(paperId);
}
function explainPaperTag(paperTag){
    var paperTagDesc="";
    switch(paperTag){
        case CommercialPaperTag.CREATED:
            paperTagDesc="新建";
            break; 
        case CommercialPaperTag.PUBLISH:
            paperTagDesc="招商中";
                break; 
        case CommercialPaperTag.OFFLINE:
            paperTagDesc="已停止";
            break; 
        case CommercialPaperTag.END:
            paperTagDesc="已完成";
                break; 
        case CommercialPaperTag.DELIVERING:
            paperTagDesc="交付中";
                break; 
    }
    return paperTagDesc;
}