import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene,CommercialPaperTag} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

const RootComponent = {
    data() {
        return {
            mps_list_pagination:{
                url: "/api/v1/web_estudio/brand/commercial_paper",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: CommercialPaperTag.DELIVERING
                },
                paging: {},
                responesHandler: (response)=>{

                    if(response.code == 200){
                        this.mps_list_pagination.size = response.paper.size;
                        this.mps_list_pagination.current = response.paper.current;
                        this.mps_list_pagination.total = response.paper.total;
                        this.mps_list_pagination.pages = response.paper.pages;
                        this.mps_list_pagination.records = response.paper.records;
                        this.mps_list_pagination.paging = this.doPaging({current: response.paper.current, pages: response.paper.pages, max: 5});
                    }
                }
            },
            mps_order_receiving_pagination:{
                url: "/api/v1/web_estudio/brand/commercial_paper",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: CommercialPaperTag.PUBLISH
                },
                paging: {},
                responesHandler: (response)=>{
                    // mock data todo: need to remove 
                    // response = mockTransData();
                    if(response.code == 200){
                        this.mps_order_receiving_pagination.size = response.paper.size;
                        this.mps_order_receiving_pagination.current = response.paper.current;
                        this.mps_order_receiving_pagination.total = response.paper.total;
                        this.mps_order_receiving_pagination.pages = response.paper.pages;
                        this.mps_order_receiving_pagination.records = response.paper.records;
                        this.mps_order_receiving_pagination.paging = this.doPaging({current: response.paper.current, pages: response.paper.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        resetAndRetrieveMpsPaperListV(){
            resetAndRetrieveMpsPaperList();
        },
        filterPaperListV(filter){
            filterPaperList(filter);
        },
        retrieveMpsTbV(){
            retrieveMpsTb();
        },
        retrieveOrderReceivingPaperTbV(){
            retrieveOrderReceivingPaperTb();
        },
        retrieveMpsPaperListByTagV(tag){
            retrieveMpsPaperListByTag(tag); 
        },
        explainPaperTagV(tag){
            return explainPaperTag(tag);
        }

    },
    created() {
        this.pageInit(this.mps_list_pagination);
        this.pageInit(this.mps_order_receiving_pagination);
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);



    
const tobPage = app.mount('#app');
window.cTobPage = tobPage;

function filterPaperList(filter){
    tobPage.mps_list_pagination.param.filter=filter;
    tobPage.reloadPage(tobPage.mps_list_pagination);
}
function retrieveMpsPaperListByTag(tag){
    tobPage.mps_list_pagination.param.tag=tag;
    tobPage.reloadPage(tobPage.mps_list_pagination);
}

function resetAndRetrieveMpsPaperList(){
    tobPage.mps_list_pagination.param={};
    tobPage.reloadPage(tobPage.mps_list_pagination);
}
function retrieveMpsTb(){

    tobPage.reloadPage(tobPage.mps_list_pagination);

}
function retrieveOrderReceivingPaperTb(){
    tobPage.reloadPage(tobPage.mps_order_receiving_pagination);
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