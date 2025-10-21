
import axios from 'axios';

const AppApi = {
    fetchChannelGeneralInfo: fetchChannelGeneralInfo,
    retrieveBrandPoint: retrieveBrandPoint
}
async function fetchChannelGeneralInfo(och){
    return doFetchChannelGeneralInfo(och);
}
async function retrieveBrandPoint(channel){
    return getBrandPintInOasis(channel);
}

async function doFetchChannelGeneralInfo(och){
    const url= "/api/public/team/oasis/channel/{oasis_channel_id}/general".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}

async function getBrandPintInOasis(channel){
    const url="/api/v1/team/point/query_use_channel?channel="+ channel;
    return await axios.get(url);
}

export default AppApi;