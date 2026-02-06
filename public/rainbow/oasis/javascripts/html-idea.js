import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { copyValueToClipboard } from "/common/javascripts/share-util.js";

let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            htmlChanged: false,
            generalHadChange: false,
            historyGeneral: {},
            htmlcode: "",
            general: {
                channelName: "",
                channelDesc: ""
            }
        }
    },
    methods: {
        mobilePreviewV(){
            var frame = document.getElementById("iphone-iframe"),
            frameDoc = frame.contentDocument || frame.contentWindow.document;
            frameDoc.removeChild(frameDoc.documentElement);

            var x = document.getElementById('iphone-iframe').contentWindow;
            x.document.open();
            x.document.write(this.htmlcode);
            x.document.close();
             $("#mobilePreviewModal").modal("show");
        },
        laptopPreviewV(){
            var frame = document.getElementById("pc-iframe"),
            frameDoc = frame.contentDocument || frame.contentWindow.document;
            frameDoc.removeChild(frameDoc.documentElement);

            var x = document.getElementById('pc-iframe').contentWindow;
            x.document.open();
            x.document.write(this.htmlcode);
            x.document.close();

             $("#pcPreviewModal").modal("show");
        },
        showSettingAppInfoModalV(){
            this.general=JSON.parse(JSON.stringify(this.historyGeneral));
            this.generalHadChange=false;
            $("#settingAppInfoModal").modal("show");
        },
        fetchChannelGeneralInfoV(){
            const och=getQueryVariable("och");
            fetchChannelGeneralInfo(och).then(response=>{
                if(response.data.code == 200){
                    this.historyGeneral= !response.data.channel ? {} : response.data.channel;
                    var title = !response.data.channel ? "" : response.data.channel.channelName;
                    document.title = title + " | 创作工坊";
                }
            });
        },
        modifyChannelGeneralInfoV(){
            const och=getQueryVariable("och");

            modifyChannelGeneralInfo(och,this.general.channelName,this.general.channelDesc).then(response=>{
                if(response.data.code == 200){
                    this.historyGeneral=JSON.parse(JSON.stringify(this.general));
                    $("#settingAppInfoModal").modal("hide");
                    document.title = this.general.channelName + " | 创作工坊";
                }
            })
        },
        updateHtmlCodeV(){
            const och=getQueryVariable("och");
            saveHtmlCodeContent(och,this.htmlcode).then(response=>{
                if(response.data.code == 200){

                    customAlert.alert("保存成功！");
                    this.historyHtmlCode=this.htmlcode;
                    this.htmlChanged=false;
                }
            });
        },
        fetchHtmlCodeV(){
            const och=getQueryVariable("och");
            fetchHtmlCode(och).then(response=>{
                if(response.data.code == 200){

                    this.htmlcode=response.data.htmlCode;
                    this.historyHtmlCode=response.data.htmlCode;

                }
            })
        },
        shareIdeaV(){
            const och=getQueryVariable("och");
            const htmlIdeaLink=window.location.origin + "/idea/"+och;
            copyValueToClipboard(htmlIdeaLink);
        }
    },
    created(){
        this.fetchHtmlCodeV();
        this.fetchChannelGeneralInfoV();
    },
    updated(){
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }

}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);


const htmlIdea = app.mount('#app');

window.htmlIdeaPage = htmlIdea;


async function doFetchChannelGeneralInfo(och){
    const url= "/api/public/team/oasis/channel/{oasis_channel_id}/general".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}
async function doModifyChannelGeneralInfo(dto){
    const url="/api/v1/team/oasis/channel/general";
    return await axios.put(url,dto);
}
async function doSaveHtmlCodeContent(och,htmlcode){
    const url="/api/v1/team/app/html/edit";
    const dto={
        oasisChannelId: och,
        html: htmlcode
    }
    return await axios.put(url,dto);
}
async function doFetchHtmlCode(och){
    const url= "/api/public/team/app/html/{oasis_channel_id}/info".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}
async function fetchHtmlCode(och){
   return doFetchHtmlCode(och);
}
async function saveHtmlCodeContent(och,htmlcode){
   return doSaveHtmlCodeContent(och,htmlcode);
}
async function modifyChannelGeneralInfo(och,channelName,channelDesc){
    const dto={
        oasisChannelId: och,
        channelName,
        channelDesc
    }
    return doModifyChannelGeneralInfo(dto);
}

async function fetchChannelGeneralInfo(och){
    return doFetchChannelGeneralInfo(och);
}

