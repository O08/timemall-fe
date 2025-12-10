import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from "axios";
import Auth from "/estudio/javascripts/auth.js"
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import oasisAvatarDefault from "/rainbow/images/oasis-default-building.jpeg";
import { transformInputNumberAsPositiveDecimal,transformInputNumberAsPositive } from "/common/javascripts/util.js";
import {ProductStatus} from "/common/javascripts/tm-constant.js";


import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';


import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            btn_ctl: {
                material_uploading: false
            },
            init_finish: false,
            oasisAvatarDefault,
            oasisId: "",
            announce: {},
            tiers: [],

            roleOptions: [],
            roleSelectedItem: "",
            queryRoleQ: "",

            newTier: {},
            editTier: {},
            editTierTemp:{},
            configRoleChannelModalObj:{
                q: "",
                channels: [],
                roleId: ""
            }
        }
    },
    methods: {

        validateEditTierFormCanSaveV(){
            if( !this.editTier.tierId || !this.editTier.tierName || !this.editTier.price || !this.roleSelectedItem || !this.editTier.tierDescription
                || Number(this.editTier.price)==0){
                 return false
            }
            if( this.editTier.tierName!=this.editTierTemp.tierName || this.editTier.price!=this.editTierTemp.price
                 || this.editTier.tierDescription!=this.editTierTemp.tierDescription
                || this.roleSelectedItem != this.editTierTemp.subscribeRoleId
                ){
                 return true
             }
 
            return false;
        },
        validateNewTierFormV(){
            if(!!this.newTier.oasisId && !!this.newTier.tierName && !!this.newTier.price && !!this.roleSelectedItem && !!this.newTier.tierDescription
                && !!this.newTier.tierThumbnailFileUrl && Number(this.newTier.price)>0){
                    return true;
            }
            return false;
        },
        fetchOasisRolesV() {
            fetchOasisRoles(this.oasisId,this.queryRoleQ);
        },

        previewNewTierThumbnailV(e){
            previewNewTierThumbnail(e,this);
        },
        previewEditTierThumbnailV(e){
            previewEditTierThumbnail(e,this);
        },
        showNewTierModalV(){
            this.newTier= this.initNewTierModalV();
            $("#newTierModal").modal("show");
        },
        closeNewTierModalV(){
            $("#newTierModal").modal("hide");
        },
        fetchOasisMembershipTiersV() {
            fetchOasisMembershipTiers(this.oasisId);
        },
        createTierV(){
            createTier(this).then(response=>{
                if(response.data.code == 200){
                    
                    this.fetchOasisMembershipTiersV();
                    this.closeNewTierModalV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        showEditTierModalV(tier){
            const tmp=JSON.parse(JSON.stringify(tier));
            this.editTier={
                tierId: tmp.tierId,
                tierName: tmp.tierName,
                price: tmp.price,
                tierDescription: tmp.tierDescription,
                tierThumbnailFileUrl: tmp.thumbnail,
                tierThumbnailFile: ""
            }
            this.roleSelectedItem=tmp.subscribeRoleId;
            var fileInputEl=document.getElementById("edit_file_thumbnail");
            if(!!fileInputEl){
                fileInputEl.value=null;
            }
            this.editTierTemp=tmp;

            $("#editTierModal").modal("show");
        },
        closeEditTierModalV(){
            $("#editTierModal").modal("hide");
        },
        changeTierV(){
            editTier(this).then(response=>{
                if(response.data.code == 200){
                    
                    this.fetchOasisMembershipTiersV();
                    this.closeEditTierModalV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        deleteTierV(tierId){
            deleteTier(tierId).then(response=>{
                if(response.data.code == 200){
                    this.fetchOasisMembershipTiersV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        onlineTierV(tierId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForTier(tierId,ProductStatus.Online).then(response=>{
                if(response.data.code == 200){
                    this.fetchOasisMembershipTiersV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        offlineTierV(tierId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForTier(tierId,ProductStatus.Offline).then(response=>{
                if(response.data.code == 200){
                    this.fetchOasisMembershipTiersV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },

        changeTierSortV(tierId,direction){
            changeTierSort(tierId,direction).then(response=>{
             if(response.data.code==200){
                this.fetchOasisMembershipTiersV();
             }
             if(response.data.code!=200){
               const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
               customAlert.alert(error); 
             }
           })
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

        transformInputNumberAsPositiveDecimalV(e){
           return transformInputNumberAsPositiveDecimal(e);
        },
        transformInputNumberAsPositiveV(e){
           return transformInputNumberAsPositive(e);
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


        },
        initNewTierModalV(){

            var fileInputEl=document.getElementById("file_thumbnail");
            if(!!fileInputEl){
                fileInputEl.value=null;
            }
            this.roleSelectedItem="";


           return {
            oasisId: this.oasisId,
            tierName: "",
            tierDescription: "",
            price: "",
            tierThumbnailFile: "",
            tierThumbnailFileUrl: "",
          }
        },

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
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.component("model-select",ModelSelect);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingMembership = app.mount('#app');

window.settingMembershipPage = settingMembership;

// init
settingMembership.userAdapter(); // auth.js
settingMembership.fetchOasisMembershipTiersV();
settingMembership.fetchOasisRolesV();

async function doFetchOasisMembershipTier(oasisId) {
    const url = "/api/v1/team/membership/tier/query?oasisId=" + oasisId;
    return await axios.get(url);
}
async function doFetchRoleChannel(oasisId,roleId,q){
    const url = "/api/v1/team/oasis/role/channel/query?oasisId="+oasisId+"&roleId="+roleId+"&q="+q;
    return await axios.get(url);
}
async function doConfigPermission(dto){
    const url = "/api/v1/team/oasis/role/channel/config";
    return await axios.post(url,dto);
}

async function modifyTierStatus(tierId,status){
    var url = "/api/v1/team/membership/tier/change_status";
    const dto = {
      tierId,
      status
    }
    return await axios.put(url,dto);
} 
async function doChangeTierSort(tierId,direction){
    const dto={
        tierId: tierId,
        direction: direction
    }
    const url="/api/v1/team/membership/tier/sort";
    return await axios.put(url,dto)
}
async function doFetchOasisRoles(oasisId, q) {
    const url = "/api/v1/team/oasis/role?q=" + q + "&oasisId=" + oasisId;
    return await axios.get(url);
}

async function doCreateTier(appObj){
    var form=new FormData();
    form.append("oasisId",appObj.newTier.oasisId);
    form.append("tierName",appObj.newTier.tierName);
    form.append("tierDescription",appObj.newTier.tierDescription);
    form.append("price",appObj.newTier.price);
    form.append("subscribeRoleId",appObj.roleSelectedItem);
    form.append("thumbnail",appObj.newTier.tierThumbnailFile);

    var url="/api/v1/team/membership/tier/create";
    return await axios.post(url,form);
}

async function doEditTier(appObj){
    var form=new FormData();
    form.append("tierId",appObj.editTier.tierId);
    form.append("tierName",appObj.editTier.tierName);
    form.append("tierDescription",appObj.editTier.tierDescription);
    form.append("price",appObj.editTier.price);
    form.append("subscribeRoleId",appObj.roleSelectedItem);

    var url="/api/v1/team/membership/tier/edit/core";
    return await axios.put(url,form);
}
async function removeTier(tierId){
    const url="/api/v1/team/membership/tier/{id}/del".replace("{id}",tierId);
    return await axios.delete(url);
}
async function doChangeTierThumbnail(tierId,thumbnail){
    var fd = new FormData();
    fd.append('tierId', tierId);
    fd.append('thumbnail', thumbnail);
    const url = "/api/v1/team/membership/tier/edit/thumbnail";
    return await axios.put(url, fd);
}
async function changeTierThumbnail(){
    const thumbnailFile = document.getElementById("edit_file_thumbnail").files[0];
    const tierId=settingMembership.editTier.tierId;
    return await doChangeTierThumbnail(tierId,thumbnailFile);
}
async function deleteTier(tierId){
    return await removeTier(tierId);
}
async function editTier(appObj){

   return await doEditTier(appObj);
}

async function createTier(appObj){
 
  return await  doCreateTier(appObj);
}

async function fetchOasisRoles(oasisId, q) {

    doFetchOasisRoles(oasisId, q).then(response => {
        if (response.data.code == 200) {

            var roleArr=[{value:"",text:"请选择身份组"}];
            response.data.role.forEach(element => {
                roleArr.push({value: element.id,text: element.roleName});
            });
            settingMembership.roleOptions=roleArr;

        }
        if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });
}
async function changeTierSort(tierId,direction){
    return await doChangeTierSort(tierId,direction);
}

async function onOrOffSaleForTier(tierId,status){
    return await modifyTierStatus(tierId,status);
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

            settingMembership.configRoleChannelModalObj.channels = response.data.channel;

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

            settingMembership.configRoleChannelModalObj.channels = response.data.channel;
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


async function fetchOasisMembershipTiers(oasisId) {

    doFetchOasisMembershipTier(oasisId).then(response => {
        if (response.data.code == 200) {

            settingMembership.tiers = response.data.tier;
            settingMembership.init_finish=true;

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



function previewNewTierThumbnail(e,appObj){

    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.newTier.tierThumbnailFile = file;

    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
  
    const feedThumbnailImgFile = new Image();
      feedThumbnailImgFile.onload = ()=> {
  
          // validate image pixel
          if(!(feedThumbnailImgFile.width>=99 && feedThumbnailImgFile.height>=99 && feedThumbnailImgFile.width<4096 && feedThumbnailImgFile.height<4096 && feedThumbnailImgFile.height * feedThumbnailImgFile.width <9437184)){
              console.log("current image: width=" + feedThumbnailImgFile.width + "  height="+feedThumbnailImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
   
  
          appObj.newTier.tierThumbnailFileUrl = URL2;
  
  
      };
  
     feedThumbnailImgFile.src = URL.createObjectURL(file);
  
}

function previewEditTierThumbnail(e,appObj){
    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.editTier.tierThumbnailFile = file;

    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
  
    const feedThumbnailImgFile = new Image();
      feedThumbnailImgFile.onload = ()=> {
  
          // validate image pixel
          if(!(feedThumbnailImgFile.width>=99 && feedThumbnailImgFile.height>=99 && feedThumbnailImgFile.width<4096 && feedThumbnailImgFile.height<4096 && feedThumbnailImgFile.height * feedThumbnailImgFile.width <9437184)){
              console.log("current image: width=" + feedThumbnailImgFile.width + "  height="+feedThumbnailImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
   
          appObj.btn_ctl.material_uploading=true; 

                // upload product cover file
        changeTierThumbnail().then(response=>{

            if(response.data.code == 200){

                appObj.editTier.tierThumbnailFileUrl = URL2;
              
                settingMembership.fetchOasisMembershipTiersV();

            }
            if(response.data.code!=200){
              const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(error);
            }
            appObj.btn_ctl.material_uploading=false; 

        })
  
  
  
      };
  
     feedThumbnailImgFile.src = URL.createObjectURL(file);
}
