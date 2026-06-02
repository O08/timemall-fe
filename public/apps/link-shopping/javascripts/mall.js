import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import { transformInputNumberAsPositiveDecimal,isValidHttpUrlNeedScheme} from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();


const sandboxEnv= getQueryVariable("sandbox");
const currentOch = window.location.pathname.split('/').pop();

const currentNow = Date.now(); 
const RootComponent = {
    data() {
      return {
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        currentNow,
        memberCanPost: false,
        newProduct:{
            linkUrl: "",
            title: "",
            price: "",
            linkCoverFileUrl: "",
            coverFile: "",
            channel: currentOch
        },
        editProductModalHadChange: false,
        editProduct:{
            title: "",
            price: "",
            id: ""
        },
        feedArr: [],
        feedList_pagination: {
            url: "/api/v1/app/link_shopping/product/list",
            size: 24,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            isLoading: false,
            param: {
              q: '',
              sort: "2",
              channel: currentOch
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.feedList_pagination.size = response.feed.size;
                    this.feedList_pagination.current = response.feed.current;
                    this.feedList_pagination.total = response.feed.total;
                    this.feedList_pagination.pages = response.feed.pages;
                    this.feedList_pagination.records = response.feed.records;
                    this.feedList_pagination.isLoading = false;
                    this.feedArr.push(...response.feed.records);
                }
            }
        },
    }
    },
    methods: {
        newProductV(){
            publishNewProduct(this).then(response=>{
                if(response.data.code==200){
                    this.closeNewProductModalV();

                    // change sort to create time 
                    this.feedList_pagination.param.sort="2";
         
                    this.retrieveFeedListV();

                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
             });
        },
        editProductV(){

            changeProduct(this).then(response=>{
    
              if(response.data.code == 200){
    
                this.closeEditProductModalV();

                   // change sort to time 
                this.feedList_pagination.param.sort="4";
                this.retrieveFeedListV();
    
              }
              if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error);
              }
    
            });
        },
        removeProductV(id){
            deleteProductBO(id).then(response=>{
                if(response.data.code==200){

                 this.feedArr = this.feedArr.filter(item => item.id !== id);
    
                }
                if(response.data.code!=200){
                  const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                  customAlert.alert(error); 
                }
                
              }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        previewFeedThumbnailV(e){
            previewFeedThumbnail(e,this);
        },
        showNewProductModalV(){
            resetNewProductModel();
            $("#newProductModal").modal("show");
        },
        showEditProductModalV(product){
            this.editProduct=JSON.parse(JSON.stringify(product));
            $("#editProductModal").modal("show");
        },
        closeEditProductModalV(){
            $("#editProductModal").modal("hide");
        },
        closeNewProductModalV(){
            resetNewProductModel();
            $("#newProductModal").modal("hide");
        },

        transformInputNumberAsPositiveDecimalV(event){
            return transformInputNumberAsPositiveDecimal(event);
        },
        validatedPostFormV(){
            return !!this.newProduct.title && !!this.newProduct.price && Number(this.newProduct.price)>0  && !!this.newProduct.linkUrl && !!this.newProduct.coverFile && isValidHttpUrlNeedScheme(this.newProduct.linkUrl);
        },
        validatedEditPostFormV(){
            return !!this.editProduct.title && !!this.editProduct.price && Number(this.editProduct.price)>0 && this.editProductModalHadChange;

        },
        isSellerV(sellerBrandId){
            return sellerBrandId==this.getIdentity().brandId;
        },
        canRemovePostV(product){
            //  卖家权限最快，依然优先判断
            if (this.isSellerV(product.sellerBrandId)) return true;
            
            // 如果普通成员连发帖权限都没有，直接返回 false，省去日期解析
            if (!this.memberCanPost) return false;

            // 直接解析产品时间戳
            const createTime = new Date(product.createAt).getTime();
            
            // 一周的毫秒数常量：604800000, 大于一周，可以删除
            return (currentNow - createTime) >= 604800000;

        },
        copyFeedLinkUrlV(linkUrl){
            copyValueToClipboard(linkUrl);
        },
        openLinkV(linkUrl){
           window.open(linkUrl, '_blank');
        },
        retrieveFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.reloadPage(this.feedList_pagination);
        },
        captueItemDataV(itemId){
            captueItemDataBO(itemId);
        },
        fetchChannelGeneralInfoV(){
       
            AppApi.fetchChannelGeneralInfo(currentOch).then(response=>{
                if(response.data.code == 200){
                    const result=response.data.channel;
                    var guide= {enableMemberPost: "0"}
                    if(result && result.guide) {
                        guide = JSON.parse(result.guide);
                    } 
                    this.memberCanPost=guide.enableMemberPost=='1';

                    var title = !response.data.channel ? "链接商店" : response.data.channel.channelName;
                    document.title = title + " | bluvarri.com";
                }
            });
        },
        showMoreV(){
            showMore();
        },
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
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);

const linkShoppingApp = app.mount('#app');

window.linkShoppingAppPage = linkShoppingApp;

linkShoppingApp.pageInit(linkShoppingApp.feedList_pagination);
linkShoppingApp.fetchChannelGeneralInfoV();

async function captueItemData(itemId){
    const dto={
    }
    const url="/api/v1/app/link_shopping/product/{id}/data_science".replace("{id}",itemId);;
    return await axios.put(url,dto);
}

async function captueItemDataBO(itemId){
    return await captueItemData(itemId);
}

async function doPublishNewProduct(dto){
    var form = new FormData();
    form.append("title",dto.title);
    form.append("price",dto.price);
    form.append("linkUrl",dto.linkUrl);
    form.append("coverFile",dto.coverFile);
    form.append("channel",dto.channel);


    const url = "/api/v1/app/link_shopping/product/new";

    return await   axios.post(url, form);

}
async function doEditProduct(dto){

    const url = "/api/v1/app/link_shopping/product/edit";
    return await axios.put(url,dto);
  
}
async function changeProduct(appObj){
    return doEditProduct(appObj.editProduct);
}
async function deleteProduct(id){

    const url="/api/v1/app/link_shopping/product/{id}".replace("{id}",id);
    return await axios.delete(url);
  
}
async function deleteProductBO(id){
    return await deleteProduct(id);
  }

async function publishNewProduct(appObj){
    return await doPublishNewProduct(appObj.newProduct)
}



function resetNewProductModel(){
    linkShoppingApp.newProduct={
        linkUrl: "",
        title: "",
        price: "",
        linkCoverFileUrl: "",
        coverFile: "",
        channel: currentOch
    };
    document.getElementById("file_thumbnail").value=null;

}



function previewFeedThumbnail(e,appObj){

    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.newProduct.coverFile = file;

    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
  
    const feedThumbnailImgFile = new Image();
      feedThumbnailImgFile.onload = ()=> {
  
          // validate image pixel
          if(!(feedThumbnailImgFile.width>=99 && feedThumbnailImgFile.height>=99 && feedThumbnailImgFile.width<4096 && feedThumbnailImgFile.height<4096 && feedThumbnailImgFile.height * feedThumbnailImgFile.width <9437184)){
              console.log("current image: width=" + feedThumbnailImgFile.width + "  height="+feedThumbnailImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
   
  
          appObj.newProduct.linkCoverFileUrl = URL2;
  
  
      };
  
     feedThumbnailImgFile.src = URL.createObjectURL(file);
  
  }

function showMore(){
    if(linkShoppingApp.feedList_pagination.isLoading){
        return;
    }
    linkShoppingApp.feedList_pagination.current = linkShoppingApp.feedList_pagination.current +  1;
    linkShoppingApp.feedList_pagination.isLoading = true;

    linkShoppingApp.reloadPage(linkShoppingApp.feedList_pagination);

}