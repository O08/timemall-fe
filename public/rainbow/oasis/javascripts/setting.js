import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";

import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const fontSizeArr = ['14px', '16px', '18px', '20px', '22px'];
const backgroundArr = [
  "#1a1a1a", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff",
  "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff",
  "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff",
  "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2",
  "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"
];

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);


const toolbarOptions = [
    [{ 'size': fontSizeArr }],  // custom dropdown
    [{ 'color': [] }, { 'background': backgroundArr }],          // dropdown with defaults from theme
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    [{ 'align': [] }],
    ['blockquote'],
    ['link'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    ['clean']                                         // remove formatting button
];
var quill = ""; // init in mounted

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
                window.location.href="/rainbow/teixcalaanli";
                return ;
            }
            OasisApi.loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce || this.announce.initiator!=this.getIdentity().brandId){
                        window.location.href="/rainbow/teixcalaanli";
                    }
                    this.putAnnounce=JSON.parse(JSON.stringify(this.announce));
                    quill.root.innerHTML = '';
                    quill.clipboard.dangerouslyPasteHTML(0, response.data.announce.risk);  
                    this.announce.risk=quill.getSemanticHTML();
                    this.putAnnounce.risk=quill.getSemanticHTML();

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
        this.oasisId =  getQueryVariable("oasis_id");
    },
    mounted(){
        quill=new Quill('#editor', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
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

const setting = app.mount('#app');

window.oasisSettingPage = setting;
setting.loadAnnounceV();




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
    if(quill.getSemanticHTML().length>25000){
        customAlert.alert("公告内容长度超出容量，需重新调整！")
        return;
    }
    announce.risk=quill.getSemanticHTML();


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
        if(!(imgFile.width>=99 && imgFile.height>=99  && imgFile.width<4096 && imgFile.height<4096 && imgFile.width*imgFile.height<9437184 )){
            console.log("current image: width=" + imgFile.width + "  height="+imgFile.height);
            customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
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
         if(!(imgFile.width>=576 && imgFile.height>=576  && imgFile.width<4096 && imgFile.height<4096 && imgFile.width*imgFile.height<9437184)){
             console.log("current image: width=" + imgFile.width + "  height="+imgFile.height);
             customAlert.alert("图片必须至少为 576 x 576 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
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

quill.on('text-change', () => {
    setting.putAnnounce.risk=quill.getSemanticHTML();
});