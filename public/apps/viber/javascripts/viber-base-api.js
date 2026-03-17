import axios from 'axios';



var ViberBaseApi = {}
async function doCreateOnePost(dto) {
    const url="/api/v1/app/viber/feed/post/create";
    return await axios.post(url,dto);
}



async function  createPost(channel,textMsg,embed) {
    const dto={
        channel: channel,
        textMsg: textMsg
    }
    if (embed && Object.keys(embed).length) {
        dto.embed = embed;
    }

    return  await doCreateOnePost(dto)
}


ViberBaseApi.createPost = createPost;

export {ViberBaseApi}