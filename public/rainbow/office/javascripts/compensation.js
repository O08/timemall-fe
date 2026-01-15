import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import Pagination  from "/common/javascripts/pagination-vue.js";
import { transformInputNumberAsPositiveDecimal } from "/common/javascripts/util.js";

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

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
        newCompensationObj: {
          title: "",
          amount: "",
          description: "",
          oasisId: currentOasisId,
          direction: "1"
        },
        editCompensationObjRaw: {},
        editCompensationObj: {
          title: "",
          amount: "",
          description: "",
          id: "",
          status: ""
        },
        oasisId: currentOasisId,
        salaryElementList_pagination: {
          url: "/api/v1/team/office/compensation/query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              q: '',
              status: '',
              direction: '',
              oasisId: currentOasisId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.salaryElementList_pagination.size = response.compensation.size;
                  this.salaryElementList_pagination.current = response.compensation.current;
                  this.salaryElementList_pagination.total = response.compensation.total;
                  this.salaryElementList_pagination.pages = response.compensation.pages;
                  this.salaryElementList_pagination.records = response.compensation.records;
                  this.salaryElementList_pagination.paging = this.doPaging({current: response.compensation.current, pages: response.compensation.pages, size: 5});

              }
          }
        },
      }
    },
    methods: {
      validateNewBenefitFormV(){
        if(!!this.newCompensationObj.title && !!this.newCompensationObj.amount  && Number(this.newCompensationObj.amount)>0){
           return true
        }
        return false;
      },
      validateEditBenefitFormCanSaveV(){
        if( !this.editCompensationObj.title || !this.editCompensationObj.amount || Number(this.editCompensationObj.amount)==0){
           return false
        }
        if( this.editCompensationObjRaw.title!=this.editCompensationObj.title || this.editCompensationObjRaw.amount!=this.editCompensationObj.amount 
            || this.editCompensationObjRaw.status!=this.editCompensationObj.status || this.editCompensationObjRaw.description!=this.editCompensationObj.description 
            ){
            return true
        }

        return false;
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
      searchV(){
        this.salaryElementList_pagination.current=1;
        this.salaryElementList_pagination.param.status="";
        this.salaryElementList_pagination.param.direction="";
        this.reloadPage(this.salaryElementList_pagination);
      },
      filterListV(){
        this.salaryElementList_pagination.current=1;
        this.reloadPage(this.salaryElementList_pagination);
      },
      addOneSalaryItemV(){
        addOneSalaryItem(this.newCompensationObj);
      },
      editSalaryItemV(){
        editSalaryItem(this.editCompensationObj);
      },
      delSalaryItemV(id){
        delSalaryItem(id);
      },
      showNewBenefitModalV(){
        this.newCompensationObj= {
          title: "",
          amount: "",
          description: "",
          oasisId: currentOasisId,
          direction: "1"
        };

        $("#newBenefitModal").modal("show");

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
      explianCompensationItemDirectionV(direction){
        var directionDesc = "未知";
        switch(direction){
            case "1":
              directionDesc="发放";
                break; 
            case "-1":
              directionDesc="扣除";
                break; 
 
        }
        return directionDesc;
      },
      closeNewBenefitModalV(){
        $("#newBenefitModal").modal("hide");

      },
      showEditBenefitModalV(compensationItem){

         this.editCompensationObjRaw=compensationItem;
        const tmp =JSON.parse(JSON.stringify(compensationItem));

        this.editCompensationObj={
          title: tmp.title,
          amount: tmp.amount,
          description: tmp.description,
          id: tmp.id,
          status: tmp.status
        }
        $("#editBenefitModal").modal("show");

      },
      closeEditBenefitModalV(){
        $("#editBenefitModal").modal("hide");

      },
      transformInputNumberAsPositiveDecimalV(e){
        return transformInputNumberAsPositiveDecimal(e);
     },

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

const officeCompensation = app.mount('#app');

window.officeCompensationPage = officeCompensation;

// init
officeCompensation.loadAnnounceV();
officeCompensation.pageInit(officeCompensation.salaryElementList_pagination);



async function doAddOneSalaryItem(dto) {
  const url = "/api/v1/team/office/compensation/create";
  return await axios.post(url,dto);
}
async function doEditCompensationItem(dto){
  const url ="/api/v1/team/office/compensation/edit";
  return await axios.put(url,dto);
}
async function doDelSalaryItem(id){
  const url ="/api/v1/team/office/compensation/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function delSalaryItem(id){
    doDelSalaryItem(id).then(response=>{
        if (response.data.code == 200) {
          officeCompensation.reloadPage(officeCompensation.salaryElementList_pagination);
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function editSalaryItem(compensationItem){
  doEditCompensationItem(compensationItem).then(response=>{
      if (response.data.code == 200) {
        officeCompensation.reloadPage(officeCompensation.salaryElementList_pagination);
        officeCompensation.closeEditBenefitModalV();
      }
      if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
      }
  }).catch(error => {
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}
async function addOneSalaryItem(compensationItem){
   doAddOneSalaryItem(compensationItem).then(response=>{
        if (response.data.code == 200) {
          officeCompensation.reloadPage(officeCompensation.salaryElementList_pagination);
          officeCompensation.closeNewBenefitModalV();
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}


