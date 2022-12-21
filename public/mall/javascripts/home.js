import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";

import Auth from "/estudio/javascripts/auth.js"

var PriceSbu = new Map();
PriceSbu.set("second", "秒");
PriceSbu.set("minute", "分钟");
PriceSbu.set("hour","小时");
PriceSbu.set("day", "天");
PriceSbu.set("week", "周");
PriceSbu.set("month" ,"月");
PriceSbu.set("quarter", "季度");
PriceSbu.set( "year","年");
  


const RootComponent = {
  data() {
    return {
      input_sbu: '',
      paging: {}, // 分页导航
      cellgrid_pagination:{
        url: "/api/v1/web_mall/cells",
        size: 12,
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
            }
        }
    }
    }
  },
  methods: {
    filterCellGridV(){
      filterCellGrid();
    },
    retrieveCellGridV(){
      retrieveCellGrid()
    },
    transformSbuV(sbu){
      return transformSbu(sbu);
    },
    transformInputNumberV(event){
      var val = Number(event.target.value);
      var min = Number(event.target.min);
      var max = Number(event.target.max);
      event.target.value = transformInputNumber(val, min, max);
      if(val !== Number(event.target.value)){
        event.currentTarget.dispatchEvent(new Event('input')); // update v-model
      }
    }
  },
  created(){
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
const home = app.mount('#app');

window.home = home;

// init
home.pageInit(home.cellgrid_pagination);


//  function loadMoreCell(e){
    
//     // 滚定监听
//       if (Math.ceil(e.currentTarget.scrollTop + e.currentTarget.clientHeight) >=e.currentTarget.scrollHeight) {   //容差：20px
//           console.log('滚动到底部');
//           if(home.queryParam.current +1 > home.queryParam.pages){
//             return ;
//           }
//           // loading data
//           home.queryParam.current = home.queryParam.current + 1;
//           const data = getMutipleCell();
//           home.cellList.push(...data.records);
//           home.queryParam.pages = data.pages;

//       }
//     }
 
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