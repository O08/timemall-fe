import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import {ContentediableComponent} from "/common/javascripts/contenteditable-compoent.js";
import {OasisMark} from "/common/javascripts/tm-constant.js"
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 


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
                window.location.href="/micro/oasis.html?oasis_id="+oasisId;
                return
            }
            markOasisB(oasisId,OasisMark.PUBLISH).then(response=>{
                if(response.data.code==200){
                    window.location.href="/micro/teixcalaanli.html";
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
app.mixin(new Auth({need_permission : true}));
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

    const file = $('#announceFile')[0].files[0];
    putAnnounce(oasisId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            $('#lastestAnnounceFile').attr('src',url);
    
            $("#announceFileModal").modal("hide");
            $('#announceFilePreview').attr('src',"");
        }
    }).catch(error=>{
        alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于1M。异常信息(" + error+ ")");
    })
}

function uploadOasisCover(){
    const oasisId = getQueryVariable("oasis_id");

    const file = $('#oasisCoverFile')[0].files[0];
    putAvatar(oasisId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            $('#lastestOasisCover').attr('src',url);
    
            $("#oasisCoverModal").modal("hide");
            $('#oasisCoverPreview').attr('src',"");
        }
    }).catch(error=>{
        alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于1M。异常信息(" + error+ ")");
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
    });
   }
   if(id){
    modifyBaseInfo(base,id).then(response=>{
        if(response.data.code == 200){
            createOasisPage.nextSlideV();
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
        let url = "/micro/create-oasis.html?oasis_id="+ oasisId
        history.pushState(null, "", url);
    }
}
// file handler
function previewOasisCover(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    document.querySelector('#oasisCoverPreview').src = URL2
    $("#oasisCoverModal").modal("show");
}
function closeOasisCoverModalHandler(){
    document.querySelector('#oasisCoverPreview').src = "";
    document.querySelector('#oasisCoverFile').value = null;
}
function previewAnnounceFile(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    document.querySelector('#announceFilePreview').src = URL2
    $("#announceFileModal").modal("show");
}
function closeAnnounceFileModalHandler(){
    document.querySelector('#announceFilePreview').src = "";
    document.querySelector('#announceFile').value = null;
}
