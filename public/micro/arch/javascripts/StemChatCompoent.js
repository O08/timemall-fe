import { createPopup } from "@picmo/popup-picker";
import axios from 'axios';
import emojiData from 'emojibase-data/zh/data.json';
import messages from 'emojibase-data/zh/messages.json';

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

export default function StemChatCompoent(config) {
  const {
    chatSetting = {}
  } = config  
  return {
    data(){
      return {
        pageLoadSetting: {
          pages: "",
          current: 1,
          size: 10,
          defaultCurrent: 1,
          defaultSize: 10
        },
        chatSetting: chatSetting,
         eventObj:{
          records: []
         },
         // image file 
         errors: [],
         maxSize: 6, // 1 M
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
        rtcSetting:  this.rtcSettingConfig(),
        quoteMsg: {
          id: "",
          author: "",
          msgType: "",
          msg: "{}"
        }
      }
    },
    methods: {
      quoteOneMessageV(msg){
        this.quoteMsg= JSON.parse(JSON.stringify(msg));
      },
      removeQuoteMessageV(){
          this.quoteMsg = {
              id: "",
              author: "",
              msgType: "",
              msg: "{}"
          }
      },
      formatMessageV(msg) {

          return !msg ? "" : msg.replace(new RegExp("<br>", "g"), '');

      },
      removeOneMessageFromLocalV(messageId){
        this.eventObj.records=this.eventObj.records.filter(e=>e.id!=messageId);
        
      },
      displayIncrementMessageV(){
        fetchIncrementMessage(chatSetting).then(response=>{
          if(response.data.code==200 && response.data.event.records.length>0 ){
            this.pageLoadSetting.pages=response.data.event.pages;

            this.eventObj.records.push(...response.data.event.records);
            this.eventObj.records=incrementMessageHandler(this.eventObj.records);

            this.$nextTick(() => {
              document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
            })

          }
        })
      },
      fetchIncrementMessageV(){
        fetchIncrementMessage(chatSetting).then(response=>{
          if(response.data.code==200 && response.data.event.records.length>0 ){
            this.pageLoadSetting.pages=response.data.event.pages;
            this.eventObj.records.push(...response.data.event.records);
            this.eventObj.records=incrementMessageHandler(this.eventObj.records);
        
          }
        })
      },
      initMessageRecordV(){
        if(!chatSetting.rtcChannel){
          return ;
        }
        retrieveMessage(chatSetting,this.pageLoadSetting).then(response=>{
          if(response.data.code==200){

            this.pageLoadSetting.pages=response.data.event.pages;
            response.data.event.records.forEach(element => {
              this.eventObj.records.unshift(element);
            });

            this.$nextTick(() => {
              document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
            })
          
          }
        })
      },
      scrollToTopThenLoadV(e){
        scrollToTopThenLoad(e,chatSetting,this.pageLoadSetting).then(response=>{
          if(response.data.code==200){

            response.data.event.records.forEach(element => {
              this.eventObj.records.unshift(element);
            });
          
          }
        })
      },
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
            this.displayIncrementMessageV(); // fetch message
            if(!!chatSetting.sendMessageOkHandler){
              chatSetting.sendMessageOkHandler();
            }
          //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
          }
          if(response.data.code==40016){
            customAlert.alert(response.data.message);
          }
        }).catch(err=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
      sendMarkUpTextMessageV(){
        const msg = document.querySelector(".chat-input").innerHTML;
        const msgText = document.querySelector(".chat-input").textContent;
        if(!chatSetting.rtcChannel || !msgText || !msgText.trim()){
          return ;
        }
        sendMarkUpTextMessage(chatSetting).then(response=>{
          if(response.data.code==200){
            document.querySelector(".chat-input").innerHTML='';
            document.querySelector(".chat-input").style.height=32 + "px";

            this.removeQuoteMessageV(); 

            this.sendRtmChannelMessageHandler(); // notice event
            this.displayIncrementMessageV(); // fetch message
            if(!!chatSetting.sendMessageOkHandler){
              chatSetting.sendMessageOkHandler();
            }
            
          }
          if(response.data.code==40016){
            customAlert.alert(response.data.message);
          }
          if(response.data.code==40038){
            customAlert.alert(response.data.message);
          }
        }).catch(err=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
      // retrieveMessageV(){
      //   if(!chatSetting.rtcChannel){
      //     return ;
      //   }
      //   retrieveMessage(chatSetting,this.pageLoadSetting).then(response=>{
      //     if(response.data.code==200){
      //       this.eventObj = response.data.event;
            
      //     }
      //   })
      // },
      sendImageMessageV(){
        if(!chatSetting.rtcChannel){
          return ;
        }
        sendImageMessage(chatSetting,this.rawImageFile).then(response=>{
          if(response.data.code==200){
            this.sendRtmChannelMessageHandler(); // notice event
            this.displayIncrementMessageV(); // fetch message
            this.resetFileInput();
            $("#imagePreviewModal").modal("hide"); // show modal
            if(!!chatSetting.sendMessageOkHandler){
              chatSetting.sendMessageOkHandler();
            }
          //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
  
          }
          if(response.data.code==40016){
            customAlert.alert(response.data.message);
          }
          if(response.data.code==40038){
            customAlert.alert(response.data.message);
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
            this.displayIncrementMessageV(); // fetch message
            this.resetBigFileInput();
          //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
            $("#sendBigFileModal").modal("hide"); // show modal
            if(!!chatSetting.sendMessageOkHandler){
              chatSetting.sendMessageOkHandler();
            }
          }
          if(response.data.code==40016){
            customAlert.alert(response.data.message);
          }
          if(response.data.code==40038){
            customAlert.alert(response.data.message);
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
      validatedImageWidthAndHeight(file){
        const feedImgFile = new Image();
          feedImgFile.onload = ()=> {

              // validate image pixel
              if(!(feedImgFile.width>=1 && feedImgFile.height>=1 && feedImgFile.width<4096 && feedImgFile.height<4096 && feedImgFile.width*feedImgFile.height<9437184)){
                  this.errors.push("图片必须至少为 1 x 1 像素,单边长度不能超过4096像素,且总像素不能超过9437184.");
                  return false;
              }
      
          };

        feedImgFile.src = URL.createObjectURL(file);
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
        this.validatedImageWidthAndHeight(file);

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
                this.fetchIncrementMessageV();
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
        if(inputBox.tagName == 'P'){
          inputBox.innerHTML += selection.emoji;
        }
        // emoji.classList.remove("empty");
        // name.classList.remove("empty");
      });

  
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
function retrieveMessage(chatSetting,pageLoadSetting){
  const finalUrl=chatSetting.fetchMessageUrl+"?current="+pageLoadSetting.defaultCurrent + "&size="+pageLoadSetting.defaultSize;
  return getMessageEvent(finalUrl);
}
function sendTextMessage(chatSetting){
  const dto={
    msg: document.querySelector(".chat-input").value,
    msgType: 'text'
  }
  return storeMessageEvent(chatSetting.sendTextMessageUrl,dto);
}
function sendMarkUpTextMessage(chatSetting){
  const dto={
    msg: document.querySelector(".chat-input").innerHTML,
    msgType: 'text',
    channel: chatSetting.rtcChannel,
    quoteMsgId: document.getElementById('quote-message-box').title
  }
  return storeMessageEvent(chatSetting.sendTextMessageUrl,dto);
}
function sendImageMessage(chatSetting,file){
  var form = new FormData();
  form.append("file",file);
  form.append("msgType","image");
  if(!!chatSetting.rtcChannel){
    form.append("channel",chatSetting.rtcChannel);
  }
  return sendMillstoneImage(chatSetting.sendImageMessageUrl,form);
}
function sendBigFileMessage(chatSetting,file){
  var form = new FormData();
  form.append("file",file);
  form.append("msgType","attachment");
  if(!!chatSetting.rtcChannel){
    form.append("channel",chatSetting.rtcChannel);
  }
  return storeMillstoneAttachment(chatSetting.sendAttachmentUrl,form);
}
function fetchIncrementMessage(chatSetting){
  const finalUrl=chatSetting.fetchMessageUrl+"?current="+1 + "&size="+5;
  return getMessageEvent(finalUrl);
}
var previousY = 0;

async function scrollToTopThenLoad(e,chatSetting,pageLoadSetting){
  // var scrollTop = e.currentTarget.scrollTop;
  var currentY = e.currentTarget.scrollTop;
  
  var canLoadNewRecord =(currentY < previousY && currentY < 500 && pageLoadSetting.current<pageLoadSetting.pages);
  if (canLoadNewRecord) {
    pageLoadSetting.current=pageLoadSetting.current+1;
  
    const finalUrl=chatSetting.fetchMessageUrl+"?current="+pageLoadSetting.current + "&size="+pageLoadSetting.size;
    previousY=0;
    return await getMessageEvent(finalUrl);
  }
  previousY = currentY;

  if(!canLoadNewRecord){
    return Promise.resolve({data: {code: ""}});
  }
}
function removeDuplicates(arr) {
  var unique = arr.reduce(function (acc, curr) {
      if(acc.filter(e=>e.id==curr.id).length==0){
        acc.push(curr);
      }
      return acc;
  }, []);
  return unique;
}
function sortMessageByCreateAt(arr){
  return arr.sort((a,b)=> a.createAt-b.createAt)
}
function incrementMessageHandler(messageArr){
  var uniArr = removeDuplicates(messageArr);
  return sortMessageByCreateAt(uniArr);

}
