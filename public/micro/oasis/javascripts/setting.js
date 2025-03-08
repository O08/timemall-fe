import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";

import oasisAvatarDefault from "/micro/images/oasis-default-building.jpeg"

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {


      return {
        oasisAvatarDefault,
        oasisId: "",
        announce: {},
        putAnnounce: {}
      }
    },
    methods: {
        autoHeightV(event){
            var elem = event.target;
            elem.style.height = "auto";
            elem.scrollTop = 0; // 防抖动
            
            elem.style.height = elem.scrollHeight + "px";
            if(elem.scrollHeight==0){
                elem.style.height=32 + "px";
            }
            if(elem.scrollHeight>500){
              elem.style.height=500 + "px";
            }
        },
        resetV(){
            this.putAnnounce=JSON.parse(JSON.stringify(this.announce));
        },
        saveSettingV(){
            this.putAnnounce.id=this.oasisId;
            saveSetting(this.putAnnounce).then(response=>{
                if(response.data.code==200){
                    // reload oasis info
                    this.loadAnnounceV();
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            });
        },
        loadAnnounceV(){
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                window.location.href="/micro/teixcalaanli";
                return ;
            }
            OasisApi.loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce || this.announce.initiator!=this.getIdentity().brandId){
                        window.location.href="/micro/teixcalaanli";
                    }
                    this.putAnnounce=JSON.parse(JSON.stringify(this.announce));
                }
            })
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
        },
        settingAlreadyChangeV(){
            return this.announce.title!=this.putAnnounce.title || this.announce.subTitle!=this.putAnnounce.subTitle || this.announce.risk!=this.putAnnounce.risk
            || this.announce.canAddMember!=this.putAnnounce.canAddMember || this.announce.forPrivate!=this.putAnnounce.forPrivate || this.announce.privateCode!=this.putAnnounce.privateCode;
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

        // resize textarea
        var elem = document.getElementById("inputRisk");
        elem.style.height = "auto";
        elem.scrollTop = 0; // 防抖动
        
        elem.style.height = elem.scrollHeight + "px";
        if(elem.scrollHeight==0){
            elem.style.height=32 + "px";
        }
        if(elem.scrollHeight>500){
            elem.style.height=500 + "px";
        }
     

        // document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        
    }
}



let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const setting = app.mount('#app');

window.oasisSettingPage = setting;



function saveSetting(announce){
    if(!announce){
        return
    }

    if(!announce.title){
        customAlert.alert("名称为空，操作失败！");
        return
    }
    if(!announce.subTitle){
        customAlert.alert("简介为空，操作失败！");
        return
    }
    if(!announce.privateCode){
        customAlert.alert("邀请码为空，操作失败！");
        return
    }
    if(!announce.canAddMember){
        customAlert.alert("部落招新选项出错，操作失败！");
        return
    }
    if(!announce.forPrivate){
        customAlert.alert("私密部落选项出错，操作失败！");
        return
    }


    const dto={
        canAddMember: announce.canAddMember,
        forPrivate: announce.forPrivate,
        id: announce.id ,
        privateCode: announce.privateCode,
        risk: announce.risk,
        subTitle: announce.subTitle,
        title: announce.title
    }
   return OasisApi.oasisSetting(dto);
}

function uploadAnnounceFile(){
    const oasisId = getQueryVariable("oasis_id");

    const file = $('#file_announce')[0].files[0];
    OasisApi.putAnnounce(oasisId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            // $('#lastestAnnounceFile').attr('src',url);
    
            $("#announceFileModal").modal("hide");
            $('#announceFilePreview').attr('src',"");
            document.querySelector('#file_announce').value = null;

            setting.announce.announceUrl=url;

        }
    }).catch(error=>{
        customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于1M。异常信息(" + error+ ")");
    })
}

function uploadOasisCover(){
    const oasisId = getQueryVariable("oasis_id");

    const file = $('#file_avator')[0].files[0];
    OasisApi.putAvatar(oasisId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            setting.loadAnnounceV(); //reload oasis info
    
            $("#oasisCoverModal").modal("hide");
            $('#oasisCoverPreview').attr('src',"");
            document.querySelector('#file_avator').value = null;
        }
    }).catch(error=>{
        customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于1M。异常信息(" + error+ ")");
    })
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