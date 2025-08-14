import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import { EventFeedScene } from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination from "/common/javascripts/pagination-vue.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";

const RootComponent = {
    data() {
        return {
            subscription_pagination: {
                url: "/api/v1/web_estudio/brand/subscription/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: ""
                },
                paging: {},
                responesHandler: (response) => {

                    if (response.code == 200) {
                        this.subscription_pagination.size = response.subscription.size;
                        this.subscription_pagination.current = response.subscription.current;
                        this.subscription_pagination.total = response.subscription.total;
                        this.subscription_pagination.pages = response.subscription.pages;
                        this.subscription_pagination.records = response.subscription.records;
                        this.subscription_pagination.paging = this.doPaging({ current: response.subscription.current, pages: response.subscription.pages, size: 5 });
                    }
                }
            }
        }
    },
    methods: {
        searchV() {
            this.subscription_pagination.param.tag = "";
            this.subscription_pagination.current = 1;
            this.subscription_pagination.size = 10;
            this.reloadPage(this.subscription_pagination);
        },
        filterByStatusV() {
            this.subscription_pagination.current = 1;
            this.subscription_pagination.size = 10;
            this.reloadPage(this.subscription_pagination);
        },
    },
    updated() {

        $(function () {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({ need_permission: true }));
app.mixin(new EventFeed({
    need_fetch_event_feed_signal: true,
    need_fetch_mutiple_event_feed: false,
    scene: EventFeedScene.STUDIO
}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({ need_init: true }));

app.mixin(
    new Ssecompoent({
        sslSetting: {
            need_init: true,
            onMessage: (e) => {
                sellerSubsPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

app.mixin(Pagination);

const sellerSubsPage = app.mount('#app');

window.cSellerSubsPagePage = sellerSubsPage;



sellerSubsPage.pageInit(sellerSubsPage.subscription_pagination);


$(function () {
    $(".tooltip-nav").tooltip();
});