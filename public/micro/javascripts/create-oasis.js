import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import {ContentediableComponent} from "/common/javascripts/contenteditable-compoent.js";
import {OasisMark} from "/common/javascripts/tm-constant.js"
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
      return {
        btn_ctl:{
            activate_baseInfo_save: false
        },
        base: {
            title: "",
            subTitle: ""
        },
        risk: "",
        agree_check: false
      }
    },
    methods: {
        clickAvatorUploadBtn(){
            $("#file_avator").trigger("click");
         },
         clickAnnounceUploadBtn(){
            $("#file_announce").trigger("click");
         },
        nextSlideV(){
            $("#slide_next").trigger("click");
        },
        prevSlideV(){
            $("#slide_prev").trigger("click");
        },
        recoverOasisInfoV(){
            var _that=this;
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                return;
            }
            recoverOasisInfo(oasisId).then(response=>{
                if(response.data.code==200){
                    this.base.title = response.data.announce.title;
                    this.base.subTitle = response.data.announce.subTitle;

                    $('#lastestOasisCover').attr('src',_that.adaptiveImageUriV(response.data.announce.avatar));
                    $('#lastestAnnounceFile').attr('src',_that.adaptiveImageUriV(response.data.announce.announceUrl));
                    
                    this.risk = response.data.announce.risk;
                    $('.oasis-risk-box').html(response.data.announce.risk);
                    this.btn_ctl.activate_baseInfo_save= true;

                }
            });
        },
        saveBaseInfoAndtoNextSlideV(){
            saveBaseInfo(this.base);
        },
        saveOasisRiskInfoV(){
            saveOasisRiskInfo(this.risk).then(response=>{
                if(response.data.code==200){
                    this.nextSlideV();
                }
            });
        },
        publishOasisV(){
            const oasisId = getQueryVariable("oasis_id");
            const option= getQueryVariable("option");
            if(option==="edit"){
                window.location.href="/micro/oasis?oasis_id="+oasisId;
                return
            }
            markOasisB(oasisId,OasisMark.PUBLISH).then(response=>{
                if(response.data.code==200){
                    window.location.href="/micro/teixcalaanli";
                }
            });
        },
        // file handler
        previewOasisCoverV(e){
            previewOasisCover(e);
        },
        closeOasisCoverModalHandlerV(){
            closeOasisCoverModalHandler();
        },
        uploadOasisCoverV(){
            uploadOasisCover();
        },
        previewAnnounceFileV(e){
            previewAnnounceFile(e);
        },
        closeAnnounceFileModalHandlerV(){
            closeAnnounceFileModalHandler();
        },
        uploadAnnounceFileV(){
            uploadAnnounceFile();
        }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
app.component('contenteditable', ContentediableComponent)

const createOasisPage = app.mount('#app');

window.createOasisPage = createOasisPage;
// init
createOasisPage.userAdapter(); // auth.js

createOasisPage.recoverOasisInfoV();

async function createOasis(dto){
    const url="/api/v1/team/oasis/new";
    return await axios.post(url,dto);
}
async function putOasisBase(dto){
    const url="/api/v1/team/oasis/general";
    return await axios.put(url,dto);
}

async function putAvatar(oasisId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/team/oasis/{oasis_id}/avatar".replace("{oasis_id}",oasisId);
    return await axios.put(url, fd);
}
async function putAnnounce(oasisId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/team/oasis/{oasis_id}/announce".replace("{oasis_id}",oasisId);
    return await axios.put(url, fd);
}
async function putOasisRisk(dto){
    const url = "/api/v1/team/risk";
    return await axios.put(url,dto)  
}
async function markOasis(form){
    const url= "/api/v1/team/oasis/mark";
    return await axios.put(url,form);
}

async function getAnnounce(oasisId){
    const url = "/api/v1/team/oasis/announce/{oasis_id}".replace("{oasis_id}",oasisId);
    return await axios.get(url);
}

function recoverOasisInfo(oasisId){
  
    return getAnnounce(oasisId);
}
function markOasisB(oasisId,mark){

    var form = new FormData();
    form.append("oasisId",oasisId);
    form.append("mark",mark);
    return markOasis(form);

}
function uploadAnnounceFile(){
    const oasisId = getQueryVariable("oasis_id");

    const file = $('#file_announce')[0].files[0];
    putAnnounce(oasisId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            $('#lastestAnnounceFile').attr('src',url);
    
            $("#announceFileModal").modal("hide");
            $('#announceFilePreview').attr('src',"");
            document.querySelector('#file_announce').value = null;
        }
    }).catch(error=>{
        customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于1M。异常信息(" + error+ ")");
    })
}

function uploadOasisCover(){
    const oasisId = getQueryVariable("oasis_id");

    const file = $('#file_avator')[0].files[0];
    putAvatar(oasisId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            $('#lastestOasisCover').attr('src',url);
    
            $("#oasisCoverModal").modal("hide");
            $('#oasisCoverPreview').attr('src',"");
            document.querySelector('#file_avator').value = null;
        }
    }).catch(error=>{
        customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于1M。异常信息(" + error+ ")");
    })
}
function modifyBaseInfo(base,oasisId){
    var dto = {
        title: base.title,
        subTitle: base.subTitle,
        oasisId: oasisId
    }
    return putOasisBase(dto);
}
function saveBaseInfo(base){
    // valiate 
    var checkPass = !!createOasisPage.base.title && !!base.subTitle;
    if(!checkPass){
        return;
    }
   // todo update oasis when in editing
   const id = getQueryVariable("oasis_id");
   if(!id){
     createOasis(base).then(response=>{
        if(response.data.code == 200){
            addOasisIdToUrl(response.data.oasisId);
            createOasisPage.nextSlideV();
        }
        if(response.data.code==2010){
            customAlert.alert("基地名字已被使用");
        }
    });
   }
   if(id){
    modifyBaseInfo(base,id).then(response=>{
        if(response.data.code == 200){
            createOasisPage.nextSlideV();
        }
        if(response.data.code==2010){
            customAlert.alert("基地名字已被使用");
        }
    });
   }

}
function saveOasisRiskInfo(risk){
    const oasisId = getQueryVariable("oasis_id");
    var dto  = {
        risk: risk,
        oasisId: oasisId
    }
    
    return putOasisRisk(dto);
}
function addOasisIdToUrl(oasisId){
    const id = getQueryVariable("oasis_id");
    if(!id){
        let url = "/micro/create-oasis?oasis_id="+ oasisId
        history.pushState(null, "", url);
    }
}
// file handler
function previewOasisCover(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    document.querySelector('#oasisCoverPreview').src = URL2;
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
        if(!(imgFile.width>=99 && imgFile.height>=99  && imgFile.width<4096 && imgFile.height<4096 )){
            console.log("current image: width=" + imgFile.width + "  height="+imgFile.height);
            customAlert.alert("图片必须至少为 99 x 99 像素且单边长度不能超过4096像素!");
            return false;
        }
        $("#oasisCoverModal").modal("show");

     };
     imgFile.src = URL.createObjectURL(file);

}
function closeOasisCoverModalHandler(){
    document.querySelector('#oasisCoverPreview').src = "";
    var previewEl=document.querySelector('#oasisCoverPreview');
    if(!!previewEl.src){
        previewEl.src="";
    }
   document.querySelector('#file_avator').value = null;
}
function previewAnnounceFile(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    document.querySelector('#announceFilePreview').src = URL2;
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
         if(!(imgFile.width>=576 && imgFile.height>=576  && imgFile.width<4096 && imgFile.height<4096)){
             console.log("current image: width=" + imgFile.width + "  height="+imgFile.height);
             customAlert.alert("图片必须至少为 576 x 576 像素且单边长度不能超过4096像素!");
             return false;
         }
         $("#announceFileModal").modal("show");
      };
      imgFile.src = URL.createObjectURL(file);

}
function closeAnnounceFileModalHandler(){
    document.querySelector('#announceFilePreview').src = "";
    var previewEl=document.querySelector('#announceFilePreview');
    if(!!previewEl.src){
        previewEl.src="";
    }
   document.querySelector('#file_announce').value = null;
}
