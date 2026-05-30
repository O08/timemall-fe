import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";

const RootComponent = {
    data() {
      return {
        distribution_pagination:{
          url: "/api/v1/team/finance_distribute",
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
                  this.distribution_pagination.size = response.distribution.size;
                  this.distribution_pagination.current = response.distribution.current;
                  this.distribution_pagination.total = response.distribution.total;
                  this.distribution_pagination.pages = response.distribution.pages;
                  this.distribution_pagination.records = response.distribution.records;
                  this.distribution_pagination.paging = this.doPaging({current: response.distribution.current, pages: response.distribution.pages, size: 5});

              }
          }
        }
      }
    },
    methods: {
      loadAssetDistributionV(){
        loadAssetDistribution().then(response=>{
          if(response.data.code == 200){
            this.distribution = response.data.distribution;
          }
        })
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
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}
app.mixin(Pagination);
const teamFinanceDistribution = app.mount('#app');

window.teamFinanceDistribution = teamFinanceDistribution;

// init 
teamFinanceDistribution.loadSubNav() // sub nav component .js init 
teamFinanceDistribution.pageInit(teamFinanceDistribution.distribution_pagination);