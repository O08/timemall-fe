import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js";

import { Picker } from 'emoji-picker-element';
import zh_CN from 'emoji-picker-element/i18n/zh_CN';
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";

import { usePostInteract } from "./post-interact.js";
import { formatTime,formatNumber } from "/common/javascripts/util.js";
import {goErrorByReplace} from "/common/javascripts/pagenav.js";


import PostRenderTemploate from '/apps/viber/post-render-template.vue';



import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


  
const currentPostId = window.location.pathname.split('/').pop();

const AppViberCommmentInteractEventEnum = Object.freeze({
    "LIKE": "1",
    "DISLIKE": "2"
});

// URL正则表达式
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;


const RootComponent = {
    setup(){
        const { likePostV,cancelLikePostV, sharePostLinkV,publishOneCommentV,copyCommentContentV,fetchUserCtaInfo,muteUser,unmuteUser } = usePostInteract();

        return {
            likePostV,
            cancelLikePostV,
            sharePostLinkV,
            publishOneCommentV,
            copyCommentContentV,
            fetchUserCtaInfo,
            muteUser,
            unmuteUser
        }

    },
    data() {
        return {
            userCtaInfo: {},
            ctaInfoLoadFinish: false,
            post: {
                author: {},
                postId: ""
            },
            newCommentObj: {
                postId: "",
                textMsg: ""
            },

            commentArr: [],
            commentList_pagination: {
                url: "/api/v1/app/viber/feed/comment/getList",
                size: 30,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                isLoading: false,
                param: {
                  postId: currentPostId
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
                    }
                }
            }
        }
    },
    methods: {
        likeCommentV(comment){
            if(comment.interactLikeAction==AppViberCommmentInteractEventEnum.LIKE){
                return
            }
            commentInteract(comment.cid,AppViberCommmentInteractEventEnum.LIKE).then(response=>{
                if(response.data.code == 200){
                    comment.interactLikeAction=AppViberCommmentInteractEventEnum.LIKE;
                    comment.likes++;
                    comment.dislike=Math.max(Number(comment.dislike) -1,0);
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
        },
        dislikeCommentV(comment){
            if(comment.interactLikeAction==AppViberCommmentInteractEventEnum.DISLIKE){
                return
            }
            commentInteract(comment.cid,AppViberCommmentInteractEventEnum.DISLIKE).then(response=>{
                if(response.data.code == 200){
                    comment.interactLikeAction=AppViberCommmentInteractEventEnum.DISLIKE;
                    comment.likes=Math.max(Number(comment.likes)-1,0);
                    comment.dislike++;
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
        },
        feedInteractResponesHandlerV(){
            this.initLoadCommentsV();
        },
        initLoadCommentsV(){
            this.commentArr = [];
            this.commentList_pagination.current=1;

            this.reloadPage(this.commentList_pagination);
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
        delCommentV(cid){
            delComment(cid).then(response=>{
                if(response.data.code == 200){
                    const idToRemove = cid;
                    this.commentArr = this.commentArr.filter(({ cid }) => cid !== idToRemove);
                    this.post.comments--;

                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
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
        escapeHtml(text){
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        findPostInfoV(){
            findPostInfo(currentPostId).then(response=>{
                if(response.data.code == 200){
                    this.post=response.data.post;
                }
                if(response.data.code == 200 && !response.data.post){
                    goErrorByReplace();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            })
        },
        formatTimeV(date){

            return formatTime(date);
        },
        formatContentWithLinksV(content){
            if (!content) return '';
            content= this.escapeHtml(content);
            const formattedContent = content.replace(urlRegex, '<a href="$1" target="_blank" class="content-link">$1</a>');
            return `<div class="bsky-reply-text">${formattedContent}</div>`;
        },
        handleBackNavigationV(){
            // 如果有历史记录且不是直接打开的页面，则返回上一页
            if (window.history.length > 1 && document.referrer) {
                // rainbow/oasis/mini?och=e085697a288049eda24f2ba1c1cd59fd&oasis_id=f24dfc75535c42a99a00081c6619a2d1
                const vbChannelUrl= '/rainbow/oasis/mini?och=' + this.post.channel + '&oasis_id=' + this.post.oasisId;
                window.location.href = vbChannelUrl;

            } else {
                // 否则跳转到首页
                const nextUrl= this.post?.oasisId ? ('/rainbow/oasis/home?oasis_id=' + this.post.oasisId) : '/';
                window.location.href = nextUrl;
            }
        },
        formatNumberV(num){
            return formatNumber(num);
        }

    },
    mounted(){
        // init create post comment emoji picker

        const picker = new Picker({
            i18n: zh_CN,
            locale: 'zh_CN',
            dataSource: 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@%5E1/zh/emojibase/data.json'
        });
        document.getElementById("creat-post-comment-emoji-picker").appendChild(picker);
        picker.classList.add('dark');

        const commentInputBox = document.getElementById("postCommment");
    
        picker.addEventListener('emoji-click', event => {
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

const storyPage = app.mount('#app');
window.wvStoryPage = storyPage;

storyPage.userAdapter(); // auth.js

storyPage.findPostInfoV();

storyPage.pageInit(storyPage.commentList_pagination);

async function doFetchPostInfo(postId){
    const url="/api/v1/app/viber/feed/{id}/get".replace("{id}",postId);
    return await axios.get(url);
}

async function doCommentInteract(dto){
    const url="/api/v1/app/viber/feed/comment/interact";
    return await axios.post(url,dto);
}

async function doDeleteOneComment(cid){
    const url="/api/v1/app/viber/feed/comment/{id}/del".replace("{id}",cid);
    return await axios.delete(url);
}

async function delComment(cid){
    return await doDeleteOneComment(cid);
}
async function commentInteract(cid,interactEvent){
    const dto={
        cid: cid,
        event: interactEvent
    }
  return await  doCommentInteract(dto);
}

async function findPostInfo(postId){
    return await doFetchPostInfo(postId);
}


const container = document.querySelector(".bsky-app");
window.addEventListener('scroll', ()=>{
    if (storyPage.commentList_pagination.isLoading) return;

    const alreadyBottom = Math.ceil(container.clientHeight + container.scrollTop + 300) >= container.scrollHeight;
    const hasMore = storyPage.commentList_pagination.current +1 <= storyPage.commentList_pagination.pages;
  
  
    if (alreadyBottom && hasMore) {
      storyPage.commentList_pagination.isLoading= true;
      storyPage.commentList_pagination.current++;
      storyPage.reloadPage(storyPage.commentList_pagination);
    }
});
