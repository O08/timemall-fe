import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
}

const RootComponent = {
    data() {
      return {
        dashboard: {},
        hotProduct:{
            records:[]
        },
        hotChannel:{
            records:[]
        },
        dashboardTimespan: "",
        hotProductTimespan: "",
        hotChannelTimespan: ""
      }
    },
    methods: {
        formatCmpctNumberV(number){
          if(number>50000000){
            return formatCmpctNumber(number);
          }
          return number.toFixed(2);
        },
        formatCmpctNumberViewV(number){
            return formatCmpctNumber(number);
        },
        loadHotChannelListV(timespan){
            this.hotChannelTimespan=timespan;
            loadHotChannelList(this);
        },
        loadDashboardV(timespan){
          this.dashboardTimespan=timespan;
          loadDashboard(this);
        },
        loadHotProductListV(timespan){
            this.hotProductTimespan=timespan;
            loadHotProductList(this);
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
app.mixin(DirectiveComponent);

const dashboard = app.mount('#app');


window.dashboard = dashboard;
// init
dashboard.loadDashboardV("yesterday");
dashboard.loadHotProductListV("yesterday");
dashboard.loadHotChannelListV("yesterday");
async function fetchDashboard(timespan){
    const url="/api/v1/web/affiliate/dashboard?timespan="+timespan;
    return await fetch(url);
}

async function fetchHotProductList(timespan){
    const url="/api/v1/web/affiliate/hot_product?timespan="+timespan;
    return await fetch(url);
}
async function fetchHotChannelList(timespan){
    const url="/api/v1/web/affiliate/hot_outreach?timespan="+timespan;
    return await fetch(url);
}
async function loadHotChannelList(appObj){
    const response = await fetchHotChannelList(appObj.hotChannelTimespan);
    var data = await response.json();
    if(data.code==200){
       appObj.hotChannel=data.outreach;
    }
}

async function loadDashboard(appObj){
    const response = await fetchDashboard(appObj.dashboardTimespan);
    var data = await response.json();
    if(data.code==200){
       appObj.dashboard=data.dashboard;
       if(!data.dashboard){
        appObj.dashboard={}
       }
    }
}

async function loadHotProductList(appObj){
    const response = await fetchHotProductList(appObj.hotProductTimespan);
    var data = await response.json();
    if(data.code==200){
       appObj.hotProduct=data.product;
    }
}

var options = {
    notation: "compact",
    compactDisplay: "short",
};
function formatCmpctNumber(number) {
  const usformatter = Intl.NumberFormat("zh-CN", options);
  return usformatter.format(number);
}