import axios from 'axios';
import AgoraRTM from '/common/javascripts/agora-rtm-sdk-1.5.1.js';


let rtmClient;
let channel;
let channels=[];

// login 方法参数
let options = {
    token: "",
    uid: ""
}
  
  // 是否开启 Token 更新循环
let stopped = false

const RtmCompoent = {
    data(){
      },
      methods: {
        joinRoomInitV(){
            const userID = this.getIdentity().userId; // Auth.getIdentity();
            if(!this.rtcSetting){
              return;
            }
            joinRoomInit(userID,this.rtcSetting);
        },
        sendRtmChannelMessageV(){
            sendRtmChannelMessage();
        },
        joinRoomsV(defaultChannel,rooms,channelMessageFallback){
          const userID = this.getIdentity().userId; // Auth.getIdentity();
          joinRoomsInit(defaultChannel,userID,rooms,channelMessageFallback);
        },
        changeRoomV(channelId){
          changeRoom(channelId);
        }
      }
}

  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  function fetchToken() {
  
    return new Promise(function (resolve) {
        axios.get('/api/v1/ms/rtm/token')
            .then(function (response) {
                const token = response.data.token;
                const appID = response.data.appId;
                resolve({token,appID});
            })
            .catch(function (error) {
                console.log(error);
            });
    })
  }
  
  async function joinRoomInit(uid,rtcSetting)
  {
     
    if(!rtcSetting.channel){
      return;
    }

    // 你的 app ID
    let appID = ""
     // 设置 RTM 用户 ID
     options.uid = uid
     // 获取 Token
     let  rtcAuthInfo = await fetchToken()
     console.log("start to login。。。。。。");
     options.token = rtcAuthInfo.token;
     appID= rtcAuthInfo.appID;
  
    // 初始化客户端
    rtmClient = AgoraRTM.createInstance(appID)
  
    // 显示连接状态变化
    rtmClient.on('ConnectionStateChanged', function (state, reason) {
        console.log("State changed To: " + state + " Reason: " + reason)
    })

    // 登录 RTM 系统
    await rtmClient.login(options);
    // let a = await rtmClient.queryPeersOnlineStatus([uid])
    await createOrListenRtmChannel(rtcSetting);
  
    while (!stopped)
    {
        // 每 30 秒更新一次 Token。此更新频率是为了功能展示。生产环境建议每小时更新一次。
        await sleep(3600000)
        options.token = (await fetchToken(options.uid)).token
        rtmClient.renewToken(options.token)
  
        let currentDate = new Date();
        let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  
        console.log("Renew RTM token at " + time)
    }
  
  }
async function createOrListenRtmChannel(rtcSetting){
    channel = rtmClient.createChannel(rtcSetting.channel);
    
    console.log("chanel: "+rtcSetting.channel);
    await channel.join();
    channel.on('ChannelMessage', function (message, memberId) {
      rtcSetting.channelMessageFallback();
    })
}
async function sendRtmChannelMessage(){
    if (channel != null) {
        console.log(channel.channelId+"channel message!");
        await channel.sendMessage({ text: "ok" }).then(() => {
            console.log("channel Message send success!")
        }

        )
    }
}
async function joinRoomsInit(defaultChannel,uid,rooms,channelMessageFallback){
   // 你的 app ID
   let appID = ""
   // 设置 RTM 用户 ID
   options.uid = uid
   // 获取 Token
   let  rtcAuthInfo = await fetchToken()
   console.log("start to login。。。。。。");
   options.token = rtcAuthInfo.token;
   appID= rtcAuthInfo.appID;

  // 初始化客户端
  rtmClient = AgoraRTM.createInstance(appID)

  // 显示连接状态变化
  rtmClient.on('ConnectionStateChanged', function (state, reason) {
      console.log("State changed To: " + state + " Reason: " + reason)
  })

  // 登录 RTM 系统
  await rtmClient.login(options);
  // let a = await rtmClient.queryPeersOnlineStatus([uid])

  await rooms.forEach( async channelId => {


    var roomChannel = rtmClient.createChannel(channelId);
    
    console.log("roomChannel: "+channelId);
    await roomChannel.join();
    roomChannel.on('ChannelMessage', function (message, memberId) {
      channelMessageFallback(channelId);
    })
    channels.push({
      channelId: channelId,
      channel:roomChannel
    });
    if(defaultChannel==channelId){
      channel = roomChannel;
    }
  });




  while (!stopped)
  {
      // 每 30 秒更新一次 Token。此更新频率是为了功能展示。生产环境建议每小时更新一次。
      await sleep(3600000)
      options.token = (await fetchToken(options.uid)).token
      rtmClient.renewToken(options.token)

      let currentDate = new Date();
      let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

      console.log("Renew RTM token at " + time)
  }
}
function changeRoom(channelId){
 channel =  channels.filter(e=>{
    return e.channelId===channelId;
  })[0].channel;
}


  export default RtmCompoent;