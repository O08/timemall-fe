import { createPopup } from "@picmo/popup-picker";
import axios from 'axios';
import emojiData from 'emojibase-data/zh/data.json';
import messages from 'emojibase-data/zh/messages.json';

import { getQueryVariable } from "/common/javascripts/util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const MpsPaperChatCompoent = {
  data(){
    return {
      urlMpsId:"",
      haveNewMpsMsgRoomIds:[],
       currentRTMChannel: "",
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

       
      }
  },
  methods: {
    joinMpsRoomsV(){

      //  public room
      var mpsId =getQueryVariable("mps_id");

      var rooms=[];
      // paper room
      this.mpmc__paperList.records.forEach(element => {
        rooms.push(element.id);
      });

      rooms.push(mpsId);
      this.joinRoomsV(mpsId,rooms,(room)=>{
        // if in current session ,fetch info
        if(this.currentRTMChannel==room){
          this.retrieveMessageV();
          // update room msg as read
          this.putMsgHelperV();
        }

        // fetch have new msg 

        this.fetchHaveNewMpsMsgRoomV();



      });

    },
    putMsgHelperV(){
      putMsgHelper(this.currentRTMChannel);
    },
    broadCastChannelHaveNewMsgV(){
      const mpsId = getQueryVariable("mps_id");
     return this.haveNewMpsMsgRoomIds.filter(e=>{return e===mpsId}).length>0
  },
  paperChannelHaveNewMsgV(paperId){
      return this.haveNewMpsMsgRoomIds.filter(e=>{return e===paperId}).length>0
  },
  fetchHaveNewMpsMsgRoomV(){
      fetchHaveNewMpsMsgRoom(this.mpmc__paperList).then(response=>{
          if(response.data.code==200){
              this.haveNewMpsMsgRoomIds=response.data.ids.records;
          }
      });
  },

    changePaperChannelV(paperId){

       this.currentRTMChannel = paperId;
       this.changeRoomV(paperId);
       this.retrieveMessageV();
       this.putMsgHelperV(); // mark msg as read
    },
    changeChannelToBroadCastV(){
        this.currentRTMChannel = getQueryVariable("mps_id");
        this.changeRoomV(getQueryVariable("mps_id"));

        this.retrieveMessageV();
        this.putMsgHelperV(); // mark msg as read
    },
    sendTextMessageV(){
      const targetId = this.currentRTMChannel;
      const msg = document.querySelector(".chat-input").value
      if(!targetId|| !msg || !msg.trim()){
        return ;
      }
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendTextMessage(brandId,targetId).then(response=>{
        if(response.data.code==200){
          document.querySelector(".chat-input").value='';
          document.querySelector(".chat-input").style.height=32 + "px";
          this.sendRtmChannelMessageV(); // notice event
          this.retrieveMessageV(); // fetch message
        }
      }).catch(err=>{
        customAlert.alert("系统异常，请检查网络或者重新发送！")
      });
    },
    retrieveMessageV(){
      retrieveMessage(this.currentRTMChannel).then(response=>{
        if(response.data.code==200){
          this.eventObj = response.data.event;
        }
      })
    },
    sendImageMessageV(){
      const targetId = this.currentRTMChannel;
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendImageMessage(brandId,this.rawImageFile,targetId).then(response=>{
        if(response.data.code==200){
          this.sendRtmChannelMessageV(); // notice event
          this.retrieveMessageV(); // fetch message
          this.resetFileInput();
          $("#imagePreviewModal").modal("hide"); // hide modal

        }
      }).catch(err=>{
        customAlert.alert("系统异常，请检查网络或者重新发送！")
      });
    },
    sendAttachmentV(){
      const targetId = this.currentRTMChannel;
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendBigFileMessage(brandId,this.rawBigfile,targetId).then(response=>{
        if(response.data.code==200){
          this.sendRtmChannelMessageV(); // notice event
          this.retrieveMessageV(); // fetch message
          this.resetBigFileInput();
          $("#sendBigFileModal").modal("hide"); // hide modal
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
    this.currentRTMChannel = getQueryVariable("mps_id"); // defautl channel is p 2 p
    this.urlMpsId= getQueryVariable("mps_id"); 
    this.retrieveMessageV();
 },
 updated(){
    if(document.getElementById("event-tab").ariaSelected=='true'){
      document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
    }
 }
}

async function storeMessageEvent(targetId,dto){
  const url = "/api/v1/ms/mps/{room}/storeText".replace("{room}",targetId);
  return await axios.put(url,dto);
}
async function getMessageEvent(targetId){
  const url = "/api/v1/ms/mps/{room}/event".replace("{room}",targetId);
  return await axios.get(url);
}
async function sendMillstoneImage(targetId, form){
  const url ="/api/v1/ms/mps/{room}/storeImage".replace("{room}",targetId);
  return await axios.put(url,form);
}
async function storeMillstoneAttachment(targetId, form){
  const url ="/api/v1/ms/mps/{room}/storeAttachment".replace("{room}",targetId);
  return await axios.put(url,form);
}

async function doFetchHaveNewMpsMsgRoom(rooms){
  const url="/api/v1/ms/mps_msg/has_new_msg?rooms="+rooms;
  return await axios.get(url);
}
async function doPutMsgHelper(dto){
  const url="/api/v1/ms/mps_msg/read";
  return await axios.put(url,dto);
}
function putMsgHelper(targetId){
  const dto={
    targetId: targetId
  }
  return doPutMsgHelper(dto);
}
function fetchHaveNewMpsMsgRoom(mpmc__paperList){
   const publicChannel=getQueryVariable("mps_id");
   const paperChannel=mpmc__paperList.records.map(e=>{return e.id}).join(',')
   const rooms=publicChannel+","+paperChannel;
 return  doFetchHaveNewMpsMsgRoom(rooms);
}

function retrieveMessage(targetId){
  return getMessageEvent(targetId);
}
function sendTextMessage(authorId,targetId){
  const dto={
    authorId: authorId,
    msg: document.querySelector(".chat-input").value,
    msgType: 'text'
  }
  return storeMessageEvent(targetId,dto);
}
function sendImageMessage(authorId,file,targetId){
  var form = new FormData();
  form.append("file",file);
  form.append("authorId",authorId);
  form.append("msgType","image");
  return sendMillstoneImage(targetId,form);
}
function sendBigFileMessage(authorId,file,targetId){
  var form = new FormData();
  form.append("file",file);
  form.append("authorId",authorId);
  form.append("msgType","attachment");
  return storeMillstoneAttachment(targetId,form);
}



export default MpsPaperChatCompoent;