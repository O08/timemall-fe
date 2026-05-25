import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import Pagination  from "/common/javascripts/pagination-vue.js";

import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { formatTime } from "/common/javascripts/util.js";

import { transformInputNumberAsPositive } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const RootComponent = {
    data() {
        return {
            contact: {},
            uploadingNdaSupplierObj: {
              uploadingNdaSupplierRecordId: "",
              supplierName: "",
              isUploading: false,
              fileName: ""
            },
            btn_ctl: {
              editSupplierObjChange: false,
            },

            editSupplierObj: {},
            candidateParamQuery: "",
            candidateSuppliers: [],
            supplierList_pagination: {
                url: "/api/v1/web_estudio/brand/supplier/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {
                  q: '',
                  status: ""
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.supplierList_pagination.size = response.supplier.size;
                        this.supplierList_pagination.current = response.supplier.current;
                        this.supplierList_pagination.total = response.supplier.total;
                        this.supplierList_pagination.pages = response.supplier.pages;
                        this.supplierList_pagination.records = response.supplier.records;
                        this.supplierList_pagination.paging = this.doPaging({current: response.supplier.current, pages: response.supplier.pages, size: 5});
        
                    }
                }
            },
        }
    },
    methods: {
      initLoadSupplierListV(){
        this.supplierList_pagination.param.q = "";
        this.supplierList_pagination.param.status = "";
        this.supplierList_pagination.current = 1;
        this.supplierList_pagination.size = 10;
        this.reloadPage(this.supplierList_pagination);
      },
      retrieveSupplierListV(){
        this.supplierList_pagination.param.status = "";
        this.supplierList_pagination.current = 1;
        this.supplierList_pagination.size = 10;
        this.reloadPage(this.supplierList_pagination);
      },
      filterSupplierListByStatusV(){
        this.supplierList_pagination.current = 1;
        this.supplierList_pagination.size = 10;
        this.reloadPage(this.supplierList_pagination);
      },
      formateDateV(date){
        return formatTime(date)
      },
      showInviteModalV(){
        this.candidateParamQuery=""; // reset
        queryCandidateSupplier(this.candidateParamQuery).then(response => {

          if (response.data.code == 200) {
              this.candidateSuppliers=response.data.suppliers;
              $("#inviteModal").modal("show"); // show modal
          }
          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }

        }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      retrieveCandidateSupplierListV(){
        queryCandidateSupplier(this.candidateParamQuery).then(response => {

          if (response.data.code == 200) {
              this.candidateSuppliers=response.data.suppliers;
          }
          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }

        }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      addBrandAsSupplierV(brand) {
        brand.added = "1";
        addBrandAsSupplier(brand.brandId).then(response => {

          if(response.data.code==200){ 
            this.initLoadSupplierListV();
          }

          if (response.data.code != 200) {
            brand.added = "0";
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
          }

        }).catch(error => {
          brand.added = "0";
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      showContactModalV(brandId){
        findBrandContactInfo(brandId);
      },
      showEditSupplierModalV(supplier){
        this.editSupplierObj=JSON.parse(JSON.stringify(supplier));
        this.btn_ctl.editSupplierObjChange=false;
        $("#editSupplierModal").modal("show"); // show modal
      },
      showUploadSupplierModalV(supplier){
        this.uploadingNdaSupplierObj.uploadingNdaSupplierRecordId=supplier.id;
        this.uploadingNdaSupplierObj.supplierName=supplier.supplierName;
        this.uploadingNdaSupplierObj.isUploading=false;
        this.uploadingNdaSupplierObj.fileName="";
        $("#uploadNdaModal").modal("show"); // show modal
      },
      editSupplierV(){
        editSupplier(this.editSupplierObj).then(response => {

          if (response.data.code == 200) {
            this.reloadPage(this.supplierList_pagination);
            $("#editSupplierModal").modal("hide"); // show modal
          }

          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }

        }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      handleNdaFileChangeV(e){
        handleNdaFileChange(this.uploadingNdaSupplierObj.uploadingNdaSupplierRecordId,e);
      },
      removeOneSupplierV(id){
        removeOneSupplier(id).then(response => {

          if (response.data.code == 200) {
            this.reloadPage(this.supplierList_pagination);
          }

          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }

        }).catch(error => {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      transformInputNumberAsPositiveV(e){
        return transformInputNumberAsPositive(e);
      },
      ndaFileDownloadUriV(supplier){
       return supplier.ndaFileUri+"&download=true&downloadName=nda_"+ encodeURIComponent(supplier.supplierName);
      },

        

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
                supplierPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(CodeExplainComponent);

const supplierPage = app.mount('#app');
window.cProposalPage = supplierPage;

supplierPage.pageInit(supplierPage.supplierList_pagination);

async function doFetchCandidateSupplier(q){
  const url="/api/v1/web_estudio/candidate_supplier/query?q="+q;
  return await axios.get(url);
}

async function doAddNewSupplier(supplierBrandId){
  const url="/api/v1/web_estudio/brand/{id}/add_as_supplier".replace("{id}",supplierBrandId);
  return await axios.post(url)
}

async function getBrandContact(brandId)
{
    const url = "/api/v1/web_epod/brand/{brand_id}/contact".replace("{brand_id}",brandId);
    return await axios.get(url);
    
}

async function doEditSupplier(dto){
    const url ="/api/v1/web_estudio/supplier/edit";
    return await axios.put(url,dto);
}

async function uploadNdaFile(id,files){
  var fd = new FormData();
  fd.append('material', files);
  fd.append('id',id)
  const url = "/api/v1/web_estudio/supplier/nda/replace";
  return await axios.put(url, fd);
}

async function doRemoveSupplier(id){
  const url="/api/v1/web_estudio/supplier/{id}/remove".replace("{id}",id);
  return await axios.delete(url);
}

async function removeOneSupplier(id){
  return await doRemoveSupplier(id);
}


async function handleNdaFileChange(id,event){
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  
  // 文件大小限制 (20MB)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('文件大小不能超过 20MB！');
    event.target.value = ''; // 清空
    return;
  }

  supplierPage.uploadingNdaSupplierObj.fileName=file.name;
  supplierPage.uploadingNdaSupplierObj.isUploading=true;

  uploadNdaFile(id,file).then(response => {
    if (response.data.code == 200) {
      supplierPage.reloadPage(supplierPage.supplierList_pagination);
      $("#uploadNdaModal").modal("hide"); 
    }
    if (response.data.code != 200) {
      const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
      customAlert.alert(error);
    }
  }).catch(error => {
    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  }).finally(() => {

    supplierPage.uploadingNdaSupplierObj.isUploading=false;
    event.target.value = ''; // 清空

  });

}
async function editSupplier(supplier){
  return await doEditSupplier(supplier);
}

function findBrandContactInfo(brandId) {
  getBrandContact(brandId).then(response => {
    if (response.data.code == 200) {
      supplierPage.contact = response.data.contact;
      $("#contactModal").modal("show"); // show modal
    }
    if (response.data.code != 200) {
      const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
      customAlert.alert(error);
    }
  }).catch(error => {
    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
  });
}

async function addBrandAsSupplier(supplierBrandId){
  return await doAddNewSupplier(supplierBrandId);
}
async function queryCandidateSupplier(q){
  if(!q)  return await Promise.resolve({data: {code: "200", suppliers: [], message: "success"}});
  return await doFetchCandidateSupplier(q);
}

$(function(){
	$(".tooltip-nav").tooltip();
});
