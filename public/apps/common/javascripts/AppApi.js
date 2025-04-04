
import axios from 'axios';

const AppApi = {
    fetchChannelGeneralInfo: fetchChannelGeneralInfo
}
async function fetchChannelGeneralInfo(och){
    return doFetchChannelGeneralInfo(och);
}
async function doFetchChannelGeneralInfo(och){
    const url= "/api/public/team/oasis/channel/{oasis_channel_id}/general".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}

export default AppApi;