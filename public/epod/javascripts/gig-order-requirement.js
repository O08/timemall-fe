import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import { DirectiveComponent,autoHeight } from "/common/javascripts/custom-directives.js";
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';
import  MillstoneChatCompoent from "/estudio/javascripts/compoent/MillstoneChatCompoent.js";
import RtmCompoent from "/common/javascripts/blv-rtm.js";
import {EventFeedScene,MillstoneAc} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";
import {getDaysBetween}from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
const currentWorkflowId = getQueryVariable("workflow_id");
const RootComponent = {
    data() {
      
        return {
            a: "",
            init_finish: false,
            bizId: currentWorkflowId,
            btn_ctl:{
                activate_general_save_btn: false
            },
            ruleCheckResults: [],
            editWorkflow: {},
            workflow: {
                millstones: [],
                serviceInfo: {}
            }
        }
    },
    methods: {
        showEditTaskModalV(){
            this.editWorkflow=JSON.parse(JSON.stringify(this.workflow));
            $("#editTaskModal").modal("show");
            this.btn_ctl.activate_general_save_btn = false;
        },
        closeEditTaskModalV(){
            $("#editTaskModal").modal("hide");
        },
         newMillstoneV(){
           const m = this.emptyMillstone();
           this.editWorkflow.millstones.unshift(m);
         },
         removeMillstoneV(mIndex){
            this.editWorkflow.millstones.splice(mIndex,1);
            this.btn_ctl.activate_general_save_btn = true;
         },
         newObjToFirstV(mIndex){
            this.editWorkflow.millstones[mIndex].objective.unshift({});
         },
         newObjAfterV(mIndex,objIndex){
            this.editWorkflow.millstones[mIndex].objective.splice(objIndex + 1,0,{});
         },
         removeObjV(mIndex,objIndex){
            this.editWorkflow.millstones[mIndex].objective.splice(objIndex,1);
            this.btn_ctl.activate_general_save_btn = true;
         },
         newMetricToFirstV(mIndex){
            this.editWorkflow.millstones[mIndex].metric.unshift({});
         },
         newMetricAfterV(mIndex,metricIndex){
            this.editWorkflow.millstones[mIndex].metric.splice(metricIndex + 1,0,{});
         },
         removeMetric(mIndex,metricIndex){
            this.editWorkflow.millstones[mIndex].metric.splice(metricIndex,1);
            this.btn_ctl.activate_general_save_btn = true;
         },
         replaceWorkflowV(){
            replaceWorkflow();
         },
         emptyMillstone(){
            return {
                objective: [{}],
                metric: [{}]
            }
         },
         loadWorkflowInfoV(){
            loadWorkflowInfo();
        },
        transformInputNumberV(event){
            return transformInputNumberAsPositive(event);
        },
        userInputDatePickerHandlerV(e){    

            if(!e.target.dataset.olddate){
                e.target.dataset.olddate="2022-02-21";
            }
            e.target.value =  e.target.dataset.olddate;
            $("#" + e.target.id).datepicker("setDate", e.target.dataset.olddate);
            if(!!e.data){
                e.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }

        },
        authorizeEditV(){
           modifyMillstoneAc(MillstoneAc.OPEN).then(response=>{
            if(response.data.code==200){
                this.workflow.ac=MillstoneAc.OPEN;
                customAlert.alert("已授权服务商「编辑服务内容」 权限！");
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
           });
        },
        reclaimEditV(){
            modifyMillstoneAc(MillstoneAc.CLOSED).then(response=>{
                if(response.data.code==200){
                    this.workflow.ac=MillstoneAc.CLOSED;
                    customAlert.alert("已回收服务商「编辑服务内容」 权限！");
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
               });
        }
    },
    updated(){

        if(document.getElementById("event-tab").ariaSelected=='true'){
            document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
          }

          // init auto height for textarea
          [...$("textarea")].forEach(el=>{ 
            if(el.id === 'twemoji-picker'){ // exclude emoji picker 
                console.log("emoji picker");
            }else{
                autoHeight(el);
            }
        })
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

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

    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(DirectiveComponent);

app.mixin(MillstoneChatCompoent);
app.mixin(RtmCompoent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content') || tag.startsWith('json-node')
}

app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                millstoneEditPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const millstoneEditPage = app.mount('#app');
window.pMillstoneEdit= millstoneEditPage;


// init 
millstoneEditPage.loadWorkflowInfoV();
millstoneEditPage.joinRoomInitV(); // rtm.js
async function saveWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    return axios.put(url,{workflow: millstoneEditPage.editWorkflow});
}
async function getSingleWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    return await axios.get(url);
}
async function doMillstoneAuth(dto){
    const url = "/api/v1/web_epod/millstone/permission";
    return axios.put(url,dto);
}
async function modifyMillstoneAc(ac){

     const dto={
        id: currentWorkflowId,
        ac: ac
     }
     return doMillstoneAuth(dto);

}

function loadWorkflowInfo(){
    getSingleWorkflow(currentWorkflowId).then(response=>{
        if(response.data.code==200){
            millstoneEditPage.workflow = response.data.workflow;
            if(!millstoneEditPage.workflow.millstones){
                millstoneEditPage.workflow.millstones=[];
            }
            ruleCheck(response.data.workflow);
        }
        millstoneEditPage.init_finish=true;
    }).catch(error=>{
        millstoneEditPage.init_finish=true;
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

function replaceWorkflow(){
    // validate data
    if(!currentWorkflowId || millstoneEditPage.editWorkflow.millstones.length==0){
        return;
    }
    if(millstoneEditPage.editWorkflow.millstones.length>=100){
        customAlert.alert("任务超限，最多支持99个任务，请检查.");
        return;
    }
    if(millstoneEditPage.editWorkflow.millstones.filter(e => {
        // 检查 objective：数组为空，或者内部存在任何一个空对象
        const objectiveInvalid = !e.objective || e.objective.length === 0 || e.objective.some(item => $.isEmptyObject(item?.entry));
        
        // 检查 metric：数组为空，或者内部存在任何一个空对象
        const metricInvalid = !e.metric || e.metric.length === 0 || e.metric.some(item => $.isEmptyObject(item?.entry));
        
        return objectiveInvalid || metricInvalid;
    }).length > 0){
        customAlert.alert("有任务未填写完整，请检查.");
        return;
    }


    
    
    if(millstoneEditPage.editWorkflow.millstones.filter(e=>!e.title).length>0){
        customAlert.alert("存在任务标题未填写，请检查.");
        return;
    }
    if(millstoneEditPage.editWorkflow.millstones.filter(e=>!e.payRate).length>0){
        customAlert.alert("有任务结算比率未填写，请检查.");
        return;
    }
    if(millstoneEditPage.editWorkflow.millstones.filter(e=>!e.start).length>0){
        customAlert.alert("有任务开始时间未填写，请检查.");
        return;
    }
    if(millstoneEditPage.editWorkflow.millstones.filter(e=>!e.end).length>0){
        customAlert.alert("有任务结束时间未填写，请检查.");
        return;
    }
    if(millstoneEditPage.editWorkflow.millstones.filter(e=>new Date(e.start) > new Date(e.end)).length>0){
        customAlert.alert("有任务【开始日期】大于【结束日期】，请检查.");
        return;
    }
    const totalPayRate= millstoneEditPage.editWorkflow.millstones.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue.payRate),
        0,
    );
    if(totalPayRate>100){
        customAlert.alert( "所有任务【结算比率】求和大于100 ，请检查.");
        return;
    }

    saveWorkflow(currentWorkflowId).then(response=>{
        if(response.data.code==200){
            millstoneEditPage.workflow=JSON.parse(JSON.stringify(millstoneEditPage.editWorkflow))
            ruleCheck(millstoneEditPage.workflow);
            millstoneEditPage.btn_ctl.activate_general_save_btn = false;
            millstoneEditPage.closeEditTaskModalV();
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、权限、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    });
}


function ruleCheck(workflow){

    if(!workflow.millstones || workflow.millstones.length==0){
      return;
    }
  
    const inOneDayRule= workflow.millstones.filter(e=>getDaysBetween(new Date(e.start), new Date())==0 ).length>0;
  
    const payRateSumRule = workflow.millstones.reduce(
          (accumulator, currentValue) => accumulator + Number(currentValue.payRate),
          0,
    );
    const arr = workflow.millstones;
  
    const maxEndDate=  Math.max(...Array.from(arr, arr => new Date(arr.end).getTime() ));
  
    const minStartDate=  Math.min(...Array.from(arr, arr => new Date(arr.start).getTime() ));
  
    const workCyclRule=getDaysBetween(new Date(minStartDate),new Date(maxEndDate));
  
    const entryDateRule=new Date(minStartDate).toISOString().split('T')[0];
  
    const FirstPayRateRule=workflow.millstones[workflow.millstones.length - 1].payRate;
   
    // reset  ruleCheckResults
    millstoneEditPage.ruleCheckResults=[];
    if(inOneDayRule){
      millstoneEditPage.ruleCheckResults.push({ label: "识别到紧急任务", desc:"存在任务施工周期小于一天。"});
    }
    millstoneEditPage.ruleCheckResults.push({ label: "结算比例核查", desc: "结算比例求和为" + payRateSumRule + "%"});
    millstoneEditPage.ruleCheckResults.push({ label: "任务排期指引", desc:"完成全部任务预估时间" + workCyclRule + "天"});
    millstoneEditPage.ruleCheckResults.push({ label: "开工日期",desc:"任务入场时间为" + entryDateRule });
    millstoneEditPage.ruleCheckResults.push({ label: "首次结算核查",desc:"第一个任务结算比例为" + FirstPayRateRule + "%" });
  
    generateScheduleInfo(minStartDate,maxEndDate);
  
  }
  
  function generateScheduleInfo(minStartDate,maxEndDate){
      const formatDate = (dateStr) => {
          const d = new Date(dateStr);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}.${m}.${day}`;
        };
        
        millstoneEditPage.workflow.serviceInfo.minStartDate = formatDate(minStartDate);
        millstoneEditPage.workflow.serviceInfo.maxEndDate = formatDate(maxEndDate);
        
  
  }

// Enable popovers 
$('[data-bs-toggle="popover"]').popover();



  $(function(){
	$(".tooltip-nav").tooltip();
});

  