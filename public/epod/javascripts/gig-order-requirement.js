import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import { DirectiveComponent,autoHeight } from "/common/javascripts/custom-directives.js";
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';
import  MillstoneChatCompoent from "/estudio/javascripts/compoent/MillstoneChatCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {EventFeedScene,MillstoneAc} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
const RootComponent = {
    data() {
      
        return {
            a: "",
            btn_ctl:{
                activate_general_save_btn: false
            },
            workflow: {
                millstones: [],
                serviceInfo: {}
            }
        }
    },
    methods: {
         newMillstoneV(){
           const m = this.emptyMillstone();
           this.workflow.millstones.unshift(m)
         },
         removeMillstoneV(mIndex){
            this.workflow.millstones.splice(mIndex,1);
         },
         newObjToFirstV(mIndex){
            this.workflow.millstones[mIndex].objective.unshift({});
         },
         newObjAfterV(mIndex,objIndex){
            this.workflow.millstones[mIndex].objective.splice(objIndex + 1,0,{});
         },
         removeObjV(mIndex,objIndex){
            this.workflow.millstones[mIndex].objective.splice(objIndex,1);
         },
         newMetricToFirstV(mIndex){
            this.workflow.millstones[mIndex].metric.unshift({});
         },
         newMetricAfterV(mIndex,metricIndex){
            this.workflow.millstones[mIndex].metric.splice(metricIndex + 1,0,{});
         },
         removeMetric(mIndex,metricIndex){
            this.workflow.millstones[mIndex].metric.splice(metricIndex,1);
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
    return axios.put(url,{workflow: millstoneEditPage.workflow});
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

     const id = getQueryVariable("workflow_id"); 
     const dto={
        id,
        ac
     }
     return doMillstoneAuth(dto);

}

function loadWorkflowInfo(){
    const workflowId = getQueryVariable("workflow_id"); 
    getSingleWorkflow(workflowId).then(response=>{
        if(response.data.code==200){
            millstoneEditPage.workflow = response.data.workflow;
            if(!millstoneEditPage.workflow.millstones){
                millstoneEditPage.workflow.millstones=[];
            }
        }
    });
}

function replaceWorkflow(){
    // validate data
    const id= getQueryVariable("workflow_id");// workflow id
    if(!id || millstoneEditPage.workflow.millstones.length==0){
        return;
    }
    if(millstoneEditPage.workflow.millstones.filter(e=> (  $.isEmptyObject(e.objective[0])  || $.isEmptyObject(e.metric[0]) )).length>0){
        customAlert.alert("有任务未填写完整，请检查.");
        return;
    }
    if(millstoneEditPage.workflow.millstones.filter(e=>!e.title).length>0){
        customAlert.alert("存在任务标题未填写，请检查.");
        return;
    }
    if(millstoneEditPage.workflow.millstones.filter(e=>!e.payRate).length>0){
        customAlert.alert("有任务结算比率未填写，请检查.");
        return;
    }
    if(millstoneEditPage.workflow.millstones.filter(e=>!e.start).length>0){
        customAlert.alert("有任务开始时间未填写，请检查.");
        return;
    }
    if(millstoneEditPage.workflow.millstones.filter(e=>!e.end).length>0){
        customAlert.alert("有任务结束时间未填写，请检查.");
        return;
    }
    if(millstoneEditPage.workflow.millstones.filter(e=>new Date(e.start) > new Date(e.end)).length>0){
        customAlert.alert("有任务【开始日期】大于【结束日期】，请检查.");
        return;
    }
    const totalPayRate= millstoneEditPage.workflow.millstones.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue.payRate),
        0,
    );
    if(totalPayRate>100){
        customAlert.alert( "所有任务【结算比率】求和大于100 ，请检查.");
        return;
    }

    saveWorkflow(id).then(response=>{
        if(response.data.code==200){
            millstoneEditPage.btn_ctl.activate_general_save_btn = false;
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、权限、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    });
}

// Enable popovers 
$('[data-bs-toggle="popover"]').popover();



  $(function(){
	$(".tooltip-nav").tooltip();
});

  