import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from 'axios';
var CellStatus = Object.freeze({
    "Draft":1,
    "Online":2,
    "Offline":3
});
const RootComponent = {
    data() {
        return {
            online_pagination:{
                url: "/api/v1/web_estudio/brand/cellIndices",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: CellStatus.Online
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.online_pagination.size = response.cells.size;
                        this.online_pagination.current = response.cells.current;
                        this.online_pagination.total = response.cells.total;
                        this.online_pagination.pages = response.cells.pages;
                        this.online_pagination.records = response.cells.records;
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
                    code: CellStatus.Offline
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.offline_pagination.size = response.cells.size;
                        this.offline_pagination.current = response.cells.current;
                        this.offline_pagination.total = response.cells.total;
                        this.offline_pagination.pages = response.cells.pages;
                        this.offline_pagination.records = response.cells.records;
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
                    code: CellStatus.Draft
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.draft_pagination.size = response.cells.size;
                        this.draft_pagination.current = response.cells.current;
                        this.draft_pagination.total = response.cells.total;
                        this.draft_pagination.pages = response.cells.pages;
                        this.draft_pagination.records = response.cells.records;
                    }
                }
            }
        }
    },
    methods: {
        onlineCell(cellId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForCell(cellId,CellStatus.Online).then((response)=>{
                if(response.data.code == 200){
                   this.reloadCellTable();
                }
            });
        },
        offlineCell(cellId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForCell(cellId,CellStatus.Offline).then((response)=>{
                if(response.data.code == 200){
                   this.reloadCellTable();
                }
            });
        },
        reloadCellTable(){
            this.reloadPage(this.online_pagination);
            this.reloadPage(this.offline_pagination);
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
        
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
const studioStorePage = app.mount('#app');
window.cStore = studioStorePage;
// init
studioStorePage.pageInit(studioStorePage.online_pagination);
studioStorePage.pageInit(studioStorePage.offline_pagination);
studioStorePage.pageInit(studioStorePage.draft_pagination);


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