import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";



import { Picker } from 'emoji-picker-element';
import zh_CN from 'emoji-picker-element/i18n/zh_CN';

import axios from 'axios';


import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";
import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import { usePostInteract } from "./post-interact.js";
import { usePostRenderHelper } from "./post-render-template-helper.js";
import { formatTime,getFileIcon,formatFileSize,formatNumber } from "/common/javascripts/util.js";


import PostRenderTemploate from '/apps/viber/post-render-template.vue';





import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;
const sandboxEnv= getQueryVariable("sandbox");
const currentChannel = window.location.pathname.split('/').pop();
// URL正则表达式
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;



const AppViberPostEmbedFacetEnum = Object.freeze({
    "ATTACHMENT": "attachment",
    "IMAGE": "image",
    "THIRD_PARTY_IMAGE": "third_party_image",
    "THIRD_PARTY_VIDEO": "third_party_video",
    "THIRD_PARTY_AUDIO": "third_party_audio",
    "LINK": "link",
    "APPLICATION": "application"
});

const AppViberFileSceneEnum = Object.freeze({
    "ATTACHMENT": "attachment",
    "IMAGE": "image"
});

const RootComponent = {
    setup(){
        const { likePostV,cancelLikePostV, sharePostLinkV,publishOneCommentV,fetchUserCtaInfo,muteUser,unmuteUser } = usePostInteract();
        const { formatContentWithLinksV, postHasEmbedAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV } = usePostRenderHelper()

        return {
            likePostV,
            cancelLikePostV,
            sharePostLinkV,
            publishOneCommentV,
            fetchUserCtaInfo,
            muteUser,
            unmuteUser,
            formatContentWithLinksV, postHasEmbedAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV
        }

    },
    data() {


        return {

            reportOptions: [],
            reportForm: initReportForm(),

            hasAuth: true,
            isPublishingPost: false,
             
            userCtaInfo: {},
            ctaInfoLoadFinish: false,
            sandbox: !sandboxEnv ? "0" : sandboxEnv,
            newCommentObj: {
                postId: "",
                textMsg: ""
            },
            newPostObj: {
                textMsg: "",
                images: [],
                attachments: [],
                linkPreviewLoading: false
            },
            mainCommentComposerIsActive: false,
            commentComposerIsActive: false,
            commentsList: [],
            commentContent: "",
            postList_pagination: {
                url: "/api/v1/app/viber/feed/getFeed",
                size: 30,
                current: 1,
                total: 0,
                pages: 0,
                isLoading: false,
                records: [],
                paging: {},
                param: {
                  q: '',
                  sort: "4",
                  endAt: "",
                  channel: currentChannel
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.postList_pagination.size = response.feed.size;
                        this.postList_pagination.current = response.feed.current;
                        this.postList_pagination.total = response.feed.total;
                        this.postList_pagination.pages = response.feed.pages;
                        this.postList_pagination.records = response.feed.records;
                        this.postList_pagination.isLoading = false;
                        this.feedArr.push(...response.feed.records);
                    }
                    if(response.code == 40042){
                        this.hasAuth=false;
                    }
                }
            },
            feedArr: []
        }

    },
    methods: {

        hasAnyContentForCreatePostV(){
            return doQueryUploadingFacetForCreatePost(this.newPostObj)?.uploadingSomething || this.newPostObj.textMsg;
        },
        queryUploadingFacetForCreatePostV(){
            return doQueryUploadingFacetForCreatePost(this.newPostObj);
        },
        removeUploadedLocalAttachmentV(index){
            this.newPostObj.attachments.splice(index, 1);
            if(this.newPostObj.attachments?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        removeUploadedLocalImageV(index){
            this.newPostObj.images.splice(index, 1);
            if(this.newPostObj.images?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        removeUploadedThirdPartyImageV(index){
            this.newPostObj.embed?.images?.splice(index, 1);
            if(this.newPostObj.embed?.images?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        removeUploadedThirdPartyAudioV(index){
            this.newPostObj.embed?.audios?.splice(index, 1);
            if(this.newPostObj.embed?.audios?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        removeUploadedThirdPartyVideoV(index){
            this.newPostObj.embed?.videos?.splice(index, 1);
            if(this.newPostObj.embed?.videos?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        removeUploadedThirdPartyLinkV(index){
            this.newPostObj.embed?.links?.splice(index, 1);
            if(this.newPostObj.embed?.links?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        fetchUserCtaInfoV(oasisId,userId){
            this.ctaInfoLoadFinish=false;
            this.fetchUserCtaInfo(oasisId,userId).then(response=>{
                if(response.data.code == 200){
                  this.userCtaInfo=response.data.cta;
                  this.ctaInfoLoadFinish=true;
                }
            })
        },
        openLocalFileBrowserForAttachmentUploadV(){
            document.getElementById('attachmentUpload').click();
        },
        openLocalFileBrowserForImageUploadV(){
            document.getElementById('imageUpload').click();
        },
        handleAttachmentUploadForCreatePostV(e){
            handleAttachmentUploadForCreatePost(e);
        },
        handleImageUploadForCreatePostV(e){
            handleImageUploadForCreatePost(e);
        },
        delPostV(postId){
            delPost(postId);
        },
        muteUserV(channel,authorUserId){
            this.muteUser(channel,authorUserId).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("已禁言用户");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        unmuteUserV(channel,authorUserId){
            this.unmuteUser(channel,authorUserId).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("已解除禁言");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        searchPostListV(){
            this.postList_pagination.current=1;
            this.postList_pagination.param.endAt="";
            this.feedArr=[];
            this.reloadPage(this.postList_pagination);
        },
        initPostListV(){
            this.postList_pagination.current=1;
            this.postList_pagination.param.endAt="";
            this.postList_pagination.param.q="";

            this.feedArr=[];
            this.reloadPage(this.postList_pagination);
        },
        async createPostV(){
            this.isPublishingPost=true;
            await preHanderForPostAttachment(this.newPostObj);
            await preHanderForPostImage(this.newPostObj);
            await createPost(currentChannel,this.newPostObj.textMsg,this.newPostObj.embed).then(response=>{
                if(response.data.code == 200){
                    this.initPostListV();
                    $("#createPostModal").modal("hide");
                }
                if(response.data.code==40042){
                    const error="操作失败，可能原因：您已被禁言或已被移出部落";
                    customAlert.alert(error); 
                    return
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
            this.isPublishingPost=false;

        },
        detectAndPreviewLinkV(e){
            debounce(detectAndPreviewLink(this.newPostObj.textMsg), 500);
            this.autoHeightV(e);
        },
        autoHeightV(event){
            var elem = event.target;
            elem.style.height = "auto";
            elem.scrollTop = 0; // 防抖动
            
            elem.style.height = elem.scrollHeight + "px";
            if(elem.scrollHeight==0){
                elem.style.height=100 + "px";
            }
        },
        showCreatePostModalV() {
            const attachmentInputEl=document.getElementById('attachmentUpload');
            const imageInputEl=document.getElementById('imageUpload');
            if(attachmentInputEl) attachmentInputEl.value=null;
            if(imageInputEl) imageInputEl.value=null;

            this.newPostObj={
                textMsg: "",
                images: [],
                attachments: [],
                linkPreviewLoading: false
            }
            this.isPublishingPost=false;
            
            // init textarea
            var elem = document.getElementById("postContent");
            elem.style.height = "auto";
            elem.scrollTop = 0; // 防抖动
            elem.style.height=100 + "px";


            $("#createPostModal").modal("show");
        },
        closeCreatePostModalV() {
            $("#createPostModal").modal("hide");
        },
        showPostCommmentModalV(postId) {
            this.newCommentObj={
                postId: postId,
                textMsg: ""
            }
            $("#publishCommentModal").modal("show");
        },
        closePostCommmentModalV() {
            $("#publishCommentModal").modal("hide");
        },
        goStoryPageV(postId){
            const url =currentDomain+"/viber/post/"+postId;
            window.open(url, '_blank');
        },
        copyValueToClipboardV(copyContent){
          copyValueToClipboard(copyContent);
        },
        getFileIconV(fileName){
            return getFileIcon(fileName);
        },
        formatFileSizeV(fileSize){
            return formatFileSize(fileSize);
        },
        newReportCaseV(){
          newReportCase(this.reportForm).then(response=>{
              if(response.data.code==200){
  
              document.querySelector('#caseMaterialFile').value = null;
  
              $("#reportOasisModal").modal("hide"); // show success modal
  
              }
              if(response.data.code!=200){
                  customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
              }
          })
        },
        showOasisReportModalV(postId){
  
            this.reportForm=initReportForm();
            this.reportForm.sceneUrl = this.reportForm.sceneUrl+postId;
  
            showOasisReportModal(         
                this.loadReportIssueListV
            );
        },
        loadReportIssueListV(){
            loadReportIssueList(this);
        },
        validateReportFormV(){
          return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
        },
        formatTimeV(date){
            return formatTime(date);
        },
        formatNumberV(num){
            return formatNumber(num);
        },
        isPostAuthorV(authorUserId){
            return authorUserId==this.getIdentity().userId;
        }
        

    },
    mounted(){

        // 

        // init create post emoji picker

        const postPicker = new Picker({
            i18n: zh_CN,
            locale: 'zh_CN',
            dataSource: 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@%5E1/zh/emojibase/data.json'
        });
        document.getElementById("creat-post-emoji-picker").appendChild(postPicker);
        postPicker.classList.add('dark');

        const inputBox = document.getElementById("postContent");
        postPicker.addEventListener('emoji-click', event => {
            const emojiText= event.detail.emoji.unicode;
            inputBox.value = inputBox.value + emojiText;
            if(inputBox.tagName == 'P'){
              inputBox.innerHTML += emojiText;
            }

            inputBox.dispatchEvent(new Event('input')); // update v-model

       });

       
        const tooltipCanvas=document.querySelector('.emoji-picker-canvas');

        document.querySelector('#create-post-emoji-trigger').onclick = () => {
            tooltipCanvas.classList.toggle('shown')
        }  
        
        // init create post comment emoji picker
        const commentPicker = new Picker({
            i18n: zh_CN,
            locale: 'zh_CN',
            dataSource: 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@%5E1/zh/emojibase/data.json'
        });
        document.getElementById("creat-post-comment-emoji-picker").appendChild(commentPicker);
        commentPicker.classList.add('dark');

        const commentInputBox = document.getElementById("postCommment");
        commentPicker.addEventListener('emoji-click', event => {
            const emojiText= event.detail.emoji.unicode;
            commentInputBox.value = commentInputBox.value + emojiText;
            if(commentInputBox.tagName == 'P'){
                commentInputBox.innerHTML += emojiText;
            }

            commentInputBox.dispatchEvent(new Event('input')); // update v-model

       });

       
        const commentTooltipCanvas=document.querySelector('.comment-emoji-picker-canvas');

        document.querySelector('#create-comment-emoji-trigger').onclick = () => {
            commentTooltipCanvas.classList.toggle('shown')
        }  

    }
}


const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.component('post-render-temploate', PostRenderTemploate);


const storyHubPage = app.mount('#app');
window.wvStoryHubPage = storyHubPage;

storyHubPage.userAdapter(); // auth.js
storyHubPage.pageInit(storyHubPage.postList_pagination);



async function preHanderForPostAttachment(post){
    if (!post || post.attachments.length == 0 || post.embed?.facet !== AppViberPostEmbedFacetEnum.ATTACHMENT) {
        return
    }
    for (const attachment of post.attachments) {
        await uploadPostFile(attachment.rawFile, currentChannel, AppViberFileSceneEnum.ATTACHMENT).then(response => {
            if (response.data.code == 200) {
                const attachmentEmbedItem={
                    url: response.data.link,
                    fileName: attachment.fileName,
                    contentType: attachment.contentType,
                    size: attachment.size,
                }
                storyHubPage.newPostObj.embed.attachments.push(attachmentEmbedItem);
            }
        });
    }
}

async function preHanderForPostImage(post) {
    if (!post || post.images.length == 0 || post.embed?.facet !== AppViberPostEmbedFacetEnum.IMAGE) {
        return
    }
    for (const img of post.images) {
        await uploadPostFile(img.rawFile, currentChannel, AppViberFileSceneEnum.IMAGE).then(response => {
            if (response.data.code == 200) {
                const imageEmbedItem={
                    link: response.data.link,
                    innerUrl: response.data.link,
                    contentType: img.contentType,
                    type: 'file',
                    alt: img.alt,
                    size: img.size

                }
                storyHubPage.newPostObj.embed.images.push(imageEmbedItem);
            }
        });
    }
}

function handleAttachmentUploadForCreatePost(e){

    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingLocalAttachment){
        return;
    }

    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.ATTACHMENT,
            attachments: []
        }
    }

    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // 限制最夆5个附件
    const maxAttachments = 5;
    const remainingSlots = maxAttachments - storyHubPage.newPostObj.attachments.length;
    
    if (remainingSlots <= 0 || files.length>maxAttachments) {
        customAlert.alert('最多只能上传' + maxAttachments + '个附件');
        return;
    }
    
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
        // 验证文件大小 (最大50MB)
        if (file.size > 50 * 1024 * 1024) {
            customAlert.alert('附件大小不能超过50MB: ' + file.name);
            return;
        }

        const tmpAttachment={
            url: "",
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            rawFile: file

        }
        
        // 添加附件到列表
        storyHubPage.newPostObj.attachments.push(tmpAttachment);
    });
    
    
    // 清空 input 以便重复选择同一文件
    document.getElementById('attachmentUpload').value = '';
}
function handleImageUploadForCreatePost(e){

   const uploadingFacetInfo= queryUploadingFacetForCreatePost();

   if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingLocalImage){
      return;
   }

    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.IMAGE,
            images: []
        }
    }
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // 限制最多9张图片
    const maxImages = 9;
    const remainingSlots = maxImages - storyHubPage.newPostObj.images.length;
    
    if (remainingSlots <= 0 || files.length>maxImages) {
        customAlert.alert('最多只能上传' + maxImages + '张图片');
        return;
    }
    
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
        // 验证文件类型
        if (!file.type.match('image.*')) {
            customAlert.alert('请选择图片文件');
            return;
        }
        
        // 验证文件大小 (最大5MB)
        if (file.size > 5 * 1024 * 1024) {
            customAlert.alert('图片大小不能超过5MB: ' + file.name);
            return;
        }

        const tmpImage={
            alt: file.name,
            aspectRatio: {
                height: "",
                width: ""
            },
            contentType: file.type,
            innerUrl: "",
            link: "",
            size: file.size,
            rawFile: file

        }
        
        const reader = new FileReader();
        reader.onload = function(e) {

            var img = new Image();


            img.onload = function() {

                if(!(img.width<4096 && img.height<4096 && img.width*img.height<9437184 )){
                    customAlert.alert("图片单边长度不能超过4096像素,且总像素不能超过9437184: " + file.name);
                    return false;
                }
                // 这里可以获取图片的宽度和高度
                tmpImage.aspectRatio={
                    height: img.height,
                    width: img.width
                }
                tmpImage.link=e.target.result;
                tmpImage.innerUrl=e.target.result;
    
    
    
                storyHubPage.newPostObj.images.push(tmpImage);



            }


            img.src = e.target.result;

        };
        reader.readAsDataURL(file);
    });
    
    // 清空 input 以便重复选择同一文件
    document.getElementById('imageUpload').value = '';
}

// 从URL获取域名
function getDomainFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        return url;
    }
}

// 发表动态内容前置校验
function queryUploadingFacetForCreatePost(){
  const post=storyHubPage.newPostObj;
  return doQueryUploadingFacetForCreatePost(post);
}

function doQueryUploadingFacetForCreatePost(post){
    const uploadingLocalAttachment= post?.attachments?.length>0;
    const uploadingLocalImage=post?.images?.length>0;
    const uploadingThirdImage=post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_IMAGE && post?.embed?.images.length>0;
    const uploadingThirdAudio=post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_AUDIO && post?.embed?.audios.length>0;
    const uploadingThirdVideo=post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_VIDEO && post?.embed?.videos.length>0;
    const uploadingLink=post?.embed?.facet==AppViberPostEmbedFacetEnum.LINK && post?.embed?.links.length>0;
    const uploadingSomething=uploadingLocalAttachment || uploadingLocalImage || uploadingThirdImage || uploadingThirdAudio || uploadingThirdVideo || uploadingLink;
  
    return {uploadingSomething,uploadingLocalAttachment,uploadingLocalImage,uploadingThirdImage, uploadingThirdAudio,uploadingThirdVideo,uploadingLink}
  
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 检测并预览链接
async function detectAndPreviewLink(content) {
    const urls = content.match(urlRegex);
    if (!urls || urls.length === 0) {
        return;
    }
    

    // 取第一个链接进行预览
    const url = urls[0];
    
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();

    if(uploadingFacetInfo.uploadingSomething && uploadingFacetInfo.uploadingLocalImage){
        return;
    }
    if(uploadingFacetInfo.uploadingSomething && uploadingFacetInfo.uploadingLocalAttachment){
        return;
    }
    if(uploadingFacetInfo.uploadingSomething && uploadingFacetInfo.uploadingThirdVideo 
        && storyHubPage.newPostObj.embed.videos.filter(e=>e.url==url).length>0){
        return;
    }
    if(uploadingFacetInfo.uploadingSomething && uploadingFacetInfo.uploadingThirdAudio 
        && storyHubPage.newPostObj.embed.audios.filter(e=>e.url==url).length>0){
        return;
    }
    if(uploadingFacetInfo.uploadingSomething && uploadingFacetInfo.uploadingThirdImage 
        && storyHubPage.newPostObj.embed.images.filter(e=>e.link==url).length>0){
        return;
    }
    if(uploadingFacetInfo.uploadingSomething && uploadingFacetInfo.uploadingLink 
        && storyHubPage.newPostObj.embed.links.filter(e=>e.url==url).length>0){
        return;
    }

    // max num validate
    if(storyHubPage.newPostObj.embed?.videos?.length>=1){
        return
    }
    if(storyHubPage.newPostObj.embed?.audios?.length>=5){
        return
    }
    if(storyHubPage.newPostObj.embed?.images?.length>=9){
        return
    }
    if(storyHubPage.newPostObj.embed?.links?.length>=1){
        return
    }
    
    // 显示加载状态
    storyHubPage.newPostObj.linkPreviewLoading = true;

    try {
       await fetchLinkPreview(url);
    } catch (error) {
        console.error('获取链接预览失败:', error);
        // 显示基本链接预览
        parseLinkOnNotFoundData(url);
    }
    // 关闭加载状态
    storyHubPage.newPostObj.linkPreviewLoading = false;

}

// 获取链接预览数据
async function fetchLinkPreview(url) {

   await dofetchJsonLinkData(url).then(response=>{
        if(response.status == 200){
            parseLinkResponse(response.data);
        }
        if(response.status!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
   });

}

function parseLinkResponse(linkInfo){
    if(linkInfo.contentType.toLowerCase()=='text/html'){
      return  parseLinkTextResponse(linkInfo);
    }
    if(linkInfo.mediaType=='video'){
        return parseLinkVideoResponse(linkInfo);
    }
    if(linkInfo.mediaType=='audio'){
        return parseAudioResponse(linkInfo);
    }
    if(linkInfo.mediaType=='image'){
        return parseLinkImageResponse(linkInfo);
    }
    // application uri don't handle

}

function parseLinkImageResponse(linkInfo) {
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.facet!==AppViberPostEmbedFacetEnum.THIRD_PARTY_IMAGE){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.images.filter(e=>e.link==linkInfo.url).length>0){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.images.length>=9){
        customAlert.alert('最多支持9张图片');
        return
    }
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingThirdImage){
        return;
    }
    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.THIRD_PARTY_IMAGE,
            images: []
        }
    }
    const imageLink={
        link: linkInfo.url,
        innerUrl: linkInfo.url,
        contentType: linkInfo.contentType,
        type: 'exteral_link'
    }
    storyHubPage.newPostObj.embed.images.push(imageLink);
}
function parseAudioResponse(linkInfo){
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.facet!==AppViberPostEmbedFacetEnum.THIRD_PARTY_AUDIO){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.audios.filter(e=>e.url==linkInfo.url).length>0){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.audios.length>=5){
        customAlert.alert('最多支持5个音频内容');
        return
    }
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingThirdAudio){
        return;
    }
    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.THIRD_PARTY_AUDIO,
            audios: []
        }
    }
    const audioLink={
        url: linkInfo.url,
        contentType: linkInfo.contentType
    }
    storyHubPage.newPostObj.embed.audios.push(audioLink);
}
function parseLinkVideoResponse(linkInfo){
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.facet!==AppViberPostEmbedFacetEnum.THIRD_PARTY_VIDEO){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.videos.filter(e=>e.url==linkInfo.url).length>0){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.videos.length>=1){
        customAlert.alert('最多支持1个视频内容');
        return
    }
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingThirdVideo){
        return;
    }
    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.THIRD_PARTY_VIDEO,
            videos: []
        }
    }
    const videoLink={
        url: linkInfo.url,
        contentType: linkInfo.contentType
    }
    storyHubPage.newPostObj.embed.videos.push(videoLink);

}

function parseLinkOnNotFoundData(url){
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.facet!==AppViberPostEmbedFacetEnum.LINK){
        return
    }

    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.links.filter(e=>e.url==url).length>0){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.links.length>=1){
        // customAlert.alert('最多支持1个网页型内容');
        return
    }

    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingLink){
        return;
    }
    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.LINK,
            links: []
        }
    }


    const generalLink={
        url: url,
        title: getDomainFromUrl(url),
        description: url,
        image: null
    }
    storyHubPage.newPostObj.embed.links.push(generalLink);

}
async function parseLinkTextResponse(linkInfo){
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.facet!==AppViberPostEmbedFacetEnum.LINK){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.links.filter(e=>e.url==linkInfo.url).length>0){
        return
    }
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.links.length>=1){
        // customAlert.alert('最多支持1个网页型内容');
        return
    }
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingLink){
        return;
    }
    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.LINK,
            links: []
        }
    }

    const thumbnail= await parseGeneralLinkImage(linkInfo.images);
    const generalLink={
        url: linkInfo.url,
        title: linkInfo.title,
        description: linkInfo.description,
        image: thumbnail,
        mediaType: linkInfo.mediaType,
        contentType: linkInfo.contentType,
        domain: getDomainFromUrl(linkInfo.url)
    }
    storyHubPage.newPostObj.embed.links.push(generalLink);

  
}
async function parseGeneralLinkImage(images){
    var thumbnail="";

    for (let imageUrl of images) {

        try {
            const img = await loadImageAsync(imageUrl);
            if(img.width>300 && img.height>300){
                thumbnail=imageUrl
            }
        } catch (error) {
            console.error(error);
        }

    }

    return thumbnail;

}

async function loadImageAsync(src) {
    const img = new Image();
    img.src = src;
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;

    });

    console.log('Image has been loaded');
    return img;
}



async function doDeleteOnePost(postId){
    const url="/api/v1/app/viber/feed/post/{id}/del".replace("{id}",postId);
    return await axios.delete(url);
}
async function doCreateOnePost(dto) {
    const url="/api/v1/app/viber/feed/post/create";
    return await axios.post(url,dto);
}

async function dofetchJsonLinkData(link){
    const url=`/link/parse?url=${encodeURIComponent(link)}`;
    return await axios.get(url);
}

async function doUploadPostFile(file,channel,scene){
    var fd = new FormData();
    fd.append('file', file);
    fd.append('channel', channel);
    fd.append('scene', scene);

    const url="/api/v1/app/viber/feed/file/upload";
    return await axios.post(url, fd);

}

async function uploadPostFile(file,channel,scene){
    return await doUploadPostFile(file,channel,scene);
}



async function delPost(postId){
    doDeleteOnePost(postId).then(response=>{
        if(response.data.code == 200){
            storyHubPage.initPostListV();
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    })
}
async function  createPost(channel,textMsg,embed) {
    const dto={
        channel: channel,
        textMsg: textMsg
    }
    if(!$.isEmptyObject(embed)){
        dto.embed=embed;
    }
    return  await doCreateOnePost(dto)
}



// 使用传统的滚动监听
const container = document.querySelector(".app-container");
window.addEventListener('scroll', ()=>{
    if (storyHubPage.postList_pagination.isLoading) return;
    const alreadyBottom = Math.ceil(container.clientHeight + container.scrollTop + 300) >= container.scrollHeight;
    const hasMore = storyHubPage.postList_pagination.current + 1 <= storyHubPage.postList_pagination.pages;
    if (alreadyBottom && hasMore) {
        storyHubPage.postList_pagination.isLoading = true;
        storyHubPage.postList_pagination.current++;
        storyHubPage.reloadPage(storyHubPage.postList_pagination);
    }
});







 // report feature

 function initReportForm(){
  
    if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
       document.querySelector('#caseMaterialFile').value = null;
    }

    return {
        fraudType: "",
        scene: "Viber帖子",
        sceneUrl: currentDomain+"/viber/post/",
        caseDesc: "",
        material: ""
    }
}

async function newReportCase(reportForm) {

    const materialFile = $('#caseMaterialFile')[0].files[0];

    var form = new FormData();
    if (!!materialFile) {
        form.append("material", materialFile);
    }
    form.append("fraudType", reportForm.fraudType);
    form.append("scene", reportForm.scene);
    form.append("sceneUrl", reportForm.sceneUrl);
    form.append("caseDesc", reportForm.caseDesc);
    return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj) {
    const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE, "");
    var data = await response.json();
    if (data.code == 200) {

        appObj.reportOptions = data.codes.records;

    }
}

async function showOasisReportModal(loadReportIssueListV) {
    await loadReportIssueListV();
    $("#reportOasisModal").modal("show");
}
