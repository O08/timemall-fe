import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

const RootComponent = {
    data() {
      return {
        billboard: {
            totalIn: "",
            totalOut: ""
        }
      }
    },
    methods: {
        loadFinanceBoardV(){
            loadFinanceBoard();
        }
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);

const teamFinance = app.mount('#app');

window.teamFinance = teamFinance;

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
