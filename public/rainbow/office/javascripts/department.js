import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const currentOasisId = getQueryVariable("oasis_id");

let customAlert = new CustomAlertModal();
const RootComponent = {
    data() {
      return {
        btn_ctl: {
            editDepartmentModal_already_change: false
        },
        oasisAvatarDefault,
        oasisId: currentOasisId,
        announce: {},
        employeeOptions: [],
        leaderSelectedItem: "",
        newDepartmentObj: {
            title: "",
            description: "",
            oasisId: currentOasisId
        },
        editDepartmentObj: {
            departmentId: "",
            title: "",
            description: "",
            leaderEmployeeId: ""
        },
        departmentList_pagination: {
          url: "/api/v1/team/office/department/query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
              q: '',
              oasisId: currentOasisId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.departmentList_pagination.size = response.department.size;
                  this.departmentList_pagination.current = response.department.current;
                  this.departmentList_pagination.total = response.department.total;
                  this.departmentList_pagination.pages = response.department.pages;
                  this.departmentList_pagination.records = response.department.records;
                  this.departmentList_pagination.paging = this.doPaging({current: response.department.current, pages: response.department.pages, size: 5});

              }
          }
        },
      }
    },
    methods: {
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
        searchDepartmentV(){
            this.departmentList_pagination.current=1;
            this.reloadPage(this.departmentList_pagination);
        },
        loadEmployeeListV(){
            loadEmployeeList(this);
        },
        establishDepartmentV(){
            establishDepartment(this.newDepartmentObj);
        },
        changeDepartmentV(){
            this.editDepartmentObj.leaderEmployeeId=this.leaderSelectedItem;
            changeDepartment(this.editDepartmentObj);

        },
        showNewEmployeeModalV(){
            this.newDepartmentObj={
                title: "",
                description: "",
                oasisId: currentOasisId
            }
            $("#newDepartmentModal").modal("show");
        },
        closeNewDepartmentModalV(){
            $("#newDepartmentModal").modal("hide");
        },
        delOneDepartmentV(id){
            delOneDepartment(id);
        },
        showEditDepartmentModalV(department){
            const tmp=JSON.parse(JSON.stringify(department));
            this.editDepartmentObj={
                departmentId: tmp.id,
                title: tmp.title,
                description: tmp.description,
                leaderEmployeeId: tmp.leaderEmployeeId
            }
            this.leaderSelectedItem=tmp.leaderEmployeeId;
            this.btn_ctl.editDepartmentModal_already_change=false;
            $("#editDepartmentModal").modal("show");
        },
        closeEditDepartmentModalV(){
            $("#editDepartmentModal").modal("hide");
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
app.component("model-select",ModelSelect);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const officeDepartment = app.mount('#app');

window.officeDepartmentPage = officeDepartment;

// init
officeDepartment.userAdapter(); // auth.js
officeDepartment.loadAnnounceV();
officeDepartment.pageInit(officeDepartment.departmentList_pagination);
officeDepartment.loadEmployeeListV();


async function doEstablishDepartment(dto) {
    const url = "/api/v1/team/office/department/create";
    return await axios.post(url,dto);
}

async function fetchEmployeeList(oasisId){
    const url="/api/v1/team/office/employee/query?size=2000&current=1&genre=1&oasisId="+oasisId;
    return await fetch(url);
}

async function doChangeDepartment(dto){
    const url="/api/v1/team/office/department/edit";
    return await axios.put(url,dto);
}
async function doDelOneDepartment(id){
    const url = "/api/v1/team/office/department/{id}/del".replace("{id}",id);
    return await axios.delete(url);
}
async function delOneDepartment(id){
    doDelOneDepartment(id).then(response=>{
        if (response.data.code == 200) {
            officeDepartment.reloadPage(officeDepartment.departmentList_pagination);
        }
        if(response.data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function changeDepartment(dto){
    doChangeDepartment(dto).then(response=>{
        if (response.data.code == 200) {
            officeDepartment.reloadPage(officeDepartment.departmentList_pagination);
            officeDepartment.closeEditDepartmentModalV();
        }
        if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function loadEmployeeList(appObj){
    const response = await fetchEmployeeList(currentOasisId);
    var data = await response.json();
    if(data.code==200){
       var employeeArr=[{value:"",text:"请选择员工"}];
       data.employee.records.forEach(element => {
        employeeArr.push({value: element.id,text: element.employeeName});
       });
       appObj.employeeOptions=employeeArr;
    }
}

async function establishDepartment(department){
    doEstablishDepartment(department).then(response=>{
        if (response.data.code == 200) {
            officeDepartment.reloadPage(officeDepartment.departmentList_pagination);
            officeDepartment.closeNewDepartmentModalV();
        }
        if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}




