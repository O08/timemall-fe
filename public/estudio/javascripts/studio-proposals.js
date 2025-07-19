import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {EventFeedScene,EnvWebsite} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import Pagination  from "/common/javascripts/pagination-vue.js";

import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;



const RootComponent = {
    data() {
        return {
            proposalMaintenanceObj:{
                projectStatus: "",
                id: ""
            },
            proposalList_pagination: {
                url: "/api/v1/web_estudio/brand/proposal/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {
                  q: '',
                  tag: ""
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.proposalList_pagination.size = response.proposal.size;
                        this.proposalList_pagination.current = response.proposal.current;
                        this.proposalList_pagination.total = response.proposal.total;
                        this.proposalList_pagination.pages = response.proposal.pages;
                        this.proposalList_pagination.records = response.proposal.records;
                        this.proposalList_pagination.paging = this.doPaging({current: response.proposal.current, pages: response.proposal.pages, size: 5});
        
                    }
                }
            },
        }
    },
    methods: {
        initProposalListV(){
            this.proposalList_pagination.param.q = "";
            this.proposalList_pagination.param.tag = "";
            this.proposalList_pagination.current = 1;
            this.proposalList_pagination.size = 10;
            this.reloadPage(this.proposalList_pagination);

        },
        filterProposalListV(){
            this.proposalList_pagination.current = 1;
            this.proposalList_pagination.size = 10;
            this.reloadPage(this.proposalList_pagination);
        },
        retrieveProposalListV(){
            this.proposalList_pagination.param.tag = "";
            this.proposalList_pagination.current = 1;
            this.proposalList_pagination.size = 10;
            this.reloadPage(this.proposalList_pagination);
        },
        copyProposalLinkV(projectNo){
            var content = currentDomain+"/proposal/"+projectNo;
            copyValueToClipboard(content);
        },
        duplicateProposalV(proposalId){
            duplicateProposal(proposalId);
        },
        delProposalV(proposalId){
            delProposal(proposalId);
        },
        showProposalMaintenanceModalV(proposalId){
            this.proposalMaintenanceObj.id= proposalId;
            this.proposalMaintenanceObj.projectStatus="";
            $("#proposalManagementModal").modal("show"); // show modal
        },
        maintenanceProposalV(){
            maintenanceProposal(this);
        },

    },
    created() {
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
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                proposalPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(CodeExplainComponent);

const proposalPage = app.mount('#app');
window.cProposalPage = proposalPage;

proposalPage.pageInit(proposalPage.proposalList_pagination);


async function doDuplicateProposal(proposalId){
    const url ="/api/v1/web_estudio/brand/proposal/{id}/duplicate".replace("{id}",proposalId);
    return await axios.post(url,{});
}

async function doDelProposal(proposalId){
    const url ="/api/v1/web_estudio/brand/proposal/{id}/del".replace("{id}",proposalId);
    return await axios.delete(url);
}
async function doMaintenanceProposal(dto){
    const url = "/api/v1/web_estudio/brand/proposal/change_project_status";
    return await axios.put(url,dto);
}
async function maintenanceProposal(appObj){
    doMaintenanceProposal(appObj.proposalMaintenanceObj).then(response=>{
        if(response.data.code==200){
          appObj.reloadPage(appObj.proposalList_pagination); // refresh tb
          $("#proposalManagementModal").modal("hide"); // show modal

        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
        }

    }).catch(error=>{
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

async function delProposal(proposalId){
    doDelProposal(proposalId).then(response=>{
        if(response.data.code==200){
            proposalPage.reloadPage(proposalPage.proposalList_pagination);
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

async function duplicateProposal(proposalId){
    doDuplicateProposal(proposalId).then(response=>{
        if(response.data.code==200){
            proposalPage.initProposalListV();
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}


$(function(){
	$(".tooltip-nav").tooltip();
});
