import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
const RootComponent = {
    data() {
      return {
        billboard: {
            amount: "",
            drawable: ""
        }
      }
    },
    methods: {
        loadFinanceBoardV(){
            loadFinanceBoard();
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
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const teamFinance = app.mount('#app');

window.teamFinance = teamFinance;
// init 
teamFinance.loadFinanceBoardV();
teamFinance.loadSubNav() // sub nav component .js init 
async function getFinanceBillBoard(){
    const url = "/api/v1/team/finance_board";
  return await axios.get(url);
}
function loadFinanceBoard(){
    getFinanceBillBoard().then(response=>{
        if(response.data.code == 200){
            teamFinance.billboard = response.data.billboard;
        }
    })
}
