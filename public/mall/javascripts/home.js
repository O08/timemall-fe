import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";

import Auth from "/estudio/javascripts/auth.js"



const RootComponent = {
  data() {
    return {
      cellgrid_pagination:{
        url: "/api/v1/web_mall/cells",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        param: {
          q: '',
          sort: '',
          sbu: 'day'
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.cellgrid_pagination.size = response.cells.size;
                this.cellgrid_pagination.current = response.cells.current;
                this.cellgrid_pagination.total = response.cells.total;
                this.cellgrid_pagination.pages = response.cells.pages;
                this.cellgrid_pagination.records = response.cells.records;
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
    }
  },
  created(){
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
   home.queryParam.q = tmp;

   home.reloadPage(home.cellgrid_pagination);

 }

 function initQueryParam(){
  home.cellgrid_pagination.param = {
    q: '',
    // budgetMin: 50,
    // budgetMax: 50,
    sort: '',
    sbu: 'day'
  }
  home.cellgrid_pagination.current = 1;
  home.cellgrid_pagination.size = 30;
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