import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene,PriceSbu} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

const RootComponent = {
    data() {
        return {
            transpagination:{
                url: "/api/v1/web_estudio/brand/transaction",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                },
                paging: {},
                responesHandler: (response)=>{
                    // mock data todo: need to remove 
                    // response = mockTransData();
                    if(response.code == 200){
                        this.transpagination.size = response.transactions.size;
                        this.transpagination.current = response.transactions.current;
                        this.transpagination.total = response.transactions.total;
                        this.transpagination.pages = response.transactions.pages;
                        this.transpagination.records = response.transactions.records;
                        this.transpagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
        } 
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);
    },
    updated(){
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));

app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
} 
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                transactionPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const transactionPage = app.mount('#app');
window.cTransaction= transactionPage;

  // Enable popovers 
  $('[data-bs-toggle="popover"]').popover();

  $(function(){
	$(".tooltip-nav").tooltip();
});