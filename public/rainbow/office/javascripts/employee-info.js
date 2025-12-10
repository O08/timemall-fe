import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
import "/common/javascripts/import-jquery.js";
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';

import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { transformInputNumberAsPositiveDecimal } from "/common/javascripts/util.js";

import personManDefault from "/common/images/default-person-man.jpg";

import { validateEmailOrPhoneInput } from "/common/javascripts/util.js";



import Pagination  from "/common/javascripts/pagination-vue.js";


import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const currentEmployeeId= window.location.pathname.split('/').slice(-2).shift();
const RootComponent = {
    data() {
      return {
        personManDefault,
        departmentOptions: [],
        departmentSelectedItem: "",
        employee:{},
        editEmployeeBasicObj: {},
        editEmployeeBenefitObj: {},
        configCompensationObj: {},
        newEmployeeExtraInfoObj: {},
        renameEmployeeMaterialObj: {},
        employeeBenefit: {},
        btn_ctl: {
            material_uploading: false,
            photo_uploading: false,
            basicInfo_already_change: false,
            benefit_obj_already_change: false,
            renameMaterialModal_already_change: false
        },
        compensationGrantInfo: {
          records: []
        },
        compensationList_pagination: {
          url: "/api/v1/team/office/employee/compensation",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              id: currentEmployeeId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.compensationList_pagination.size = response.compensation.size;
                  this.compensationList_pagination.current = response.compensation.current;
                  this.compensationList_pagination.total = response.compensation.total;
                  this.compensationList_pagination.pages = response.compensation.pages;
                  this.compensationList_pagination.records = response.compensation.records;
                  this.compensationList_pagination.paging = this.doPaging({current: response.compensation.current, pages: response.compensation.pages, size: 5});
  
              }
          }
        },
        materialList_pagination: {
          url: "/api/v1/team/office/employee/material/query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              id: currentEmployeeId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.materialList_pagination.size = response.material.size;
                  this.materialList_pagination.current = response.material.current;
                  this.materialList_pagination.total = response.material.total;
                  this.materialList_pagination.pages = response.material.pages;
                  this.materialList_pagination.records = response.material.records;
                  this.materialList_pagination.paging = this.doPaging({current: response.material.current, pages: response.material.pages, size: 5});
  
              }
          }
        },
        kvList_pagination: {
          url: "/api/v1/team/office/employee/kv",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              id: currentEmployeeId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.kvList_pagination.size = response.kv.size;
                  this.kvList_pagination.current = response.kv.current;
                  this.kvList_pagination.total = response.kv.total;
                  this.kvList_pagination.pages = response.kv.pages;
                  this.kvList_pagination.records = response.kv.records;
                  this.kvList_pagination.paging = this.doPaging({current: response.kv.current, pages: response.kv.pages, size: 5});
  
              }
          }
        },
      }
    },
    methods: {
      validateEditEmployeeBasicInfoModalCanSaveV(){
        if( !this.editEmployeeBasicObj.employeeNumber || !this.editEmployeeBasicObj.employeeName || !this.editEmployeeBasicObj.role
          ||  !this.editEmployeeBasicObj.officeLocation || !this.editEmployeeBasicObj.hireDate
          || !this.editEmployeeBasicObj.status || !this.editEmployeeBasicObj.genre
          || !this.editEmployeeBasicObj.salary || Number(this.editEmployeeBasicObj.salary)==0 || !this.departmentSelectedItem || !this.btn_ctl.basicInfo_already_change){
          return false
        }

        if(!!this.editEmployeeBasicObj.email && !validateEmailOrPhoneInput(this.editEmployeeBasicObj.email)){
          return false;
        }
        return true;
      },
      validateEditBenefitFormCanSaveV(){
        if( !this.editEmployeeBenefitObj.pensionInsuranceBase || !this.editEmployeeBenefitObj.pensionInsuranceCompanyRate || !this.editEmployeeBenefitObj.pensionInsuranceEmployeeRate
          || !this.editEmployeeBenefitObj.medicalInsuranceBase || !this.editEmployeeBenefitObj.medicalInsuranceCompanyRate || !this.editEmployeeBenefitObj.medicalInsuranceEmployeeRate
          || !this.editEmployeeBenefitObj.unemploymentInsuranceBase || !this.editEmployeeBenefitObj.unemploymentInsuranceCompanyRate || !this.editEmployeeBenefitObj.unemploymentInsuranceEmployeeRate
          || !this.editEmployeeBenefitObj.occupationalInjuryInsuranceBase || !this.editEmployeeBenefitObj.occupationalInjuryInsuranceCompanyRate || !this.editEmployeeBenefitObj.occupationalInjuryInsuranceEmployeeRate
          || !this.editEmployeeBenefitObj.birthInsuranceBase || !this.editEmployeeBenefitObj.birthInsuranceCompanyRate || !this.editEmployeeBenefitObj.birthInsuranceEmployeeRate
          || !this.editEmployeeBenefitObj.housingProvidentFundsBase || !this.editEmployeeBenefitObj.housingProvidentFundsCompanyRate || !this.editEmployeeBenefitObj.housingProvidentFundsEmployeeRate
          || !this.btn_ctl.benefit_obj_already_change){
           return false
        }

        return true;
      },
      validateAddKvPairFormCanSaveV(){
        if( !this.newEmployeeExtraInfoObj.title || !this.newEmployeeExtraInfoObj.content ){
          return false
        }
        return true;
      },
      searchOrderListV(){},
      filterOrderListV(){},
      loadEmployeeBasicInfoV(){
        loadEmployeeBasicInfo();
      },
      loadEmployeeBenefitInfoV(){
        loadEmployeeBenefitInfo();
      },
      showEditBasicEmployeeModalV(){
        this.editEmployeeBasicObj=JSON.parse(JSON.stringify(this.employee));
        this.departmentSelectedItem=this.editEmployeeBasicObj.departmentId;
        this.btn_ctl.basicInfo_already_change=false;
        $("#editEmployeeModal").modal("show");

      },
      closeEditBasicEmployeeModalV(){
        $("#editEmployeeModal").modal("hide");
      },
      showRenameEmployeeMaterialModalV(material){
        this.renameEmployeeMaterialObj={
          materialName: material.materialName,
          id: material.materialId
        }
        this.btn_ctl.renameMaterialModal_already_change=false;
        $("#renameEmployeeMaterialModal").modal("show");
      },
      closeRenameEmployeeMaterialModalV(){
        $("#renameEmployeeMaterialModal").modal("hide");
      },
      showEditEmployeeBenefitModalV(){
        const tmp =JSON.parse(JSON.stringify(this.employeeBenefit));
        this.editEmployeeBenefitObj={
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
        this.editEmployeeBenefitObj.employeeId=currentEmployeeId;
        this.btn_ctl.benefit_obj_already_change=false;
        $("#editEmployeeBenefitModal").modal("show");

      },
      closeEditEmployeeBenefitModalV(){
        $("#editEmployeeBenefitModal").modal("hide");
      },
      showConfigCompensationModalV(){
        this.configCompensationObj.q="";
        this.configCompensationObj.oasisId=this.oasisId,
        this.configCompensationObj.employeeId=currentEmployeeId;
        this.configCompensationObj.current=1;
        this.configCompensationObj.size=200;
        loadConfigCompensationModalData(this.configCompensationObj);

      },
      loadComensationListV(){
        this.configCompensationObj.oasisId=this.oasisId,
        this.configCompensationObj.employeeId=currentEmployeeId;
        this.configCompensationObj.current=1;
        this.configCompensationObj.size=200;
        loadComensationList(this.configCompensationObj);
      },
      closeConfigCompensationModalV(){
        $("#newCompensationModal").modal("hide");

      },
      showNewEmployeeExtraInfoModalV(){
        this.newEmployeeExtraInfoObj={
          employeeId: currentEmployeeId,
          title: "",
          content: ""
        }
        $("#newEmployeeExtraInfoModal").modal("show");
      },
      closeNewEmployeeExtraInfoModalV(){
        $("#newEmployeeExtraInfoModal").modal("hide");
      },
      uploadMaterialV(e){
        uploadMaterial(e,this);
      },
      uploadEmployeePhotoV(e){
        uploadEmployeePhoto(e,this);
      },
      explianCompensationItemStatusV(status){
        var statusDesc = "未知";
        switch(status){
            case "0":
                statusDesc="已停用";
                break; 
            case "1":
                statusDesc="生效中";
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
      calEmployeeBenefitExpenseV(benefit){
        const pensionMoney=this.calBenefitItemV(benefit.pensionInsuranceBase,benefit.pensionInsuranceEmployeeRate);
        const medicalMoney=this.calBenefitItemV(benefit.medicalInsuranceBase,benefit.medicalInsuranceEmployeeRate);;
        const unemploymentMoney=this.calBenefitItemV(benefit.unemploymentInsuranceBase,benefit.unemploymentInsuranceEmployeeRate);;
        const injuryMoney=this.calBenefitItemV(benefit.occupationalInjuryInsuranceBase,benefit.occupationalInjuryInsuranceEmployeeRate);;
        const birthMoney=this.calBenefitItemV(benefit.birthInsuranceBase,benefit.birthInsuranceEmployeeRate);;
        const housingMoney=this.calBenefitItemV(benefit.housingProvidentFundsBase,benefit.housingProvidentFundsEmployeeRate);;
        return (Number(pensionMoney)+Number(medicalMoney)+Number(unemploymentMoney)
                   +Number(injuryMoney)+Number(birthMoney)+Number(housingMoney)).toFixed(2);
      },
      loadDepartmentListV(){
        loadDepartmentList(this);
      },
      loadEmployeeBasicInfoAndDepartmentListWhenInitPageV(){
        loadEmployeeBasicInfoAndDepartmentListWhenInitPage();
      },
      editEmployeeBasicInfoV(){
        this.editEmployeeBasicObj.departmentId=this.departmentSelectedItem;
        editEmployeeBasicInfo(this.editEmployeeBasicObj);
      },
      editEmployeeBenefitInfoV(){
        editEmployeeBenefitInfo(this.editEmployeeBenefitObj);
      },
      configCompensationV(item){
        configEmployeeCompensation(item);
      },
      removeOneMaterialV(id){
        removeOneMaterial(id);
      },
      addOneKvPairV(){
        addOneKvPair(this.newEmployeeExtraInfoObj)
      },
      removeOnekvPairV(id){
        removeOnekvPair(id);
      },
      renderFileSizeV(size){
        return renderSize(size);
      },
      renameEmployeeMaterialV(){
        renameEmployeeMaterial(this.renameEmployeeMaterialObj);
      },
      userInputDatePickerHandlerV(e){    

          if(!e.target.dataset.olddate){
              e.target.dataset.olddate="2025-02-21";
          }
          e.target.value =  e.target.dataset.olddate;
          $("#" + e.target.id).datepicker("setDate", e.target.dataset.olddate);
          if(!!e.data){
              e.currentTarget.dispatchEvent(new Event('input')); // update v-model
          }
  
      },
      transformInputNumberAsPositiveDecimalV(e){
        return transformInputNumberAsPositiveDecimal(e);
      },
      renderEmployeeFieldV(field){
        return !field ? "-": field;
      },
      transformInputTextV(e){
          return transformInputText(e);
      },

      renderNetWorthV(netWorth){
        if(!netWorth){
          return "-";
        }
        return formatCmpctNumber(netWorth);
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
const officeEmployeeInfo = app.mount('#app');

window.officeEmployeeInfoPage = officeEmployeeInfo;

// init


officeEmployeeInfo.userAdapter(); // auth.js
officeEmployeeInfo.loadEmployeeBasicInfoAndDepartmentListWhenInitPageV();
officeEmployeeInfo.loadEmployeeBenefitInfoV();
officeEmployeeInfo.pageInit(officeEmployeeInfo.compensationList_pagination);
officeEmployeeInfo.pageInit(officeEmployeeInfo.materialList_pagination);
officeEmployeeInfo.pageInit(officeEmployeeInfo.kvList_pagination);

async function doFetchEmployeeBasicInfo(id){
  const url="/api/v1/team/office/employee/basic?id="+id;
  return await axios.get(url)
}

async function doFetchEmployeeBenefitInfo(id){
  const url="/api/v1/team/office/employee/benefit/info?id="+id;
  return await axios.get(url);
}
async function fetchDepartmentList(oasisId){
  const url="/api/v1/team/office/department/query?size=200&current=1&oasisId="+oasisId;
  return await fetch(url);
}
async function doEditEmployeeBasicInfo(dto){
  const url="/api/v1/team/office/employee/basic/change";
  return await axios.put(url,dto);
}
async function doEditEmployeeBenefitInfo(dto){
  const url="/api/v1/team/office/employee/benefit/edit";
  return await axios.put(url,dto);
}
async function fetchConfigCompensationModalData(params){
  const url="/api/v1/team/office/employee/compensation_config?"+ new URLSearchParams(params).toString();
  return await axios.get(url);
}
async function doConfigEmployeeCompensation(dto){
  const url="/api/v1/team/office/employee/compensation/config";
  return await axios.put(url,dto);
}
async function doUploadEmployeeMaterial(file,employeeId){
  var fd = new FormData();
  fd.append('employeeId', employeeId);
  fd.append('materialFile', file);
  const url = "/api/v1/team/office/employee/material/upload";
  return await axios.post(url, fd);
}
async function doUploadEmployeePhoto(file,employeeId){
  var fd = new FormData();
  fd.append('employeeId', employeeId);
  fd.append('photoFile', file);
  const url = "/api/v1/team/office/employee/photo/change";
  return await axios.put(url, fd);
}
async function doRemoveOneMaterial(id){
  const url="/api/v1/team/office/empolyee/material/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function doAddOneKvPair(dto){
  const url="/api/v1/team/office/employee/kv/new";
  return await axios.post(url,dto);
}
async function doRemoveOnekvPair(id){
  const url="/api/v1/team/office/employee/kv/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function doRenameEmployeeMaterial(params){
  const url="/api/v1/team/office/employee/material/rename";
  return await axios.put(url,params);
}
async function renameEmployeeMaterial(params){
  doRenameEmployeeMaterial(params).then(response=>{
    if(response.data.code==200){
      officeEmployeeInfo.reloadPage(officeEmployeeInfo.materialList_pagination);
      officeEmployeeInfo.closeRenameEmployeeMaterialModalV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  }).catch(error => {

      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function removeOnekvPair(id){
  doRemoveOnekvPair(id).then(response=>{
    if(response.data.code==200){
      officeEmployeeInfo.reloadPage(officeEmployeeInfo.kvList_pagination);
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  }).catch(error => {

      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function addOneKvPair(kvpair){
  doAddOneKvPair(kvpair).then(response=>{
    if(response.data.code==200){
      officeEmployeeInfo.kvList_pagination.current=1;
      officeEmployeeInfo.reloadPage(officeEmployeeInfo.kvList_pagination);
      officeEmployeeInfo.closeNewEmployeeExtraInfoModalV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  }).catch(error => {

      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function removeOneMaterial(id){
  doRemoveOneMaterial(id).then(response=>{
    if(response.data.code==200){
      officeEmployeeInfo.reloadPage(officeEmployeeInfo.materialList_pagination);
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  }).catch(error => {

      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function configEmployeeCompensation(item){
  const dto={
    employeeId: currentEmployeeId,
    compensationId: item.id,
    assigned: item.assigned
  }
  doConfigEmployeeCompensation(dto).then(response=>{
    if(response.data.code==200){
      officeEmployeeInfo.compensationList_pagination.current=1;
      officeEmployeeInfo.reloadPage(officeEmployeeInfo.compensationList_pagination);
    }
    if(response.data.code!=200){
      item.assigned=toggleAssigned(role.assigned);
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  }).catch(error => {
      item.assigned=toggleAssigned(role.assigned);

      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
function toggleAssigned(assigned){
  if(assigned=='1')
    return '0';
  return '1';
}
async function loadConfigCompensationModalData(queryObj){
  fetchConfigCompensationModalData(queryObj).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.compensationGrantInfo=response.data.compensationGrantInfo;
      $("#configCompensationModal").modal("show");
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function loadComensationList(queryObj){
  fetchConfigCompensationModalData(queryObj).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.compensationGrantInfo=response.data.compensationGrantInfo;
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function editEmployeeBenefitInfo(benefit){
  doEditEmployeeBenefitInfo(benefit).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.loadEmployeeBenefitInfoV();
      officeEmployeeInfo.closeEditEmployeeBenefitModalV();
    }
    if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
    }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function editEmployeeBasicInfo(basicInfo){
  doEditEmployeeBasicInfo(basicInfo).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.loadEmployeeBasicInfoV();
      officeEmployeeInfo.closeEditBasicEmployeeModalV();
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
  const response = await fetchDepartmentList(appObj.oasisId);
  var data = await response.json();
  if(data.code==200){
     var departmentArr=[];
     data.department.records.forEach(element => {
      departmentArr.push({value: element.id,text: element.title});
     });
     appObj.departmentOptions=departmentArr;
  }
}
async function loadEmployeeBenefitInfo(){
  doFetchEmployeeBenefitInfo(currentEmployeeId).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.employeeBenefit=response.data.benefit;
    }
  })
}
async function loadEmployeeBasicInfo(){
  doFetchEmployeeBasicInfo(currentEmployeeId).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.employee=response.data.employee;
    }
  })
}
async function loadEmployeeBasicInfoAndDepartmentListWhenInitPage(){
  doFetchEmployeeBasicInfo(currentEmployeeId).then(response=>{
    if (response.data.code == 200) {
      officeEmployeeInfo.employee=response.data.employee;
      officeEmployeeInfo.oasisId=response.data.employee.oasisId;
      officeEmployeeInfo.loadDepartmentListV();
    }
  })
}




function uploadMaterial(e, appObj) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }


  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 50; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("文件最大为50M!");
    var fileInputEl=document.getElementById("employee_material_file");
    if(!!fileInputEl){
      fileInputEl.value=null;
    }
    return false;
  }

  appObj.btn_ctl.material_uploading = true;

  // upload product cover file
  doUploadEmployeeMaterial(file,currentEmployeeId).then(response => {

    if (response.data.code == 200) {


      appObj.reloadPage(appObj.materialList_pagination);

    }
    if (response.data.code != 200) {
      const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
      customAlert.alert(error);
    }
    appObj.btn_ctl.material_uploading = false;

    var fileInputEl=document.getElementById("employee_material_file");
    if(!!fileInputEl){
      fileInputEl.value=null;
    }

  })

}

function uploadEmployeePhoto(e,appObj){
  const file = e.target.files[0];
  if (!file) {
    return;
  }


  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("文件最大为6M!");
    var fileInputEl=document.getElementById("employee_photo_file");
    if(!!fileInputEl){
      fileInputEl.value=null;
    }
    return false;
  }

  appObj.btn_ctl.photo_uploading = true;

  // upload product cover file
  doUploadEmployeePhoto(file,currentEmployeeId).then(response => {

    if (response.data.code == 200) {


      appObj.loadEmployeeBasicInfoV();

    }
    if (response.data.code != 200) {
      const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
      customAlert.alert(error);
    }
    appObj.btn_ctl.photo_uploading = false;

    var fileInputEl=document.getElementById("employee_photo_file");
    if(!!fileInputEl){
      fileInputEl.value=null;
    }

  })
}
function renderSize(filesize){
  if(null==filesize||filesize==''){
      return "0 Bytes";
  }
  var unitArr = new Array("Bytes","KB","MB","GB","TB","PB","EB","ZB","YB");
  var index=0;
  var srcsize = parseFloat(filesize);
  index=Math.floor(Math.log(srcsize)/Math.log(1024));
  var size =srcsize/Math.pow(1024,index);
  size=size.toFixed(2);//保留的小数位数
  return parseFloat(size)+unitArr[index];
}



$( ".datepicker" ).datepicker({
  dateFormat: "yy-mm-dd",
  duration: "fast",
  onSelect: function(selectedDate,inst) {
      if(inst.lastVal !=selectedDate){
          document.getElementById(inst.id).dataset.olddate=selectedDate;
          document.getElementById(inst.id).dispatchEvent(new Event('input'))
          document.getElementById(inst.id).dispatchEvent(new Event('change'))
      }
  }
});



$( ".datepicker" ).datepicker( $.datepicker.regional[ "zh-CN" ] );


function  transformInputText(e){
  var val = e.target.value.replace(/[^\a-\z\A-\Z0-9\_]/g,'');// type int
  const needUpdate = (val !== e.target.value);
  if(needUpdate){
      e.target.value=val;
      e.currentTarget.dispatchEvent(new Event('input')); // update v-model
  }
}


var options = {
  notation: "compact",
  compactDisplay: "short",
};
function formatCmpctNumber(number) {
  const usformatter = Intl.NumberFormat("zh-CN", options);
  return usformatter.format(number);
}