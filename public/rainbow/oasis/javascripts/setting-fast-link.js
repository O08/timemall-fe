import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

import axios from "axios";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";

let customAlert = new CustomAlertModal();

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const RootComponent = {
    data() {
      return {
        tempLogoFile: "",
        oasisAvatarDefault,
        oasisId: "",
        announce: {},
        links: [],
        editLink:{
 
        },
        focusModal:{
            message: "",
            confirmHandler:()=>{
  
            }
        },
      }
    },
    methods: {
        previewLinkLogoV(e){
            previewLinkLogo(e,this);
        },
        newFastLinkV(){
         
            newFastLink(this);
        },
        fetchFastLinkV(){
            const id  =  getQueryVariable("oasis_id");
            OasisApi.fetchFastLinks(id).then(response=>{
                if(response.data.code==200){
                   
                 this.links = response.data.link;
    
                }
                if(response.data.code!=200){
                   const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                   customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
             });
        },
        showAddFastLinkModalV(){

           resetNewFastLinkModel();
            $("#addFastLinkModal").modal("show"); 

        },
        showDeleteFocusModalV(linkId){
            this.focusModal.message="注意，链接删除后不可恢复！";
            this.focusModal.confirmHandler=()=>{
                delOneFastLink(linkId).then(response=>{

                    if(response.data.code==200){
                        this.fetchFastLinkV();
                        $("#focusModal").modal("hide"); // hide modal
        
                    }
                    if(response.data.code!=200){
                       const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                       customAlert.alert(error); 
                    }

                }).catch(error=>{
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
                 });
            }
            $("#focusModal").modal("show"); // show modal
          },
        loadAnnounceV(){
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                window.location.href="/rainbow/teixcalaanli";
                return ;
            }
            OasisApi.loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce || this.announce.initiator!=this.getIdentity().brandId){
                        window.location.href="/rainbow/teixcalaanli";
                    }
                }
            })
        },
        formatDateV(datestr) {
            var date = new Date(datestr);
            var year = date.getFullYear();
        
        
            var month = date.getMonth() + 1;
        
        
            var day = date.getDate();
        
        
            return `${year}年${month}月${day}日`;
        
      
        }
        
    },
    created(){
        this.loadAnnounceV();
        this.oasisId =  getQueryVariable("oasis_id");
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

     

        
    }
}



let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingFastLink = app.mount('#app');

window.settingFastLinkPage = settingFastLink;

// init
settingFastLink.fetchFastLinkV();

async function doDeleteFastLink(id){
    const url = "/api/v1/oasis/fast_link/{id}/del".replace("{id}",id);
    return await axios.delete(url);
}
async function doAddOneFastLink(dto,logoFile){
    var form = new FormData();
    form.append("linkUrl",dto.linkUrl);
    form.append("title",dto.title);
    form.append("linkDetail",dto.linkDetail);
    form.append("logo",logoFile);
    form.append("oasisId",dto.oasisId);
    const url = "/api/v1/oasis/fast_link/new";

    return await   axios.post(url, form);
}
async function delOneFastLink(id){
    return await doDeleteFastLink(id);
}
async function newFastLink(appObj){

    if(!appObj.tempLogoFile){
        customAlert.alert("需要提供链接图标!");
        return;
    }
    if(!appObj.editLink.linkUrl){
        customAlert.alert("需要输入链接地址！")
        return;
    }
    if(!appObj.editLink.linkDetail){
        customAlert.alert("需要输入链接简介！")
        return;
    }
    if(!appObj.editLink.title){
        customAlert.alert("需要输入链接名称！")
        return;
    }
    if( !isValidHttpUrlNeedScheme(appObj.editLink.linkUrl)){
        customAlert.alert("链接地址无效，需要调整！")
        return;
    }


    doAddOneFastLink(appObj.editLink, appObj.tempLogoFile).then(response=>{
        if(response.data.code==200){
            settingFastLink.fetchFastLinkV();

            resetNewFastLinkModel();

            $("#addFastLinkModal").modal("hide"); // hide modal
        }
        if(response.data.code!=200){
           const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
           customAlert.alert(error); 
        }
    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
     });


}

function resetNewFastLinkModel(){

    settingFastLink.editLink={
            linkUrl: "",
            title: "",
            linkLogoFileUrl: "",
            linkDetail: "",
            oasisId: getQueryVariable("oasis_id")
    };
    document.getElementById("file_logo").value=null;
    settingFastLink.tempLogoFile = "";
  
  }

function previewLinkLogo(e,appObj){

    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.tempLogoFile = file;

    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
  
    const linkLogoImgFile = new Image();
      linkLogoImgFile.onload = ()=> {
  
          // validate image pixel
          if(!(linkLogoImgFile.width>=99 && linkLogoImgFile.height>=99 && linkLogoImgFile.width<4096 && linkLogoImgFile.height<4096 && linkLogoImgFile.width*linkLogoImgFile.height<9437184)){
              console.log("current image: width=" + linkLogoImgFile.width + "  height="+linkLogoImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
   
  
          appObj.editLink.linkLogoFileUrl = URL2;
  
  
      };
  
     linkLogoImgFile.src = URL.createObjectURL(file);
  
  }


