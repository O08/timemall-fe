import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();


const RootComponent = {
    data() {
      return {
        btn_ctl: {
          newTopicModalAlreadyChange: false,
          already_choose_icon_file: false,
          edit_topic_modal_change: false,
          edit_app_modal_change: false
        },
        apps: [],
        q: "",
        newAppObj:{
          title: "",
          preface: "",
          iconFile: "",
          linkUrl: "",
          topicId: ""
        },
        editAppObj:{
          title: "",
          preface: ""
        },
        newTopicObj:{
          title: "",
          preface: ""
        },
        editTopicObj:{
          title: "",
          preface: ""
        },
        general: {
            channelName: "",
            channelDesc: "",
            och: ""
        },
        focusModal:{
            message: "",
            confirmHandler:()=>{
  
            }
        },
      }
    },
    methods: {
      validateNewAppFormV(){
        return !!this.newAppObj.title && !!this.newAppObj.preface && !!this.newAppObj.linkUrl && isValidHttpUrlNeedScheme(this.newAppObj.linkUrl) && this.btn_ctl.already_choose_icon_file  
      },
      validateEditAppFormV(){
        return !!this.editAppObj.title && !!this.editAppObj.preface && !!this.editAppObj.linkUrl && isValidHttpUrlNeedScheme(this.editAppObj.linkUrl) && this.btn_ctl.edit_app_modal_change; 
      },
      validateNewTopicFormV(){
        return !!this.newTopicObj.title;
      },
      validateEditTopicFormV(){
        return !!this.editTopicObj.title  && this.btn_ctl.edit_topic_modal_change;
      },
      previewElementIconFileV(e){
        previewElementIconFile(e);
     },
     searchAppsV(){
      const och=getQueryVariable("och");
      fetchApps(this.q,och);
     },
      fetchAppsV(){

        const och=getQueryVariable("och");
        fetchApps(this.q,och);

      },
      fetchChannelGeneralInfoV(){
        const och=getQueryVariable("och");
        fetchChannelGeneralInfo(och).then(response=>{
            if(response.data.code == 200){
                this.general= !response.data.channel ? {} : response.data.channel;
                this.general.och = och;
                document.title = this.general.channelName + " | 频道规划";

            }
        });
      },
      showEditTopicModalV(topic){
        const targetTopic=JSON.parse(JSON.stringify(topic));
        this.editTopicObj={
          title: targetTopic.topicTitle ,
          preface: targetTopic.topicPreface,
          topicId: targetTopic.topicId
        }
        this.btn_ctl.edit_topic_modal_change=false;
        $("#editTopicModal").modal("show"); // show modal

      },
      closeEditTopicModalV(){
        $("#editTopicModal").modal("hide"); // show modal
      },
      editTopicV(){
        changeTopicInfo(this);
      },
      showNewTopicModalV(){
        resetNewTopicModal();
        $("#newTopicModal").modal("show"); // show modal

      },
      closeNewTopicModalV(){
        $("#newTopicModal").modal("hide"); // show modal
      },
      newTopicV(){
        newTopic(this);
      },

      reorderTopicV(topicId,direction){
        reorderTopic(topicId,direction);
      },

      showNewAppModalV(topicId){
        resetNewAppModal();
        this.newAppObj.topicId = topicId;
        $("#newAppModal").modal("show"); // show modal

      },
      closeNewAppModalV(){
        resetNewAppModal();

        $("#newAppModal").modal("hide"); // show modal
      },
      newAppV(){
        newElement(this);
      },
      delAppV(elementId){
        removeFromTopic(elementId);
      },
      showEditAppModalV(element){
        this.editAppObj = JSON.parse(JSON.stringify(element))
        this.btn_ctl.edit_app_modal_change=false;
        $("#editAppModal").modal("show"); // show modal
      },
      closeEditAppModalV(){
        $("#editAppModal").modal("hide"); // show modal
      },
      editAppV(){
        changeElement(this);
      },

      showDeleteFocusModalV(topicId){
          this.focusModal.message="注意，主题区删除后不可恢复！";
          this.focusModal.confirmHandler=()=>{
            trashTopic(topicId)
          }
          $("#focusModal").modal("show"); // show modal
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
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const designApps = app.mount('#app');

window.designAppsPage = designApps;

//init
designApps.fetchChannelGeneralInfoV();
designApps.fetchAppsV();

async function doFetchChannelGeneralInfo(och){
  const url= "/api/public/team/oasis/channel/{oasis_channel_id}/general".replace("{oasis_channel_id}",och);
  return await axios.get(url);
}
async function doFetchApps(q,och){
  const url = "/api/v1/app/desk/yourapps?q="+q+"&chn="+och;
  return await axios.get(url);
}

async function doAddOneTopic(dto){
  const url = "/api/v1/app/desk/topic/new";
  return await axios.post(url,dto);
}

async function doEditTopic(dto){
  const url = "/api/v1/app/desk/topic/edit";
  return await axios.put(url,dto);
}
async function doReorderTopic(dto){
  const url = "/api/v1/app/desk/topic/reorder";
  return await axios.put(url,dto);
}

async function delOneTopic(topicId){
  const url = "/api/v1/app/desk/topic/{id}/del".replace("{id}",topicId);
  return await axios.delete(url);
}

async function addOneElement(dto){
  var form = new FormData();
  form.append("title",dto.title);
  form.append("preface",dto.preface);
  form.append("linkUrl",dto.linkUrl);
  form.append("iconFile",dto.iconFile);
  form.append("topicId",dto.topicId);

  const url = "/api/v1/app/desk/element/new";

  return await   axios.post(url, form);
}
async function delOneElement(id){
  const url = "/api/v1/app/desk/element/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function doEditElement(dto){
  const url = "/api/v1/app/desk/element/edit";
  return await axios.put(url,dto);
}

async function changeElement(appObj){
  doEditElement(appObj.editAppObj).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
      designApps.closeEditAppModalV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function removeFromTopic(elementId){
  delOneElement(elementId).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function newElement(appObj){
  const iconFile = $('#file_icon')[0].files[0];
   const dto={
     title: appObj.newAppObj.title,
     preface: appObj.newAppObj.preface,
     linkUrl: appObj.newAppObj.linkUrl,
     iconFile: iconFile,
     topicId: appObj.newAppObj.topicId
   }
   addOneElement(dto).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
      designApps.closeNewAppModalV();

    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
   });
}


async function trashTopic(topicId){
  delOneTopic(topicId).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
      $("#focusModal").modal("hide"); // hide modal
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function reorderTopic(topicId,direction){
  const dto = {
    topicId: topicId,
    direction: direction
  }
  doReorderTopic(dto).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function changeTopicInfo(appObj){
  const dto={
    title: appObj.editTopicObj.title,
    preface: appObj.editTopicObj.preface,
    topicId: appObj.editTopicObj.topicId
  }
  doEditTopic(dto).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
      designApps.closeEditTopicModalV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function newTopic(appObj){
  const dto={
    title: appObj.newTopicObj.title,
    preface: appObj.newTopicObj.preface,
    chn: appObj.general.och
  }
  doAddOneTopic(dto).then(response=>{
    if(response.data.code==200){
      designApps.fetchAppsV();
      designApps.closeNewTopicModalV();
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function fetchApps(q,och){
  if(!och){
    return;
  }
  doFetchApps(q,och).then(response=>{
    if(response.data.code==200){
      designApps.apps=response.data.apps;
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
async function fetchChannelGeneralInfo(och){
  return await doFetchChannelGeneralInfo(och);
}


function resetNewTopicModal(){
  designApps.newTopicObj = {
    title: "",
    preface: ""
  }
  designApps.btn_ctl.newTopicModalAlreadyChange= false;
}


// file handler
function previewElementIconFile(e){
  const file = e.target.files[0]

  const URL2 = URL.createObjectURL(file)
   // validate image size <=6M
   var size = parseFloat(file.size);
   var maxSizeMB = 6; //Size in MB.
   var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
   if (size > maxSize) {
       customAlert.alert("图片最大为6M!");
       return false;
   }
   const imgFile = new Image();
   imgFile.onload = ()=> {
      if(!(imgFile.width>=99 && imgFile.height>=99  && imgFile.width<4096 && imgFile.height<4096 && imgFile.width*imgFile.height<9437184 )){
          console.log("current image: width=" + imgFile.width + "  height="+imgFile.height);
          designApps.btn_ctl.already_choose_icon_file=false;
          document.querySelector('#element_icon_preview').src = "";
          document.querySelector('#file_icon').value = null;
          customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");

          return false;
      }
      document.querySelector('#element_icon_preview').src = URL2;
      designApps.btn_ctl.already_choose_icon_file=true;

   };
   imgFile.src = URL.createObjectURL(file);

}

function resetNewAppModal(){
  document.querySelector('#element_icon_preview').src = "";
  document.querySelector('#file_icon').value = null;
  designApps.newAppObj={
    title: "",
    preface: "",
    iconFile: "",
    linkUrl: "",
    topicId: ""
  }
  designApps.btn_ctl.already_choose_icon_file=false;
}