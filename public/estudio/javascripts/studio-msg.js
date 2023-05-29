import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';


import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

const RootComponent = {
    data() {
        return {
             contact: {
                phone: "",
                email: "",
                wechat: ""
             },
             contact_already_change: false
        }
    },
    methods: {
        previewWechatQrV(e){
            previewWechatQr(e);
        },
        wechatQrSettingV(){
            wechatQrSetting();
        },
        settingContactV(){
            settingContact(this.contact);
            this.contact_already_change = false;
        },
        loadBrandContactV(){
            getBrandContact();
        },
        activeSaveContactBtn(){
            this.contact_already_change = true;
        },
        closewechatQrModalHandlerV(){
            closewechatQrModalHandler();
        }
         
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : true,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);

const msgPage = app.mount('#app');
window.cMsg= msgPage;

// init 
msgPage.loadBrandContactV();

async function saveWechatQrImg(brandId, files){
    
    var fd = new FormData();
    fd.append('file', files);
    
    const url = "/api/v1/web_estudio/brand/{brand_id}/wechat_qrcode".replace("{brand_id}",brandId);
    var res = await axios.put(url, fd);
    return res;
}
function saveContactInfo(brandId,dto)
{
    const url = "/api/v1/web_estudio/brand/{brand_id}/contact_setting".replace("{brand_id}",brandId);
    $.ajax({
        url: url,
        data: JSON.stringify(dto),
        type: "put",
        dataType:"json",
        contentType: "application/json",
        success:function(data){
            // todo 
            if(data.code == 200){
            
            }
        },
        error:function(){
            //alert('error'); //错误的处理
        }
    });  
}
function getBrandContact(){
    const url = "/api/v1/web_estudio/brand/info";
    $.get(url,function(data) {
        if(data.code == 200){
            msgPage.contact = data.brand.contact;
        }
       })
}
 function wechatQrSetting()
{
    const brandId =  msgPage.getIdentity().brandId; // Auth.getIdentity();

   const file = $('#wechatQrFile')[0].files[0];
    saveWechatQrImg(brandId, file).then(function (response) {
        if(response.data.code == 200){
            const url = URL.createObjectURL(file);
            $('#lastestWechatQr').attr('src',url);
    
            $("#wechatQrModal").modal("hide");
            $('#wechatQrPreview').attr('src',"");
        }
      })
    
}

function previewWechatQr(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    $('#wechatQrPreview').attr('src',URL2);
    $("#wechatQrModal").modal("show");
}
function settingContact(contact){
    const brandId =  msgPage.getIdentity().brandId; // Auth.getIdentity();
    const dto = {};
    dto.phone = contact.phone;
    dto.email = contact.email;
    saveContactInfo(brandId,dto)
}
// close modal handler
function closewechatQrModalHandler(){
    document.querySelector('#wechatQrPreview').src = "";
    document.querySelector('#wechatQrFile').value = null;
}