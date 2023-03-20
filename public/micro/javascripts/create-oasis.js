import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";

const RootComponent = {
    data() {
      return {
        base: {
            title: "",
            subTitle: ""
        }
      }
    },
    methods: {
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);

const createOasis = app.mount('#app');

window.createOasis = createOasis;

async function createOasis(dto){
    const url="/api/v1/team/oasis/new";
    return await axios.post(url,dto);
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

    const file = $('#file_avatar')[0].files[0];
    putAnnounce(brandId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            $('#lastest_banner').attr('src',url);
    
            $("#bannerModal").modal("hide");
            $('#bannerPreview').attr('src',"");
        }
    })
}

function uploadAvatarFile(){
    const oasisId = getQueryVariable("oasis_id");

    const file = $('#file_avatar')[0].files[0];
    putAvatar(brandId,file).then(response=>{
        if(response.data.code ==200){
          
            const url = URL.createObjectURL(file);
            $('#lastest_banner').attr('src',url);
    
            $("#bannerModal").modal("hide");
            $('#bannerPreview').attr('src',"");
        }
    })
}

function newOasis(base){
   return createOasis(base);
}