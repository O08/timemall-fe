import { RtmManager } from './blv-rtm-sdk.js';
import { debounce } from 'lodash';
import axios from 'axios';


const host = window.location.host;

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

const socketUrl = `${protocol}//${host}/rtm`;

let rtmClient;
let channel;
let channels = [];

let options = {
    token: "",
    uid: "",
    userName: ""
}


let stopped = false

const RtmCompoent = {
    data() {
    },
    methods: {
        joinRoomInitV() {
            const userID = this.getIdentity().userId; // Auth.getIdentity();
            if (!this.rtcSetting) {
                return;
            }
            joinRoomInit(userID, this.rtcSetting);
        },
        sendRtmChannelMessageV() {
            sendRtmChannelMessage();
        },
        joinRoomsV(defaultChannel, rooms, channelMessageFallback) {
            const userID = this.getIdentity().userId; // Auth.getIdentity();
            joinRoomsInit(defaultChannel, userID, rooms, channelMessageFallback);
        },
        changeRoomV(channelId) {
            changeRoom(channelId);
        }
    },
    beforeUnmount() {
        if (rtmClient) {
            stopped = true; // 💡 停止 Token 续期计时器
            rtmClient.destroy();
            console.log("RTM 资源已随组件销毁而释放");
        }
    }
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function fetchToken() {

    return new Promise(function (resolve) {
        axios.get('/api/v1/base/rtm/token')
            .then(function (response) {
                const token = response.data.token;
                const userName = response.data.userName;
                resolve({ token, userName });
            })
            .catch(function (error) {
                console.log(error);
            });
    })
}


async function joinRoomInit(uid, rtcSetting) {

    if (!rtcSetting.channel) {
        return;
    }
    stopped = false;


    // 设置 RTM 用户 ID
    options.uid = uid
    // 获取 Token
    let rtcAuthInfo = await fetchToken()
    console.log("start to login。。。。。。");
    options.token = rtcAuthInfo.token;
    options.userName = rtcAuthInfo.userName;

    // 初始化客户端
    rtmClient = new RtmManager(`${socketUrl}?token=${options.token}`);

    // 显示连接状态变化
    rtmClient.on('open', () => {
        console.log("Status: Connected");
    });

    rtmClient.on('close', () => {
        console.log("Status: Disconnected / Reconnecting...");
    });

    rtmClient.on('error', (err) => {
        console.error("Status: Error", err);
    });

    await createOrListenRtmChannel(rtcSetting);

    tokenDeamon();

}

async function createOrListenRtmChannel(rtcSetting) {
    channel = rtmClient.createChannel(rtcSetting.channel);

    console.log("chanel: " + rtcSetting.channel);
    await channel.join();
    channel.on('NEW_MSG_NOTIFY', function (data) {
  
        debouncedFetch(rtcSetting.channel, rtcSetting.channelMessageFallback);

    })
}



async function sendRtmChannelMessage() {
    if (channel != null) {
        console.log(channel.channelId + "channel message!");

        await channel.sendMessage({ text: "ok" }).then(() => {
            console.log("channel Message send success!")
        })
    }
}

async function joinRoomsInit(defaultChannel, uid, rooms, channelMessageFallback) {
    channels = [];
    stopped = false;
    // 设置 RTM 用户 ID
    options.uid = uid
    // 获取 Token
    let rtcAuthInfo = await fetchToken()
    console.log("start to login。。。。。。");
    options.token = rtcAuthInfo.token;
    options.userName = rtcAuthInfo.userName;

    // 初始化客户端
    rtmClient = new RtmManager(`${socketUrl}?token=${options.token}`);

    // 显示连接状态变化
    rtmClient.on('open', () => {
        console.log("Status: Connected");
    });

    rtmClient.on('close', () => {
        console.log("Status: Disconnected / Reconnecting...");
    });

    rtmClient.on('error', (err) => {
        console.error("Status: Error", err);
    });

    for (const channelId of rooms) {
        const roomChannel = rtmClient.createChannel(channelId);

        roomChannel.on('NEW_MSG_NOTIFY', function (data) {
            // 回传当前是哪个频道收到的信号
            debouncedFetch(channelId, channelMessageFallback);

        });

        channels.push({
            channelId: channelId,
            channel: roomChannel
        });

        // 默认进入的频道（后端会执行 bindGroup）
        if (defaultChannel === channelId) {
            channel = roomChannel;
            await channel.join();
        }
    }



    tokenDeamon();
}
function changeRoom(channelId) {
    const target = channels.find(e => e.channelId === channelId);
    if (target) {
        channel = target.channel;
        channel.join(); 
        console.log(`[RTM] 已切换到群组: ${channelId}`);
    } else {
        console.warn(`[RTM] 未找到群组实例: ${channelId}`);
    }
}


async function tokenDeamon() {
    while (!stopped) {
        await sleep(3600000); // 1小时更新一次
        const rtcAuthInfo = await fetchToken();
        if (rtcAuthInfo && rtcAuthInfo) {
            options.token = rtcAuthInfo.token;
            rtmClient.renewToken(options.token);
            console.log("RTM Token renewed at " + new Date().toLocaleTimeString());
        }
    }
}

const debouncedFetch = debounce((channelId, fallback) => {
    console.log(`[HTTP] 执行防抖拉取，群组: ${channelId}`);
    fallback(channelId); 
}, 300);

export default RtmCompoent;
