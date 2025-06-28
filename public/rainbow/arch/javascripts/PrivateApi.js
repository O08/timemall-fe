import axios from 'axios';
const PrivateApi = {

    fetchPrivateFriend: fetchPrivateFriend,
    markAllMsgAsRead: markAllMsgAsRead,
    delAllFriendMsg: delAllFriendMsg,
    recallOneMessage: recallOneMessage,
    fetchFriendProfile: fetchFriendProfile

}


function fetchPrivateFriend(queryParam){
    return doFetchPrivateFriend(queryParam);
}
function markAllMsgAsRead(friend){
    if(!friend){
        return 
    }
    return doMarkAllMsgAsRead(friend);
}
function delAllFriendMsg(friend){
    if(!friend){
        return 
    }
    return doDelAllFriendMsg(friend);
}
function recallOneMessage(messageId){
    if(!messageId){
        return 
    }
    return doRecallOneMessage(messageId);
}
function fetchFriendProfile(friend){
    if(!friend){
        return 
    }
    return doFetchFriendProfile(friend);
}

async function doFetchPrivateFriend(queryParam){
    const url="/api/v1/ms/private/me/event/friend/list?q="+queryParam.q;
    return await axios.get(url);
}
async function doMarkAllMsgAsRead(friend){
    const url="/api/v1/ms/private/me/event/friend/{id}/mark_as_read".replace("{id}",friend);
    return await axios.put(url);
}
async function doDelAllFriendMsg(friend){
    const url="/api/v1/ms/private/{friend}/event/remove_all".replace("{friend}",friend);
    return await axios.delete(url);
}
async function doRecallOneMessage(messageId){
   const url="/api/v1/ms/private/me/event/{message_id}/recall_one".replace("{message_id}",messageId);
   return await axios.delete(url)
}
async function doFetchFriendProfile(friend){
   const url="/api/v1/ms/private/user/{id}/profile".replace("{id}",friend);
   return await axios.get(url);
}
export default PrivateApi;