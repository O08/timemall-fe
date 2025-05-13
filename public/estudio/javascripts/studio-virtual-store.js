import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from 'axios';
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"

import {ProductStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

const RootComponent = {
    data() {
        return {
            online_pagination:{
                url: "/api/v1/web_mall/brand/virtual/product",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    brandId: this.getIdentity().brandId,
                    status: ProductStatus.Online
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.online_pagination.size = response.product.size;
                        this.online_pagination.current = response.product.current;
                        this.online_pagination.total = response.product.total;
                        this.online_pagination.pages = response.product.pages;
                        this.online_pagination.records = response.product.records;
                        this.online_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, max: 5});

                    }
                }
            }, 
            offline_pagination:{
                url: "/api/v1/web_mall/brand/virtual/product",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                  brandId: this.getIdentity().brandId,
                  status: ProductStatus.Offline
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.offline_pagination.size = response.product.size;
                        this.offline_pagination.current = response.product.current;
                        this.offline_pagination.total = response.product.total;
                        this.offline_pagination.pages = response.product.pages;
                        this.offline_pagination.records = response.product.records;
                        this.offline_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, max: 5});
                    }
                }
            },
            draft_pagination:{
                url: "/api/v1/web_mall/brand/virtual/product",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                  brandId: this.getIdentity().brandId,
                  status: ProductStatus.Draft
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.draft_pagination.size = response.product.size;
                        this.draft_pagination.current = response.product.current;
                        this.draft_pagination.total = response.product.total;
                        this.draft_pagination.pages = response.product.pages;
                        this.draft_pagination.records = response.product.records;
                        this.draft_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        onlineProductV(productId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForProduct(productId,ProductStatus.Online).then((response)=>{
                if(response.data.code == 200){
                   this.reloadCellTable();
                }
            });
        },
        offlineProductV(productId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForProduct(productId,ProductStatus.Offline).then((response)=>{
                if(response.data.code == 200){
                   this.reloadCellTable();
                }
            });
        },
        reloadCellTable(){
            this.reloadPage(this.online_pagination);
            this.reloadPage(this.offline_pagination);
        },
        removeOneProductV(productId){
          trashProduct(productId).then((response)=>{
                if(response.data.code == 200){
                    this.reloadPage(this.draft_pagination);
                    this.disposePopOver();

                }
            });
        },
        disposePopOver(){
             // Remove already delete element popover ,maybe is bug
             $('[data-popper-reference-hidden]').remove();
        }
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
                         need_fetch_mutiple_event_feed : false,
                         scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                studioStorePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const studioStorePage = app.mount('#app');
window.cStore = studioStorePage;
// init
studioStorePage.pageInit(studioStorePage.online_pagination);
studioStorePage.pageInit(studioStorePage.offline_pagination);
studioStorePage.pageInit(studioStorePage.draft_pagination);


/**
 * 
 * @param {*} productId  cell id
 * @param {*} status 1--draft ; 2--onsale; 3--offsale;
 */
async function modifyProductStatus(productId,status){
    var url = "/api/v1/web_estudio/virtual/product/status";
    const dto = {
      productId,
      status
    }
    return await axios.put(url,dto);
} 
async function trashProduct(productId){
    var url = "/api/v1/web_estudio/virtual/product/{id}/remove".replace("{id}",productId);
    return await axios.delete(url);
}


function onOrOffSaleForProduct(productId,status){
    return modifyProductStatus(productId,status);
}



function showContent(){
    const option = getQueryVariable("tab");
    if(option === "active"){
        $("#activeCell-tab").trigger("click");
    }
    if(option === "paused"){
        $("#pausedCell-tab").trigger("click");
    }
    if(option === "draft"){
        $("#draftCell-tab").trigger("click");
    }
}
showContent();

$(function(){
	$(".tooltip-nav").tooltip();
});