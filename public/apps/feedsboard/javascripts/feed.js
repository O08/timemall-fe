import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import Pagination  from "/common/javascripts/pagination-vue.js";
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import { getQueryVariable } from "/common/javascripts/util.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";

import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

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


const currentFeedId= window.location.pathname.split('/').pop();
const currentChannel= window.location.pathname.split('/').at(-2);
const sandboxEnv= getQueryVariable("sandbox");

const RootComponent = {
    data() {
      return {
        btn_ctl: {
          material_uploading: false
        },
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        newFeedComment:{
          feedId: currentFeedId,
          content: "",
          safeMode: "0"
        },
        attachmentsArr: [],
        commentArr: [],
        commentList_pagination: {
          url: "/api/open/v1/app/feed/comment/list",
          size: 20,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          isLoading: false,
          param: {
            feedId: currentFeedId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.commentList_pagination.size = response.comment.size;
                  this.commentList_pagination.current = response.comment.current;
                  this.commentList_pagination.total = response.comment.total;
                  this.commentList_pagination.pages = response.comment.pages;
                  this.commentList_pagination.records = response.comment.records;
                  this.commentList_pagination.isLoading = false;
                  this.commentArr.push(...response.comment.records);
                  // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
              }
          }
      },
        editFeedObj: {
          id: "",
          title: "",
          preface: "",
          richMediaContent: "",
          ctaPrimaryLabel: "",
          ctaSecondaryLabel: "",
          ctaPrimaryUrl: "",
          ctaSecondaryUrl: "",
          coverUrl: ""
        },
        historyFeed:{
          id: "",
          title: "",
          preface: "",
          richMediaContent: "",
          ctaPrimaryLabel: "",
          ctaSecondaryLabel: "",
          ctaPrimaryUrl: "",
          ctaSecondaryUrl: "",
          coverUrl: ""
        },
        focusModal:{
          message: "",
          confirmHandler:()=>{

          }
        },
        oasisRole: []
      }
    },
    methods: {
      findFeedAttachmemtsV(){
        findFeedAttachmemts(currentFeedId).then(response=>{
          if(response.data.code == 200){

            this.attachmentsArr=response.data.attachments;

          }
        })
      },
      uploadAttachmentV(e){
        uploadAttachment(e,this);
      },
      deleteAttachmentV(id){
        deleteAttachment(id).then(response=>{
          if(response.data.code == 200){

            this.findFeedAttachmemtsV();

          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }
        })
      },
      previewFeedCoverV(e){
        previewFeedCover(e,this);
       },
       reSelectFeedCoverFileV(){
         $("#file_cover").trigger("click");
       },
       removeFeedCoverFileV(){
        document.getElementById("file_cover").value=null;
        this.editFeedObj.coverUrl = "";
        removeFeedCover().then(response=>{
          if(response.data.code == 200){

            this.fetchFeedInfoV();

          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }
        })
       },
      showEditFeedModalV(){
        resetEditFeedModel(this.historyFeed);
        $("#editFeedModal").modal("show");
       },
       closeEditFeedModalV(){

        resetEditFeedModel(this.historyFeed);
        $("#editFeedModal").modal("hide");
       },
       changeFeedV(){

        changeFeed(this).then(response=>{

          if(response.data.code == 200){

            this.closeEditFeedModalV();
            this.fetchFeedInfoV();

          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }

        });
       },
      fetchFeedInfoV(){
        fetchFeedInfoBO(currentFeedId).then(response=>{
          if(response.data.code == 200){

             this.historyFeed=response.data.feed;
             document.title = !!this.historyFeed ? this.historyFeed.title + " | Feed" : "访问的内容不存在或已被删除";

          }
        });
      },
      showDeleteFocusModalV(){
        this.focusModal.message="注意，帖子删除后不可恢复！";
        this.focusModal.confirmHandler=()=>{
          deleteFeedBO(currentFeedId).then(response=>{
            if(response.data.code==200){
              this.fetchFeedInfoV();
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
      highlightFeedV(){
        this.historyFeed.highlight= this.historyFeed.highlight=='0' ? '1' : '0';
        highlightFeedBO(this.historyFeed.highlight,currentFeedId);
      },
      pinFeedV(){

        this.historyFeed.pin= this.historyFeed.pin=='0' ? '1' : '0';
        pinFeedBO(this.historyFeed.pin,currentFeedId);

      },
      manageCommentFeatureV(){

        this.historyFeed.commentTag= this.historyFeed.commentTag=='0' ? '1' : '0';
        manageCommentFeature(this.historyFeed.commentTag ,currentFeedId);

      },
      publishNewFeedCommentV(){
        if(!this.newFeedComment.content){
          return;
        }
        publishNewFeedComment(this).then(response=>{
          if(response.data.code==200){
            this.newFeedComment.content="";// reset
            this.newFeedComment.safeMode="0";
            this.commentArr = [];
            this.commentList_pagination.current=1;

            this.reloadPage(this.commentList_pagination);

            var textarea = $('#input_comment');
            textarea.css("height","61px");


          }
        });
      },
      deleteFeedCommentV(id){
        deleteFeedComment(id).then(response=>{
          if(response.data.code==200){
            // remove comment from comment list
            this.commentArr = this.commentArr.filter(item => item.id !== id)

          }
        })
      },
      fetchOasisRoleInfoV(){
        const brandId = this.getIdentity().brandId;
        fetchOasisRoleInfo(currentChannel,brandId).then(response=>{
           if(response.data.code == 200){
             this.oasisRole = response.data.role.tier;
           }
        })
      },
      isChannelAdminRoleV(){
        return this.oasisRole.filter(e=> e == "admin").length>0;
      },
      isFeedAuthorRoleV(){
        const brandId = this.getIdentity().brandId;
        return this.historyFeed.authorBrandId == brandId;
      },
      refreshPageV(){
        window.location.reload();
      },
      copyPostUrlV(){
        const postUrl = EnvWebsite.PROD+"/fb/" + currentChannel + "/" + currentFeedId;
        copyValueToClipboard(postUrl);
      },
      autoHeightV(event){
        var elem = event.target;
        elem.style.height = "auto";
        elem.scrollTop = 0; // 防抖动
        
        elem.style.height = elem.scrollHeight + "px";
        if(elem.scrollHeight==0){
            elem.style.height=61 + "px";
        }
        if(elem.scrollHeight>128){
            elem.style.height=128 + "px";
        }
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
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const feedPage = app.mount('#app');

window.feedPage = feedPage;

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


feedPage.fetchFeedInfoV();
feedPage.pageInit(feedPage.commentList_pagination);
feedPage.fetchOasisRoleInfoV();
feedPage.findFeedAttachmemtsV();

async function fetchFeedInfo(feedId){
  const url="/api/open/v1/app/feed/{id}".replace("{id}",feedId);
  return await axios.get(url);
}

async function deleteFeed(feedId){

  const url="/api/v1/app/feed/{id}".replace("{id}",feedId);
  return await axios.delete(url);

}
async function deleteFeedCover(feedId){
  const url="/api/v1/app/feed/{id}/cover".replace("{id}",feedId);
  return await axios.delete(url);
}
async function doEditFeed(dto){

  const url = "/api/v1/app/feed/edit";
  return await axios.put(url,dto);

}

async function doHighlightFeed(tag,feedId){
  const dto={
    feedId: feedId,
    tag: tag
  }
  const url="/api/v1/app/feed/toggle_highlight";
  return await axios.put(url,dto);
}
async function doPinFeed(tag,feedId){
  const dto={
    feedId: feedId,
    tag: tag
  }
  const url="/api/v1/app/feed/toggle_pin";
  return await axios.put(url,dto);
}

// close or open comment feature
async function doManageCommentFeature(tag,feedId){
  const dto={
    feedId: feedId,
    tag: tag
  }
  const url="/api/v1/app/feed/toggle_comment";
  return await axios.put(url,dto);
}

async function doChangeFeedCover(feedId,files){
  var fd = new FormData();
  fd.append('coverFile', files);
  const url = "/api/v1/app/feed/{id}/cover".replace("{id}",feedId);
  return await axios.put(url, fd);
}

async function doPublishNewComment(dto){

  const url ="/api/v1/app/feed/comment/new";
  return await axios.post(url,dto);

}

async function doDeleteFeedComment(id){

  const url="/api/open/v1/app/feed/comment/{id}".replace("{id}",id);
  return await axios.delete(url);

}
async function doFetchOasisRoleInfo(params){
  const url = "/api/open/app/oasis/role";
  return await axios.get(url,{params});
}

async function doFetchAttachments(feedId){
  const url="/api/open/v1/app/feed/{id}/attachments".replace("{id}",feedId);
  return await axios.get(url);
}
async function doUploadAttachment(file,feedId){
  var fd = new FormData();
  fd.append('feedId', feedId);
  fd.append('attachment', file);
  const url = "/api/v1/app/feed/attachment/add";
  return await axios.post(url, fd);
}
async function doDeleteAttachment(id){
  const url="/api/v1/app/feed/attachment/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function deleteAttachment(id){
  return await doDeleteAttachment(id);
}
async function findFeedAttachmemts(feedId){
  return await doFetchAttachments(feedId);
}
async function removeFeedCover(){
  return await deleteFeedCover(currentFeedId);
}
async function changeFeedCover(){
  const coverFile = document.getElementById("file_cover").files[0];
  return await doChangeFeedCover(currentFeedId,coverFile);
}
async function fetchOasisRoleInfo(channel,brandId){
  const params = {
    channel: channel,
    brandId: brandId
  }
  return await doFetchOasisRoleInfo(params);
}
async function highlightFeedBO(tag,feedId){

  return await doHighlightFeed(tag,feedId);

}
async function pinFeedBO(tag,feedId){
  return await doPinFeed(tag,feedId);
}
async function fetchFeedInfoBO(feedId){
  return await fetchFeedInfo(feedId);
}

async function deleteFeedBO(feedId){
  return await deleteFeed(feedId);
}

async function manageCommentFeature(tag,feedId){
  return await doManageCommentFeature(tag,feedId);
}

async function publishNewFeedComment(appObj){
  
  return await doPublishNewComment(appObj.newFeedComment);
}

async function deleteFeedComment(id){
  return await doDeleteFeedComment(id);
}

async function changeFeed(appObj){
  if(!quill.getText().trim()){
    customAlert.alert("需要输入帖子正文！")
    return;
 }
 if(!appObj.editFeedObj.title){
   customAlert.alert("需要输入帖子标题！")
   return;
 }

 if(!!appObj.editFeedObj.ctaPrimaryUrl && !isValidHttpUrlNeedScheme(appObj.editFeedObj.ctaPrimaryUrl )){
  customAlert.alert("优选CTA链接无效，需要调整！")
  return;
 }
 if(!!appObj.editFeedObj.ctaSecondaryUrl && !isValidHttpUrlNeedScheme(appObj.editFeedObj.ctaSecondaryUrl )){
  customAlert.alert("次选CTA链接无效，需要调整！")
  return;
 }


 appObj.editFeedObj.richMediaContent = quill.getSemanticHTML();


  // max length == 60000
  if(appObj.editFeedObj.richMediaContent.length>60000){
    customAlert.alert("帖子正文内容长度超出容量，需要重新调整！")
    return;
  }

 
  return await doEditFeed(appObj.editFeedObj);

}
function resetEditFeedModel(feed){

  feedPage.editFeedObj=JSON.parse(JSON.stringify(feed));
  feedPage.editFeedObj.id=currentFeedId;
   quill.root.innerHTML = '';
   quill.clipboard.dangerouslyPasteHTML(0, feedPage.editFeedObj.richMediaContent);  
  
}

function previewFeedCover(e,appObj){

  const file = e.target.files[0];

  const URL2 = URL.createObjectURL(file);

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
      customAlert.alert("图片最大为6M!");
      return false;
  }

  const feedCoverImgFile = new Image();
    feedCoverImgFile.onload = ()=> {

        // validate image pixel
        if(!(feedCoverImgFile.width>=99 && feedCoverImgFile.height>=99 && feedCoverImgFile.width<4096 && feedCoverImgFile.height<4096 && feedCoverImgFile.width*feedCoverImgFile.height<9437184)){
            console.log("current image: width=" + feedCoverImgFile.width + "  height="+feedCoverImgFile.height);
            customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
            return false;
        }
 


        // upload feed cover file
        changeFeedCover().then(response=>{

          if(response.data.code == 200){
            appObj.editFeedObj.coverUrl = URL2;
            appObj.fetchFeedInfoV();
          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }
        })


    };

   feedCoverImgFile.src = URL.createObjectURL(file);

}

const container = document.querySelector("micro-app");


container.onscroll = () => {
  if (feedPage.commentList_pagination.isLoading) return;

  const alreadyBottom = Math.ceil(container.clientHeight + container.scrollTop + 300) >= container.scrollHeight;
  const hasMore = feedPage.commentList_pagination.current +1 <= feedPage.commentList_pagination.pages;


  if (alreadyBottom && hasMore) {
    feedPage.commentList_pagination.isLoading= true;
    feedPage.commentList_pagination.current++;
    feedPage.reloadPage(feedPage.commentList_pagination);
  }
};


function uploadAttachment(e, appObj) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }


  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 50; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("文件最大为50M!");
    return false;
  }

  appObj.btn_ctl.material_uploading = true;

  // upload product cover file
  doUploadAttachment(file,currentFeedId).then(response => {

    if (response.data.code == 200) {


      appObj.findFeedAttachmemtsV();

    }
    if (response.data.code != 200) {
      const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
      customAlert.alert(error);
    }
    appObj.btn_ctl.material_uploading = false;

    var fileInputEl=document.getElementById("feed_attachment_file");
    if(!!fileInputEl){
      fileInputEl.value=null;
    }

  })

}