import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
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

const oasisAvatarDefault = new URL(
  '/rainbow/images/oasis-default-building.jpeg',
  import.meta.url
);

const currentOasisId = getQueryVariable("oasis_id");

const RootComponent = {
    data() {
      return {
        oasisAvatarDefault,
        announce: {},
        oasisId: currentOasisId,
        departmentOptions: [],
        departmentSelectedItem: "",
        newEmployeeObj: initNewEmployeeModal(),
        employeeList_pagination: {
          url: "/api/v1/team/office/employee/query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              q: '',
              status: '',
              genre: '',
              oasisId: currentOasisId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.employeeList_pagination.size = response.employee.size;
                  this.employeeList_pagination.current = response.employee.current;
                  this.employeeList_pagination.total = response.employee.total;
                  this.employeeList_pagination.pages = response.employee.pages;
                  this.employeeList_pagination.records = response.employee.records;
                  this.employeeList_pagination.paging = this.doPaging({current: response.employee.current, pages: response.employee.pages, size: 5});

              }
          }
        },
      }
    },
    methods: {
      validateNewEmployeeModalCanSaveV(){
        if( !this.newEmployeeObj.employeeName || !this.newEmployeeObj.uid || !this.newEmployeeObj.employeeNumber || !this.departmentSelectedItem
          || !this.newEmployeeObj.role || !this.newEmployeeObj.officeLocation || !this.newEmployeeObj.genre || !this.newEmployeeObj.salary || Number(this.newEmployeeObj.salary)==0
          || !this.newEmployeeObj.pensionInsuranceBase || !this.newEmployeeObj.pensionInsuranceCompanyRate || !this.newEmployeeObj.pensionInsuranceEmployeeRate
          || !this.newEmployeeObj.medicalInsuranceBase || !this.newEmployeeObj.medicalInsuranceCompanyRate || !this.newEmployeeObj.medicalInsuranceEmployeeRate
          || !this.newEmployeeObj.unemploymentInsuranceBase || !this.newEmployeeObj.unemploymentInsuranceCompanyRate || !this.newEmployeeObj.unemploymentInsuranceEmployeeRate
          || !this.newEmployeeObj.occupationalInjuryInsuranceBase || !this.newEmployeeObj.occupationalInjuryInsuranceCompanyRate || !this.newEmployeeObj.occupationalInjuryInsuranceEmployeeRate
          || !this.newEmployeeObj.birthInsuranceBase || !this.newEmployeeObj.birthInsuranceCompanyRate || !this.newEmployeeObj.birthInsuranceEmployeeRate
          || !this.newEmployeeObj.housingProvidentFundsBase || !this.newEmployeeObj.housingProvidentFundsCompanyRate || !this.newEmployeeObj.housingProvidentFundsEmployeeRate){
          return false
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
      searchEmployeeListV(){
        this.employeeList_pagination.current=1;
        this.employeeList_pagination.param.status='';
        this.employeeList_pagination.param.genre='';
        this.reloadPage(this.employeeList_pagination);
      },
      filterEmployeeListV(){
        this.employeeList_pagination.current=1;
        this.reloadPage(this.employeeList_pagination);
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
      showNewEmployeeModalV(){
        this.departmentSelectedItem="";
        this.newEmployeeObj=initNewEmployeeModal();
        $("#newEmployeeModal").modal("show");
      },
      closeNewEmployeeModalV(){
        $("#newEmployeeModal").modal("hide");
      },
      loadDepartmentListV(){
        loadDepartmentList(this);
      },
      addOneEmployeeV(){
        this.newEmployeeObj.departmentId=this.departmentSelectedItem;
        addOneEmployee(this.newEmployeeObj);
      },
      transformInputNumberAsPositiveDecimalV(e){
        return transformInputNumberAsPositiveDecimal(e);
      },
      transformInputTextV(e){
          return transformInputText(e);
      }

    },
    created(){
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}
app.component("model-select",ModelSelect);

const officeEmployee = app.mount('#app');

window.officeEmployeePage = officeEmployee;


// init
officeEmployee.userAdapter(); // auth.js
officeEmployee.loadAnnounceV();
officeEmployee.pageInit(officeEmployee.employeeList_pagination);
officeEmployee.loadDepartmentListV();

async function fetchDepartmentList(oasisId){
  const url="/api/v1/team/office/department/query?size=200&current=1&oasisId="+oasisId;
  return await fetch(url);
}
async function doAddOneEmployee(dto){
  const url="/api/v1/team/office/employee/create";
  return await axios.post(url,dto);
}
async function addOneEmployee(employee){
  doAddOneEmployee(employee).then(response=>{
      if (response.data.code == 200) {
        officeEmployee.reloadPage(officeEmployee.employeeList_pagination);
        officeEmployee.closeNewEmployeeModalV();
      }
      if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
      }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}

async function loadDepartmentList(appObj){
  const response = await fetchDepartmentList(currentOasisId);
  var data = await response.json();
  if(data.code==200){
     var departmentArr=[];
     data.department.records.forEach(element => {
      departmentArr.push({value: element.id,text: element.title});
     });
     appObj.departmentOptions=departmentArr;
  }
}

function initNewEmployeeModal(){
  return {
    employeeName: "",
    uid: "",
    employeeNumber: "",
    departmentId: "",
    role: "",
    officeLocation: "",
    genre: "1",
    salary: "",
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
  }
}

function  transformInputText(e){
  var val = e.target.value.replace(/[^\a-\z\A-\Z0-9\_]/g,'');// type int
  const needUpdate = (val !== e.target.value);
  if(needUpdate){
      e.target.value=val;
      e.currentTarget.dispatchEvent(new Event('input')); // update v-model
  }
}