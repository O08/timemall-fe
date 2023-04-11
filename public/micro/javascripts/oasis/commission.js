import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CommissionTag} from "/common/javascripts/tm-constant.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


const RootComponent = {
    data() {
        return {
            commissionForm: {
              title: "",
              bonus: "",
            },
            commissionTb_pagination: {
                url: "/api/v1/team/commission",
                size: 12,
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
                    info.param.oasisId = this.oasisId;
                 },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.commissionTb_pagination.size = response.commission.size;
                        this.commissionTb_pagination.current = response.commission.current;
                        this.commissionTb_pagination.total = response.commission.total;
                        this.commissionTb_pagination.pages = response.commission.pages;
                        this.commissionTb_pagination.records = response.commission.records;
                        // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        addCommissionV(){
            addCommission().then(response=>{
                if(response.data.code == 200){
                   this.reloadPage(this.commissionTb_pagination);
                   $("#addTaskModal").modal("hide");
                }
            })
        },
        receiveCommissionV(commissionId){
            receiveCommission(commissionId).then(response=>{
                if(response.data.code == 200){
                    this.reloadPage(this.commissionTb_pagination);
                 }
            })
        },
        summitCommissionV(commissionId){
            summitCommission(commissionId).then(response=>{
                if(response.data.code == 200){
                    this.reloadPage(this.commissionTb_pagination);
                 }
            })
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
        getTagDescV(tag){
            var desc="";
            switch(tag){
                case "1":
                    desc="新建"
                    break;
                case "2":
                    desc="处理中"
                    break;
                case "3":
                    desc="已拒绝"
                    break;
                case "4":
                    desc="已交付"
                    break;
            }
            return desc;
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
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);
app.mixin(DirectiveComponent);


const teamCommission = app.mount('#app');

window.teamCommission = teamCommission;
// init 
teamCommission.pageInit(teamCommission.commissionTb_pagination);

async function newCommission(dto){
  const url ="/api/v1/team/commission";
  return axios.put(url,dto);
}
async function acceptCommission(dto){
   const url ="/api/v1/team/commission/accept";
   return axios.put(url,dto);
}
async function finishCommission(dto){
    const url ="/api/v1/team/commission/finish";
    return axios.put(url,dto);
}

function addCommission(){
    const oasisId = getQueryVariable("oasis_id");
    const dto ={
        oasisId: oasisId,
        title: teamCommission.commissionForm.title,
        bonus: teamCommission.commissionForm.bonus
    }
    return newCommission(dto);
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
function summitCommission(commissionId){
    const oasisId = getQueryVariable("oasis_id");
    const brandId =  teamCommission.getIdentity().brandId; // Auth.getIdentity();
    const dto = {
        oasisId: oasisId,
        commissionId: commissionId,
        brandId: brandId
    }
    return finishCommission(dto);
}
function filterCommission(filter){
    // init 
    teamCommission.commissionTb_pagination.param.filter = filter;
    teamCommission.commissionTb_pagination.param.worker =  teamCommission.getIdentity().brandId; ;
    teamCommission.commissionTb_pagination.param.tag = "";
    teamCommission.commissionTb_pagination.param.q="";
    teamCommission.commissionTb_pagination.param.sort="";
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
}
function retrieveOasisCommissionGrid(){
    teamCommission.commissionTb_pagination.param.filter = "";
    teamCommission.commissionTb_pagination.param.tag = "";
    teamCommission.commissionTb_pagination.param.sort="";
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
}
function retrieveOasisCommissionByTag(tag){
    teamCommission.commissionTb_pagination.param.filter = "";
    teamCommission.commissionTb_pagination.param.tag = tag;
    teamCommission.commissionTb_pagination.param.q="";
    teamCommission.commissionTb_pagination.param.sort="";
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
}
function sortCommission(sort){
    teamCommission.commissionTb_pagination.param.filter = "";
    teamCommission.commissionTb_pagination.param.tag = "";
    teamCommission.commissionTb_pagination.param.q="";
    teamCommission.commissionTb_pagination.param.sort=sort;
    teamCommission.reloadPage(teamCommission.commissionTb_pagination);
} 