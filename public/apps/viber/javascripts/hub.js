import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";


import { Picker } from 'emoji-picker-element';
import zh_CN from 'emoji-picker-element/i18n/zh_CN';

import axios from 'axios';

import { Drag, DropList } from "vue-easy-dnd";

import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {EnvWebsite,AppViberPostEmbedFacetEnum,AppViberFileSceneEnum} from "/common/javascripts/tm-constant.js";
import { usePostInteract } from "./post-interact.js";
import { usePostRenderHelper } from "./post-render-template-helper.js";
import { formatTime,getFileIcon,formatFileSize,formatNumber } from "/common/javascripts/util.js";
import { useAliyunOssUtil } from "./file-upload-util.js";
import { useDspReportUtil } from "/common/javascripts/dsp-report-util.js";

import { comicEditorMethods } from './comic-editor-methods.js';

import PostRenderTemploate from '/apps/viber/post-render-template.vue';

import { ViberBaseApi } from "./viber-base-api.js";





import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;
const sandboxEnv= getQueryVariable("sandbox");
const currentChannel = window.location.pathname.split('/').pop();
// URL正则表达式
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

const {uploadSingleFileToOSS,uploadPostFile} = useAliyunOssUtil();

const { showOasisReportModal,loadReportIssueList,newReportCase,initReportForm } = useDspReportUtil("Viber帖子",currentDomain+"/viber/post/");

const RootComponent = {
    components: {
        Drag,
        DropList
    },
    setup(){
        const { likePostV,cancelLikePostV, sharePostLinkV,publishOneCommentV,fetchUserCtaInfo,muteUser,unmuteUser } = usePostInteract();
        const { formatContentWithLinksV, postHasEmbedThirdAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV } = usePostRenderHelper()

        return {
            likePostV,
            cancelLikePostV,
            sharePostLinkV,
            publishOneCommentV,
            fetchUserCtaInfo,
            muteUser,
            unmuteUser,
            formatContentWithLinksV, postHasEmbedThirdAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV
        }

    },
    data() {


        return {

            reportOptions: [],
            reportForm: initReportForm(),

            hasAuth: true,
            isPublishingPost: false,
            isPublishingComicPost: false,
             
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
                videos: [],
                audios: [],
                linkPreviewLoading: false
            },
            newComicPostObj: {
                textMsg: "",
                title: "",
                genre: "",
                cover: "",
                chapter: "",
                images: [],
                coverRawFile: ""
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
                        // 过滤掉 feedArr 中已经存在的 postId
                        const newRecords = response.feed.records;
                        const uniqueRecords = newRecords.filter(newItems => 
                            !this.feedArr.some(oldItem => oldItem.postId === newItems.postId)
                        );
                        if (uniqueRecords.length > 0) {
                            this.feedArr.push(...uniqueRecords);
                        }
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

        ...comicEditorMethods,

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
        removeUploadedLocalVideoV(index){
            const videoToDelete = this.newPostObj.videos[index];
            if (videoToDelete) {
                // 2. Critical: Revoke the specific blob URL to free up memory
                if (videoToDelete.url && videoToDelete.url.startsWith('blob:')) {
                    URL.revokeObjectURL(videoToDelete.url);
                }

                if (videoToDelete.poster && videoToDelete.poster.startsWith('blob:')) {
                    URL.revokeObjectURL(videoToDelete.poster);
                }
        
                // 3. Remove the item from the array
                this.newPostObj.videos.splice(index, 1);
            }

            if(this.newPostObj.videos?.length==0){
                this.newPostObj.embed=undefined;
            }
        },
        removeUploadedLocalAudioV(index){
            const audioToDelete = this.newPostObj.audios[index];
            if (audioToDelete) {
                // 2. Memory Cleanup: Revoke the local URL to prevent leaks
                if (audioToDelete.url && audioToDelete.url.startsWith('blob:')) {
                    URL.revokeObjectURL(audioToDelete.url);
                }
        
                // 3. Remove the specific audio
                this.newPostObj.audios.splice(index, 1);
            }
            if(this.newPostObj.audios?.length==0){
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
        openLocalFileBrowserV(id) {
            const el = document.getElementById(id);
            if (el) {
                el.click();
            } else {
                console.warn(`未找到 ID 为 [${id}] 的上传控件`);
            }
        },
        handleAttachmentUploadForCreatePostV(e){
            handleAttachmentUploadForCreatePost(e);
        },
        handleImageUploadForCreatePostV(e){
            handleImageUploadForCreatePost(e);
        },
        handleVideoUploadForCreatePostV(e){
            handleVideoUploadForCreatePost(e);
        },
        handleAudioUploadForCreatePostV(e){
            handleAudioUploadForCreatePost(e);
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
            try {
                await preHanderForCreatePost(this.newPostObj);
                await ViberBaseApi.createPost(currentChannel,this.newPostObj.textMsg,this.newPostObj.embed).then(response=>{
                    if(response.data.code == 200){
                        afterCompletionForCreatePost(this.newPostObj);
                        const newFeed = response.data.post;
                        this.feedArr.unshift(newFeed);

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
            }catch (error) {
                const errorMsg = error.message || "Network error, please try again.";
                customAlert.alert(`操作失败，可能原因: ${errorMsg}`);

            }finally {
                this.isPublishingPost = false;
            }

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
                videos: [],
                audios: [],
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

const MAX_LIMITS = {
    videos: 1,
    audios: 5,
    images: 9,
    links: 1,
    attachments: 5
};

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

async function preHanderForCreatePost(post){
    await preHanderForPostAttachment(post);
    await preHanderForPostImage(post);
    await preHanderForPostLocalVideo(post);
    await preHanderForPostLocalAudio(post);
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
async function preHanderForPostLocalVideo(post){
    if (!post || post.videos.length == 0 || post.embed?.facet !== AppViberPostEmbedFacetEnum.LOCAL_VIDEO) {
        return
    }
    for (const video of post.videos) {
        try {
            const videoEmbedItem = {
                url: "",
                contentType: video.contentType,
                duration: video.duration,
                thumbnail: {
                    url: ""
                }
            };

            // upload video file
            const { status,objectName, etag } = await uploadSingleFileToOSS(video.rawFile, currentChannel);
    
            if (status === 200) {
                 videoEmbedItem.url=`/${objectName}?etag=${etag}`;
            }

            // upload video poster
            const posterRes = await uploadPostFile(video.posterBlob, currentChannel, AppViberFileSceneEnum.IMAGE);
                
            if (posterRes.data.code === 200) {
                 videoEmbedItem.thumbnail.url=posterRes.data.link;
            }
            
   
            storyHubPage.newPostObj.embed.videos.push(videoEmbedItem);
        } catch (error) {
            const errorMsg = `视频 [${video.rawFile.name}] 上传失败，原因：${error.message || '网络连接超时'}`;
            throw new Error(errorMsg); 
        }
    }
}
async function preHanderForPostLocalAudio(post){
    if (!post || post.audios.length == 0 || post.embed?.facet !== AppViberPostEmbedFacetEnum.LOCAL_AUDIO) {
        return
    }
    for (const audio of post.audios) {
        try {
            const { status,objectName, etag } = await uploadSingleFileToOSS(audio.rawFile, currentChannel);
    
            if (status === 200) {
                const audioEmbedItem = {
                    url: `/${objectName}?etag=${etag}`,
                    contentType: audio.contentType
                };
    
                storyHubPage.newPostObj.embed.audios.push(audioEmbedItem);
            }
        } catch (error) {
            const errorMsg = `音频 [${audio.rawFile.name}] 上传失败，原因：${error.message || '网络连接超时'}`;
            throw new Error(errorMsg); 
        }
    }
}
async function afterCompletionForCreatePost(post){
    await postHanderForPostLocalAudio(post);
    await postHanderForPostLocalVideo(post);
}

async function postHanderForPostLocalAudio(post){
    if (!post || post.audios.length == 0 || post.embed?.facet !== AppViberPostEmbedFacetEnum.LOCAL_AUDIO) {
        return
    }
    for (const audioToDelete of post.audios) {
         // Memory Cleanup: Revoke the local URL to prevent leaks
         if (audioToDelete.url && audioToDelete.url.startsWith('blob:')) {
            URL.revokeObjectURL(audioToDelete.url);
        }
    }
}
async function postHanderForPostLocalVideo(post){
    if (!post || post.videos.length == 0 || post.embed?.facet !== AppViberPostEmbedFacetEnum.LOCAL_VIDEO) {
        return
    }
    for (const videoToDelete of post.videos) {
         // Memory Cleanup: Revoke the local URL to prevent leaks
         if (videoToDelete.url && videoToDelete.url.startsWith('blob:')) {
            URL.revokeObjectURL(videoToDelete.url);
        }
        if (videoToDelete.poster && videoToDelete.poster.startsWith('blob:')) {
            URL.revokeObjectURL(videoToDelete.poster);
        }
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
    const maxAttachments = MAX_LIMITS.attachments;
    const remainingSlots = maxAttachments - storyHubPage.newPostObj.attachments.length;
    
    if (remainingSlots <= 0 || files.length>maxAttachments || files.length> remainingSlots) {
        customAlert.alert('最多只能上传' + maxAttachments + '个附件');
        return;
    }
    
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
        // 验证文件大小 (最大50MB)
        if (file.size > 50 * 1024 * 1024) {
            customAlert.alert('附件大小不能超过50MB，已跳过: ' + file.name);
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
    const maxImages = MAX_LIMITS.images;
    const remainingSlots = maxImages - storyHubPage.newPostObj.images.length;
    
    if (remainingSlots <= 0 || files.length>maxImages || files.length> remainingSlots) {
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


async function getVideoMetadataFromLocalFile(file, seekTime = 0.5) {
    return new Promise((resolve, reject) => {
        // 1. Create a hidden video element
        const video = document.createElement('video');
        
        // Crucial for Safari & Mobile: Must be muted and playsinline
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('crossOrigin', 'anonymous');
        video.preload = 'metadata';

        const videoUrl = URL.createObjectURL(file);
        
        // Safety timeout (15s for large 100MB files)
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Video processing timed out."));
        }, 15000);

        const cleanup = () => {
            clearTimeout(timeout);
            video.onloadedmetadata = null;
            video.onseeked = null;
            video.onerror = null;
            // Only revoke the temporary video source URL
            URL.revokeObjectURL(videoUrl);
            video.remove();
        };

        video.onloadedmetadata = () => {
            const duration = video.duration;
            if (isNaN(duration) || duration === 0) {
                cleanup();
                reject(new Error("Invalid video duration."));
                return;
            }

            // Capture at seekTime or 20% of duration if video is very short
            video.currentTime = duration > seekTime ? seekTime : duration * 0.2;
        };

        video.onseeked = () => {
            // Check if video dimensions are valid before drawing
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                cleanup();
                reject(new Error("Could not retrieve video dimensions."));
                return;
            }

            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#000"; // Background for transparent frames
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        cleanup();
                        reject(new Error("Failed to create poster blob."));
                        return;
                    }

                    const posterUrl = URL.createObjectURL(blob);
                    
                    const result = {
                        duration: video.duration,
                        posterBlob: blob,      // For FormData upload
                        posterUrl: posterUrl,  // For <img src> or <video poster>
                        width: video.videoWidth,
                        height: video.videoHeight,
                        originalFile: file
                    };
                    
                    cleanup();
                    resolve(result);
                }, 'image/jpeg', 0.85);
            } catch (e) {
                cleanup();
                reject(e);
            }
        };

        video.onerror = () => {
            cleanup();
            reject(new Error("Browser could not play this video format."));
        };

        // Start the process
        video.src = videoUrl;
        // Some browsers need a manual load call if preload is metadata
        video.load(); 
    });
};



async function handleVideoUploadForCreatePost(e){
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingLocalVideo){
        return;
    }

    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.LOCAL_VIDEO,
            videos: []
        }
    }

    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // 限制最多1个视频
    const maxVideos = MAX_LIMITS.videos;
    const remainingSlots = maxVideos - storyHubPage.newPostObj.videos.length;
    
    if (remainingSlots <= 0 || files.length>maxVideos || files.length> remainingSlots) {
        customAlert.alert('最多只能上传' + maxVideos + '个视频');
        return;
    }
    
    const filesToProcess = files.slice(0, remainingSlots);

    // 修改为异步循环
    for (const file of filesToProcess) {
        if (file.size > 100 * 1024 * 1024) {
            customAlert.alert('视频大小不能超过100MB');
            continue;
        }

        try {
            // --- 核心新增：提取封面和时长 ---
            const meta = await getVideoMetadataFromLocalFile(file);

            const tmpVideo = {
                url: URL.createObjectURL(file), // 这是给预览用的
                poster: meta.posterUrl,         // 封面图预览地址
                posterBlob: meta.posterBlob,    // 用于最终上传给后端的图片文件
                duration: meta.duration,        // 视频时长
                width: meta.width,              // 宽度
                height: meta.height,            // 高度
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                rawFile: file
            };
            
            storyHubPage.newPostObj.videos.push(tmpVideo);
            
        } catch (err) {
            console.error("视频处理出错:", err);
            customAlert.alert('无法解析视频文件');
        }
    }

    
    // 清空 input 以便重复选择同一文件
    document.getElementById('videoUpload').value = '';
}

function handleAudioUploadForCreatePost(e){
    const uploadingFacetInfo= queryUploadingFacetForCreatePost();
    if(uploadingFacetInfo.uploadingSomething && !uploadingFacetInfo.uploadingLocalAudio){
        return;
    }

    if(!storyHubPage.newPostObj.embed) {
        storyHubPage.newPostObj.embed = {
            facet: AppViberPostEmbedFacetEnum.LOCAL_AUDIO,
            audios: []
        }
    }

    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // 限制最多5个音频
    const maxAudios = MAX_LIMITS.audios;
    const remainingSlots = maxAudios - storyHubPage.newPostObj.audios.length;
    
    if (remainingSlots <= 0 || files.length>maxAudios || files.length>remainingSlots) {
        customAlert.alert('最多只能上传' + maxAudios + '个音频');
        return;
    }
    
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
        // 验证文件大小 (最大100MB)
        if (file.size > 100 * 1024 * 1024) {
            customAlert.alert('音频大小不能超过100MB，已跳过: ' + file.name);
            return;
        }

        const tmpAudio={
            url: URL.createObjectURL(file),
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            rawFile: file

        }
        
        // 添加附件到列表
        storyHubPage.newPostObj.audios.push(tmpAudio);
    });
    
    
    // 清空 input 以便重复选择同一文件
    document.getElementById('audioUpload').value = '';
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
    const uploadingLocalVideo=post?.videos?.length>0;
    const uploadingLocalAudio=post?.audios?.length>0;
    const uploadingThirdImage=post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_IMAGE && post?.embed?.images.length>0;
    const uploadingThirdAudio=post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_AUDIO && post?.embed?.audios.length>0;
    const uploadingThirdVideo=post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_VIDEO && post?.embed?.videos.length>0;
    const uploadingLink=post?.embed?.facet==AppViberPostEmbedFacetEnum.LINK && post?.embed?.links.length>0;
    const uploadingSomething=uploadingLocalVideo || uploadingLocalAudio || uploadingLocalAttachment || uploadingLocalImage || uploadingThirdImage || uploadingThirdAudio || uploadingThirdVideo || uploadingLink;
  
    return {uploadingSomething,uploadingLocalVideo,uploadingLocalAudio,uploadingLocalAttachment,uploadingLocalImage,uploadingThirdImage, uploadingThirdAudio,uploadingThirdVideo,uploadingLink}
  
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
    const post = storyHubPage.newPostObj;

    const info = queryUploadingFacetForCreatePost();

    // 只要有任何本地媒体正在上传，就不处理链接预览
    if (info.uploadingLocalVideo || info.uploadingLocalAudio || 
        info.uploadingLocalImage || info.uploadingLocalAttachment) {
        return;
    }

    // 定义一个辅助函数检查 URL 是否已存在于 embed 的各个分类中
    const isUrlExists = (type, key = 'url') => {
        return post.embed?.[type]?.some(item => item[key] === url);
    };

    if (isUrlExists('videos') || isUrlExists('audios') || 
        isUrlExists('images', 'link') || isUrlExists('links')) {
        return;
    }


    // --- 数量限制校验 ---
    const isFull = (type) => (post.embed?.[type]?.length || 0) >= MAX_LIMITS[type];
    
    if (isFull('videos') || isFull('audios') || isFull('images') || isFull('links')) {
        return;
    }

    
    // 显示加载状态
    post.linkPreviewLoading = true;

    try {
       await fetchLinkPreview(url);
    } catch (error) {
        console.error('获取链接预览失败:', error);
        // 显示基本链接预览
        parseLinkOnNotFoundData(url);
    }finally{
        // 关闭加载状态
        post.linkPreviewLoading = false;
    }


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
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.images.length>=MAX_LIMITS.images){
        // customAlert.alert('最多支持9张图片');
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
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.audios.length>=MAX_LIMITS.audios){
        // customAlert.alert('最多支持5个音频内容');
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
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.videos.length>=MAX_LIMITS.videos){
        // customAlert.alert('最多支持1个视频内容');
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
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed?.links.length>=MAX_LIMITS.links){
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
    if(storyHubPage.newPostObj.embed && storyHubPage.newPostObj.embed.links.length>=MAX_LIMITS.links){
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

async function dofetchJsonLinkData(link){
    const url=`/link/parse?url=${encodeURIComponent(link)}`;
    return await axios.get(url);
}

async function delPost(postId){
    doDeleteOnePost(postId).then(response=>{
        if(response.data.code == 200){
            storyHubPage.feedArr = storyHubPage.feedArr.filter(item => item.postId !== postId);
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
    })
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
