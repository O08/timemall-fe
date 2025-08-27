import axios from 'axios';
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";

export default function BrandContactSetting(params) {
    const {
        need_init = true
      } = params  
    return {
        data() {
            return {
                 contact: {
                    phone: "",
                    email: "",
                    wechat: "",
                    realName: ""
                 },
                 studio: {
                    hiLinkName: "",
                    hiLinkUrl: ""
                 },
                 contact_already_change: false,
                 studio_already_change: false
            }
        },
        methods: {
            previewWechatQrV(e){
                previewWechatQr(e);
            },
            wechatQrSettingV(){
                wechatQrSetting(this);
            },
            settingContactV(){
                settingContact(this);
                this.contact_already_change = false;
            },
            loadBrandContactV(){
                getBrandContact(this);
            },
            activeSaveContactBtn(){
                this.contact_already_change = true;
            },
            closewechatQrModalHandlerV(){
                closewechatQrModalHandler();
            },
            validateStudioSettingFormV(){
              return !!this.studio.hiLinkName && !!this.studio.hiLinkUrl && isValidHttpUrlNeedScheme(this.studio.hiLinkUrl)  && this.studio_already_change
            },
            settingStudioV(){
                settingStudio(this);
                this.studio_already_change = false;
                this.removeIdentity(); // from auth.js
            }
             
        },
        created: function() {
            if(need_init){
                this.loadBrandContactV();
            }
        }

    }

}



async function saveWechatQrImg(brandId, files){
    
    var fd = new FormData();
    fd.append('file', files);
    
    const url = "/api/v1/web_estudio/brand/{brand_id}/wechat_qrcode".replace("{brand_id}",brandId);
    var res = await axios.put(url, fd);
    return res;
}
function saveContactInfo(brandId,dto)
{
    const url = "/api/v1/web_estudio/brand/contact_setting";
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
function saveStudioInfo(dto){
    const url = "/api/v1/web_estudio/brand/setting/studio_hi_link";
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
function getBrandContact(appObj){
    const url = "/api/v1/web_estudio/brand/info";
    $.get(url,function(data) {
        if(data.code == 200){
            appObj.contact = data.brand.contact;
            appObj.contact.realName=data.brand.realName;
            appObj.studio = data.brand.studio;
        }
       })
}
 function wechatQrSetting(appObj)
{
    const brandId =  appObj.getIdentity().brandId; // Auth.getIdentity();

   const file = $('#wechatQrFile')[0].files[0];
    saveWechatQrImg(brandId, file).then(function (response) {
        if(response.data.code == 200){
            const url = URL.createObjectURL(file);
            appObj.contact.wechat= url;
            // $('#lastestWechatQr').attr('src',url);
    
            $("#wechatQrModal").modal("hide");
            $('#wechatQrPreview').attr('src',"");
            document.querySelector('#wechatQrFile').value = null;
        }
      })
    
}

function previewWechatQr(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    $('#wechatQrPreview').attr('src',URL2);
    $("#wechatQrModal").modal("show");
}
function settingStudio(appObj){
    saveStudioInfo(appObj.studio)
}
function settingContact(appObj){
    const brandId =  appObj.getIdentity().brandId; // Auth.getIdentity();
    const dto = {};
    dto.phone = appObj.contact.phone;
    dto.email = appObj.contact.email;
    dto.realName = appObj.contact.realName;
    saveContactInfo(brandId,dto)
}
// close modal handler
function closewechatQrModalHandler(){
    var  previewEl=  document.querySelector('#wechatQrPreview');
    if(!!previewEl.src){
        previewEl.src="";
    }

    document.querySelector('#wechatQrFile').value = null;
}
