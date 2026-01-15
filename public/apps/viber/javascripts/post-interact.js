import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import axios from 'axios';
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();



const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const AppViberPostInteractEventEnum = Object.freeze({
    "LIKE": "1",
    "CANCEL_LIKE": "2",
    "SHARE": "3"
});

export function usePostInteract() {

    const  publishOneCommentV = async(comment,appObj,post)=>{
        publishOneComment(comment,appObj,post);
    }

    const  likePostV = async(postId,appObj,post)=>{
        feedInteract(postId,AppViberPostInteractEventEnum.LIKE,appObj,post);
    }
    const cancelLikePostV = async(postId,appObj,post)=>{
        feedInteract(postId,AppViberPostInteractEventEnum.CANCEL_LIKE,appObj,post);
    }

    const  sharePostLinkV = async(postId,appObj,post)=>{
        const copyContent=currentDomain+"/viber/post/"+postId;
        copyValueToClipboard(copyContent);
        feedInteract(postId,AppViberPostInteractEventEnum.SHARE,appObj,post);
    }

    const feedInteract = async(postId,interactType,appObj,post)=> {
        const dto={
            postId: postId,
            event: interactType
        }
        doFeedInteract(dto).then(response=>{
            if(response.data.code == 200){
                feedInteractSuccessHandler(post,interactType)
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error); 
            }
        })
    }

    const feedInteractSuccessHandler= (post,interactType)=>{
        if(interactType==AppViberPostInteractEventEnum.SHARE && post.author.hasShare!='1'){
            post.shares++;
            post.author.hasShare='1'
        }
        if(interactType==AppViberPostInteractEventEnum.LIKE && post.author.hasLike!='1'){
            post.likes++;
            post.author.hasLike='1'
        }
        if(interactType==AppViberPostInteractEventEnum.CANCEL_LIKE && post.author.hasLike=='1'){
            post.likes = Math.max(0, post.likes - 1); // Prevents negative values

            post.author.hasLike='0'
        }
    }

    const muteUser = async (channel,userId)=>{
        return await doMuteOneUser(channel,userId);
    }

    const unmuteUser = async (channel,userId)=>{
        return await doUnmuteOneUser(channel,userId)
    }

    const fetchUserCtaInfo = async (oasisId,userId)=>{
        return doFetchUserCtaInfo(oasisId,userId);
    }

    const  copyCommentContentV = async(textMsg)=>{
        copyValueToClipboard(textMsg);
    }


    const publishOneComment= async(comment,appObj,post)=>{
        doPublishOneComment(comment).then(response=>{
  
            if(response.data.code == 200){
                post.comments++;
                appObj.closePostCommmentModalV();
            }
            if(response.data.code == 200 && appObj.feedInteractResponesHandlerV){
                appObj.feedInteractResponesHandlerV();
            }

            if(response.data.code==40042){
                const error="操作失败，可能原因：您已被禁言或还不是部落成员";
                customAlert.alert(error); 
                return
            }

            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error); 
            }
        })
    }
    
  return { likePostV,sharePostLinkV,publishOneCommentV,copyCommentContentV,fetchUserCtaInfo,muteUser,unmuteUser,cancelLikePostV }
}

async function doFeedInteract(dto){
    const url="/api/v1/app/viber/feed/post/interact";
    return await axios.post(url,dto);
}

async function doPublishOneComment(dto){
    const url="/api/v1/app/viber/feed/comment/publish";
    return await axios.post(url,dto);
}

async function doFetchUserCtaInfo(oasisId,userId){
    const url="/api/v1/app/oasis/{oasis_id}/user/{user_id}/cta_info".replace("{oasis_id}",oasisId).replace("{user_id}",userId);
    return await axios.get(url);
}

async function doMuteOneUser(channel,userId){
    const url="/api/v1/app/viber/{channel}/user/{id}/mute".replace("{channel}",channel).replace("{id}",userId);
    return await axios.put(url,{})
}

async function doUnmuteOneUser(channel,userId){
    const url="/api/v1/app/oasis/{channel}/user/{id}/unmute".replace("{channel}",channel).replace("{id}",userId);
    return await axios.put(url,{})
}

