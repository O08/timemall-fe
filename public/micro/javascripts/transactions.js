import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";

const RootComponent = {
    data() {
      return {
        trans_pagination:{
          url: "/api/v1/team/trans",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          param: {

          },
          paging: {},
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.trans_pagination.size = response.trans.size;
                  this.trans_pagination.current = response.trans.current;
                  this.trans_pagination.total = response.trans.total;
                  this.trans_pagination.pages = response.trans.pages;
                  this.trans_pagination.records = response.trans.records;
                  this.trans_pagination.paging = this.doPaging({current: response.trans.current, pages: response.trans.pages, size: 5});

              }
          }
        }
      }
    },
    methods: {

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
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}
app.mixin(Pagination);
const teamTrans = app.mount('#app');

window.teamTransPage = teamTrans;


// init 
teamTrans.pageInit(teamTrans.trans_pagination);
teamTrans.loadSubNav() // sub nav component .js init 

