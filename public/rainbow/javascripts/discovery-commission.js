import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import axios from 'axios';

import { renderDateToDayInChina,formatTime } from "/common/javascripts/util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const defaultOasisPreviewImage = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const RootComponent = {
    data() {
        return {
            viewTaskObj: {},
            defaultOasisPreviewImage,
            taskgrid_pagination: {
                url: "/api/v1/team/discovery/commission",
                size: 30,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {
                    items: []
                },
                param: {
                q: ''
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.taskgrid_pagination.size = response.commission.size;
                        this.taskgrid_pagination.current = response.commission.current;
                        this.taskgrid_pagination.total = response.commission.total;
                        this.taskgrid_pagination.pages = response.commission.pages;
                        this.taskgrid_pagination.records = response.commission.records;
                        this.taskgrid_pagination.paging = this.doPaging({current: response.commission.current, pages: response.commission.pages, size: 5});
        
                    }
                }
            }
        }
    },
    methods: {
        showAcceptTaskModalV(task){

            this.viewTaskObj = JSON.parse(JSON.stringify(task));
            
            $("#acceptTaskModal").modal("show");
        },
        retrieveCommissionGridV(){
            this.taskgrid_pagination.current=1;
            this.reloadPage(this.taskgrid_pagination);
        },
        formatTimeV(dateStr){
            return formatTime(dateStr);
        },
        renderDateToDayInChinaV(dateStr){
            return renderDateToDayInChina(dateStr);
        },
        receiveCommissionV(commissionId){
            receiveCommission(commissionId).then(response=>{
                if(response.data.code == 200){
                    this.reloadPage(this.taskgrid_pagination);
                    $("#acceptTaskModal").modal("hide");
                    customAlert.alert("接取成功，任务已为您添加到【薪动商号】-【委托任务】"); 


                 }
                 if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
    },
    updated(){
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}

let app =  createApp(RootComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-search') 
}
const disTask = app.mount('#app');

window.disTask = disTask;

// init
disTask.pageInit(disTask.taskgrid_pagination);


async function acceptCommission(dto){
    const url ="/api/v1/team/commission/accept";
    return axios.put(url,dto);
 }

 function receiveCommission(commissionId){
    const dto = {
        commissionId: commissionId
    }
   return acceptCommission(dto);
}