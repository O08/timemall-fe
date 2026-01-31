import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from "axios";
import Auth from "/estudio/javascripts/auth.js"
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);
const RootComponent = {
    data() {
        return {
            init_finish: false,
            btn_ctl: {
             edit_role_modal_change: false
            },
            oasisAvatarDefault,
            oasisId: "",
            announce: {},
            roles: [],
            newRole: {},
            editRole: {},
            roleChannel: [],
            queryRoleQ: "",
            configRoleChannelModalObj:{
                q: "",
                channels: [],
                roleId: ""
            },
            focusModal:{
                message: "",
                confirmHandler:()=>{
      
                }
            }
        }
    },
    methods: {
        fetchOasisRolesV() {
            fetchOasisRoles(this.oasisId,this.queryRoleQ);
        },

        showAddRoleModalV() {

            this.newRole={
                roleCode: "",
                roleName: "",
                roleDesc: "",
                oasisId: this.oasisId
            };
            $("#addOasisRoleModal").modal("show");

        },
        newOasisRoleV() {
            newOasisRole(this);
        },
        showEditRoleModalV(targetRole) {
            const tmp =JSON.parse(JSON.stringify(targetRole));
            this.btn_ctl.edit_role_modal_change=false;
            this.editRole={
                roleName: tmp.roleName,
                roleDesc: tmp.roleDesc,
                roleId: tmp.id
            }
            $("#editOasisRoleModal").modal("show");

        },
        editOasisRoleV() {
            editOasisRole(this);
        },
        showRoleResourceModalV(roleId) {
            this.configRoleChannelModalObj.q="";
            this.configRoleChannelModalObj.roleId=roleId;
            this.configRoleChannelModalObj.channels=[];
            fetchRoleChannel(this.oasisId,this.configRoleChannelModalObj);

        },
        searchRoleResourceV(){
            searchRoleResource(this.oasisId,this.configRoleChannelModalObj);
        },
        configPermissionV(channel){
            configPermission(this.configRoleChannelModalObj.roleId,channel);
        },
        showDeleteFocusModalV(role) {
            this.focusModal.message = "即将移除身份组： " + role.roleName + " ，身份组删除后不可恢复！";
            this.focusModal.confirmHandler = () => {
                delOneRole(role.id).then(response => {

                    if (response.data.code == 200) {
                        this.fetchOasisRolesV();
                        $("#focusModal").modal("hide"); // hide modal

                    }
                    if (response.data.code != 200) {
                        const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                        customAlert.alert(error);
                    }

                }).catch(error => {
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
                });
            }
            $("#focusModal").modal("show"); // show modal
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
        validateNewRoleFormV(){
            return !!this.newRole.roleCode && !!this.newRole.roleName && !!this.newRole.roleDesc; 
        },
        validateEditRoleFormV(){
            return !!this.editRole.roleName && !!this.editRole.roleDesc && this.btn_ctl.edit_role_modal_change; 
        },
        
        transformInputTextV(e){
            return transformInputText(e);
        },
        formatDateV(datestr) {
            var date = new Date(datestr);
            var year = date.getFullYear();


            var month = date.getMonth() + 1;


            var day = date.getDate();


            return `${year}年${month}月${day}日`;


        }

    },
    created() {
        this.loadAnnounceV();
        this.oasisId = getQueryVariable("oasis_id");
    },
    updated() {

        $(function () {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

    }
}



let app = createApp(RootComponent);
app.mixin(new Auth({ need_permission: true }));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingRole = app.mount('#app');

window.settingRolePage = settingRole;

// init
settingRole.fetchOasisRolesV();



async function doCreateOasisRole(dto){
    const url = "/api/v1/team/oasis/role/new";
    return await axios.post(url,dto);
}
async function doEditOasisRole(dto){
    const url = "/api/v1/team/oasis/role/change";
    return await axios.put(url,dto);
}

async function doFetchRoleChannel(oasisId,roleId,q){
    const url = "/api/v1/team/oasis/role/channel/query?oasisId="+oasisId+"&roleId="+roleId+"&q="+q;
    return await axios.get(url);
}
async function doConfigPermission(dto){
    const url = "/api/v1/team/oasis/role/channel/config";
    return await axios.post(url,dto);
}
async function doDelOneRole(roleId){
    const url = "/api/v1/team/oasis/role/{id}/del".replace("{id}",roleId);
    return await axios.delete(url);
}
async function delOneRole(roleId){
   return doDelOneRole(roleId);
}
async function configPermission(roleId, channel){
    const dto={
        roleId: roleId,
        oasisChannelId: channel.channelId,
        assigned: channel.assigned
    }
    doConfigPermission(dto).then(response=>{
        if(response.data.code!=200){
          channel.assigned=toggleAssigned(role.assigned);

          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
        }
    }).catch(error => {
        channel.assigned=toggleAssigned(role.assigned);
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
function toggleAssigned(assigned){
    if(assigned=='1')
      return '0';
    return '1';
}
async function searchRoleResource(oasisId,configRoleChannelModalObj){
    doFetchRoleChannel(oasisId,configRoleChannelModalObj.roleId,configRoleChannelModalObj.q).then(response => {
        if (response.data.code == 200) {

            settingRole.configRoleChannelModalObj.channels = response.data.channel;

        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    }); 
}
async function fetchRoleChannel(oasisId,configRoleChannelModalObj){
    doFetchRoleChannel(oasisId,configRoleChannelModalObj.roleId,configRoleChannelModalObj.q).then(response => {
        if (response.data.code == 200) {

            settingRole.configRoleChannelModalObj.channels = response.data.channel;
            $("#editOasisRoleResourceModal").modal("show");

        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function editOasisRole(appObj){
    doEditOasisRole(appObj.editRole).then(response=>{
        if(response.data.code==200){

          settingRole.fetchOasisRolesV();
          $("#editOasisRoleModal").modal("hide");

        }
        if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}

async function newOasisRole(appObj){
    doCreateOasisRole(appObj.newRole).then(response=>{
        if(response.data.code==200){

          settingRole.fetchOasisRolesV();
          $("#addOasisRoleModal").modal("hide");

        }
        if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function fetchOasisRoles(oasisId, q) {

    OasisApi.doFetchOasisRoles(oasisId, q).then(response => {
        if (response.data.code == 200) {

            settingRole.roles = response.data.role;
            settingRole.init_finish=true;

        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}

function  transformInputText(e){
    var val = e.target.value.replace(/[^\a-\z\A-\Z0-9\_]/g,'');// type int
    const needUpdate = (val !== e.target.value);
    if(needUpdate){
        e.target.value=val;
        e.currentTarget.dispatchEvent(new Event('input')); // update v-model
    }
}



