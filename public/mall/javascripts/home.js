import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";

import Auth from "/estudio/javascripts/auth.js"

import defaultAvatarImage from '/common/icon/panda-kawaii.svg'

import defaultCellPreviewImage from '/common/images/default-cell-preview.jpg'
import {PriceSbu,FromWhere} from "/common/javascripts/tm-constant.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { getQueryVariable } from "/common/javascripts/util.js";
import { uploadScienceData,uploadCellDataLayerWhenImpression } from "/common/javascripts/science.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";




const RootComponent = {
  data() {
    return {
      currentLocalCity: '',
      defaultAvatarImage,
      defaultCellPreviewImage,
      input_sbu: '',
      paging: {}, // 分页导航
      cellgrid_pagination:{
        url: "/api/v1/web_mall/cells",
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
        paramHandler: (info)=>{
            info.param.sbu = !this.input_sbu ? "hour" : this.input_sbu;
         },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.cellgrid_pagination.size = response.cells.size;
                this.cellgrid_pagination.current = response.cells.current;
                this.cellgrid_pagination.total = response.cells.total;
                this.cellgrid_pagination.pages = response.cells.pages;

                this.cellgrid_pagination.records.push(...response.cells.records);

                this.currentLocalCity=this.cellgrid_pagination.param.location;
                // capture cell indices data layer
                var idsArr=[];
                response.cells.records.forEach(element => {
                  idsArr.push(element.id)
                });
                uploadCellDataLayerWhenImpression(idsArr);
            }
            this.cellgrid_pagination.param.loading = false;
        }
    }
    }
  },
  methods: {
    showMoreCellV(){
      showMoreCell();
    },
    filterCellGridV(){
      filterCellGrid();
      this.uploadScienceDataV();
    },
    retrieveCellGridV(){
      changeUrlQueryvariable(this.cellgrid_pagination.param.q);
      retrieveCellGrid();
      this.uploadScienceDataV();
    },
    isEmptyObjectV(obj){
      return $.isEmptyObject(obj);
    },
    uploadScienceDataV(){
      const snippet = this.cellgrid_pagination.param.q;
      const details= JSON.stringify(this.cellgrid_pagination.param);
      const fromWhere=FromWhere.CELL_SEARCH;
      uploadScienceData(snippet,details,fromWhere);
    },
    transformSbuV(sbu){
      return transformSbu(sbu);
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
const home = app.mount('#app');

window.home = home;

// init
var q=getQueryVariable("q");
if(!!q){
  home.cellgrid_pagination.param.q = q;
}
home.pageInit(home.cellgrid_pagination);

function showMoreCell(){
  if(home.cellgrid_pagination.param.loading){
    return;
  }
  home.cellgrid_pagination.current = home.cellgrid_pagination.current +  1;
  home.cellgrid_pagination.param.loading = true;

  home.reloadPage(home.cellgrid_pagination);

}
 
 function filterCellGrid(){
    home.cellgrid_pagination.current = 1;
    home.cellgrid_pagination.records = [];
    home.reloadPage(home.cellgrid_pagination);
 }   
 function retrieveCellGrid(){
  if(home.cellgrid_pagination.param.loading){
    return;
  }
   const tmpq = home.cellgrid_pagination.param.q;
   const tmplocation = home.cellgrid_pagination.param.location;

   initQueryParam();
   home.cellgrid_pagination.param.q = tmpq;
   home.cellgrid_pagination.param.location = tmplocation;

   home.cellgrid_pagination.param.loading = true;
   home.reloadPage(home.cellgrid_pagination);

 }

 function initQueryParam(){
  home.input_sbu = "";
  home.cellgrid_pagination.param = {
    q: '',
    // budgetMin: 50,
    // budgetMax: 50,
    sort: '',
    sbu: 'hour',
    location: '',
    online: false,
    loading: false,
  }
  home.cellgrid_pagination.records = [];
  home.cellgrid_pagination.current = 1;
  home.cellgrid_pagination.size = 24;
 }

 function transformSbu(sbu){
     return PriceSbu.get(sbu);
 }
function transformInputNumber(val,min,max){
  val = val ? val == 0 ? 0 : val : val; // cope with 0000000
  return val < min ? "" : val > max ? max : val;
}
function changeUrlQueryvariable(q){
  
  let url = "/home?q="+ q;
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

