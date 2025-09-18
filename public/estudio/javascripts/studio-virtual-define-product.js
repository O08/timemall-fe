import "/common/javascripts/import-jquery.js";

import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";

import axios from 'axios';

import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

import {ProductStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import {goStudioVirtualProductStore} from "/common/javascripts/pagenav.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { transformInputNumberAsPositive ,transformInputNumberAsPositiveDecimal} from "/common/javascripts/util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentProductId = getQueryVariable("product_id");


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


const RootComponent = {

    data() {
        return {
          randomMerchandiseQueryParam: "",
          randomMerchandiseQueryItems: [],
          changeRandomShippingMerchandiseObj: {
            merchandiseId: "",
            pack: ""
          },
          addRandomShippingMerchandiseObj:{
            productId: "",
            pack: ""
          },
          randomMerchandise: [],
          changeShowcaseImageCropper: {},
          addShowcaseImageCropper:{},
          thumbnailCoverCropper: {},
          productId: currentProductId,
          btn_ctl: {
              activate_general_save_btn: false,
              activate_product_desc_save_btn: false,
              activate_upload_thumbnailCover_btn: false,
              activate_add_show__btn: false,
              activate_change_show__btn: false,
              activate_deliver_save__btn: false,
              activate_shipping_save__btn: false,
              editRandomShippingMerchandise_already_change: false
          },
          editIngShowcase: {},
          product: {
              productId: "",
              deliverAttachment: null,
              deliverNote: "",
              inventory: "1",
              productDesc: "",
              productName: "",
              productPrice: "",
              productStatus: "",
              provideInvoice: "0",
              thumbnailUrl: "",
              thumbnailBlob: "",
              showcase: [],
              tags: []
          },
          agree_check: false,
        }
    },
    methods: {
        validateShippingFormV(){
          if(this.product.shippingMethod=="standard"){
            return this.btn_ctl.activate_shipping_save__btn && !!this.product.pack;
          }
          return this.btn_ctl.activate_shipping_save__btn ;
        },
        validateGeneralFormV(){
          if(!this.productId && !this.product.thumbnailBlob){
            return false;
          }
          return this.btn_ctl.activate_general_save_btn && !!this.product.productName && !!this.product.productPrice && Number(this.product.productPrice)>0 && !!this.product.inventory;
        },
        changeDeliverAttachmenttriggerV(){
          $("#deliverAttachment").trigger("click");
        },
        defineProductGenernalV(){

          if(!this.productId){
            createProduct(this.product).then(response=>{
              if(response.data.code==200){
                addProductIdToUrl(response.data.productId,this);
                this.btn_ctl.activate_general_save_btn = false;
                this.loadProductInfoV();
              }
              if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
              }
            })
          }
          if(!!this.productId){
            this.changeProductInfoV();
          }

         
        },
        changeProductInfoV(){
          this.product.productId = this.productId;
          changeProductInfo(this.product);
        },
        changeProductDescInfoV(){
          this.product.productId = this.productId;
          changeProductDescInfo(this.product);
        },
        closeProductThumbnailAddModalV(){
          closeThumnailAddModal();
        },
        previewAddProductThumbnailV(e){
          previewAddProductThumbnail(e,this);
        },
        addOneShowcaseImageV(){
          addOneShowcaseImage(this);
        },
        closeShowcaseAddModalV(){
          closeShowcaseAddModal();
        },
        previewAddShowcaseImageModalV(e){
          previewAddShowcaseImageModal(e,this);
        },
        clickCropAddShowcaseBtnV(){
          clickCropAddShowcaseBtn(this);
        },
        closeShowcaseChangeModalV(){
          closeShowcaseChangeModal();
        },
        previewChangeShowcaseImageModalV(e){
          previewChangeShowcaseImageModal(e,this);
        },
        clickCropChangeShowcaseBtnV(){
          clickCropChangeShowcaseBtn(this);
        },
        changeOneShowcaseImageV(){
          changeOneShowcaseImage(this);
        },
        triggerChangeShowcaseFileV(showcase){
          this.editIngShowcase = showcase;
          $("#changeShowCaseFile").trigger("click");
        },
        changeDeliverMaterialV(){
          changeDeliverMaterial(this);
        },
        triggerUploadThumbnailFileV(){
          $("#coverFile").trigger("click");
        },
        clickCropThumbnailBtnV(){
          clickCropThumbnailBtn(this);
        },
        setThumbnailV(){
          setThumbnail(this);
        },
        //tags
        removeTagV(index){
            this.product.tags.splice(index, 1);
        },
        addTagV(event){
            addTag(event)
        },
        deleteContentOrTagV(event){
            deleteContentOrTag(event);

        },
        loadProductInfoV(){
          if(!this.productId){
            return;
          }
          getProductInfo(this.productId).then(response=>{
            if(response.data.code==200){
              this.product=response.data.product;
              // editor
              quill.root.innerHTML = '';
              quill.clipboard.dangerouslyPasteHTML(0, this.product.productDesc);  
              this.btn_ctl.activate_product_desc_save_btn = false; // because editor text change event
            }
          });
        },
        onlineProductV(){
          
            onOrOffSaleForProduct(this.productId,ProductStatus.Online);
        },
        currentTabIntV(currentTab){
            return currentTabInt(currentTab);
        },
        transformInputNumberAsPositiveDecimalV(event){
          return transformInputNumberAsPositiveDecimal(event);
        },
        transformInputNumberV(event){
          return transformInputNumberAsPositive(event);
        },
        // shipping setting
        changShippingInfoV(){
          changShippingInfo(this.productId,this.product.pack,this.product.shippingMethod);
        },
        findRandomShippingMerchandiseV(){
          findRandomShippingMerchandise(this.productId);
        },
        showAddRandomShippingMerchandiseModalV(){
          this.addRandomShippingMerchandiseObj={
            productId: this.productId,
            pack: ""
          }
          $("#createRandomShippingMerchandiseModal").modal("show"); // show modal
        },
        addRandomShippingMerchandiseV(){
          addRandomShippingMerchandise(this.addRandomShippingMerchandiseObj)
        },
        showEditRandomShippingMerchandiseV(merchandise){
          this.changeRandomShippingMerchandiseObj.merchandiseId=merchandise.id;
          this.changeRandomShippingMerchandiseObj.pack=merchandise.pack;
          this.btn_ctl.editRandomShippingMerchandise_already_change=false;
          $("#editRandomShippingMerchandiseModal").modal("show"); // show modal

        },
        editRandomShippingMerchandiseV(){
          editRandomShippingMerchandise(this.changeRandomShippingMerchandiseObj);
        },
        removeRandomShippingMerchandiseV(id){
          removeRandomShippingMerchandise(id);
        },
        searchMerchandiseV(){
         if(!this.randomMerchandiseQueryParam){
          this.randomMerchandise= this.randomMerchandiseQueryItems;
         }
         if(!!this.randomMerchandiseQueryParam){
          this.randomMerchandise= this.randomMerchandiseQueryItems.filter(e=>e.pack.search(this.randomMerchandiseQueryParam) >=0);
        }

        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(DirectiveComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO,need_init: false
}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag == 'content'
}
app.mixin(new FriendListCompoent({need_init: false}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: false,
            onMessage: (e)=>{
                defineVirtualProductPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const defineVirtualProductPage = app.mount('#app');
window.cDefineVirtualProductPage= defineVirtualProductPage;



  
// init
defineVirtualProductPage.loadProductInfoV();
defineVirtualProductPage.userAdapter(); // auth.js
defineVirtualProductPage.fetchPrivateFriendV();// FriendListCompoent.js
defineVirtualProductPage.sseInitV();// Ssecompoent.js
defineVirtualProductPage.initEventFeedCompoentV(); // EventFeed.js
defineVirtualProductPage.findRandomShippingMerchandiseV();



/**
 * 
 * @param {*} productId  product id
 * @param {*} status 1--draft ; 2--onsale; 3--offsale;
 */
 async function modifyProductStatus(productId,status){
    var url = "/api/v1/web_estudio/virtual/product/status";
    const dto = {
      productId,
      status
    }
    return await axios.put(url,dto);
} 

async function fetchProductMetaInfo(productId){
  const url = "/api/v1/web_estudio/brand/virtual/product/{id}/meta".replace("{id}",productId);
  return await axios.get(url);
}

async function saveThumbnailImg(productId, files){
  var fd = new FormData();
  fd.append('thumbnail', files,'product_thumbnail.png');
  fd.append('productId', productId);

  const url = "/api/v1/web_estudio/virtual/product/change_thumbnail";
  return await axios.put(url, fd);
}

async function addShowcaseImg(productId,files){
  var fd = new FormData();
  fd.append('showcase', files,'virtual_showcase.png');
  fd.append('productId', productId);
  const url = "/api/v1/web_estudio/virtual/product/showcase/new";
  return await axios.post(url, fd);
}
async function changeShowcaseImg(productId,showcaseId,files){
  var fd = new FormData();
  fd.append('showcase', files,'virtual_showcase.png');
  fd.append('productId', productId);
  fd.append('showcaseId', showcaseId);
  const url = "/api/v1/web_estudio/virtual/product/showcase/change";
  return await axios.put(url, fd);
}


async function createOneProduct(product){
  var fd = new FormData();
  fd.append('thumbnail', product.thumbnailBlob,'product_thumbnail.png');
  fd.append('productName', product.productName);
  fd.append('productPrice',product.productPrice);
  fd.append('inventory', product.inventory);
  fd.append('provideInvoice',product.provideInvoice);
  fd.append('tags', JSON.stringify(product.tags));
  const url = "/api/v1/web_estudio/virtual/product/create";
  return await axios.post(url,fd);
}

async function doChangeProduct(product){

  const dto = {
    productId: product.productId,
    productName: product.productName,
    productPrice: product.productPrice,
    inventory: product.inventory,
    provideInvoice: product.provideInvoice,
    tags: JSON.stringify(product.tags)
  }
  const url = "/api/v1/web_estudio/virtual/product/change";
  return await axios.put(url,dto);

}
async function doChangeProductDesc(product){
  const dto = {
    productId: product.productId,
    productDesc: product.productDesc
  }
  const url = "/api/v1/web_estudio/virtual/product/change_desc";
  return await axios.put(url,dto);
}


async function doChangeDeliverMaterial(productId,deliverNote,deliverAttachment){

  var fd = new FormData();
  if(!!deliverAttachment){
    fd.append('deliverAttachment', deliverAttachment);
  }
  fd.append('productId', productId);
  fd.append('deliverNote', deliverNote);
  const url = "/api/v1/web_estudio/virtual/product/deliver/change";
  return await axios.put(url, fd);

}
async function doShippingSetting(dto){
  const url = "/api/v1/web_estudio/virtual/product/shipping/setting";
  return await axios.post(url,dto);
}
async function fetchRandomShippingMerchandiseInfo(productId){
  const url = "/api/v1/web_estudio/virtual/product/shipping/random/merchandise?productId="+productId;
  return await axios.get(url);
}
async function doCreateRandomShippingMerchandise(dto){
  const url = "/api/v1/web_estudio/virtual/product/shipping/random/merchandise/create";
  return await axios.post(url,dto);
}
async function doEditRandomShippingMerchandise(dto){
  const url = "/api/v1/web_estudio/virtual/product/shipping/random/merchandise/change";
  return await axios.put(url,dto);
}
async function delRandomShippingMerchandiseInfo(id){
  const url = "/api/v1/web_estudio/virtual/product/shipping/random/merchandise/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function removeRandomShippingMerchandise(id){
  delRandomShippingMerchandiseInfo(id).then(response=>{
    if(response.data.code == 200){
      
      defineVirtualProductPage.findRandomShippingMerchandiseV();

      
    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  });
}
async function editRandomShippingMerchandise(dto){
  doEditRandomShippingMerchandise(dto).then(response=>{
    if(response.data.code == 200){
      
      defineVirtualProductPage.findRandomShippingMerchandiseV();
      $("#editRandomShippingMerchandiseModal").modal("hide"); // show modal

      
    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  });
}
async function addRandomShippingMerchandise(dto){
  doCreateRandomShippingMerchandise(dto).then(response=>{
    if(response.data.code == 200){
      
      defineVirtualProductPage.findRandomShippingMerchandiseV();
      $("#createRandomShippingMerchandiseModal").modal("hide"); // show modal

      
    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  });
}
async function findRandomShippingMerchandise(productId){
  fetchRandomShippingMerchandiseInfo(productId).then(response=>{
    if(response.data.code == 200){
      
      defineVirtualProductPage.randomMerchandise=response.data.merchandise;
      defineVirtualProductPage.randomMerchandiseQueryItems=response.data.merchandise;

    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  });
}

async function changShippingInfo(productId,pack,shippingMethod){
  const dto={
    productId: productId,
    pack: pack,
    shippingMethod: shippingMethod
  }
  doShippingSetting(dto).then(response=>{
    if(response.data.code == 200){

      changeUrlTabWithoutRefreshPage("publish");// open publish settign
      // reload data
      defineVirtualProductPage.loadProductInfoV();
      defineVirtualProductPage.btn_ctl.activate_shipping_save__btn= false;

    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  });


}
async function changeDeliverMaterial(appObj){
  const deliverAttachment = document.getElementById("deliverAttachment").files[0];

  if(!!deliverAttachment){

    // validate image size <=6M
    var size = parseFloat(deliverAttachment.size);
    var maxSizeMB = 50; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("附件最大为50M!");
        return false;
    }

  }

  doChangeDeliverMaterial(appObj.productId,appObj.product.deliverNote,deliverAttachment).then(response=>{
    if(response.data.code == 200){

      changeUrlTabWithoutRefreshPage("publish");// open shipping settign
      // reload data
      defineVirtualProductPage.loadProductInfoV();
      document.querySelector('#deliverAttachment').value = null;
      defineVirtualProductPage.btn_ctl.activate_deliver_save__btn= false;

    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  });

}
async function changeProductInfo(product){

  doChangeProduct(product).then(response=>{
    if(response.data.code==200){
       defineVirtualProductPage.btn_ctl.activate_general_save_btn = false;
       changeUrlTabWithoutRefreshPage("publish");// open showcase and deliver settign
    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  })

}
async function changeProductDescInfo(product){
  if(!quill.getText().trim()){
    customAlert.alert("需要输入正文！")
    return;
  }
  product.productDesc = quill.getSemanticHTML();


  // max length == 10000
  if(product.productDesc.length>10000){
    customAlert.alert("《关于商品内容》长度超出容量，需要重新调整！")
    return;
  }
  doChangeProductDesc(product).then(response=>{
    if(response.data.code==200){
       defineVirtualProductPage.btn_ctl.activate_product_desc_save_btn = false;
       changeUrlTabWithoutRefreshPage("publish");// open showcase and deliver settign
    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  })
}

async function createProduct(product){
   return createOneProduct(product);
}
// file handler---------
// 1. product thumbnail file handler
function previewAddProductThumbnail(e,appObj){
  const file = e.target.files[0]
  if(!file){
    return
  }
  const URL2 = URL.createObjectURL(file)
  document.querySelector('#thumbnailAddPreview').src = URL2

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
      closeThumnailAddModal();
      customAlert.alert("图片最大为6M!");
      return false;
  }
  const coverImageRaw = document.getElementById('thumbnailAddPreview');
  const coverImgFile = new Image();
  coverImgFile.onload = ()=> {
       // validate image pixel
       if(!(coverImgFile.width>=640 && coverImgFile.height>=320 && coverImgFile.width<4096 && coverImgFile.height<4096 && coverImgFile.width*coverImgFile.height<9437184)){
          customAlert.alert("图片必须至少为 640 x 320 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
          closeThumnailAddModal();
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

      // reset  model fn
      document.querySelector('#cropped-output-cover').src = "";
      appObj.btn_ctl.activate_upload_thumbnailCover_btn=false;
  
      appObj.thumbnailCoverCropper.replace(URL2, false);
  
  
 
  
      $("#productThumbnailAddModal").modal("show");

  }
  coverImgFile.src = URL2;

}

function clickCropThumbnailBtn(appObj){

  var croppedImage = appObj.thumbnailCoverCropper.getCroppedCanvas().toDataURL("image/png");
  document.getElementById('cropped-output-cover').src = croppedImage;
  appObj.btn_ctl.activate_upload_thumbnailCover_btn=true;
      
}

function setThumbnail(appObj){
  var croppedThumbnailImage = appObj.thumbnailCoverCropper.getCroppedCanvas().toDataURL("image/png");
  appObj.product.thumbnailUrl= croppedThumbnailImage;
  
  appObj.thumbnailCoverCropper.getCroppedCanvas().toBlob((blob) => {
      
    appObj.product.thumbnailBlob = blob;
    if(!!appObj.productId){
      uploadThumbnail(appObj)
    }else{
      closeThumnailAddModal();
    }


  }/*, 'image/png' */);

   

}
function closeThumnailAddModal(){
  $("#productThumbnailAddModal").modal("hide");
  document.querySelector('#coverFile').value = null;
}
function closeShowcaseAddModal(){

  $("#showcaseAddModal").modal("hide");
  document.querySelector('#addShowCaseFile').value = null;

}
function closeShowcaseChangeModal(){
  $("#showcaseChangeModal").modal("hide");
  document.querySelector('#changeShowCaseFile').value = null;
}
async function uploadThumbnail(appObj){

  
  saveThumbnailImg(appObj.productId,appObj.product.thumbnailBlob).then((response)=>{
    if(response.data.code == 200){
     
      closeThumnailAddModal();

    }
    if(response.data.code!=200){
      customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  }).catch(error=>{
      document.querySelector('#coverFile').value = null;
      customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
  });


}

// add show case image
function previewAddShowcaseImageModal(e,appObj){
  const file = e.target.files[0]
  if(!file){
    return
  }
  const URL2 = URL.createObjectURL(file)
  document.querySelector('#showcaseAddPreview').src = URL2

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
      closeShowcaseAddModal();
      customAlert.alert("图片最大为6M!");
      return false;
  }
  const coverImageRaw = document.getElementById('showcaseAddPreview');
  const coverImgFile = new Image();
  coverImgFile.onload = ()=> {
       // validate image pixel
       if(!(coverImgFile.width>=640 && coverImgFile.height>=320 && coverImgFile.width<4096 && coverImgFile.height<4096 && coverImgFile.width*coverImgFile.height<9437184)){
           closeShowcaseAddModal();
           customAlert.alert("图片必须至少为 640 x 320 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
          return false;
      }
      var minContainerSize= screen.availWidth<=768 ? 300 : 500;


      if(Object.keys(appObj.addShowcaseImageCropper).length === 0){

          appObj.addShowcaseImageCropper = new Cropper(coverImageRaw, {
              aspectRatio: 4 / 3,
              minContainerWidth:minContainerSize,   //容器最小的宽度
              minContainerHeight:minContainerSize,  //容器最小的高度
              dragMode:'move', 
              // minCropBoxHeight: 200,// 裁剪层的最小高度，默认为0
          });

      }

      // reset  model fn
      document.querySelector('#cropped-output-showcase__add').src = "";
      appObj.btn_ctl.activate_add_show__btn=false;
  
      appObj.addShowcaseImageCropper.replace(URL2, false);
  
  
 
  
      $("#showcaseAddModal").modal("show");

  }
  coverImgFile.src = URL2;

}

function clickCropAddShowcaseBtn(appObj){
  var croppedImage = appObj.addShowcaseImageCropper.getCroppedCanvas().toDataURL("image/png");
  document.getElementById('cropped-output-showcase__add').src = croppedImage;
  appObj.btn_ctl.activate_add_show__btn=true;
}

async function addOneShowcaseImage(appObj){

  appObj.addShowcaseImageCropper.getCroppedCanvas().toBlob((blob) => {
        
    addShowcaseImg(appObj.productId,blob).then((response)=>{
        if(response.data.code == 200){

            // reload data
             defineVirtualProductPage.loadProductInfoV();
             closeShowcaseAddModal();

        }
        if(response.data.code!=200){
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
        document.querySelector('#addShowCaseFile').value = null;
        customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
    });

  }/*, 'image/png' */);

}


// 3 ... change show case image
function previewChangeShowcaseImageModal(e,appObj){
  const file = e.target.files[0]
  if(!file){
    return
  }
  const URL2 = URL.createObjectURL(file)
  document.querySelector('#showcaseChangePreview').src = URL2

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
      closeShowcaseChangeModal();
      customAlert.alert("图片最大为6M!");
      return false;
  }
  const coverImageRaw = document.getElementById('showcaseChangePreview');
  const coverImgFile = new Image();
  coverImgFile.onload = ()=> {
       // validate image pixel
       if(!(coverImgFile.width>=640 && coverImgFile.height>=320 && coverImgFile.width<4096 && coverImgFile.height<4096 && coverImgFile.width*coverImgFile.height<9437184)){
          closeShowcaseChangeModal();
          customAlert.alert("图片必须至少为 640 x 320 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
          return false;
      }
      var minContainerSize= screen.availWidth<=768 ? 300 : 500;


      if(Object.keys(appObj.changeShowcaseImageCropper).length === 0){

          appObj.changeShowcaseImageCropper = new Cropper(coverImageRaw, {
              aspectRatio: 4 / 3,
              minContainerWidth:minContainerSize,   //容器最小的宽度
              minContainerHeight:minContainerSize,  //容器最小的高度
              dragMode:'move', 
              // minCropBoxHeight: 200,// 裁剪层的最小高度，默认为0
          });

      }

      // reset  model fn
      document.querySelector('#cropped-output-showcase__change').src = "";
      appObj.btn_ctl.activate_change_show__btn=false;
  
      appObj.changeShowcaseImageCropper.replace(URL2, false);
  
  
 
  
      $("#showcaseChangeModal").modal("show");

  }
  coverImgFile.src = URL2;

}

function clickCropChangeShowcaseBtn(appObj){

  var croppedImage = appObj.changeShowcaseImageCropper.getCroppedCanvas().toDataURL("image/png");
  document.getElementById('cropped-output-showcase__change').src = croppedImage;
  appObj.btn_ctl.activate_change_show__btn=true;

}

async function changeOneShowcaseImage(appObj){

  appObj.changeShowcaseImageCropper.getCroppedCanvas().toBlob((blob) => {
        
    changeShowcaseImg(appObj.productId,appObj.editIngShowcase.showcaseId, blob).then((response)=>{
        if(response.data.code == 200){

            // reload data
             defineVirtualProductPage.loadProductInfoV();
             closeShowcaseChangeModal();

        }
        if(response.data.code!=200){
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
        document.querySelector('#changeShowCaseFile').value = null;
        customAlert.alert("文件上传失败，请检查图片格式,大小, 若异常信息出现code 413, 说明图片大于6M。异常信息(" + error+ ")");
    });

  }/*, 'image/png' */);

}
// ----- - - -- - ---- -  -- - - - -split line- - - -- - - - - -- - - - - - -- - - - - - - -- - - - - -- - - -- -- - - -- 
async function getProductInfo(productId){
  if(!productId){
      return;
  }
  return fetchProductMetaInfo(productId);
}
async function addTag(e){
    
    var tag = e.target.value.replace(/\s+/g, ' ');
    var tags=defineVirtualProductPage.product.tags;
    if(tag.length > 0 && !tags.includes(tag)){
        if(tags.length < 5){
            defineVirtualProductPage.product.tags.push(tag);
            defineVirtualProductPage.btn_ctl.activate_general_save_btn=true;
        }
    }
    e.target.value = "";

}
// tmp_global_val
var gl_tag_before_del='';
async function deleteContentOrTag(e){

    if (e.keyCode == 8 || e.keyCode == 46) {
        
        if(e.target.value.length==0 && gl_tag_before_del.length==0 && defineVirtualProductPage.product.tags.length>0){
            defineVirtualProductPage.product.tags.pop();
            defineVirtualProductPage.btn_ctl.activate_general_save_btn=true;
        }
    }
    gl_tag_before_del=e.target.value;

}



function onOrOffSaleForProduct(productId,code){
      if(!productId){
        return;
      }
      modifyProductStatus(productId,code).then(response=>{
        if(response.data.code == 200){
          goStudioVirtualProductStore();
          defineVirtualProductPage.agree_check = false;
        }
        if(response.data.code!=200){
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
     });
}

function currentTabInt(currentTab){
  const tab = getQueryVariable("tab");
  const option = getQueryVariable("option");

  var navIntMap = new Map();
  navIntMap.set("general",1);
  navIntMap.set("about",2);
  navIntMap.set("showcase",3);
  navIntMap.set("deliver",4);
  navIntMap.set("shipping",5);
  navIntMap.set("publish",6);
  // if edit open all
  return option === "edit" ? 6 < currentTab : navIntMap.get(tab) < currentTab;
}

const toolbarOptions = [
    [{ 'size': fontSizeArr }],  // custom dropdown
    [{ 'color': [] }, { 'background': backgroundArr }],          // dropdown with defaults from theme
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    ['clean']                                         // remove formatting button
  ];
  
const quill = new Quill('#editor', {
  modules: {
    toolbar: toolbarOptions
  },
  theme: 'snow'
});

quill.on('text-change', () => {
   defineVirtualProductPage.btn_ctl.activate_product_desc_save_btn = true;
});

function addProductIdToUrl(productId,appObj){
  if(!appObj.productId){
    appObj.productId = productId;
    let url = "/estudio/studio-virtual-define-product?tab=about&product_id="+ productId;
    history.pushState(null, "", url);
  }
}

function changeUrlTabWithoutRefreshPage(tab){
  const id = getQueryVariable("product_id");
  if(id){
      let url = "/estudio/studio-virtual-define-product?tab="+ tab+ "&product_id="+ id;
      history.pushState(null, "", url);
  }
}


$(function(){
	$(".tooltip-nav").tooltip();
});