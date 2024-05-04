import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


const RootComponent = {
    data() {
        return {
            display: "normal",
            paperDetail:{

            }
        }
    },
    methods: {
        orderReceivingV(){
            orderReceiving().then(response=>{
                if(response.data.code==200){

                    $("#orderReceivingSuccessModal").modal("show"); // show success modal

                }
                if(response.data.code!=200){
                    alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        findPaperDetailV(){
            findPaperDetail().then(response=>{
                if(response.data.code==200){
                    this.paperDetail=response.data.detail;
                }
            });
        }
    },
    created(){
       var displayWay = getQueryVariable("display");
       if(!!displayWay){
          this.display=displayWay;
       }
        this.findPaperDetailV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new BrandInfoComponent({need_init: true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
    
const paperDetailPage = app.mount('#app');
window.cPaperDetailPage = paperDetailPage;

async function doOrderReceiving(dto){
  const url="/api/v1/web_estudio/mps_paper/order_receiving";
  return await axios.post(url,dto);
}

async function fetchPaperDetail(paperId){
    const url="/api/v1/web_estudio/commercial_paper/{id}/detail".replace("{id}",paperId);
    return await axios.get(url);
}
function orderReceiving(){
    const paperId=getQueryVariable("paper_id");
    const dto={
        paperId: paperId
    }
    return doOrderReceiving(dto);
}
function findPaperDetail(){
    const paperId=getQueryVariable("paper_id");
    return fetchPaperDetail(paperId);
}