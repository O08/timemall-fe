import 'cropperjs/dist/cropper.css';
import axios from 'axios';

import Cropper from 'cropperjs';


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const BrandAvatorAndBannerSetting = {
    data(){
        return {
            bannerCropper: {},
            avatarCropper:{},
            btn_ctl: {
                activate_upload_banner_btn: false,
                activate_upload_avatar_btn: false
            }
        }
    },
    methods: {
        clickBannerUploadBtn(){
            $("#file_banner").trigger("click");
        },
        showPreviewBannerModalV(e){
            showPreviewBannerModal(e,this);
         },
         clickCropBannerBtnV(){
            clickCropBannerBtn(this);
         },

         closeBannerModalHandlerV(){
            closeBannerModalHandler();
         },
         uploadBannerFileV(){
            uploadBannerFile(this);
         },
         clickAvatorUploadBtn(){
            $("#file_avator").trigger("click");
         },
         showPreviewAvatorModalV(e){
            showPreviewAvatorModal(e,this);
         },
         closeAvatorModalHandlerV(){
            closeAvatorModalHandler();
         },
         uploadAvatorFileV(){
            uploadAvatorFile(this);
         },
         clickCropAvatarBtnV(){
            clickCropAvatarBtn(this);
         }
    }
}


async function uploadBannerImgFile(brandId,files){
    var fd = new FormData();
    fd.append('file', files, 'banner.png');
    const url = "/api/v1/web_estudio/brand/{brand_id}/cover".replace("{brand_id}",brandId);
    return await axios.put(url, fd);
}
async function uploadAvatorImgFile(brandId,files){
    var fd = new FormData();
    fd.append('file', files, 'brandAvatar.png');
    const url = "/api/v1/web_estudio/brand/{brand_id}/avator".replace("{brand_id}",brandId);
    return await axios.put(url, fd);
}

function showPreviewBannerModal(e,appObj){
    const file = e.target.files[0];

    const URL2 = URL.createObjectURL(file);
    document.querySelector('#bannerPreview').src = URL2;
    
    
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }

    const bannerImageRaw = document.getElementById('bannerPreview');

    const bannerImgFile = new Image();
    bannerImgFile.onload = ()=> {

        // validate image pixel
        if(!(bannerImgFile.width>=1024 && bannerImgFile.height>=576)){
            console.log("current image: width=" + bannerImgFile.width + "  height="+bannerImgFile.height);
            customAlert.alert("图片必须至少为 1024 x 576 像素!");
            return false;
        }
        var minContainerSize= screen.availWidth<=768 ? 300 : 500;

        if(Object.keys(appObj.bannerCropper).length === 0){
            appObj.bannerCropper = new Cropper(bannerImageRaw, {
                aspectRatio: 310 / 50,
                minContainerWidth: minContainerSize,   //容器最小的宽度
                minContainerHeight: minContainerSize,  //容器最小的高度
                dragMode:'move', 
                // minCropBoxHeight: 200,// 裁剪层的最小高度，默认为0
            });
        }

        // reset banner model fn
        document.querySelector('#cropped-output-banner').src = "";
        appObj.btn_ctl.activate_upload_banner_btn=false;
    
        appObj.bannerCropper.replace(URL2, false);
    
    
       
        
    
        $("#bannerModal").modal("show");

    };

    bannerImgFile.src = URL.createObjectURL(file);
    
}
function clickCropBannerBtn(appObj){
    var croppedImage = appObj.bannerCropper.getCroppedCanvas().toDataURL("image/png");
    document.getElementById('cropped-output-banner').src = croppedImage;
    appObj.btn_ctl.activate_upload_banner_btn=true;
    console.log("pick up");
}
function closeBannerModalHandler(){
    var bannerPreviewEl=document.querySelector('#bannerPreview');
    if(!!bannerPreviewEl.src){
        bannerPreviewEl.src="";
    }
    document.querySelector('#file_banner').value = null;
}
function uploadAvatorFile(appObj){
    const brandId =  appObj.getIdentity().brandId; // Auth.getIdentity();
    const file = $('#file_avator')[0].files[0];


    appObj.avatarCropper.getCroppedCanvas().toBlob((blob) => {
        
        uploadAvatorImgFile(brandId,blob).then(response=>{
            if(response.data.code ==200){
              
                var croppedAvatarImage = appObj.avatarCropper.getCroppedCanvas().toDataURL("image/png");

                $('#lastest_avator').attr('src',croppedAvatarImage);
                $('.customer-avator').attr('src',croppedAvatarImage); // modify left nav panel brand avatar
        
                $("#avatorModal").modal("hide");
                document.querySelector('#file_avator').value = null;
                $('#avatorPreview').attr('src',"");
                // reset auth.js
                appObj.removeIdentity(); // from auth.js
            }
        }).catch(error=>{
            document.querySelector('#file_avator').value = null;
            customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
        })

      }/*, 'image/png' */);

}
function clickCropAvatarBtn(appObj){
    var croppedAvatarImage = appObj.avatarCropper.getCroppedCanvas().toDataURL("image/png");
    document.getElementById('cropped-output-avatar').src = croppedAvatarImage;
    document.getElementById('cropped-output-avatar-no-radius').src = croppedAvatarImage;

    appObj.btn_ctl.activate_upload_avatar_btn=true;
        
}
function showPreviewAvatorModal(e,appObj){
    const file = e.target.files[0]

    const localAvatarImgUrl = URL.createObjectURL(file)
    $('#avatarPreview').attr('src',localAvatarImgUrl);
    
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }

    const avatarImageRaw = document.getElementById('avatarPreview');
    const avatarImgFile = new Image();
    avatarImgFile.onload = ()=> {

        // validate image pixel
        if(!(avatarImgFile.width>=99 && avatarImgFile.height>=99)){
            customAlert.alert("图片必须至少为 99 x 99 像素!");
            return false;
        }
        var minContainerSize= screen.availWidth<=768 ? 300 : 500;

        if(Object.keys(appObj.avatarCropper).length === 0){
            appObj.avatarCropper = new Cropper(avatarImageRaw, {
                aspectRatio: 1 / 1,
                minContainerWidth: minContainerSize,   //容器最小的宽度
                minContainerHeight: minContainerSize,  //容器最小的高度
                dragMode:'move', 
                // minCropBoxHeight: 200,// 裁剪层的最小高度，默认为0
            });
        }

        // reset banner model fn
        document.querySelector('#cropped-output-avatar').src = "";
        document.querySelector('#cropped-output-avatar-no-radius').src = "";
        appObj.btn_ctl.activate_upload_avatar_btn=false;
    
        appObj.avatarCropper.replace(localAvatarImgUrl, false);
    
    

    
        $("#avatorModal").modal("show");

    };

    avatarImgFile.src = URL.createObjectURL(file);


}
function closeAvatorModalHandler(){

    var avatarPreviewEl=document.querySelector('#avatarPreview');
     if(!!avatarPreviewEl.src){
        avatarPreviewEl.src="";
     }
    document.querySelector('#file_avator').value = null;

}
function uploadBannerFile(appObj){
    const brandId =  appObj.getIdentity().brandId; // Auth.getIdentity();
    const file = $('#file_banner')[0].files[0];
  


    appObj.bannerCropper.getCroppedCanvas().toBlob((blob) => {
        
        uploadBannerImgFile(brandId,blob).then(response=>{
            if(response.data.code ==200){
              
                var croppedBannerImage = appObj.bannerCropper.getCroppedCanvas().toDataURL("image/png");

                // $('#lastest_banner').attr('src',croppedBannerImage);
                document.getElementById("lastest_banner").src=croppedBannerImage;
        
                $("#bannerModal").modal("hide");
                document.querySelector('#file_banner').value = null;
                // $('#bannerPreview').attr('src',"");
                document.getElementById("bannerPreview").src="";
            }
        }).catch(error=>{
            document.querySelector('#file_banner').value = null;
            customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
        })

      }/*, 'image/png' */);

}




export default BrandAvatorAndBannerSetting;
