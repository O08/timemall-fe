import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";

const RootComponent = {
    data() {
        return {
            api_market_pagination: {
                url: "/api/v1/web/affiliate/outreach_api_ind",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    heartbeat:"",
                    blue: "",
                    sort: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.api_market_pagination.size = response.ind.size;
                        this.api_market_pagination.current = response.ind.current;
                        this.api_market_pagination.total = response.ind.total;
                        this.api_market_pagination.pages = response.ind.pages;
                        this.api_market_pagination.records = response.ind.records;
                        this.api_market_pagination.paging = this.doPaging({current: response.ind.current, pages: response.ind.pages, size: 5});
    
                    }
                }
            }
        }
    },
    methods: {
        
        filterApiMarketTableV(){
            filterApiMarketTable();
        },
        retrieveApiMarketTableV(){
            retrieveApiMarketTable();
        },
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
app.mixin(Pagination);
app.mixin(DirectiveComponent);
const apiMarketing = app.mount('#app');

window.apiMarketing = apiMarketing;

// init
apiMarketing.pageInit(apiMarketing.api_market_pagination);



function retrieveApiMarketTable(){
    const tmpq = apiMarketing.api_market_pagination.param.q;
 
    initQueryParam();
    apiMarketing.api_market_pagination.param.q = tmpq;
 
    apiMarketing.reloadPage(apiMarketing.api_market_pagination);
}

function initQueryParam(){
    apiMarketing.api_market_pagination.param = {
      q: '',
      viewsLeft: '',
      viewsRight: '',
      revshareRight: '',
      saleVolumeLeft: '',
      saleVolumeRight: '',
      salesLeft: '',
      salesRight: '',
      supplierAccountAgeLeft: '',
      supplierAccountAgeRight: '',
      heartbeat: '',
      blue: '',
      planPriceLeft: '',
      planPriceRight: '',
      offline: '',
      revshareLeft: '',
      sort: ""
    }
    apiMarketing.api_market_pagination.current = 1;
    apiMarketing.api_market_pagination.size = 10;
}

function filterApiMarketTable(){
    apiMarketing.api_market_pagination.param.current = 1;
    apiMarketing.reloadPage(apiMarketing.api_market_pagination);
}