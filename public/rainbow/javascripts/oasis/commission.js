import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/rainbow/javascripts/compoent/OasisAnnounceComponent.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import {CommissionTag} from "/common/javascripts/tm-constant.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js'; 

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentOasisId = getQueryVariable("oasis_id");

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);

const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {

        return {
            currentOch: "oasis-home",
            channelSort, oaisiChannelList,getChannelDataV,
            commissionForm: {
              title: "",
              bonus: "",
              sow: ""
            },
            auditingCommission: {
                title: "",
                bonus: "",
                sow: "",
                id: ""
            },
            editingCommission: {
                title: "",
                bonus: "",
                sow: "",
                id: ""
            },
            viewCommission:{
                title: "",
                bonus: "",
                sow: "",
                id: ""
            },
            commissionTb_pagination: {
                url: "/api/v1/team/commission",
                size: 5,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: '',
                    tag: '',
                    sort: '1',
                    filter: '',
                    oasisId: '',
                    worker: ""
                },
                paramHandler: (info)=>{
                    info.param.oasisId = currentOasisId;
                 },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.commissionTb_pagination.size = response.commission.size;
                        this.commissionTb_pagination.current = response.commission.current;
                        this.commissionTb_pagination.total = response.commission.total;
                        this.commissionTb_pagination.pages = response.commission.pages;
                        this.commissionTb_pagination.records = response.commission.records;
                        this.commissionTb_pagination.paging = this.doPaging({current: response.commission.current, pages: response.commission.pages, size: 5});
                    }
                }
            }
        }
    },
    methods: {
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        abortTaskV(commissionId){
            examineTask(commissionId,CommissionTag.ABOLISH).then(response=>{
                if(response.data.code == 200){
                   this.reloadPage(this.commissionTb_pagination);
                   this.closeAuditTaskModalHandlerV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        addTaskToPoolV(commissionId){
            examineTask(commissionId,CommissionTag.ADD_TO_NEED_POOL).then(response=>{
                if(response.data.code == 200){
                   this.reloadPage(this.commissionTb_pagination);
                   this.closeAuditTaskModalHandlerV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        addCommissionV(){
            addCommission().then(response=>{
                if(response.data.code == 200){
                   this.reloadPage(this.commissionTb_pagination);
                   // reset data
                   this.closeAddTaskModalHandlerV();
                   $("#addTaskModal").modal("hide");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        deleteCommissionV(id){
            deleteCommission(id);
        },
        receiveCommissionV(commissionId){
            receiveCommission(commissionId).then(response=>{
                if(response.data.code == 200){
                    this.reloadPage(this.commissionTb_pagination);
                    this.closeAcceptTaskModalHandlerV();
                 }
                 if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        filterCommissionV(filter){
            filterCommission(filter);
        },
        retrieveOasisCommissionGridV(){
            retrieveOasisCommissionGrid();
        },
        retrieveOasisCommissionByTagV(tag){
            retrieveOasisCommissionByTag(tag);
        },
        sortCommissionV(sort){
            sortCommission(sort);
        },
        isOasisFounder(){
            const brandId = this.getIdentity().brandId;
            return brandId == this.announce.initiator;
        },
        closeAddTaskModalHandlerV(){
            this.commissionForm={
                title: "",
                bonus: "",
                sow: ""
            };
        },
        openAuditTaskModalV(record){
            this.auditingCommission={
                title: record.title,
                bonus: record.bonus,
                sow: record.sow,
                id: record.id
            };

            $("#auditTaskModal").modal("show");
        },
        closeAuditTaskModalHandlerV(){
            $("#auditTaskModal").modal("hide");
        },
        openEditTaskModalV(record){
            this.editingCommission={
                title: record.title,
                bonus: Number(record.bonus).toFixed(0),
                sow: record.sow,
                id: record.id
            };

            $("#editTaskModal").modal("show");
        },
        closeEditTaskModalHandlerV(){
            this.editingCommission={
                title: "",
                bonus: "",
                sow: "",
                id: ""
            };
            $("#editTaskModal").modal("hide");
        },
        changeCommissionV(){
            changeCommission();
        },
        openViewTaskModalV(record){
            this.viewCommission={
                title: record.title,
                bonus: record.bonus,
                sow: record.sow,
                id: record.id
            };

            $("#acceptTaskModal").modal("show");
        },
        closeAcceptTaskModalHandlerV(){
            this.viewCommission={
                title: "",
                bonus: "",
                sow: "",
                id: ""
            };
            $("#acceptTaskModal").modal("hide");
        },
        validitateCommissionFormV(){
            if(!!this.commissionForm.title && !!this.commissionForm.bonus && !!this.commissionForm.sow){
                return true;
            }
            return false;
        },
        validitateCommissionEditFormV(){
            if(!!this.editingCommission.title && !!this.editingCommission.bonus && !!this.editingCommission.sow){
                return true;
            }
            return false;
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
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
let app =  createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}

const teamCommission = app.mount('#app');

window.teamCommission = teamCommission;
// init 
teamCommission.pageInit(teamCommission.commissionTb_pagination);
teamCommission.userAdapter(); // auth.js init
teamCommission.loadAnnounceV(); // oasis announce component .js init
teamCommission.loadSubNav() // sub nav component .js init 
teamCommission.loadFastLink() // announce  component .js init 
async function newCommission(dto){
  const url ="/api/v1/team/commission";
  return axios.put(url,dto);
}
async function acceptCommission(dto){
   const url ="/api/v1/team/commission/accept";
   return axios.put(url,dto);
}

async function doExamineTask(dto){
    const url="/api/v1/team/commission/examine";
    return  axios.put(url,dto);
}
async function doDeleteCommission(id){
    const url="/api/v1/team/commission/{id}/del".replace("{id}",id);
    return  axios.delete(url);
}
async function doUpdateCommission(dto){
    const url ="/api/v1/team/commission/change";
    return axios.put(url,dto);
}
function changeCommission(){
    const dto ={
        id: teamCommission.editingCommission.id,
        title: teamCommission.editingCommission.title,
        bonus: teamCommission.editingCommission.bonus,
        sow: teamCommission.editingCommission.sow
    }
    doUpdateCommission(dto).then(response=>{
        if(response.data.code == 200){
            teamCommission.reloadPage(teamCommission.commissionTb_pagination);
            teamCommission.closeEditTaskModalHandlerV();
         }
         if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });

}
function examineTask(commissionId,tag){
    const dto={
        commissionId: commissionId,
        tag: tag
    }
    return doExamineTask(dto);
}
function addCommission(){
    const oasisId = getQueryVariable("oasis_id");
    const dto ={
        oasisId: oasisId,
        title: teamCommission.commissionForm.title,
        bonus: teamCommission.commissionForm.bonus,
        sow: teamCommission.commissionForm.sow
    }
    return newCommission(dto);
}
 
function deleteCommission(id){
    doDeleteCommission(id).then(response=>{
        if(response.data.code == 200){
            teamCommission.reloadPage(teamCommission.commissionTb_pagination);
            teamCommission.closeEditTaskModalHandlerV();
         }
         if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

function receiveCommission(commissionId){
    const oasisId = getQueryVariable("oasis_id");
    const brandId =  teamCommission.getIdentity().brandId; // Auth.getIdentity();
    const dto = {
        oasisId: oasisId,
        commissionId: commissionId,
        brandId: brandId
    }
   return acceptCommission(dto);
}
function filterCommission(filter){
    // init 
    teamCommission.commissionTb_pagination.param.filter = filter;
    teamCommission.commissionTb_pagination.param.worker =  teamCommission.getIdentity().brandId; ;
    teamCommission.commissionTb_pagination.param.tag = "";
    teamCommission.commissionTb_pagination.param.q="";
    teamCommission.commissionTb_pagination.param.sort="1";
    teamCommission.commissionTb_pagination.current=1;
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
}
function retrieveOasisCommissionGrid(){
    teamCommission.commissionTb_pagination.param.filter = "";
    teamCommission.commissionTb_pagination.param.tag = "";
    teamCommission.commissionTb_pagination.param.sort="1";
    teamCommission.commissionTb_pagination.current=1;
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
}
function retrieveOasisCommissionByTag(tag){
    teamCommission.commissionTb_pagination.param.tag = tag;
    teamCommission.commissionTb_pagination.current=1;
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
}
function sortCommission(sort){

    teamCommission.commissionTb_pagination.param.sort=sort;
    teamCommission.commissionTb_pagination.current=1;
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
} 
function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }