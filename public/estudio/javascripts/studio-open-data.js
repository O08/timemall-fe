import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";



const RootComponent = {
    data() {
        return {
            fullViewData:{
            },
            open_data_pagination: {
                url: "/api/v1/web_studio/open/data/semi",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    sort: "1",
                    fromWhere: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.open_data_pagination.size = response.semi.size;
                        this.open_data_pagination.current = response.semi.current;
                        this.open_data_pagination.total = response.semi.total;
                        this.open_data_pagination.pages = response.semi.pages;
                        this.open_data_pagination.records = response.semi.records;
                        this.open_data_pagination.paging = this.doPaging({current: response.semi.current, pages: response.semi.pages, size: 5});
        
                    }
                }
            }
        }
    },
    methods: {
        showFullViewDataModalV(data){
            this.fullViewData={};
            this.fullViewData= JSON.parse(JSON.stringify(data));
            this.fullViewData.details= isJSON(data.details) ? JSON.parse(data.details) : data.details;
            this.fullViewData.rawDetail=data.details;
            $("#fullViewDataModal").modal("show"); // show modal
        },
        retrieveSemiDataV(){
            retrieveSemiData();
        },
        sortSemiDataV(sort){
            this.open_data_pagination.param.sort=sort;
            this.open_data_pagination.current = 1;
            this.open_data_pagination.size = 10;
            this.reloadPage(this.open_data_pagination);
        },
        retrieveSemiBySoruceV(fromWhere){
            this.open_data_pagination.param.fromWhere=fromWhere;
            this.open_data_pagination.current = 1;
            this.open_data_pagination.size = 10;
            this.reloadPage(this.open_data_pagination);
        }
    },
    created() {
        this.pageInit(this.open_data_pagination);
   }
    
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}     
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                openDataPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const openDataPage = app.mount('#app');
window.openDataPage = openDataPage;

function retrieveSemiData(){
    const tmp = openDataPage.open_data_pagination.param.q;
    initQueryParam();
    openDataPage.open_data_pagination.param.q = tmp;
 
    openDataPage.reloadPage(openDataPage.open_data_pagination);
 
}


  function initQueryParam(){
    openDataPage.open_data_pagination.param = {
        q: "",
        sort: "1",
        fromWhere: ""
    }
    openDataPage.open_data_pagination.current = 1;
    openDataPage.open_data_pagination.size = 10;
  }

  function isJSON(variable) {
    if (typeof variable !== 'string') {
      return false;
    }
  
    try {
      var json = JSON.parse(variable);
    } catch (error) {
      return false;
    }
  
    if (typeof json !== 'object') {
      return false;
    }
  
    return true;
  }


  $(function(){
	$(".tooltip-nav").tooltip();
});