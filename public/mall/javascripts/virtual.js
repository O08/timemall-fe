import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";

import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { getQueryVariable,formatCmpctNumber } from "/common/javascripts/util.js";
import {FromWhere} from "/common/javascripts/tm-constant.js";
import { uploadScienceData,uploadVirtualProductDataLayerWhenImpression } from "/common/javascripts/science.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

const defaultCellPreviewImage = new URL(
  '/common/images/default-cell-preview.jpg',
  import.meta.url
);


const RootComponent = {
  data() {
    return {
      currentLocalCity: '',
      defaultCellPreviewImage,
      paging: {}, // 分页导航
      virtual_pagination:{
        url: "/api/v1/web_mall/virtual/product",
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
                this.virtual_pagination.size = response.product.size;
                this.virtual_pagination.current = response.product.current;
                this.virtual_pagination.total = response.product.total;
                this.virtual_pagination.pages = response.product.pages;

                this.virtual_pagination.records.push(...response.product.records);

                this.currentLocalCity=this.virtual_pagination.param.location;

                // capture cell indices data layer
                var idsArr=[];
                response.product.records.forEach(element => {
                  idsArr.push(element.productId)
                });
                uploadVirtualProductDataLayerWhenImpression(idsArr);

            }

            this.virtual_pagination.param.loading = false;
        }
    }
    }
  },
  methods: {
    formatCmpctNumberV(number){
      return formatCmpctNumber(Number(number));
    },
    showMoreCellProductV(){
      showMoreCellProduct();
    },
    filterCellProductGridV(){
      filterCellGrid();
      this.uploadScienceDataV();

    },
    retrieveCellProductGridV(){
      changeUrlQueryvariable(this.virtual_pagination.param.q);
      retrieveCellProductGrid()
      this.uploadScienceDataV();

    },
    uploadScienceDataV(){
      const snippet = this.virtual_pagination.param.q;
      const details= JSON.stringify(this.virtual_pagination.param);
      const fromWhere=FromWhere.VIRTUAL_PRODUCT_SEARCH;
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
const mallVirtual = app.mount('#app');

window.mallVirtual = mallVirtual;

// init
var q=getQueryVariable("q");
if(!!q){
  mallVirtual.virtual_pagination.param.q = q;
}
mallVirtual.pageInit(mallVirtual.virtual_pagination);


function showMoreCellProduct(){
  if(mallVirtual.virtual_pagination.param.loading){
    return;
  }
  mallVirtual.virtual_pagination.current = mallVirtual.virtual_pagination.current +  1;
  mallVirtual.virtual_pagination.param.loading = true;

  mallVirtual.reloadPage(mallVirtual.virtual_pagination);

}

 function filterCellGrid(){
  if(mallVirtual.virtual_pagination.param.loading){
    return;
  }

  mallVirtual.virtual_pagination.param.current = 1;
  mallVirtual.virtual_pagination.records = [];
  mallVirtual.virtual_pagination.param.loading = true;


  mallVirtual.reloadPage(mallVirtual.virtual_pagination);
 }   
 function retrieveCellProductGrid(){
  if(mallVirtual.virtual_pagination.param.loading){
    return;
  }

   const tmpq = mallVirtual.virtual_pagination.param.q;
   const tmplocation = mallVirtual.virtual_pagination.param.location;

   initQueryParam();
   mallVirtual.virtual_pagination.param.q = tmpq;
   mallVirtual.virtual_pagination.param.location = tmplocation;
   mallVirtual.virtual_pagination.param.loading = true;


   mallVirtual.reloadPage(mallVirtual.virtual_pagination);

 }

 function initQueryParam(){
  mallVirtual.virtual_pagination.param = {
    q: '',
    // budgetMin: 50,
    // budgetMax: 50,
    sort: '',
    location: '',
    online: false,
    loading: false
  }
  mallVirtual.virtual_pagination.records = [];
  mallVirtual.virtual_pagination.current = 1;
  mallVirtual.virtual_pagination.size = 24;
 }


function transformInputNumber(val,min,max){
  val = val ? val == 0 ? 0 : val : val; // cope with 0000000
  return val < min ? "" : val > max ? max : val;
}
function changeUrlQueryvariable(q){
  
  let url = "/mall/virtual?q="+ q;
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
