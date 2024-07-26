import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";


const RootComponent = {
    data() {
        return {
            
            plan_pagination:{
                url: "/api/v1/web_estudio/cell/plan_order",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    planType: "",
                    tag: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.plan_pagination.size = response.planOrder.size;
                        this.plan_pagination.current = response.planOrder.current;
                        this.plan_pagination.total = response.planOrder.total;
                        this.plan_pagination.pages = response.planOrder.pages;
                        this.plan_pagination.records = response.planOrder.records;
                        this.plan_pagination.paging = this.doPaging({current: response.planOrder.current, pages: response.planOrder.pages, max: 5});
                    }
                }
            }
        }

    },
    methods: {
        retrieveCellPlanOrderTbV(){
            retrieveCellPlanOrderTb();
        },
        retrieveCellPlanOrderListByPlanTypeV(){
            retrieveCellPlanOrderListByPlanType();
        },
        retrieveMpsPaperListByTagV(){
            retrieveMpsPaperListByTag();
        }
    },
    updated(){
        $('[data-popper-reference-hidden]').remove();
        $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
        // Enable popovers 
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                millstonePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const millstonePage = app.mount('#app');
window.cMillstone= millstonePage;

// init 
millstonePage.pageInit(millstonePage.plan_pagination);

function retrieveCellPlanOrderTb(){
    millstonePage.plan_pagination.param.planType="";
    millstonePage.plan_pagination.param.tag="";
    millstonePage.plan_pagination.size = 10;
    millstonePage.plan_pagination.current = 1;
    millstonePage.reloadPage(millstonePage.plan_pagination);
}
function retrieveCellPlanOrderListByPlanType(){
    millstonePage.plan_pagination.current=1;
    millstonePage.reloadPage(millstonePage.plan_pagination);
}
function retrieveMpsPaperListByTag(){
    millstonePage.plan_pagination.current=1;
    millstonePage.reloadPage(millstonePage.plan_pagination); 
}


$(function(){
	$(".tooltip-nav").tooltip();
});
