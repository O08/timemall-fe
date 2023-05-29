import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 


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
         
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));

app.mixin(ImageAdaptiveComponent);

const transactionPage = app.mount('#app');
window.cTransaction= transactionPage;
