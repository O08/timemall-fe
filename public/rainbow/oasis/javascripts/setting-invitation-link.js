import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from "axios";
import Pagination  from "/common/javascripts/pagination-vue.js";


import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';


let customAlert = new CustomAlertModal();

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const currentOasisId= getQueryVariable("oasis_id");
if(!currentOasisId){
    window.location.href="/rainbow/teixcalaanli";
    return ;
}

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;


const RootComponent = {
    data() {
      return {
        newInvitationLinkObj: {
            oasisId: "",
            maxUses: "",
            grantedOasisRoleId: "",
            expireTime: ""
        },
        oasisAvatarDefault,
        oasisId: "",
        announce: {},
        linkList_pagination: {
            url: "/api/v1/oasis/setting/invitation_link/query",
            size: 36,
            current: 1,
            total: 0,
            pages: 0,
            isLoading: false,
            records: [],
            paging: {},
            param: {
                oasisId: currentOasisId,
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.linkList_pagination.size = response.link.size;
                    this.linkList_pagination.current = response.link.current;
                    this.linkList_pagination.total = response.link.total;
                    this.linkList_pagination.pages = response.link.pages;
                    this.linkList_pagination.records = response.link.records;
                    this.linkList_pagination.isLoading = false;
                    this.links.push(...response.link.records);
                }
            }
        },
        links: [],
        roles: []
      }
    },
    methods: {

        delOneInviteLinkV(id,index){
            delOneInviteLink(id).then(response=>{
                if(response.data.code == 200){
                    this.links.splice(index,1);
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
        },

        copyInvitationLinkToClipboardV(invitationCode){
            const copyContent=currentDomain+"/oasis/invite/"+invitationCode;
            copyValueToClipboard(copyContent);
        },

        newInvitationLinkV(){
            newInvitationLink(this.newInvitationLinkObj).then(response => {
                if (response.data.code == 200) {
                    this.links=[];
                    this.linkList_pagination.current=1;
                    this.reloadPage(this.linkList_pagination);

                    $("#createInvitationLinkModal").modal("hide"); 
                
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });
        },
        showCreateInviteLinkModalV(){

           // q is blank, query all role
           let q='';
           OasisApi.doFetchOasisRoles(currentOasisId, q).then(response => {
                if (response.data.code == 200) {
        
                    this.roles = response.data.role?.filter(e=>e.roleCode!='admin');
                    resetCreateInvitationLinkModel();

                    $("#createInvitationLinkModal").modal("show"); 
                
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });

        },
        loadAnnounceV(){
         
            OasisApi.loadAnnounce(currentOasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce || this.announce.initiator!=this.getIdentity().brandId){
                        window.location.href="/rainbow/teixcalaanli";
                    }
                }
            })
        },
        renderExpireTimeV(dateStr){
            const expired= new Date(dateStr)  < new Date();
            return expired ? '已失效' : dateStr.replace(new RegExp('-', 'g'), '/');
        }
        
    },
    created(){
        this.loadAnnounceV();
        this.oasisId =  getQueryVariable("oasis_id");
    }
}



let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);

const settingInvitationLink = app.mount('#app');

window.settingInvitationLinkPage = settingInvitationLink;

// init
settingInvitationLink.pageInit(settingInvitationLink.linkList_pagination);

async function doDeleteOneLink(id){
    const url = "/api/v1/oasis/setting/invitation_link/{id}/del".replace("{id}",id);
    return await axios.delete(url);
}

async function doCreateOneLink(dto){
    const url = "/api/v1/oasis/setting/invitation_link/create";
    return await   axios.post(url, dto);
}
async function delOneInviteLink(id){
    return await doDeleteOneLink(id);
}

async function newInvitationLink(link){

   return await doCreateOneLink(link);

}

function resetCreateInvitationLinkModel(){

    const publicRole=settingInvitationLink.roles?.filter(e=>e.roleCode=='public');

    settingInvitationLink.newInvitationLinkObj={
        oasisId: currentOasisId,
        maxUses: "1",
        grantedOasisRoleId: publicRole?.[0]?.id,
        expireTime: "1h"
    };

  
}


// 使用传统的滚动监听
const container = document.querySelector(".content-container");
container.addEventListener('scroll', ()=>{

    if (settingInvitationLink.linkList_pagination.isLoading) return;
    const alreadyBottom = Math.ceil(container.clientHeight + container.scrollTop + 300) >= container.scrollHeight;

    const hasMore = settingInvitationLink.linkList_pagination.current + 1 <= settingInvitationLink.linkList_pagination.pages;

    if (alreadyBottom && hasMore) {
        settingInvitationLink.linkList_pagination.isLoading = true;
        settingInvitationLink.linkList_pagination.current++;
        settingInvitationLink.reloadPage(settingInvitationLink.linkList_pagination);
    }
});



