import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";

let customAlert = new CustomAlertModal();

const currentOch = getQueryVariable("och");

const RootComponent = {
    data() {
        return {
            generalHadChange: false,
            historyGeneral: {},
            general: {
                channelName: "",
                channelDesc: ""
            },
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
            focusModal:{
                message: "",
                confirmHandler:()=>{
      
                }
            },
            feedList_pagination: {
                url: "/api/v1/app/link_shopping/product/list",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
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
                        this.feedList_pagination.paging = this.doPaging({current: response.feed.current, pages: response.feed.pages, max: 5});

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

                    // change sort to time 
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
        retrieveFeedListV(){
            // refrest feed list
            this.feedList_pagination.param.q="";
            this.feedList_pagination.current=1;
            this.reloadPage(this.feedList_pagination);
        },
        filterFeedListV(){
            this.feedList_pagination.current=1;
            this.reloadPage(this.feedList_pagination);
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
        showDeleteFocusModalV(id){
            this.focusModal.message="注意，商品数据删除后不可恢复！";
            this.focusModal.confirmHandler=()=>{
              deleteProductBO(id).then(response=>{
                if(response.data.code==200){

                 this.feedList_pagination.records = this.feedList_pagination.records.filter(item => item.id !== id);
                  $("#focusModal").modal("hide"); // hide modal
    
                }
                if(response.data.code!=200){
                  const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                  customAlert.alert(error); 
                }
                
              }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
              });
            }
            $("#focusModal").modal("show"); // show modal
          },
        showSettingAppInfoModalV(){
            this.general=JSON.parse(JSON.stringify(this.historyGeneral));
            this.generalHadChange=false;
            $("#settingAppInfoModal").modal("show");
        },
        fetchChannelGeneralInfoV(){
            const och=getQueryVariable("och");
            AppApi.fetchChannelGeneralInfo(och).then(response=>{
                if(response.data.code == 200){
                    this.historyGeneral= !response.data.channel ? {} : response.data.channel;
                    var title = !response.data.channel ? "" : response.data.channel.channelName;
                    document.title = title + " | 链接商店后台";
                }
            });
        },
        modifyChannelGeneralInfoV(){
            const och=getQueryVariable("och");

            modifyChannelGeneralInfo(och,this.general.channelName,this.general.channelDesc).then(response=>{
                if(response.data.code == 200){
                    this.historyGeneral=JSON.parse(JSON.stringify(this.general));
                    $("#settingAppInfoModal").modal("hide");
                    document.title = this.general.channelName + " | 链接商店后台";
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
        },
        shareStoreV(){
            const och=getQueryVariable("och");
            const storeLink=window.location.origin + "/apps/link-shopping/"+och;
            copyValueToClipboard(storeLink);
        },
        transformInputNumberV(event){
            var val = event.target.value.match(/\d+(\.\d{0,2})?/) ? event.target.value.match(/\d+(\.\d{0,2})?/)[0] : '';// type positve number
            var max = event.target.max;
            event.target.value = transformInputNumber(val, max);
            const firstCodeIsZero= e.data=='0' && !e.target.value;
            const supportCodes = ["0", "1", "2","3","4","5","6","7","8","9","."];
            const needUpdate = firstCodeIsZero || (val !== Number(e.target.value)) || (!!e.data && !supportCodes.includes(e.data));

            if(needUpdate){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        },
        validatedPostFormV(){
            return !!this.newProduct.title && !!this.newProduct.price && Number(this.newProduct.price)>0  && !!this.newProduct.linkUrl && !!this.newProduct.coverFile && isValidHttpUrlNeedScheme(this.newProduct.linkUrl);
        },
        validatedEditPostFormV(){
            return !!this.editProduct.title && !!this.editProduct.price && Number(this.editProduct.price)>0 && this.editProductModalHadChange;

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
app.mixin(new Auth({need_permission : true,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);


const linkShopping = app.mount('#app');

window.linkShoppingPage = linkShopping;

linkShopping.fetchChannelGeneralInfoV();
// init 
linkShopping.pageInit(linkShopping.feedList_pagination);


async function doModifyChannelGeneralInfo(dto){
    const url="/api/v1/team/oasis/channel/general";
    return await axios.put(url,dto);
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
async function modifyChannelGeneralInfo(och,channelName,channelDesc){
    const dto={
        oasisChannelId: och,
        channelName,
        channelDesc
    }
    return doModifyChannelGeneralInfo(dto);
}




function resetNewProductModel(){
    linkShopping.newProduct={
        linkUrl: "",
        title: "",
        price: "",
        linkCoverFileUrl: "",
        coverFile: "",
        channel: currentOch
    };
    document.getElementById("file_thumbnail").value=null;

}




function transformInputNumber(val,max){
    return  Number(val) > Number(max) ? max : val.split('').pop() === '.' || !val || val === '0.0' ? val : Number(val);
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


 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});