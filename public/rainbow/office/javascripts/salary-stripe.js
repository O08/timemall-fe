import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {goError} from "/common/javascripts/pagenav.js";


import Pagination  from "/common/javascripts/pagination-vue.js";

import { transformInputNumberAsPositiveDecimal } from "/common/javascripts/util.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';


let customAlert = new CustomAlertModal();

const personManDefault = new URL(
  '/common/images/default-person-man.jpg',
  import.meta.url
);

const currentPayrollId= window.location.pathname.split('/').slice(-1).shift();

const RootComponent = {
    data() {
      return {
        personManDefault,
        focusModal:{
          message: "",
          confirmHandler:()=>{

          }
        },
        payroll: {
          init_finish: false,
          benefit: {
            pensionInsuranceBase: "0",
            pensionInsuranceCompanyRate: "16",
            pensionInsuranceEmployeeRate: "8",
            medicalInsuranceBase: "0",
            medicalInsuranceCompanyRate: "7",
            medicalInsuranceEmployeeRate: "2",
            unemploymentInsuranceBase: "0",
            unemploymentInsuranceCompanyRate: "0.5",
            unemploymentInsuranceEmployeeRate: "0.5",
            occupationalInjuryInsuranceBase: "0",
            occupationalInjuryInsuranceCompanyRate: "0.4",
            occupationalInjuryInsuranceEmployeeRate: "0",
            birthInsuranceBase: "0",
            birthInsuranceCompanyRate: "0.8",
            birthInsuranceEmployeeRate: "0",
            housingProvidentFundsBase: "0",
            housingProvidentFundsCompanyRate: "5",
            housingProvidentFundsEmployeeRate: "5"
          },
          compensation: []
        },
        newCompensationItemObj:{
          payrollId: currentPayrollId,
          title: "",
          amount: "",
          direction: "1"
        },
        editBenefitObj: {
          pensionInsuranceBase: "0",
          pensionInsuranceCompanyRate: "16",
          pensionInsuranceEmployeeRate: "8",
          medicalInsuranceBase: "0",
          medicalInsuranceCompanyRate: "7",
          medicalInsuranceEmployeeRate: "2",
          unemploymentInsuranceBase: "0",
          unemploymentInsuranceCompanyRate: "0.5",
          unemploymentInsuranceEmployeeRate: "0.5",
          occupationalInjuryInsuranceBase: "0",
          occupationalInjuryInsuranceCompanyRate: "0.4",
          occupationalInjuryInsuranceEmployeeRate: "0",
          birthInsuranceBase: "0",
          birthInsuranceCompanyRate: "0.8",
          birthInsuranceEmployeeRate: "0",
          housingProvidentFundsBase: "0",
          housingProvidentFundsCompanyRate: "5",
          housingProvidentFundsEmployeeRate: "5"
        },
        btn_ctl: {
            benefit_obj_already_change: false,
        }
      }
    },
    methods: {
      validateNewCompensationItemFormV(){
        if(!!this.newCompensationItemObj.title && !!this.newCompensationItemObj.amount  && Number(this.newCompensationItemObj.amount)>0){
           return true
        }
        return false;
      },
      validateEditBenefitFormCanSaveV(){
        if( !this.editBenefitObj.pensionInsuranceBase || !this.editBenefitObj.pensionInsuranceCompanyRate || !this.editBenefitObj.pensionInsuranceEmployeeRate
          || !this.editBenefitObj.medicalInsuranceBase || !this.editBenefitObj.medicalInsuranceCompanyRate || !this.editBenefitObj.medicalInsuranceEmployeeRate
          || !this.editBenefitObj.unemploymentInsuranceBase || !this.editBenefitObj.unemploymentInsuranceCompanyRate || !this.editBenefitObj.unemploymentInsuranceEmployeeRate
          || !this.editBenefitObj.occupationalInjuryInsuranceBase || !this.editBenefitObj.occupationalInjuryInsuranceCompanyRate || !this.editBenefitObj.occupationalInjuryInsuranceEmployeeRate
          || !this.editBenefitObj.birthInsuranceBase || !this.editBenefitObj.birthInsuranceCompanyRate || !this.editBenefitObj.birthInsuranceEmployeeRate
          || !this.editBenefitObj.housingProvidentFundsBase || !this.editBenefitObj.housingProvidentFundsCompanyRate || !this.editBenefitObj.housingProvidentFundsEmployeeRate
          || !this.btn_ctl.benefit_obj_already_change){
           return false
        }

        return true;
      },
      showEditEmployeeBenefitModalV(){
        const tmp=JSON.parse(JSON.stringify(this.payroll.benefit));
        this.editBenefitObj={
          pensionInsuranceBase: tmp.pensionInsuranceBase.toString(),
          pensionInsuranceCompanyRate: tmp.pensionInsuranceCompanyRate.toString(),
          pensionInsuranceEmployeeRate: tmp.pensionInsuranceEmployeeRate.toString(),
          medicalInsuranceBase: tmp.medicalInsuranceBase.toString(),
          medicalInsuranceCompanyRate: tmp.medicalInsuranceCompanyRate.toString(),
          medicalInsuranceEmployeeRate: tmp.medicalInsuranceEmployeeRate.toString(),
          unemploymentInsuranceBase: tmp.unemploymentInsuranceBase.toString(),
          unemploymentInsuranceCompanyRate: tmp.unemploymentInsuranceCompanyRate.toString(),
          unemploymentInsuranceEmployeeRate: tmp.unemploymentInsuranceEmployeeRate.toString(),
          occupationalInjuryInsuranceBase: tmp.occupationalInjuryInsuranceBase.toString(),
          occupationalInjuryInsuranceCompanyRate: tmp.occupationalInjuryInsuranceCompanyRate.toString(),
          occupationalInjuryInsuranceEmployeeRate: tmp.occupationalInjuryInsuranceEmployeeRate.toString(),
          birthInsuranceBase: tmp.birthInsuranceBase.toString(),
          birthInsuranceCompanyRate: tmp.birthInsuranceCompanyRate.toString(),
          birthInsuranceEmployeeRate: tmp.birthInsuranceEmployeeRate.toString(),
          housingProvidentFundsBase: tmp.housingProvidentFundsBase.toString(),
          housingProvidentFundsCompanyRate: tmp.housingProvidentFundsCompanyRate.toString(),
          housingProvidentFundsEmployeeRate: tmp.housingProvidentFundsEmployeeRate.toString()
        }
        this.editBenefitObj.payrollId=currentPayrollId;
        this.btn_ctl.benefit_obj_already_change=false;
        $("#editEmployeeBenefitModal").modal("show");

      },
      canEditPayrollV(){
        return this.payroll.payrollStatus=='1' && this.payroll.authentication=='admin';
      },
      closeEditEmployeeBenefitModalV(){
        $("#editEmployeeBenefitModal").modal("hide");
      },
      showConfigCompensationModalV(){
        this.newCompensationItemObj={
          payrollId: currentPayrollId,
          title: "",
          amount: "",
          direction: "1"
        }
        $("#configCompensationModal").modal("show");

      },
      closeConfigCompensationModalV(){
        $("#configCompensationModal").modal("hide");
      },
      loadPayrollInfoV(){
        loadPayrollInfo();
      },
      editEmployeeBenefitV(){
        editEmployeeBenefit(this.editBenefitObj);
      },
      addOneCompensationItemV(){
        addOneCompensationItem(this.newCompensationItemObj);
      },
      removeOneCompensationItemV(index){
        if(this.payroll.compensation.length==1){
          customAlert.alert("暂不支持清空薪资项");
          return;
        }
        this.payroll.compensation.splice(index,1);
        removeOneCompensationItem(this.payroll.compensation);
      },
      showPaymentFocusModalV() {
        this.focusModal.message = "打款前请仔细核验相关薪资项、金额，如涉及五险一金、个税等第三方支付，推荐优先处理第三方业务，最后进行薪资结算";
        this.focusModal.confirmHandler = () => {

            this.payPayrollV();
      
        }
        $("#focusModal").modal("show"); // show modal
     },
      payPayrollV(){
        payPayroll();
      },
      explianEmployeeStatusV(status){
        var statusDesc = "未知";
        switch(status){
            case "1":
                statusDesc="在职";
                break; 
            case "2":
                statusDesc="离职";
                break; 
            case "3":
              statusDesc="休假";
              break;    
            case "4":
              statusDesc="试用期";
              break;     
            case "5":
              statusDesc="工伤";
              break; 

        }
        return statusDesc;
      },
      explianEmployeeGenreV(genre){
        var genreDesc = "未知";
        switch(genre){
            case "1":
              genreDesc="全职员工";
                break; 
            case "2":
              genreDesc="兼职员工";
                break; 
            case "3":
              genreDesc="临时工";
              break;    
            case "4":
              genreDesc="实习生";
              break;     
            case "5":
              genreDesc="合同工";
              break; 
            case "6":
              genreDesc="志愿者";
              break; 
            case "7":
              genreDesc="派遣员工";
              break; 

        }
        return genreDesc;
      },
      explianCompensationItemDirectionV(direction){
        var directionDesc = "未知";
        switch(direction){
            case 1:
              directionDesc="发放";
                break; 
            case -1:
              directionDesc="扣除";
                break; 
 
        }
        return directionDesc;
      },
      calBenefitItemV(base,rate){
        return (base*rate/100).toFixed(2);
      },
      calCompanyBenefitExpenseV(benefit){
        const pensionMoney=this.calBenefitItemV(benefit.pensionInsuranceBase,benefit.pensionInsuranceCompanyRate);
        const medicalMoney=this.calBenefitItemV(benefit.medicalInsuranceBase,benefit.medicalInsuranceCompanyRate);;
        const unemploymentMoney=this.calBenefitItemV(benefit.unemploymentInsuranceBase,benefit.unemploymentInsuranceCompanyRate);;
        const injuryMoney=this.calBenefitItemV(benefit.occupationalInjuryInsuranceBase,benefit.occupationalInjuryInsuranceCompanyRate);;
        const birthMoney=this.calBenefitItemV(benefit.birthInsuranceBase,benefit.birthInsuranceCompanyRate);;
        const housingMoney=this.calBenefitItemV(benefit.housingProvidentFundsBase,benefit.housingProvidentFundsCompanyRate);;
        return (Number(pensionMoney)+Number(medicalMoney)+Number(unemploymentMoney)
                   +Number(injuryMoney)+Number(birthMoney)+Number(housingMoney)).toFixed(2);
      },
      transformInputNumberAsPositiveDecimalV(e){
        return transformInputNumberAsPositiveDecimal(e);
      },
      renderEmployeeFieldV(field){
        return !field ? "-": field;
      }

    },
    created(){
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const officeSalaryStripeInfo = app.mount('#app');

window.officeSalaryStripeInfoPage = officeSalaryStripeInfo;

// init

officeSalaryStripeInfo.loadPayrollInfoV();

async function doFetchPayrollInfo(id){
  const url="/api/v1/team/office/payroll/{id}/info".replace("{id}",id);
  return await axios.get(url);
}

async function doEditEmployeeBenefit(dto){
  const url="/api/v1/team/office/payroll/benefit/edit";
  return await axios.put(url,dto);
}

async function doAddOneCompensationItem(dto){
  const url="/api/v1/team/office/payroll/compensation/create";
  return await axios.post(url,dto);
}

async function doRemoveOneCompensationItem(compensationArr,payrollId){
  const dto={
    payrollId: payrollId,
    compensationJson: JSON.stringify(compensationArr)
  }
  const url="/api/v1/team/office/payroll/compensation/change";
  return await axios.put(url,dto);
}
async function doPayPayroll(id){
  const url="/api/v1/team/office/payroll/{id}/pay".replace("{id}",id);
  return await axios.post(url);
}
async function payPayroll(){
  doPayPayroll(currentPayrollId).then(response=>{
    if (response.data.code == 200) {
      officeSalaryStripeInfo.loadPayrollInfoV();
      customAlert.alert("支付成功");
      $("#focusModal").modal("hide"); // hide modal

    }
    if(response.data.code==40007){
      customAlert.alert("余额不足，请通过 「助力部落」进行充值"); 
      return ;
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}

async function removeOneCompensationItem(compensationArr){
  doRemoveOneCompensationItem(compensationArr,currentPayrollId).then(response=>{
    if (response.data.code == 200) {
      officeSalaryStripeInfo.loadPayrollInfoV();
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function addOneCompensationItem(item){
  doAddOneCompensationItem(item).then(response=>{
    if (response.data.code == 200) {
      officeSalaryStripeInfo.loadPayrollInfoV();
      officeSalaryStripeInfo.closeConfigCompensationModalV();
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function editEmployeeBenefit(benefit){
  doEditEmployeeBenefit(benefit).then(response=>{
    if (response.data.code == 200) {
      officeSalaryStripeInfo.loadPayrollInfoV();
      officeSalaryStripeInfo.closeEditEmployeeBenefitModalV();
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function loadPayrollInfo(){
  doFetchPayrollInfo(currentPayrollId).then(response=>{
    if (response.data.code == 200) {
      officeSalaryStripeInfo.payroll=response.data.payroll;
    }
    if(response.data.code==40043){
      goError();
    }
    officeSalaryStripeInfo.payroll.init_finish=true;
  })
}