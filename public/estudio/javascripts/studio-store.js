import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from 'axios';
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"

import {CellStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

const RootComponent = {
    data() {
        return {
            current_tb: "online",
            searchQ: "",
            online_pagination:{
                url: "/api/v1/web_estudio/brand/cellIndices",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    code: CellStatus.Online
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.online_pagination.size = response.cells.size;
                        this.online_pagination.current = response.cells.current;
                        this.online_pagination.total = response.cells.total;
                        this.online_pagination.pages = response.cells.pages;
                        this.online_pagination.records = response.cells.records;
                        this.online_pagination.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, size: 5});

                    }
                }
            }, 
            offline_pagination:{
                url: "/api/v1/web_estudio/brand/cellIndices",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    code: CellStatus.Offline
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.offline_pagination.size = response.cells.size;
                        this.offline_pagination.current = response.cells.current;
                        this.offline_pagination.total = response.cells.total;
                        this.offline_pagination.pages = response.cells.pages;
                        this.offline_pagination.records = response.cells.records;
                        this.offline_pagination.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, size: 5});
                    }
                }
            },
            draft_pagination:{
                url: "/api/v1/web_estudio/brand/cellIndices",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    code: CellStatus.Draft
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.draft_pagination.size = response.cells.size;
                        this.draft_pagination.current = response.cells.current;
                        this.draft_pagination.total = response.cells.total;
                        this.draft_pagination.pages = response.cells.pages;
                        this.draft_pagination.records = response.cells.records;
                        this.draft_pagination.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, size: 5});
                    }
                }
            }
        }
    },
    methods: {
        searchCellV(){
           if(this.current_tb=="online"){
            this.online_pagination.current = 1;
            this.online_pagination.param.q=this.searchQ;
            this.reloadPage(this.online_pagination);
           }
           if(this.current_tb=="offline"){
            this.offline_pagination.current = 1;
            this.offline_pagination.param.q=this.searchQ;
            this.reloadPage(this.offline_pagination);
           }
           if(this.current_tb=="draft"){
            this.draft_pagination.current = 1;
            this.draft_pagination.param.q=this.searchQ;
            this.reloadPage(this.draft_pagination);
           }
        },
        refreshActiveCellPaginationV(){
            this.current_tb="online";
            this.searchQ="";
            this.online_pagination.current = 1;
            this.online_pagination.param.q="";
            this.reloadPage(this.online_pagination);
        },
        refreshPausedCellPaginationV(){
            this.current_tb="offline";
            this.searchQ="";
            this.offline_pagination.current = 1;
            this.offline_pagination.param.q="";
            this.reloadPage(this.offline_pagination);
        },
        refreshDraftCellPaginationV(){
            this.current_tb="draft";
            this.searchQ="";
            this.draft_pagination.current = 1;
            this.draft_pagination.param.q="";
            this.reloadPage(this.draft_pagination);
        },
        onlineCell(cellId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForCell(cellId,CellStatus.Online).then((response)=>{
                if(response.data.code == 200){
                    this.reloadPage(this.offline_pagination);
                }
            });
        },
        offlineCell(cellId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForCell(cellId,CellStatus.Offline).then((response)=>{
                if(response.data.code == 200){
                    this.reloadPage(this.online_pagination);
                }
            });
        },
        removeSingleCellV(cellId){
            trashCell(cellId).then((response)=>{
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



/**
 * 
 * @param {*} cellId  cell id
 * @param {*} code 1--draft ; 2--onsale; 3--offsale;
 */
async function modifyCellMark(cellId,code){
    var url = "/api/v1/web_estudio/services/{cell_id}/mark".replace("{cell_id}",cellId);
    url= url + "?code=" + code
    return await axios.put(url)
} 
async function trashCell(cellId){
    var url = "/api/v1/web_estudio/services/{cell_id}/trash".replace("{cell_id}",cellId);
    return await axios.delete(url);
}


function onOrOffSaleForCell(cellId,code){
    return modifyCellMark(cellId,code);
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