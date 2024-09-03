import axios from 'axios';
import { ref } from 'vue'

const OasisApi = {

    followOasis: followOasis,
    fetchchannelList,
    getAListOfInvitedOases,
    getAListOfJoinedOases,
    loadAnnounce
}
async function joinOasis(dto){
    const url="/api/v1/team/be_oasis_member?oasisId="+dto.oasisId + "&brandId="+dto.brandId;
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
function followOasis(oasisId,brandId){
    const dto={
        oasisId:oasisId,
        brandId: brandId
    }
    return joinOasis(dto);

}
export default OasisApi;