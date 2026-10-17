import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";




const RootComponent = {
    data() {
        return {
            sponsorshipList_pagination: {
                url: "/api/v1/web_pod/brand/sponsorship",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {
                  q: ""
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.sponsorshipList_pagination.size = response.sponsorship.size;
                        this.sponsorshipList_pagination.current = response.sponsorship.current;
                        this.sponsorshipList_pagination.total = response.sponsorship.total;
                        this.sponsorshipList_pagination.pages = response.sponsorship.pages;
                        this.sponsorshipList_pagination.records = response.sponsorship.records;
                        this.sponsorshipList_pagination.paging = this.doPaging({current: response.sponsorship.current, pages: response.sponsorship.pages, size: 5});
        
                    }
                }
            },
        }
    },
    methods: {

      retrieveSponsorshipDataV(){
        this.sponsorshipList_pagination.current=1;
        this.reloadPage(this.sponsorshipList_pagination);
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
                sponsorshipHistoryPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(DirectiveComponent);
const sponsorshipHistoryPage = app.mount('#app');
window.pSponsorshipHistoryPage= sponsorshipHistoryPage;

// init
sponsorshipHistoryPage.pageInit(sponsorshipHistoryPage.sponsorshipList_pagination);



 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});