import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import Pagination  from "/common/javascripts/pagination-vue.js";

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import { transformInputNumberAsPositiveDecimal } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const personManDefault = new URL(
  '/common/images/default-person-man.jpg',
  import.meta.url
);

const oasisAvatarDefault = new URL(
  '/rainbow/images/oasis-default-building.jpeg',
  import.meta.url
);


const currentOasisId = getQueryVariable("oasis_id");
const RootComponent = {
    data() {
      return {
        personManDefault,
        focusModal:{
          message: "",
          confirmHandler:()=>{

          }
        },
        oasisAvatarDefault,
        oasisEmployeeQueryParam: "",
        announce: {},
        oasisId: currentOasisId,
        payOneEmployeeTitle: "",
        batchGeneratePayrollObj:{
          title: "",
          oasisId: currentOasisId,
          employeeStatus: "1"
        },
        perkPayrollObj: {
          title: "",
          employeeStatus: "1",
          oasisId: currentOasisId,
          grossAmount: "",
          deduction: "",
          withholdAndRemitTax: ""
        },
        dashboard: {
          employees: "",
          pendingPayments: "",
          monthlyExpense: "",
          monthlyPayrolls: ""
        },
        employeeList:{
          records: []
        },
        payrollList_pagination: {
          url: "/api/v1/team/office/payroll/admin_query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              q: '',
              status: '',
              oasisId: currentOasisId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.payrollList_pagination.size = response.payroll.size;
                  this.payrollList_pagination.current = response.payroll.current;
                  this.payrollList_pagination.total = response.payroll.total;
                  this.payrollList_pagination.pages = response.payroll.pages;
                  this.payrollList_pagination.records = response.payroll.records;
                  this.payrollList_pagination.paging = this.doPaging({current: response.payroll.current, pages: response.payroll.pages, size: 5});
  
              }
          }
        },
      }
    },
    methods: {
      validatePayPerkModalCanSaveV(){
        if( !this.perkPayrollObj.title || !this.perkPayrollObj.grossAmount || Number(this.perkPayrollObj.grossAmount)==0 || !this.perkPayrollObj.deduction || !this.perkPayrollObj.withholdAndRemitTax){
          return false
        }
        const netPay=Number(this.perkPayrollObj.grossAmount)-Number(this.perkPayrollObj.deduction)-Number(this.perkPayrollObj.withholdAndRemitTax);
        if(netPay<=0){
          return false;
        }
        return true;
      },
      loadAnnounceV() {
        const oasisId = getQueryVariable("oasis_id");
        if (!oasisId) {
            window.location.href = "/rainbow/teixcalaanli";
            return;
        }
        OasisApi.loadAnnounce(oasisId).then(response => {
            if (response.data.code == 200) {
                this.announce = response.data.announce;
                if (!this.announce || this.announce.initiator != this.getIdentity().brandId) {
                    window.location.href = "/rainbow/teixcalaanli";
                }
            }
        })
      },
      loadDashboardV(){
        loadDashboard();
      },
      renderDashboard(val){
         return !val ? "0": val;
      },
      searchPayrollListV(){
        this.payrollList_pagination.current=1;
        this.payrollList_pagination.param.status='';
        this.reloadPage(this.payrollList_pagination);
      },
      filterPayrollListV(){
        this.payrollList_pagination.current=1;
        this.reloadPage(this.payrollList_pagination);
      },
      explianPayrollStatusV(status){
        var statusDesc = "未知";
        switch(status){
            case "1":
                statusDesc="待打款";
                break; 
            case "2":
                statusDesc="已支付";
                break; 
 
        }
        return statusDesc;
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
      showDeletePayrollFocusModalV(payroll) {
        this.focusModal.message = "即将删除底单，删除后不可恢复，关联员工："+payroll.employeeName;
        this.focusModal.confirmHandler = () => {

            this.delOnePayrollV(payroll.id);
      
        }
        $("#focusModal").modal("show"); // show modal
      },
      delOnePayrollV(id){
        delOnePayroll(id);
      },
      showPayGeneralModalV(){
        this.batchGeneratePayrollObj={
          title: "",
          oasisId: currentOasisId,
          employeeStatus: "1"
        }
        $("#payGeneralModal").modal("show");
      },
      closePayGeneralModalV(){
        $("#payGeneralModal").modal("hide");
      },
      showPayOneModalV(){
        this.oasisEmployeeQueryParam="";
        this.payOneEmployeeTitle="";
        this.loadEmployeeListV();
        $("#payOneEmployeeModal").modal("show");
      },
      showPayRetroactivelyModalV(){
        this.perkPayrollObj={
          title: "",
          employeeStatus: "1",
          oasisId: currentOasisId,
          grossAmount: "",
          deduction: "",
          withholdAndRemitTax: ""
        }
        $("#payRetroactivelyModal").modal("show");

      },
      closePayRetroactivelyModalV(){
        $("#payRetroactivelyModal").modal("hide");
      },
      generatePayrollByEmployeeStatusV(){
        generatePayrollByEmployeeStatus(this.batchGeneratePayrollObj);
      },
      generatePayrollWhenGivePerkV(){
        generatePayrollWhenGivePerk(this.perkPayrollObj);
      },
      generateOnePayrollV(employee){
        generateOnePayroll(employee,this.payOneEmployeeTitle);
      },
      loadEmployeeListV(){
        loadEmployeeList(this.oasisEmployeeQueryParam);
      },
      transformInputNumberAsPositiveDecimalV(e){
        return transformInputNumberAsPositiveDecimal(e);
      },
      renderTableDateV(dateStr){
        return !dateStr ? "": dateStr.replace(new RegExp('-', 'g'), '/');
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

const officePayroll = app.mount('#app');

window.officePayrollPage = officePayroll;

// init
officePayroll.loadAnnounceV();
officePayroll.pageInit(officePayroll.payrollList_pagination);
officePayroll.loadDashboardV();


async function doFetchPayrollDashboard(oasisId){
  const url="/api/v1/team/office/payroll/dashboard?oasisId="+oasisId;
  return await axios.get(url);
}
async function doGeneratePayrollByEmployeeStatus(dto){
  const url="/api/v1/team/office/payroll/create_by_status";
  return await axios.post(url,dto);
}
async function doGeneratePayrollWhenGivePerk(dto){
  const url="/api/v1/team/office/payroll/create_perks";
  return await axios.post(url,dto);
}
async function fetchEmployeeList(oasisId,oasisEmployeeQueryParam){
  const url="/api/v1/team/office/employee/query?size=2000&current=1&oasisId="+oasisId+"&q="+oasisEmployeeQueryParam;
  return await fetch(url);
}
async function doGenerateOnePayroll(dto){
  const url="/api/v1/team/office/payroll/create_one";
  return await axios.post(url,dto);
}
async function doDelOnePayroll(id){
  const url="/api/v1/team/office/payroll/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function delOnePayroll(id){
    doDelOnePayroll(id).then(response=>{
      if (response.data.code == 200) {
        officePayroll.reloadPage(officePayroll.payrollList_pagination);
        $("#focusModal").modal("hide"); // toggle modal
      }
      if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
      }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function generateOnePayroll(employee,payOneEmployeeTitle){
    if(!payOneEmployeeTitle){
       customAlert.alert("请填写薪资标题");
    }
    const dto={
      title: payOneEmployeeTitle,
      employeeId: employee.id
    }

    doGenerateOnePayroll(dto).then(response=>{
        if (response.data.code == 200) {
          officePayroll.reloadPage(officePayroll.payrollList_pagination);
          employee.areadyPay='1';
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function loadEmployeeList(oasisEmployeeQueryParam){
  const response = await fetchEmployeeList(currentOasisId,oasisEmployeeQueryParam);
  var data = await response.json();
  if(data.code==200){
     officePayroll.employeeList=data.employee.records;
  }
}
async function generatePayrollWhenGivePerk(param){
      doGeneratePayrollWhenGivePerk(param).then(response=>{
          if (response.data.code == 200) {
            officePayroll.reloadPage(officePayroll.payrollList_pagination);
            officePayroll.closePayRetroactivelyModalV();
          }
          if(response.data.code!=200){
              const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(error); 
          }
      }).catch(error => {
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
      });
}
async function generatePayrollByEmployeeStatus(param){
    doGeneratePayrollByEmployeeStatus(param).then(response=>{
        if (response.data.code == 200) {
          officePayroll.reloadPage(officePayroll.payrollList_pagination);
          officePayroll.closePayGeneralModalV();
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}

async function loadDashboard(){
    doFetchPayrollDashboard(currentOasisId).then(response=>{
      if (response.data.code == 200) {
        officePayroll.dashboard=response.data.dashboard;
        if(!officePayroll.dashboard){
          officePayroll.dashboard={
            employees: "",
            pendingPayments: "",
            monthlyExpense: "",
            monthlyPayrolls: ""
          }
        }

      }
    })
}

