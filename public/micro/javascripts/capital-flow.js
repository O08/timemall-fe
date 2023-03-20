import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

const RootComponent = {
    data() {
      return {
      }
    },
    methods: {
        addBankV(){
            addBank(); // todo args
        }
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);

const teamFinanceFlow = app.mount('#app');

window.teamFinanceFlow = teamFinanceFlow;

async function addNewBank(dto){
    const url="/api/v1/team/bank";
    return await axios.put(url,dto);
}
async function getBank(brandId){
    const url="/api/v1/team/bank?brandId=" + brandId;
    return await axios.get(url);
}
async function withdraw(dto){
    const url ="/api/v1/team/withdraw";
    return await axios.put(url,dto);
}
async function getFinanceBillBoard(){
    const url = "/api/v1/team/finance_board";
  return await axios.get(url);
}

function withdrawToBank(amount,cardId){
    const dto={
        amount: amount,
        cardId: cardId
    }
    return withdraw(dto);
}
function addBank(deposit,cardholder,cardno){
   const brandId =  teamFinanceFlow.getIdentity().brandId; // Auth.getIdentity();
 
    const dto={
        deposit: deposit,
        cardholder: cardholder,
        cardno: cardno,
        brandId: brandId
    }
    return addNewBank(dto);
}
function retrieveBank(){
    const brandId =  teamFinanceFlow.getIdentity().brandId; // Auth.getIdentity();
    return getBank(brandId);
}

