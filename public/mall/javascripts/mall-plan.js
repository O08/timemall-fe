import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";

import Auth from "/estudio/javascripts/auth.js"

import defaultAvatarImage from '/common/icon/panda-kawaii.svg'

import defaultCellPreviewImage from '/common/images/default-cell-preview.jpg'
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { getQueryVariable } from "/common/javascripts/util.js";
import {FromWhere} from "/common/javascripts/tm-constant.js";
import { uploadScienceData } from "/common/javascripts/science.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";





const RootComponent = {
  data() {
    return {
      defaultAvatarImage,
      defaultCellPreviewImage,
      paging: {}, // 分页导航
      plangrid_pagination:{
        url: "/api/v1/web_mall/plans",
        size: 24,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        param: {
          q: '',
          sort: '',
          sbu: '',
          location: '',
          online: false,
          loading: false,
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.plangrid_pagination.size = response.plans.size;
                this.plangrid_pagination.current = response.plans.current;
                this.plangrid_pagination.total = response.plans.total;
                this.plangrid_pagination.pages = response.plans.pages;

                this.plangrid_pagination.records.push(...response.plans.records);

                this.currentLocalCity=this.plangrid_pagination.param.location;

            }

            this.plangrid_pagination.param.loading = false;
        }
    }
    }
  },
  methods: {
    showMoreCellPlanV(){
      showMoreCellPlan();
    },
    filterCellPlanGridV(){
      filterCellGrid();
      this.uploadScienceDataV();

    },
    retrieveCellPlanGridV(){
      changeUrlQueryvariable(this.plangrid_pagination.param.q);
      retrieveCellPlanGrid()
      this.uploadScienceDataV();

    },
    uploadScienceDataV(){
      const snippet = this.plangrid_pagination.param.q;
      const details= JSON.stringify(this.plangrid_pagination.param);
      const fromWhere=FromWhere.PLAN_SEARCH;
      uploadScienceData(snippet,details,fromWhere);
    },
    isEmptyObjectV(obj){
      return $.isEmptyObject(obj);
    },

    transformInputNumberV(event){
      var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
      var min = Number(event.target.min);
      var max = Number(event.target.max);
      event.target.value = transformInputNumber(val, min, max);
      if(val !== Number(event.target.value)){
        event.currentTarget.dispatchEvent(new Event('input')); // update v-model
      }
    }
  },
  updated(){
        
    $(function() {
        // Enable popovers 
        $('[data-bs-toggle="popover"]').popover();
    });
  }
};
let app =  createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('content') || tag.startsWith('top-search')
}
const homePlan = app.mount('#app');

window.homePlan = homePlan;

// init
var q=getQueryVariable("q");
if(!!q){
  homePlan.plangrid_pagination.param.q = q;
}
homePlan.pageInit(homePlan.plangrid_pagination);


function showMoreCellPlan(){
  if(homePlan.plangrid_pagination.param.loading){
    return;
  }
  homePlan.plangrid_pagination.current = homePlan.plangrid_pagination.current +  1;
  homePlan.plangrid_pagination.param.loading = true;

  homePlan.reloadPage(homePlan.plangrid_pagination);

}

 function filterCellGrid(){
  if(homePlan.plangrid_pagination.param.loading){
    return;
  }

  homePlan.plangrid_pagination.param.current = 1;
  homePlan.plangrid_pagination.records = [];
  homePlan.plangrid_pagination.param.loading = true;


  homePlan.reloadPage(homePlan.plangrid_pagination);
 }   
 function retrieveCellPlanGrid(){
  if(homePlan.plangrid_pagination.param.loading){
    return;
  }

   const tmpq = homePlan.plangrid_pagination.param.q;
   const tmplocation = homePlan.plangrid_pagination.param.location;

   initQueryParam();
   homePlan.plangrid_pagination.param.q = tmpq;
   homePlan.plangrid_pagination.param.location = tmplocation;
   homePlan.plangrid_pagination.param.loading = true;


   homePlan.reloadPage(homePlan.plangrid_pagination);

 }

 function initQueryParam(){
  homePlan.plangrid_pagination.param = {
    q: '',
    // budgetMin: 50,
    // budgetMax: 50,
    sort: '',
    location: '',
    online: false,
    loading: false
  }
  homePlan.plangrid_pagination.records = [];
  homePlan.plangrid_pagination.current = 1;
  homePlan.plangrid_pagination.size = 24;
 }


function transformInputNumber(val,min,max){
  val = val ? val == 0 ? 0 : val : val; // cope with 0000000
  return val < min ? "" : val > max ? max : val;
}
function changeUrlQueryvariable(q){
  
  let url = "/mall/mall-plan?q="+ q;
  history.pushState(null, "", url);
  
}

// view 
let navbar = document.getElementById("section_filter_wrapper");

let navPos = navbar.getBoundingClientRect().top;

window.addEventListener("scroll", e => {
  let scrollPos = window.scrollY;
  if (scrollPos > navPos) {
    navbar.classList.add('sticky');
  } else {
    navbar.classList.remove('sticky');
  }
});

$(function(){
	$(".tooltip-nav").tooltip();
});
