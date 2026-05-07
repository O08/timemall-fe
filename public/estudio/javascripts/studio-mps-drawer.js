import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";
import {EventFeedScene,CommercialPaperTag,MpsTag,MpsType,MpsChainTag} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";

import  StudioApi from "/estudio/javascripts/compoent/StudioApi.js";
import { renderDateInChina } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentMpsId=getQueryVariable("mps_id");

const RootComponent = {
    data() {
        return {
            dashboard: {},
            mps_paper_list_pagination:{
                url: "/api/v1/web_estudio/mps/paper/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: "",
                    difficulty: "",
                    mpsId: currentMpsId
                },
                paging: {},
                responesHandler: (response)=>{

                    if(response.code == 200){
                        this.mps_paper_list_pagination.size = response.paper.size;
                        this.mps_paper_list_pagination.current = response.paper.current;
                        this.mps_paper_list_pagination.total = response.paper.total;
                        this.mps_paper_list_pagination.pages = response.paper.pages;
                        this.mps_paper_list_pagination.records = response.paper.records;
                        this.mps_paper_list_pagination.paging = this.doPaging({current: response.paper.current, pages: response.paper.pages, size: 5});
                    }
                }
            }
        }
    },
    methods: {
        loadDashboardInofV(){
            loadDashboardInof(currentMpsId).then(response=>{
                if(response.data.code==200){
                    this.dashboard=response.data.dashboard ? response.data.dashboard: {totalOrders: "-",expense: "-",deliverings: "-",finished: "-",seekingSuppliers: "-"};

                 }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        retrieveMpsPaperDataV(){
            const tmp = this.mps_paper_list_pagination.param.q;

            this.mps_paper_list_pagination.param = {
                q: "",
                tag: "",
                difficulty: "",
                mpsId: currentMpsId
            }
            this.mps_paper_list_pagination.current = 1;
            this.mps_paper_list_pagination.size = 10;
            this.mps_paper_list_pagination.param.q=tmp;
            this.reloadPage(this.mps_paper_list_pagination);

        },
        retrieveMpsPaperByFilterV(){
            this.mps_paper_list_pagination.current = 1;
            this.mps_paper_list_pagination.size = 10;
            this.reloadPage(this.mps_paper_list_pagination);
        },
        paperAlreadyInvalidV(paper){
            return  (Date.parse(paper.modifiedAt) + (Number(paper.contractValidityPeriod) * (1000 * 3600 * 24)))  < new Date().getTime()
        },
        explainPaperTagV(tag){
            return explainPaperTag(tag);
        },
        renderDateInChinaV(dateStr){
            return renderDateInChina(dateStr);
        },


    },
    updated(){
        
        $(function() {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO,need_init: false
}));
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.mixin(CodeExplainComponent);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
} 

app.mixin(new FriendListCompoent({need_init: false}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: false,
            onMessage: (e)=>{
                mpsDrawerPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);


    
const mpsDrawerPage = app.mount('#app');
window.cMpsDrawerPage = mpsDrawerPage;

// init
mpsDrawerPage.userAdapter(); // auth.js
mpsDrawerPage.initEventFeedCompoentV();

mpsDrawerPage.fetchPrivateFriendV();// FriendListCompoent.js
mpsDrawerPage.sseInitV();// Ssecompoent.js


mpsDrawerPage.pageInit(mpsDrawerPage.mps_paper_list_pagination);

mpsDrawerPage.loadDashboardInofV();


  $(function(){
	$(".tooltip-nav").tooltip();
});


async function doFetchDashboard(mpsId){
    const url="/api/v1/web_estudio/mps/drawer/dashboard?mpsId="+mpsId;
    return await axios.get(url);
}

async function loadDashboardInof(mpsId){
    return await doFetchDashboard(mpsId);
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
        case CommercialPaperTag.CLOSED:
            paperTagDesc="已关单";
                break; 
    }
    return paperTagDesc;
}