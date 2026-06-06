import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

import Pagination  from "/common/javascripts/pagination-vue.js";

import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import { renderDateInChina } from "/common/javascripts/util.js";


const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
          oasisAvatarDefault,
          taskList_pagination: {
            url: "/api/v1/team/worker/commission",
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
                    this.taskList_pagination.size = response.commission.size;
                    this.taskList_pagination.current = response.commission.current;
                    this.taskList_pagination.total = response.commission.total;
                    this.taskList_pagination.pages = response.commission.pages;
                    this.taskList_pagination.records = response.commission.records;
                    this.taskList_pagination.paging = this.doPaging({current: response.commission.current, pages: response.commission.pages, size: 5});
    
                }
            }
        },
    }},
    methods: {

        retrieveTaskDataV(){
            this.taskList_pagination.param.tag="";
            this.taskList_pagination.current = 1;
            this.taskList_pagination.size = 10;
            this.reloadPage(this.taskList_pagination);
        },
       
        retrieveByStatusV(){
            this.taskList_pagination.current = 1;
            this.taskList_pagination.size = 10;
            this.reloadPage(this.taskList_pagination);
        },
        renderDateInChinaV(dateStr,daysOffset){
            return renderDateInChina(dateStr,daysOffset);
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
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content') || tag.startsWith('top-search')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                workerTaskPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

const workerTaskPage = app.mount('#app');
window.cMentorshipPage = workerTaskPage;
workerTaskPage.pageInit(workerTaskPage.taskList_pagination);





$(function(){
	$(".tooltip-nav").tooltip();
});