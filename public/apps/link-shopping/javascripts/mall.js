import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";


const sandboxEnv= getQueryVariable("sandbox");
const currentOch = window.location.pathname.split('/').pop();

const RootComponent = {
    data() {
      return {
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        feedArr: [],
        feedList_pagination: {
            url: "/api/v1/app/link_shopping/product/list",
            size: 24,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            isLoading: false,
            param: {
              q: '',
              sort: "2",
              channel: currentOch
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.feedList_pagination.size = response.feed.size;
                    this.feedList_pagination.current = response.feed.current;
                    this.feedList_pagination.total = response.feed.total;
                    this.feedList_pagination.pages = response.feed.pages;
                    this.feedList_pagination.records = response.feed.records;
                    this.feedList_pagination.isLoading = false;
                    this.feedArr.push(...response.feed.records);
                }
            }
        },
    }
    },
    methods: {
        retrieveFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.reloadPage(this.feedList_pagination);
        },
        captueItemDataV(itemId){
            captueItemDataBO(itemId);
        },
        fetchChannelGeneralInfoV(){
       
            AppApi.fetchChannelGeneralInfo(currentOch).then(response=>{
                if(response.data.code == 200){
                    var title = !response.data.channel ? "链接商店" : response.data.channel.channelName;
                    document.title = title + " | bluvarri.com";
                }
            });
        },
        showMoreV(){
            showMore();
        },
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);

const linkShoppingApp = app.mount('#app');

window.linkShoppingAppPage = linkShoppingApp;

linkShoppingApp.pageInit(linkShoppingApp.feedList_pagination);
linkShoppingApp.fetchChannelGeneralInfoV();

async function captueItemData(itemId){
    const dto={
    }
    const url="/api/v1/app/link_shopping/product/{id}/data_science".replace("{id}",itemId);;
    return await axios.put(url,dto);
}

async function captueItemDataBO(itemId){
    return await captueItemData(itemId);
}

function showMore(){
    if(linkShoppingApp.feedList_pagination.isLoading){
        return;
    }
    linkShoppingApp.feedList_pagination.current = linkShoppingApp.feedList_pagination.current +  1;
    linkShoppingApp.feedList_pagination.isLoading = true;

    linkShoppingApp.reloadPage(linkShoppingApp.feedList_pagination);

}