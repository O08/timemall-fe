import { createPopup } from "@picmo/popup-picker";
import axios from 'axios';
import emojiData from 'emojibase-data/zh/data.json';
import messages from 'emojibase-data/zh/messages.json';
import { getQueryVariable } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const CellPlanOrderChatCompoent = {
  data(){
    return {
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
      rtcSetting: {
        channel: getQueryVariable("id"),
        channelMessageFallback: ()=>{
            this.retrieveMessageV();
            // update event feed mark
            // this.updateEventFeedMarkAsProcessedV();
          }
        }
       
      }
  },
  methods: {
    sendTextMessageV(){
      const orderId = getQueryVariable("id");
      const msg = document.querySelector(".chat-input").value
      if(!orderId|| !msg || !msg.trim()){
        return ;
      }
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendTextMessage(brandId).then(response=>{
        if(response.data.code==200){
          document.querySelector(".chat-input").value='';
          document.querySelector(".chat-input").style.height=32 + "px";
          this.sendRtmChannelMessageV(); // notice event
          this.retrieveMessageV(); // fetch message
        //   this.sendEventFeedMessageNoticeV(this.workflow.serviceInfo,orderId); // notice  user that have new message arrival
        }
      }).catch(err=>{
        customAlert.alert("系统异常，请检查网络或者重新发送！")
      });
    },
    retrieveMessageV(){
      retrieveMessage().then(response=>{
        if(response.data.code==200){
          this.eventObj = response.data.event;
        }
      })
    },
    sendImageMessageV(){
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendImageMessage(brandId,this.rawImageFile).then(response=>{
        if(response.data.code==200){
          this.sendRtmChannelMessageV(); // notice event
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
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendBigFileMessage(brandId,this.rawBigfile).then(response=>{
        if(response.data.code==200){
          this.sendRtmChannelMessageV(); // notice event
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

},
 updated(){
  if(document.getElementById("event-tab").ariaSelected=='true'){
    document.querySelector('main').scrollTop = document.querySelector('main').scrollHeight;
  }
 }
}

async function storeMessageEvent(orderId,dto){
  const url = "/api/v1/ms/plan_order/{room}/storeText".replace("{room}",orderId);
  return await axios.put(url,dto);
}
async function getMessageEvent(orderId){
  const url = "/api/v1/ms/plan_order/{room}/event".replace("{room}",orderId);
  return await axios.get(url);
}
async function sendMillstoneImage(orderId, form){
  const url ="/api/v1/ms/plan_order/{room}/storeImage".replace("{room}",orderId);
  return await axios.put(url,form);
}
async function storeMillstoneAttachment(orderId, form){
  const url ="/api/v1/ms/plan_order/{room}/storeAttachment".replace("{room}",orderId);
  return await axios.put(url,form);
}
function retrieveMessage(){
  const orderId = getQueryVariable("id");
  return getMessageEvent(orderId);
}
function sendTextMessage(authorId){
  const orderId = getQueryVariable("id");
  const dto={
    authorId: authorId,
    msg: document.querySelector(".chat-input").value,
    msgType: 'text'
  }
  return storeMessageEvent(orderId,dto);
}
function sendImageMessage(authorId,file){
  const orderId = getQueryVariable("id");
  var form = new FormData();
  form.append("file",file);
  form.append("authorId",authorId);
  form.append("msgType","image");
  return sendMillstoneImage(orderId,form);
}
function sendBigFileMessage(authorId,file){
  const orderId = getQueryVariable("id");
  var form = new FormData();
  form.append("file",file);
  form.append("authorId",authorId);
  form.append("msgType","attachment");
  return storeMillstoneAttachment(orderId,form);
}


export default CellPlanOrderChatCompoent;