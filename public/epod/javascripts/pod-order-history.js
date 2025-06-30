import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene,PriceSbu} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


const RootComponent = {
    data() {
        return {
            contact: {},
            transpagination:{
                url: "/api/v1/web_epod/me/transaction",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.transpagination.size = response.transactions.size;
                        this.transpagination.current = response.transactions.current;
                        this.transpagination.total = response.transactions.total;
                        this.transpagination.pages = response.transactions.pages;
                        this.transpagination.records = response.transactions.records;
                        this.transpagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, size: 5});

                    }
                }
            }
        }
    },
    methods: {
        retrieveTransV(){
            this.transpagination.current=1;
            this.transpagination.size=10;
            this.reloadPage(this.transpagination);
        },
        showContactInfoV(brandId){
            showContactInfo(brandId);
        },
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
app.mixin(DirectiveComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
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
                transactionPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const transactionPage = app.mount('#app');
window.pTransaction= transactionPage;


async function getBrandContact(brandId)
{
    const url = "/api/v1/web_epod/brand/{brand_id}/contact".replace("{brand_id}",brandId);
    return await axios.get(url);
    
}


function findBrandContactInfo(brandId){
    getBrandContact(brandId).then(response=>{
     if(response.data.code==200){
        pTransaction.contact = response.data.contact;
     }
    });
 }
 
 
 function showContactInfo(brandId){
     findBrandContactInfo(brandId);
     $("#displayModal").modal("show");
 }

  // Enable popovers 
  $('[data-bs-toggle="popover"]').popover();

  $(function(){
	$(".tooltip-nav").tooltip();
});