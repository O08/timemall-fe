import axios from 'axios';
import { ref } from 'vue'

const OasisApi = {

    followOasis: followOasis,
    fetchchannelList,
    getAListOfInvitedOases,
    getAListOfJoinedOases,
    loadAnnounce,
    oasisSetting,
    putAvatar,
    putAnnounce,
    inviteBrand,
    fetchFriendListNotInOasis,
    topUptoOasis,
    retrieveOasisFinInfo,
    fetchFastLinks,
    doFetchOasisRoles
}
async function putAnnounce(oasisId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/team/oasis/{oasis_id}/announce".replace("{oasis_id}",oasisId);
    return await axios.put(url, fd);
}
async function joinOasis(dto){
    const url="/api/v1/team/be_oasis_member?oasisId="+dto.oasisId + "&privateCode="+dto.privateCode;
    return await axios.put(url,dto);
}
async function doFetchOasisChannelList(oasisId){
    const url="/api/v1/team/oasis/{oasis_id}/oasis_channel/list".replace("{oasis_id}",oasisId);
    return await axios.get(url);
}
async function getAListOfInvitedOases(brandId){
    const url ="/api/v1/team/invitedOases?brandId="+brandId;
    return axios.get(url);
}
async function getAListOfJoinedOases(brandId){
    const url ="/api/v1/team/joinedOases?brandId="+brandId;
    return axios.get(url);
}
async function getAnnounce(oasisId){
    const url = "/api/v1/team/oasis/announce/{oasis_id}".replace("{oasis_id}",oasisId);
    return await axios.get(url);
}
async function oasisSetting(dto){
    const url="/api/v1/team/oasis/setting";
    return await axios.put(url,dto);
}
async function putAvatar(oasisId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/team/oasis/{oasis_id}/avatar".replace("{oasis_id}",oasisId);
    return await axios.put(url, fd);
}
async function doFetchFriendListNotInOasis(queryParam){
    const url="/api/v1/team/oasis/friends?q="+queryParam.q+"&oasisId="+queryParam.oasisId;
    return await axios.get(url);
}
async function getOasisFinInfo(oasisId){
    const url="/api/v1/team/oasis_finance_board?oasisId=" + oasisId;
    return await axios.get(url);
}

async function retrieveOasisFinInfo(oasisId){
    return getOasisFinInfo(oasisId);
}


function fetchFriendListNotInOasis(q,oasisId){
    const queryParam={
        q,oasisId
    }
    return doFetchFriendListNotInOasis(queryParam);
}
async function inviteBrandToOasis(dto){
    const url="/api/v1/team/invite";
    return await axios.put(url,dto);
}
async function topUp2Oasis(dto){
    const url="/api/v1/team/top_up_to_oasis";
    return axios.post(url,dto);
  }
function topUptoOasis(amount,oasisId){
    const dto={
     amount: amount,
     oasisId: oasisId
    }
    return topUp2Oasis(dto);
 }

function inviteBrand(brandId,oasisId){
    const dto={
        oasisId: oasisId,
        brandId: brandId
    }
    return inviteBrandToOasis(dto);
}
function loadAnnounce(oasisId){
    return getAnnounce(oasisId);
}
 function fetchchannelList(oasisId){
    const channelSort = ref([])
    const oaisiChannelList = ref([])
    const getChannelDataV= (och,channelList)=>{
        return channelList.filter(e=>e.oasisChannelId==och)[0];
    }

    doFetchOasisChannelList(oasisId).then(response=>{
        if(response.data.code == 200){
            channelSort.value=response.data.sort;
            oaisiChannelList.value=response.data.channel;
        }
     });
     return { channelSort, oaisiChannelList ,getChannelDataV}
}
function followOasis(oasisId,privateCode){
    const dto={
        oasisId:oasisId,
        privateCode: privateCode
    }
    return joinOasis(dto);

}

function fetchFastLinks(id){

    const url = "/api/v1/oasis/{id}/fast_link".replace("{id}",id);
    return axios.get(url);
}
async function doFetchOasisRoles(oasisId, q) {
    const url = "/api/v1/team/oasis/role?q=" + q + "&oasisId=" + oasisId;
    return await axios.get(url);
}

export default OasisApi;