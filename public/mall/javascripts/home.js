import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"


const RootComponent = {
  data() {
    return {
      num: 9,
      cellList: [],
      queryParam: initQueryParam()
    }
  },
  methods: {
    loadMoreCells: function (e) {
      loadMoreCell(e)
    },
    filterCellGridV(){
      filterCellGrid();
    },
    retrieveCellGridV(){
      retrieveCellGrid()
    },
    initCellGrid(){
      const data = getMutipleCell(this.queryParam);
      this.cellList.push(...data.records);
      this.queryParam.pages = data.pages;
    }

  },
  created(){
    this.initCellGrid();
  }
};
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
const home = app.mount('#app');

window.home = home;

 function getMutipleCell(param){
    var res = {};
    $.ajaxSetup({async: false});
    $.get('/api/v1/web_mall/cells',!param ? home.queryParam : param,function(data) {
        if(data.code == 200){
            res = data.cells;
        }
       })
         .fail(function(data) {
           // place error code here
         });
    return res;
 }

 function loadMoreCell(e){
    
    // 滚定监听
      if (Math.ceil(e.currentTarget.scrollTop + e.currentTarget.clientHeight) >=e.currentTarget.scrollHeight) {   //容差：20px
          console.log('滚动到底部');
          if(home.queryParam.current +1 > home.queryParam.pages){
            return ;
          }
          // loading data
          home.queryParam.current = home.queryParam.current + 1;
          const data = getMutipleCell();
          home.cellList.push(...data.records);
          home.queryParam.pages = data.pages;

      }
    }
 
 function filterCellGrid(){
    home.queryParam.current = 1;
    const data = getMutipleCell();
    // clear data
    home.cellList= [];
    home.cellList.push(...data.records);
    home.queryParam.pages = data.pages;
 }   
 function retrieveCellGrid(){
   const tmp = home.queryParam.q;
   home.queryParam= initQueryParam();
   home.queryParam.q = tmp;
   const data = getMutipleCell();
   // clear data
   home.cellList= [];
   home.cellList.push(...data.records);
   home.queryParam.pages = data.pages;
 }

 function initQueryParam(){
  return {
    q: '',
    // budgetMin: 50,
    // budgetMax: 50,
    sort: '',
    sbu: 'day',
    current: 1,
    size: 10
  }
 }


 function mockData(){
  console.log("loading data")
  const cellone = {
    brand: "Simo1",
    avator: 'https://i.picsum.photos/id/64/4326/2884.jpg?hmac=9_SzX666YRpR_fOyYStXpfSiJ_edO3ghlSRnH2w09Kg',
    title: "Some quick example text to build on the card title and make up the bulk of the card's content.",
    price: 22,
    id: "2",
    sbu: 'Day',
    preview: 'https://picsum.photos/200/300'
  }

  home.cellList.push(cellone) ;
  const cellone2 = {
    brand: "Simo1",
    avator: 'https://i.picsum.photos/id/64/4326/2884.jpg?hmac=9_SzX666YRpR_fOyYStXpfSiJ_edO3ghlSRnH2w09Kg',
    title: "Some quick example text to build on the card title and make up the bulk of the card's content.",
    price: 22,
    id: "2",
    sbu: 'Day',
    preview: 'https://picsum.photos/200/300'
  }

  home.cellList.push(cellone2) ;
  const cellon3 = {
    brand: "Simo1",
    avator: 'https://i.picsum.photos/id/64/4326/2884.jpg?hmac=9_SzX666YRpR_fOyYStXpfSiJ_edO3ghlSRnH2w09Kg',
    title: "Some quick example text to build on the card title and make up the bulk of the card's content.",
    price: 22,
    id: "2",
    sbu: 'Day',
    preview: 'https://picsum.photos/200/300'
  }

  home.cellList.push(cellon3) ;
  const cellon4 = {
    brand: "Simo1",
    avator: 'https://i.picsum.photos/id/64/4326/2884.jpg?hmac=9_SzX666YRpR_fOyYStXpfSiJ_edO3ghlSRnH2w09Kg',
    title: "Some quick example text to build on the card title and make up the bulk of the card's content.",
    price: 22,
    id: "2",
    sbu: 'Day',
    preview: 'https://picsum.photos/200/300'
  }

  home.cellList.push(cellon4) ;
 }