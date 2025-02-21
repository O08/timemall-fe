import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

const RootComponent = {
    data() {
      return {
        distribution: {}
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

const teamFinanceDistribution = app.mount('#app');

window.teamFinanceDistribution = teamFinanceDistribution;

// init 
teamFinanceDistribution.loadAssetDistributionV();
teamFinanceDistribution.loadSubNav() // sub nav component .js init 
async function getFinanceDistribution(){
    const url = "/api/v1/team/finance_distribute";
  return await axios.get(url);
}
function loadAssetDistribution(){
    return getFinanceDistribution();
}