import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { Ftime,formatCmpctNumber } from "/common/javascripts/util.js";

let customAlert = new CustomAlertModal();

const sandboxEnv= getQueryVariable("sandbox");
const currentOch = window.location.pathname.split('/').pop();
const RootComponent = {
    data() {
      return {
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        oasisRole: [],
        currentUserBrandId: "",
        newCard:{
            linkUrl: "",
            title: "",
            subtitle: "",
            linkCoverFileUrl: "",
            coverFile: "",
            channel: currentOch
        },
        guide: {
            layout: "",
            postStrategy: ""
        },
        feedArr: [],
        feedList_pagination: {
            url: "/api/v1/app/card/list",
            size: 24,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            isLoading: false,
            param: {
              q: '',
              sort: "2",
              filter: "",
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
        focusModal:{
            message: "",
            confirmHandler:()=>{

            }
        },
      }
    },
    methods: {
        formatCmpctNumberV(number){
            if(!number || Number(number)==0){
                return "";
            }

            return formatCmpctNumber(Number(number));
        },
        copyFeedLinkUrlV(linkUrl){
            copyValueToClipboard(linkUrl);
        },
        showDeleteFocusModalV(id){
            this.focusModal.message="注意，本内容删除后不可恢复！";
            this.focusModal.confirmHandler=()=>{
              this.removeFeedV(id);
            }
            $("#focusModal").modal("show"); // show modal
        },
        removeFeedV(id){
            removeFeed(id).then(response=>{
                if(response.data.code == 200){
      
                  this.feedArr = this.feedArr.filter(item => item.id !== id);
                  $("#focusModal").modal("hide"); // hide modal

      
                }
                if(response.data.code!=200){
                  const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                  customAlert.alert(error);
                }
              })
        },
        markResouceV(feed,targetAvailable){
            markResouce(targetAvailable,feed.id).then(response=>{
                if(response.data.code == 200){
      
                  feed.available = targetAvailable;
      
                }
                if(response.data.code!=200){
                  const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                  customAlert.alert(error);
                }
            })
        },
        showMoreV(){
            showMore();
        },
        previewFeedThumbnailV(e){
            previewFeedThumbnail(e,this);
        },
        showNewCardModalV(){
            resetNewCardFeedModel();
            $("#newCardModal").modal("show");
        },
        closeNewCardModalV(){
            resetNewCardFeedModel();
            $("#newCardModal").modal("hide");
        },
        fetchChannelGiudeInfoV(){

            fetchChannelGiudeInfo(currentOch).then(response=>{
                if(response.data.code == 200){
                    this.guide=response.data.guide;
                }
            })
        },
        retrieveFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.reloadPage(this.feedList_pagination);
        },
        fetchOasisRoleInfoV(){
            const brandId = this.getIdentity().brandId;
            fetchOasisRoleInfo(currentOch,brandId).then(response=>{
               if(response.data.code == 200){
                 this.oasisRole = response.data.role.tier;
               }
            })
        },
        isChannelAdminRoleV(){
            return this.oasisRole.filter(e=> e == "admin").length>0;
        },
        getPublishTimeV(date){
    
            var timespan = (new Date(date)).getTime()/1000;
             return Ftime(timespan);
         },
        isFeedAuthorRoleV(authorBrandId){
           return authorBrandId == this.currentUserBrandId;
        },
        validatedPostFormV(){
            return !!this.newCard.title && !!this.newCard.subtitle && !!this.newCard.linkUrl && !!this.newCard.coverFile && isValidHttpUrlNeedScheme(this.newCard.linkUrl);
        },
        captueFeedDataV(feedId){
            captueFeedDataBO(feedId);
        },
        newCardV(){
            publishNewFeed(this).then(response=>{
                if(response.data.code==200){
                    this.closeNewCardModalV();

                    // refrest feed list
                    this.feedList_pagination.param.q="";
                    this.feedList_pagination.param.sort="2";
                    this.feedList_pagination.param.filter="";
                    this.feedList_pagination.current=1;
                    this.retrieveFeedListV();

                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
             });
        }
    },
    created(){
        this.currentUserBrandId = this.getIdentity().brandId;
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
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const galleryApp = app.mount('#app');

window.galleryAppPage = galleryApp;

galleryApp.fetchChannelGiudeInfoV();
galleryApp.pageInit(galleryApp.feedList_pagination);
galleryApp.fetchOasisRoleInfoV();

async function getChannelGiudeInfo(channel){
    const url="/api/v1/app/card/channel_guide/{id}".replace("{id}",channel);
    return await axios.get(url);
}

async function deleteFeed(feedId){
    const url="/api/v1/app/card/feed/{id}".replace("{id}",feedId);
    return await axios.delete(url);
}

async function doMarkResouce(available,id){
    const dto={
      id: id,
      available: available
    }
    const url="/api/v1/app/card/feed/toogle_available";
    return await axios.put(url,dto);
}

async function captueFeedData(feedId){
    const dto={
    }
    const url="/api/v1/app/card/feed/{id}/data_science".replace("{id}",feedId);;
    return await axios.put(url,dto);
}
async function doFetchOasisRoleInfo(params){
    const url = "/api/open/app/oasis/role";
    return await axios.get(url,{params});
}
async function fetchOasisRoleInfo(channel,brandId){
    const params = {
      channel: channel,
      brandId: brandId
    }
    return await doFetchOasisRoleInfo(params);
  }

async function captueFeedDataBO(feedId){
  return await captueFeedData(feedId);
}
async function markResouce(available,id){
    return await doMarkResouce(available,id);
}

async function doPublishNewFeed(dto, coverFile){
      var form = new FormData();
      form.append("title",dto.title);
      form.append("subtitle",dto.subtitle);
      form.append("linkUrl",dto.linkUrl);
      form.append("coverFile",coverFile);
      form.append("channel",dto.channel);
  
  
      const url = "/api/v1/app/card/new_feed";
  
      return await   axios.post(url, form);
  
}

async function removeFeed(feedId){
    return await deleteFeed(feedId);
}

async function publishNewFeed(appObj){
    return await doPublishNewFeed(appObj.newCard, appObj.newCard.coverFile)
}

async function fetchChannelGiudeInfo(channel){
    return await getChannelGiudeInfo(channel);
}

function showMore(){
    if(galleryApp.feedList_pagination.isLoading){
        return;
    }
    galleryApp.feedList_pagination.current = galleryApp.feedList_pagination.current +  1;
    galleryApp.feedList_pagination.isLoading = true;

    galleryApp.reloadPage(galleryApp.feedList_pagination);

}

function resetNewCardFeedModel(){

    galleryApp.newCard={
            linkUrl: "",
            title: "",
            subtitle: "",
            linkCoverFileUrl: "",
            coverFile: "",
            channel: currentOch
    };
    document.getElementById("file_thumbnail").value=null;

    // set thumbnail preview mode
    var element = document.getElementById("link-cover-preview-box");
    if(!element.classList.contains(galleryApp.guide.layout)){
        element.classList.add(galleryApp.guide.layout)
    }
  
}


function previewFeedThumbnail(e,appObj){

    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.newCard.coverFile = file;

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
          if(!(feedThumbnailImgFile.width>=99 && feedThumbnailImgFile.height>=99 && feedThumbnailImgFile.width<4096 && feedThumbnailImgFile.height<4096 && feedThumbnailImgFile.width*feedThumbnailImgFile.height<9437184)){
              console.log("current image: width=" + feedThumbnailImgFile.width + "  height="+feedThumbnailImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
   
  
          appObj.newCard.linkCoverFileUrl = URL2;
  
  
      };
  
     feedThumbnailImgFile.src = URL.createObjectURL(file);
  
  }