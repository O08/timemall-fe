import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

const RootComponent = {
    data() {
      return {
        alipay: {},
        trans: {
            drawable: 0.00,
            amount: 0.00,
            id: ""
        },
        alipayAccount:{
            payeeAccount: "",
            payeeRealName: ""
        }
      }
    },
    methods: {
        retrieveAlipayAccountsV(){
            retrieveAlipayAccounts().then(response=>{
                if(response.data.code == 200){
                    this.alipay = response.data.alipay;
                  }
            });
        },
        withdrawV(){
            withdrawToAlipayAccount(trans.amount,trans.id);
        },
        retrieveFinInfoV(){
            retrieveFinInfo().then(response=>{
                if(response.data.code == 200){
                    this.trans.drawable = response.data.billboard.drawable;
                }
            })
        },
        newAlipayAccountV(){
            newAlipayAccount(this.alipayAccount.payeeAccount,this.alipayAccount.payeeRealName)
            .then(response=>{
                if(response.data.code == 200){
                    this.retrieveAlipayAccounts();
                }
            })
        }
      }

}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);

const teamFinanceFlow = app.mount('#app');

window.teamFinanceFlow = teamFinanceFlow;

// init
teamFinanceFlow.retrieveAlipayAccountsV();
teamFinanceFlow.retrieveFinInfoV();

async function addNewAlipayAccount(dto){
    const url="/api/v1/team/addAlipayAccount";
    return await axios.put(url,dto);
}
async function getAlipayAccounts(){
    const url="/api/v1/team/alipayAccounts";
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

function withdrawToAlipayAccount(amount,cardId){
    const dto={
        amount: amount,
        cardId: cardId
    }
    return withdraw(dto);
}
function retrieveAlipayAccounts(){
    return getAlipayAccounts();
}
function retrieveFinInfo(){
    return getFinanceBillBoard();
}

function newAlipayAccount(payeeAccount,payeeRealName){
    const dto = {
        payeeAccount: payeeAccount,
        payeeRealName: payeeRealName
    }
    return addNewAlipayAccount(dto);
}