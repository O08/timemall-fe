import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";



const RootComponent = {
    data() {
        return {
            transList_pagination: {
                url: "/api/v1/base/electricity/history",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.transList_pagination.size = response.trans.size;
                        this.transList_pagination.current = response.trans.current;
                        this.transList_pagination.total = response.trans.total;
                        this.transList_pagination.pages = response.trans.pages;
                        this.transList_pagination.records = response.trans.records;
                        this.transList_pagination.paging = this.doPaging({current: response.trans.current, pages: response.trans.pages, size: 5});
        
                    }
                }
            },
        }
    }

}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : true,
    scene: EventFeedScene.POD}));
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
                pointsHistoryPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const pointsHistoryPage = app.mount('#app');
window.pPointsHistoryPage= pointsHistoryPage;

// init
pointsHistoryPage.pageInit(pointsHistoryPage.transList_pagination);


 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});