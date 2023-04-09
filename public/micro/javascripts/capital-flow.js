import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


const RootComponent = {
    data() {
      return {
        alipay: {},
        trans: {
            drawable: 0.00,
            amount: "",
            id: ""
        },
        alipayAccount:{
            payeeAccount: "",
            payeeRealName: ""
        },
        alipayDelId: ""
      }
    },
    methods: {
        closeAddAccountModelV(){
            closeAddAccountModel();
        },
        retrieveAlipayAccountsV(){
            retrieveAlipayAccounts().then(response=>{
                if(response.data.code == 200){
                    this.alipay = response.data.alipay;
                  }
            });
        },
        withdrawV(){
            withdrawToAlipayAccount(this.trans.amount,this.trans.id).then(response=>{
                if(response.data.code==200){
                    this.retrieveFinInfoV();
                    this.trans.amount=""; // 复位
                }
                if(response.data.code==503){
                    alert("处理失败，请检查账号信息或到联系我们页面寻求支持！");
                }
            });
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
                    this.retrieveAlipayAccountsV();
                    this.closeAddAccountModelV();
                }
            })
        },
        delAlipayAccountV(){
            delAlipayAccount(this.alipayDelId).then(response=>{
                if(response.data.code==200){
                    this.retrieveAlipayAccountsV();
                    this.alipayDelId="";
                }
            });
        },
        transformInputNumberV(event){
            var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
            var min = Number(event.target.min);
            var max = Number(event.target.max);
            event.target.value = transformInputNumber(val, min, max);
            if(val !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
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
app.mixin(DirectiveComponent);


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
    const url ="/api/v1/team/withdraw_to_alipay";
    return await axios.post(url,dto);
}
async function getFinanceBillBoard(){
    const url = "/api/v1/team/finance_board";
  return await axios.get(url);
}
async function deleteAlipayAccount(accountId){
    const url ="/api/v1/team/delAlipayAccount?id=" +accountId;

    return await axios.delete(url);
}

function delAlipayAccount(accountId){
    return deleteAlipayAccount(accountId);
}
function withdrawToAlipayAccount(amount,toAccountId){
    const dto={
        amount: amount,
        toAccountId: toAccountId
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
function closeAddAccountModel(){
    $("#addAccountInfoModal").modal("hide");
    teamFinanceFlow.alipayAccount = {
        payeeAccount: "",
        payeeRealName: ""
    };
}

function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }