import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";

import Auth from "/estudio/javascripts/auth.js"

import defaultAvatarImage from '/avator.webp'

import defaultCellPreviewImage from '/common/images/default-cell-preview.jpg'
import {PriceSbu,FromWhere} from "/common/javascripts/tm-constant.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { getQueryVariable } from "/common/javascripts/util.js";
import { uploadScienceData,uploadCellDataLayerWhenImpression } from "/common/javascripts/science.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";




const RootComponent = {
  data() {
    return {
      defaultAvatarImage,
      defaultCellPreviewImage,
      input_sbu: '',
      paging: {}, // 分页导航
      cellgrid_pagination:{
        url: "/api/v1/web_mall/cells",
        size: 20,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        param: {
          q: '',
          sort: '',
          sbu: ''
        },
        paramHandler: (info)=>{
            info.param.sbu = !this.input_sbu ? "day" : this.input_sbu;
         },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.cellgrid_pagination.size = response.cells.size;
                this.cellgrid_pagination.current = response.cells.current;
                this.cellgrid_pagination.total = response.cells.total;
                this.cellgrid_pagination.pages = response.cells.pages;
                this.cellgrid_pagination.records = response.cells.records;
                this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                // capture cell indices data layer
                var idsArr=[];
                response.cells.records.forEach(element => {
                  idsArr.push(element.id)
                });
                uploadCellDataLayerWhenImpression(idsArr);
            }
        }
    }
    }
  },
  methods: {
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
const home = app.mount('#app');

window.home = home;

// init
var q=getQueryVariable("q");
if(!!q){
  home.cellgrid_pagination.param.q = q;
}
home.pageInit(home.cellgrid_pagination);


 
 function filterCellGrid(){
    home.cellgrid_pagination.param.current = 1;
    home.reloadPage(home.cellgrid_pagination);
 }   
 function retrieveCellGrid(){
   const tmp = home.cellgrid_pagination.param.q;
   initQueryParam();
   home.cellgrid_pagination.param.q = tmp;

   home.reloadPage(home.cellgrid_pagination);

 }

 function initQueryParam(){
  home.input_sbu = "";
  home.cellgrid_pagination.param = {
    q: '',
    // budgetMin: 50,
    // budgetMax: 50,
    sort: '',
    sbu: 'day'
  }
  home.cellgrid_pagination.current = 1;
  home.cellgrid_pagination.size = 12;
 }

 function transformSbu(sbu){
     return PriceSbu.get(sbu);
 }
function transformInputNumber(val,min,max){
  val = val ? val == 0 ? 0 : val : val; // cope with 0000000
  return val < min ? "" : val > max ? max : val;
}
function changeUrlQueryvariable(q){
  
  let url = "/home.html?q="+ q;
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

