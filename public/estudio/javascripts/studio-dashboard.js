import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

var DataListModelEnum = Object.freeze({
    "USER_INTEREST": "user_interest",
    "USER_DEL_PRE_REQUIREMENT": "user_del_pre_requirement"
});


const RootComponent = {
    data() {
        return {
            dashboard: {},
            interests: [],
            todoList: [],
            interestsRefreshTime: "--",
            todoListRefreshTime: "--"
        }
    },
    methods: {
        refreshInterestsDataListV(){
            refreshDataList(DataListModelEnum.USER_INTEREST);
        },
        refreshTodoListV(){
            refreshDataList(DataListModelEnum.USER_DEL_PRE_REQUIREMENT);
        },
        initDashboardV(){
          this.loadDashboardV();
          this.getUserTodoListV();
          this.getUserInterestsV();
        },
        loadDashboardV(){
            loadDashboard().then(response=>{
                if(response.data.code==200){
                   this.dashboard=!response.data.dashboard ? {}: response.data.dashboard;

                }
            })
        },
        getUserTodoListV(){
            getUserTodoList().then(response=>{
                if(response.data.code==200){
                   this.todoList=response.data.requirement.records;

                   this.todoListRefreshTime = this.todoList.length == 0 ? "--" : this.todoList[0].createAt
                }
                if(response.data.code==200 && response.data.requirement.records.length==0){
                    this.refreshTodoListV();
                }


            })
        },
        getUserInterestsV(){
            getUserInterests().then(response=>{
                if(response.data.code==200){
                   this.interests=response.data.interest.records;
                   this.interestsRefreshTime = this.interests.length == 0 ? "--" : this.interests[0].createAt

                }
                if(response.data.code==200 && response.data.interest.records.length==0){
                   this.refreshInterestsDataListV();
                }
               
            })
        },
        displayDataItemV(data){
            if(!data){
                return "0.00";
            }
            return data;
        },
        displayRepeatData(data){
            if(!data || data==0){
                return "-";
            }
            return data;
        },
        displayRepeatBuyersRateV(){
            var _dashboard=this.dashboard;
            var repeatBuyers=Number(_dashboard.planRepeatBuyers) + Number(_dashboard.virtualRepeatBuyers) + Number(_dashboard.cellRepeatBuyers);
            var totalBuyers=Number(_dashboard.planTotalBuyers) + Number(_dashboard.cellTotalBuyers) + Number(_dashboard.virtualTotalBuyers);
            if(!totalBuyers || !repeatBuyers || repeatBuyers==0 || totalBuyers==0){
                return "-";
            }
            var res=100*repeatBuyers/totalBuyers;
            return res.toFixed(2);
        },
        displayRepeatEarningsRateV(){
            var _dashboard=this.dashboard;
            var repeatEarnings=Number(_dashboard.planEarningsFromRepeatBuyers) + Number(_dashboard.virtualEarningsFromRepeatBuyers)  + Number(_dashboard.cellEarningsFromRepeatBuyers) ;
            if( !repeatEarnings || !_dashboard.earningsToDate || repeatEarnings==0 || Number(_dashboard.earningsToDate )==0){
                return "-";
            }
            var res = 100*repeatEarnings/Number(_dashboard.earningsToDate );
            return res.toFixed(2);
        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                sellerDashboardPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const sellerDashboardPage = app.mount('#app');
window.cSellerDashboardPage = sellerDashboardPage;

//init
sellerDashboardPage.initDashboardV();

async function fetchSellerDashboard(){
    const url = "/api/v1/web_estudio/seller/dashboard";
    return await axios.get(url)
}

async function fetchUserTodoList(){
    const url="/api/v1/web_mall/me/del_account_requirements";
    return await axios.get(url);
}
async function fetchUserInterests(){
    const url="/api/v1/web_mall/me/interests";
    return await axios.get(url);
}

async function doRefreshDataList(model){
    const url="/api/v1/web_mall/me/compute_ind";
    const dto={
        model: model
    }
    return await axios.put(url,dto);
}

async function refreshDataList(model){
     doRefreshDataList(model).then(response=>{
        if(response.data.code==200 && model===DataListModelEnum.USER_INTEREST){
            sellerDashboardPage.getUserInterestsV();
        }
        if(response.data.code==200 && model===DataListModelEnum.USER_DEL_PRE_REQUIREMENT){
            sellerDashboardPage.getUserTodoListV();
        }
     });
}

async function getUserTodoList(){
 return await fetchUserTodoList();
}
async function getUserInterests(){
    return await fetchUserInterests();
}

async function loadDashboard(){
    return await fetchSellerDashboard();
}







$(function(){
	$(".tooltip-nav").tooltip();
});