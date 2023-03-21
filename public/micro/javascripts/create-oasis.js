import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import {ContentediableComponent} from "/common/javascripts/contenteditable-compoent.js";


const RootComponent = {
    data() {
      return {
        base: {
            title: "",
            subTitle: ""
        },
        risk: {
            riskEntries: [],
            oasisId: ""
        }
      }
    },
    methods: {
        nextSlideV(){
            $("#slide_next").trigger("click");
        },
        prevSlideV(){
            $("#slide_prev").trigger("click");
        },
        saveBaseInfoAndtoNextSlideV(){
            saveBaseInfo(this.base);
        },
        saveOasisRiskInfoV(){
            saveOasisRiskInfo(this.risk);
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
        // text edit pannel
        pannelAddTextToFisrt(){
            addTextToFirst();
        },
        pannelAddText(index){
            nextText(index);
        },
        pannelRemoveText(){
            removeText();
        }
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);
app.component('contenteditable', ContentediableComponent)

const createOasisPage = app.mount('#app');

window.createOasisPage = createOasisPage;

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
   // todo update oasis when in editing
   const id = getQueryVariable("oasis_id");
   if(!id){
    return createOasis(base).then(response=>{
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
    var dto  = risk;
    dto.oasisId = getQueryVariable("oasis_id");
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
// edit pannel
function nextText(index){
    createOasisPage.risk.riskEntries.splice(index,0,{entry: ""});
}
function removeText(index){
    createOasisPage.risk.riskEntries.splice(index,1);
}
function addTextToFirst(){
    createOasisPage.risk.riskEntries.unshift({entry: ""});
}