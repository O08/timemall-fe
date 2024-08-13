import 'cropperjs/dist/cropper.css';
import axios from 'axios';
import Cropper from 'cropperjs';
import { getQueryVariable } from "/common/javascripts/util.js";
import { preHandleCellId ,addCellIdToUrl} from "/estudio/javascripts/compoent/DefineCellHelper.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const DefineCellCoverAndBanner = {
    data(){
        return {
            bannerCropper: {},
            thumbnailCoverCropper:{},
            btn_ctl: {
                activate_upload_banner_btn: false,
                activate_upload_thumbnailCover_btn: false
            }
        }
    },
    methods: {
        // file handler
        previewCellCoverV(e){
            previewCellCover(e,this);
        },
        closeOverViewCoverModalHandlerV(){
            closeOverViewCoverModalHandler();
        },
        clickCropCoverBtnV(){
            clickCropCoverBtn(this);
        },
        clickCropBannnerBtnV(){
            clickCropBannnerBtn(this);
        },
        uploadCellCoverV(){
            uploadCellCover(this);
        },
        previewCellIntroBannerV(e){
            previewCellIntroBanner(e,this);
        },
        closeIntroBannerModalHandlerV(){
            closeIntroBannerModalHandler();
        },
        uploadCellIntroBannerV(){
            uploadCellIntroBanner(this);
        }

    }

}


async function saveCellCoverImg(cellId, files){
    var fd = new FormData();
    fd.append('file', files,'cell_thumbnail.png');
    const url = "/api/v1/web_estudio/services/{cell_id}/cover".replace("{cell_id}",cellId);
    return await axios.put(url, fd);
}

async function saveCellIntroBannerImg(cellId,files){
    var fd = new FormData();
    fd.append('file', files,'banner.png');
    const url = "/api/v1/web_estudio/services/{cell_id}/intro/cover".replace("{cell_id}",cellId);
    return await axios.put(url, fd);
}

function clickCropCoverBtn(appObj){

    var croppedImage = appObj.thumbnailCoverCropper.getCroppedCanvas().toDataURL("image/png");
    document.getElementById('cropped-output-cover').src = croppedImage;
    appObj.btn_ctl.activate_upload_thumbnailCover_btn=true;
        
}
function clickCropBannnerBtn(appObj){

    var croppedImage = appObj.bannerCropper.getCroppedCanvas().toDataURL("image/png");
    document.getElementById('cropped-output-banner').src = croppedImage;
    appObj.btn_ctl.activate_upload_banner_btn=true;

}

// file handler---------
// 1. cell cover file handler
function previewCellCover(e,appObj){
    const file = e.target.files[0]
    const URL2 = URL.createObjectURL(file)
    document.querySelector('#coverPreview').src = URL2

    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
    const coverImageRaw = document.getElementById('coverPreview');
    const coverImgFile = new Image();
    coverImgFile.onload = ()=> {
         // validate image pixel
         if(!(coverImgFile.width>=640 && coverImgFile.height>=320 && coverImgFile.width<4096 && coverImgFile.height<4096)){
            customAlert.alert("图片必须至少为 640 x 320 像素且单边长度不能超过4096像素!");
            return false;
        }
        var minContainerSize= screen.availWidth<=768 ? 300 : 500;


        if(Object.keys(appObj.thumbnailCoverCropper).length === 0){

            appObj.thumbnailCoverCropper = new Cropper(coverImageRaw, {
                aspectRatio: 4 / 3,
                minContainerWidth:minContainerSize,   //容器最小的宽度
                minContainerHeight:minContainerSize,  //容器最小的高度
                dragMode:'move', 
                // minCropBoxHeight: 200,// 裁剪层的最小高度，默认为0
            });

        }

        // reset banner model fn
        document.querySelector('#cropped-output-cover').src = "";
        appObj.btn_ctl.activate_upload_thumbnailCover_btn=false;
    
        appObj.thumbnailCoverCropper.replace(URL2, false);
    
    
   
    
        $("#overviewCoverModal").modal("show");

    }
    coverImgFile.src = URL2;



}
function closeOverViewCoverModalHandler(){
    var coverPreviewEl=document.querySelector('#coverPreview');
    if(!!coverPreviewEl.src){
        coverPreviewEl.src="";
    }
    document.querySelector('#coverFile').value = null;
}
async function uploadCellCover(appObj){
    const brandId=appObj.getIdentity().brandId;
    const cellId =await preHandleCellId(brandId);
    if(!cellId){
        return;
    }
    
    appObj.thumbnailCoverCropper.getCroppedCanvas().toBlob((blob) => {
        
        saveCellCoverImg(cellId,blob).then((response)=>{
            if(response.data.code == 200){
                var croppedAvatarImage = appObj.thumbnailCoverCropper.getCroppedCanvas().toDataURL("image/png");

                document.querySelector('#lastestCover').src = croppedAvatarImage;
    
                $("#overviewCoverModal").modal("hide");
                document.querySelector('#coverFile').value = null;

                addCellIdToUrl(cellId);
            }
        }).catch(error=>{
            document.querySelector('#coverFile').value = null;
            customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
        });

      }/*, 'image/png' */);

}

// 2. cell intro banner file handler
function previewCellIntroBanner(e,appObj){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    document.querySelector('#bannerPreview').src = URL2


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
        if(!(bannerImgFile.width>=1024 && bannerImgFile.height>=576 && bannerImgFile.width<4096 && bannerImgFile.height<4096)){
            console.log("current image: width=" + bannerImgFile.width + "  height="+bannerImgFile.height);
            customAlert.alert("图片必须至少为 1024 x 576 像素且单边长度不能超过4096像素!");
            return false;
        }
        var minContainerSize= screen.availWidth<=768 ? 300 : 500;

        if(Object.keys(appObj.bannerCropper).length === 0){
            appObj.bannerCropper = new Cropper(bannerImageRaw, {
                aspectRatio: 3.23 / 1,
                minContainerWidth:minContainerSize,   //容器最小的宽度
                minContainerHeight:minContainerSize,  //容器最小的高度
                dragMode:'move', 
                // minCropBoxHeight: 200,// 裁剪层的最小高度，默认为0
            });
        }

        // reset banner model fn
        document.querySelector('#cropped-output-banner').src = "";
        appObj.btn_ctl.activate_upload_banner_btn=false;
    
        appObj.bannerCropper.replace(URL2, false);
    
 
        
    
        $("#introBannerModal").modal("show");

    };

    bannerImgFile.src = URL.createObjectURL(file);

}
function closeIntroBannerModalHandler(){
    var bannerPreviewEl=document.querySelector('#bannerPreview');
    if(!!bannerPreviewEl.src){
        bannerPreviewEl.src="";
    }
    document.querySelector('#intro-banner-file').value = null;
}
function uploadCellIntroBanner(appObj){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }

    appObj.bannerCropper.getCroppedCanvas().toBlob((blob) => {
        
        saveCellIntroBannerImg(cellId,blob).then((response)=>{
            if(response.data.code == 200){
                var croppedBannerImage = appObj.bannerCropper.getCroppedCanvas().toDataURL("image/png");

                document.querySelector('#lastestBanner').src = croppedBannerImage;
                document.querySelector('#intro-banner-file').value = null;
    
                $("#introBannerModal").modal("hide");
            }
        }).catch(error=>{
            document.querySelector('#intro-banner-file').value = null;
            customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
        })

      }/*, 'image/png' */);

}

export default DefineCellCoverAndBanner;
