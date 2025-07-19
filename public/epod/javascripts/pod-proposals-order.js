import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const RootComponent = {
  data() {
    return {
      proposalOrder_pagination: {
        url: "/api/v1/web_pod/me/proposal/order/query",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          tag: ""
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.proposalOrder_pagination.size = response.proposal.size;
                this.proposalOrder_pagination.current = response.proposal.current;
                this.proposalOrder_pagination.total = response.proposal.total;
                this.proposalOrder_pagination.pages = response.proposal.pages;
                this.proposalOrder_pagination.records = response.proposal.records;
                this.proposalOrder_pagination.paging = this.doPaging({current: response.proposal.current, pages: response.proposal.pages, size: 5});

            }
        }
    },
    }},
    methods: {
      filterByProjectStatusV(){
        this.proposalOrder_pagination.current = 1;
        this.proposalOrder_pagination.size = 10;
        this.reloadPage(this.proposalOrder_pagination);
      },
      retrieveOrderDataV(){
        this.proposalOrder_pagination.param.tag = "";
        this.proposalOrder_pagination.current = 1;
        this.proposalOrder_pagination.size = 10;
        this.reloadPage(this.proposalOrder_pagination);
      },
    }
}

const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
              proposalOrderPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const proposalOrderPage = app.mount('#app');
window.cProposalOrderPage = proposalOrderPage;

proposalOrderPage.pageInit(proposalOrderPage.proposalOrder_pagination);




$(function(){
	$(".tooltip-nav").tooltip();
});