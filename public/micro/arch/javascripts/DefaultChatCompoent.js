import { createPopup } from "@picmo/popup-picker";
import emojiData from 'emojibase-data/zh/data.json';
import messages from 'emojibase-data/zh/messages.json';

import axios from 'axios';


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

export default function DefaultChatCompoent(config) {
  const {
    chatSetting = {}
  } = config  
  return {
    data(){
      return {
        chatSetting: chatSetting,
         eventObj:{},
         // image file 
         errors: [],
         maxSize: 1, // 1 M
         maxAttachmentSize: 20,
         file:{
          name: "",
          size: 0,
          type: "",
          data: "",
          fileExtention: "",
          url: "",
          isImage: false,
          isUploaded: false
        },
        rawImageFile: {},
        bigfile: {fileName: ""},
        rawBigfile: {},
        accept: "png,gif,jpg,jpeg",
        rtcSetting:  this.rtcSettingConfig()
      }
    },
    methods: {
      sendTextMessageV(){
        const msg = document.querySelector(".chat-input").value
        if(!chatSetting.rtcChannel || !msg || !msg.trim()){
          return ;
        }
        sendTextMessage(chatSetting).then(response=>{
          if(response.data.code==200){
            document.querySelector(".chat-input").value='';
            document.querySelector(".chat-input").style.height=32 + "px";
            this.sendRtmChannelMessageHandler(); // notice event
            this.retrieveMessageV(); // fetch message
            if(!!chatSetting.sendMessageOkHandler){
              chatSetting.sendMessageOkHandler();
            }
          //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
          }
        }).catch(err=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
      retrieveMessageV(){
        if(!chatSetting.rtcChannel){
          return ;
        }
        retrieveMessage(chatSetting).then(response=>{
          if(response.data.code==200){
            this.eventObj = response.data.event;
          }
        })
      },
      sendImageMessageV(){
        if(!chatSetting.rtcChannel){
          return ;
        }
        sendImageMessage(chatSetting,this.rawImageFile).then(response=>{
          if(response.data.code==200){
            this.sendRtmChannelMessageHandler(); // notice event
            this.retrieveMessageV(); // fetch message
            this.resetFileInput();
            $("#imagePreviewModal").modal("hide"); // show modal
          //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
  
          }
        }).catch(err=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
      sendAttachmentV(){
        if(!chatSetting.rtcChannel){
          return ;
        }
        sendBigFileMessage(chatSetting,this.rawBigfile).then(response=>{
          if(response.data.code==200){
            this.sendRtmChannelMessageHandler(); // notice event
            this.retrieveMessageV(); // fetch message
            this.resetBigFileInput();
          //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
            $("#sendBigFileModal").modal("hide"); // show modal
          }
        }).catch(err=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
  
      },
      resetBigFileInput(){
        this.rawImageFile= {},
        this.bigfile= {fileName: ""}
        document.querySelector('#selection_attachment').value = null;
  
      },
      // file send function 
      handleBigFileChange(e){
        this.errors = [];
        $("#sendBigFileModal").modal("show"); // show modal
        if(e.target.files && e.target.files[0]){
          const file = e.target.files[0]
          if(this.isFileSizeValid((Math.round((file.size / 1024/ 1024)*100) /100),this.maxAttachmentSize)){
              this.bigfile.fileName= file.name;
              this.rawBigfile = file;
          }
        }
  
      },
      // image send function
      handleFileChange(e){
        this.errors = [];
        $("#imagePreviewModal").modal("show"); // show modal
  
        if(e.target.files && e.target.files[0]){
          if(this.isFileValid(e.target.files[0])){
            this.rawImageFile = e.target.files[0];
            const file = e.target.files[0],
            fileSize = Math.round((file.size / 1024/ 1024)*100) /100,
            fileExtention = file.name.split(".").pop(),
            fileName = file.name.split(".").shift(),
            isImage = ["jpg","jpeg","png","gif"].includes(fileExtention);
            console.log(fileSize,fileExtention, fileName,isImage);
            let reader = new FileReader();
            reader.addEventListener("load",()=>{
              this.file = {
                name: fileName,
                size: fileSize,
                type: file.type,
                fileExtention: fileExtention,
                isImage: isImage,
                url: reader.result,
                isUploaded: true
              };
            },
            false);
            reader.readAsDataURL(file);
  
          }else{
            console.log("无效文件");
          }
        }
  
      },
      resetFileInput(){
        this.uploadReady = false;
        this.$nextTick(()=>{
          this.uploadReady = true,
          this.file = {
            name: "",
            size: 0,
            type: "",
            data: "",
            fileExtention: "",
            url: "",
            isImage: false,
            isUploaded: false
          },
          this.rawImageFile ={}
        });
        document.querySelector('#selection_image').value = null;
  
      },
      isFileSizeValid(fileSize, maxSize){
        if(fileSize <= maxSize){
          console.log("文件大小符合要求");
          return true;
        } else{
          this.errors.push(`文件大小应小于 ${maxSize} M`);
          return false;
        }
      },
      isFileTypeValid(fileExtention){
        if(this.accept.split(",").includes(fileExtention)){
          console.log("文件类型符合要求");
          return true;
        } else{
          this.errors.push(`文件类型应为： ${this.accept}`)
          return false;
        }
      },
      isFileValid(file){
        this.isFileSizeValid((Math.round((file.size / 1024/ 1024)*100) /100),this.maxSize);
        this.isFileTypeValid(file.name.split(".").pop());
        if(this.errors.length ===0){
          return true;
        }else{
          return false;
        }
      },
      sendRtmChannelMessageHandler(){
        if(chatSetting.enableRtc){
          this.sendRtmChannelMessageV(); // notice event
        }
      },
      rtcSettingConfig(){
        var l_rtcSetting={}
        if(chatSetting.enableRtc){
          l_rtcSetting={
            channel: chatSetting.rtcPrefix + chatSetting.rtcChannel,
            channelMessageFallback: ()=>{
                this.retrieveMessageV();
                // update event feed mark
                // this.updateEventFeedMarkAsProcessedV();
            }
          }
        }
        return l_rtcSetting;
      },
      autoHeightV(event){
        var elem = event.target;
        elem.style.height = "auto";
        elem.scrollTop = 0; // 防抖动
        
        elem.style.height = elem.scrollHeight + "px";
        if(elem.scrollHeight==0){
            elem.style.height=32 + "px";
        }
        if(elem.scrollHeight>400){
          elem.style.height=400 + "px";
        }
      }
  
    },
    mounted(){
  
      const emoji = document.querySelector("#selection-emoji");
      const inputBox = document.querySelector(".chat-input");
      
      const picker = createPopup(
        {
          emojiData: emojiData,
          messages: messages,
          locale: 'zh'
        },
        {
          referenceElement: document.querySelector("#selection-outer"),
          triggerElement: emoji,
          position: "bottom-start",
          showCloseButton: false
        }
      );
      
      emoji.addEventListener("click", () => {
        picker.toggle();
      });
      
      picker.addEventListener("emoji:select", (selection) => {
        // emoji.innerHTML = selection.emoji;
        // name.textContent = selection.label;
        inputBox.value = inputBox.value + selection.emoji;
        // emoji.classList.remove("empty");
        // name.classList.remove("empty");
      });
  
      // // request chat message 1 second interval
      // var messagetimer = setInterval(this.retrieveMessageV,1000);
  
    },
    created(){
      this.retrieveMessageV();
  
  }
  }
}

async function storeMessageEvent(sendTextMessageUrl,dto){
  return await axios.put(sendTextMessageUrl,dto);
}
async function getMessageEvent(fetchMessageUrl){
  return await axios.get(fetchMessageUrl);
}
async function sendMillstoneImage(sendImageMessageUrl, form){
  return await axios.put(sendImageMessageUrl,form);
}
async function storeMillstoneAttachment(sendAttachmentUrl, form){
  return await axios.put(sendAttachmentUrl,form);
}
function retrieveMessage(chatSetting){
  return getMessageEvent(chatSetting.fetchMessageUrl);
}
function sendTextMessage(chatSetting){
  const dto={
    msg: document.querySelector(".chat-input").value,
    msgType: 'text'
  }
  return storeMessageEvent(chatSetting.sendTextMessageUrl,dto);
}
function sendImageMessage(chatSetting,file){
  var form = new FormData();
  form.append("file",file);
  form.append("msgType","image");
  return sendMillstoneImage(chatSetting.sendImageMessageUrl,form);
}
function sendBigFileMessage(chatSetting,file){
  var form = new FormData();
  form.append("file",file);
  form.append("msgType","attachment");
  return storeMillstoneAttachment(chatSetting.sendAttachmentUrl,form);
}

