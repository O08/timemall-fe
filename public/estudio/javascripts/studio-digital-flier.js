import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

import Pagination  from "/common/javascripts/pagination-vue.js";

import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";




import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const FlierStatusEnum = Object.freeze({
  "NORMAL": "normal",
  "FREEZE": "freeze"
});

const RootComponent = {
    data() {
        return {
          newFlierObj: {
            description: ""
          },
          editFlierObj: {
            description: ""
          },
          editFlierObjHistory: {
            description: ""
          },
          flierList_pagination: {
            url: "/api/v1/web_estudio/brand/flier/query",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            paging: {},
            param: {
              q: ''
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.flierList_pagination.size = response.flier.size;
                    this.flierList_pagination.current = response.flier.current;
                    this.flierList_pagination.total = response.flier.total;
                    this.flierList_pagination.pages = response.flier.pages;
                    this.flierList_pagination.records = response.flier.records;
                    this.flierList_pagination.paging = this.doPaging({current: response.flier.current, pages: response.flier.pages, size: 5});
    
                }
            }
          },
       }
    },
    methods: {

      validateNewFlierModalV() {
          const form = this.newFlierObj;
      
          if (!form.title  ||  !form.material || !form.description) {
              return false;
          }

          if(form.ctaLink &&  !isValidHttpUrlNeedScheme(form.ctaLink)){
              return false;
          }

          return true;
      },

      validateEditFlierModalV() {
        const form = this.editFlierObj;
        const historyForm=this.editFlierObjHistory;
    
        if (!form.title  || !form.description) {
          return false;
        }

        if(form.ctaLink &&  !isValidHttpUrlNeedScheme(form.ctaLink)){
            return false;
        }

        if(form.status==FlierStatusEnum.FREEZE){
          return false;
        }


        const dataChanged=(form.title!=historyForm.title || form.ctaLink!=historyForm.ctaLink 
           || form.description!=historyForm.description
          );

        return dataChanged;
      },

      copyValueToClipboardV(flierId){
            const copyContent=currentDomain+"/flier/"+flierId;
            copyValueToClipboard(copyContent);
      },

      previewEditFlierMaterialV(e){
        previewEditFlierMaterial(e,this);
      },
      previewNewFlierMaterialV(e){
        previewNewFlierMaterial(e,this);
      },

      newFlierV(){
        newFlier(this.newFlierObj).then(response => {
       
            if (response.data.code == 200) {
                this.reloadFlierListV();
                $("#publishModal").modal("hide");
            }

            if (response.data.code != 200) {
                const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                customAlert.alert(error);
            }
        }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },

      editFlierV(){
        editFlier(this.editFlierObj).then(response => {
       
            if (response.data.code == 200) {
                this.reloadFlierListV();
                $("#editModal").modal("hide");
            }

            if (response.data.code != 200) {
                const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                customAlert.alert(error);
            }
        }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      reloadFlierListV(){
        this.reloadPage(this.flierList_pagination);
      },

      showNewFlierModalV(){
        const coverInput = document.getElementById('coverInput');
         if (coverInput) {
           coverInput.value = '';
         }
         this.newFlierObj={
            title: "",
            description: "",
            ctaLink: "",
            material: "",
            thumbnailUrl: ""
         }
         $("#publishModal").modal("show");
       },

       deleteOneFlierV(flierId){
            deleteOneFlier(flierId).then(response=>{
                if(response.data.code == 200){
                 this.reloadFlierListV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
        
            });
       },
       showEditFlierModalV(flier){
          this.editFlierObj=JSON.parse(JSON.stringify(flier));
          this.editFlierObj.thumbnailUrl=this.adaptiveImageUriV(flier.contentLink); // from ImageAdaptiveComponent
          this.editFlierObjHistory=JSON.parse(JSON.stringify(this.editFlierObj));

          const coverInput = document.getElementById('editCoverInput');
          if (coverInput) {
            coverInput.value = '';
          }
            
          $("#eventDetailModal").modal("hide");

          $("#editModal").modal("show");
       },

       closeEditFlierModalWhenNoChangeNeedV(){
        $("#editModal").modal("hide");
       },

        retrieveFlierDataV(){
            this.flierList_pagination.param.tag="";
            this.flierList_pagination.current = 1;
            this.flierList_pagination.size = 10;
            this.reloadPage(this.flierList_pagination);
        },
        explainStatusV(status){
            if(status=='normal') return '分发中';
            if(status=='freeze') return '违规封禁';
            return '未知';

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
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content') || tag.startsWith('top-search')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                flierAdminPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

const flierAdminPage = app.mount('#app');
window.cFlierAdminPage = flierAdminPage;
flierAdminPage.pageInit(flierAdminPage.flierList_pagination);



async function doEditFlier(dto){
    const url="/api/v1/web_estudio/brand/flier/edit";
    return await axios.put(url,dto);
}

async function doChangeFlierMaterial(flierId,material){
    const url="/api/v1/web_estudio/brand/flier/material/change";
    var form = new FormData();
    form.append("flierId",flierId);
    form.append("material",material);
    return await axios.put(url,form);
}

async function doDeleteFlier(flierId){
    const url="/api/v1/web_estudio/flier/{id}/remove".replace("{id}",flierId);
    return await axios.delete(url);
}

async function doNewOneFlier(formData){
    const url="/api/v1/web_estudio/brand/flier/new";
    return await axios.post(url,formData);
}

async function newFlier(flier){
    var form = new FormData();
    form.append("title",flier.title);
    form.append("description",flier.description);
    form.append("ctaLink",flier.ctaLink);
    form.append("material",flier.material);
 
    return await doNewOneFlier(form);
}

async function deleteOneFlier(flierId){
  return await doDeleteFlier(flierId);
}  
  async function changeFlierMaterial(flierId,material){
    return await doChangeFlierMaterial(flierId,material);
  }

async function editFlier(flier){
    const dto={
        title: flier.title,
        description: flier.description,
        ctaLink: flier.ctaLink,
        flierId: flier.flierId
    }
    return await doEditFlier(dto);
}
$(function(){
	$(".tooltip-nav").tooltip();
});





function previewNewFlierMaterial(e, appObj) {

    const file = e.target.files[0];
    if (!file) {
      return;
    }
  
    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
      customAlert.alert("图片最大为6M!");
      document.querySelector('#coverInput').value = ''; // reset file input
      return false;
    }
  
    const feedThumbnailImgFile = new Image();
    feedThumbnailImgFile.onload = () => {
  
      // validate image pixel
      if (!(feedThumbnailImgFile.width >= 99 && feedThumbnailImgFile.height >= 99 && feedThumbnailImgFile.width < 4096 && feedThumbnailImgFile.height < 4096 && feedThumbnailImgFile.width * feedThumbnailImgFile.height < 9437184)) {
        customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
        document.querySelector('#coverInput').value = ''; // reset file input
        return false;
      }
  
      appObj.newFlierObj.material = file;
  
      appObj.newFlierObj.thumbnailUrl = URL2;
  
  
    };
  
    feedThumbnailImgFile.src = URL.createObjectURL(file);
  
}

function previewEditFlierMaterial(e,appObj){

    const file = e.target.files[0];
    if (!file) {
      return;
    }
  
  
    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
      customAlert.alert("图片最大为6M!");
      document.querySelector('#editCoverInput').value = ''; // reset file input
      return false;
    }
  
    const feedThumbnailImgFile = new Image();
    feedThumbnailImgFile.onload = () => {
  
      // validate image pixel
      if (!(feedThumbnailImgFile.width >= 99 && feedThumbnailImgFile.height >= 99 && feedThumbnailImgFile.width < 4096 && feedThumbnailImgFile.height < 4096 && feedThumbnailImgFile.width * feedThumbnailImgFile.height < 9437184)) {
        customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
        document.querySelector('#editCoverInput').value = ''; // reset file input
        return false;
      }
  
  
      changeFlierMaterial(appObj.editFlierObj.flierId,file).then(response=>{
        if(response.data.code == 200){
             
          appObj.editFlierObj.thumbnailUrl = URL2;
          appObj.reloadFlierListV();

        }
   
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
  
      });
  
  
  
  
    };
  
    feedThumbnailImgFile.src = URL.createObjectURL(file);
  }