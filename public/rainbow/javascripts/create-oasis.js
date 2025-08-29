import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import {OasisMark} from "/common/javascripts/tm-constant.js"
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();



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
            recoverOasisInfo(oasisId,_that);
        },
        saveBaseInfoAndtoNextSlideV(){
            saveBaseInfo(this.base);
        },
        saveOasisRiskInfoV(){
      
            saveOasisRiskInfo().then(response=>{
                if(response.data.code==200){
                    this.nextSlideV();
                }
            });
        },
        publishOasisV(){
            const oasisId = getQueryVariable("oasis_id");
            const option= getQueryVariable("option");
            if(option==="edit"){
                window.location.href="/rainbow/oasis/home?oasis_id="+oasisId;
                return
            }
            markOasisB(oasisId,OasisMark.PUBLISH).then(response=>{
                if(response.data.code==200){
                    window.location.href="/rainbow/teixcalaanli";
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
    mounted(){
        quill=new Quill('#editor', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });
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

const createOasisPage = app.mount('#app');

window.createOasisPage = createOasisPage;
// init
createOasisPage.userAdapter(); // auth.js

createOasisPage.loadSubNav() // sub nav component .js init 

createOasisPage.recoverOasisInfoV();


async function createOasis(dto){
    const url="/api/v1/team/oasis/new";
    return await axios.post(url,dto);
}
async function putOasisBase(dto){
    const url="/api/v1/team/oasis/general";
    return await axios.put(url,dto);
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

function recoverOasisInfo(oasisId,_that){
  
    getAnnounce(oasisId).then(response=>{
        if(response.data.code==200){
            createOasisPage.base.title = response.data.announce.title;
            createOasisPage.base.subTitle = response.data.announce.subTitle;

            $('#lastestOasisCover').attr('src',_that.adaptiveImageUriV(response.data.announce.avatar));
            $('#lastestAnnounceFile').attr('src',_that.adaptiveImageUriV(response.data.announce.announceUrl));
            
            createOasisPage.risk = response.data.announce.risk;
                // editor
            quill.root.innerHTML = '';
            quill.clipboard.dangerouslyPasteHTML(0, response.data.announce.risk);  

            createOasisPage.btn_ctl.activate_baseInfo_save= true;

        }
    });
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
    OasisApi.putAnnounce(oasisId,file).then(response=>{
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
    OasisApi.putAvatar(oasisId,file).then(response=>{
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
            customAlert.alert("部落名字已被使用");
        }
    });
   }
   if(id){
    modifyBaseInfo(base,id).then(response=>{
        if(response.data.code == 200){
            createOasisPage.nextSlideV();
        }
        if(response.data.code==2010){
            customAlert.alert("部落名字已被使用");
        }
    });
   }

}
function saveOasisRiskInfo(){
    const oasisId = getQueryVariable("oasis_id");
    if(quill.getSemanticHTML().length>25000){
        customAlert.alert("公告内容长度超出容量，需重新调整！")
        return;
    }
    createOasisPage.risk=quill.getSemanticHTML();

    var dto  = {
        risk: quill.getSemanticHTML(),
        oasisId: oasisId
    }
    
    return putOasisRisk(dto);
}
function addOasisIdToUrl(oasisId){
    const id = getQueryVariable("oasis_id");
    if(!id){
        let url = "/rainbow/create-oasis?oasis_id="+ oasisId
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
        if(!(imgFile.width>=99 && imgFile.height>=99  && imgFile.width<4096 && imgFile.height<4096 && imgFile.width*imgFile.height<9437184)){
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
