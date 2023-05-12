import { createPopup } from "@picmo/popup-picker";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";



const MillstoneChatCompoent = {
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
        channel: getQueryVariable("workflow_id"),
        channelMessageFallback: ()=>{
            this.retrieveMessageV();
          }
        }
       
      }
  },
  methods: {
    sendTextMessageV(){
      const millstoneId = getQueryVariable("workflow_id");
      const msg = document.querySelector(".chat-input").value
      if(!millstoneId|| !msg || !msg.trim()){
        return ;
      }
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendTextMessage(brandId).then(response=>{
        if(response.data.code==200){
          document.querySelector(".chat-input").value='';
          document.querySelector(".chat-input").style.height=32 + "px";
          this.sendRtmChannelMessageV(); // notice event
          this.retrieveMessageV(); // fetch message
        }
      }).catch(err=>{
        alert("系统异常，请检查网络或者重新发送！")
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

        }
      }).catch(err=>{
        alert("系统异常，请检查网络或者重新发送！")
      });
    },
    sendAttachmentV(){
      const brandId = this.getIdentity().brandId; // Auth.getIdentity();
      sendBigFileMessage(brandId,this.rawBigfile).then(response=>{
        if(response.data.code==200){
          this.sendRtmChannelMessageV(); // notice event
          this.retrieveMessageV(); // fetch message
          this.resetBigFileInput();
          $("#sendBigFileModal").modal("hide"); // show modal
        }
      }).catch(err=>{
        alert("系统异常，请检查网络或者重新发送！")
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
      {},
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

async function storeMessageEvent(millstoneId,dto){
  const url = "/api/v1/ms/millstone/{millstone_id}/store".replace("{millstone_id}",millstoneId);
  return await axios.put(url,dto);
}
async function getMessageEvent(millstoneId){
  const url = "/api/v1/ms/millstone/{millstone_id}/event".replace("{millstone_id}",millstoneId);
  return await axios.get(url);
}
async function sendMillstoneImage(millstoneId, form){
  const url ="/api/v1/ms/millstone/{millstone_id}/storeImage".replace("{millstone_id}",millstoneId);
  return await axios.put(url,form);
}
async function storeMillstoneAttachment(millstoneId, form){
  const url ="/api/v1/ms/millstone/{millstone_id}/storeAttachment".replace("{millstone_id}",millstoneId);
  return await axios.put(url,form);
}
function retrieveMessage(){
  const millstoneId = getQueryVariable("workflow_id");
  return getMessageEvent(millstoneId);
}
function sendTextMessage(authorId){
  const millstoneId = getQueryVariable("workflow_id");
  const dto={
    authorId: authorId,
    msg: document.querySelector(".chat-input").value,
    msgType: 'text'
  }
  return storeMessageEvent(millstoneId,dto);
}
function sendImageMessage(authorId,file){
  const millstoneId = getQueryVariable("workflow_id");
  var form = new FormData();
  form.append("file",file);
  form.append("authorId",authorId);
  form.append("msgType","image");
  return sendMillstoneImage(millstoneId,form);
}
function sendBigFileMessage(authorId,file){
  const millstoneId = getQueryVariable("workflow_id");
  var form = new FormData();
  form.append("file",file);
  form.append("authorId",authorId);
  form.append("msgType","attachment");
  return storeMillstoneAttachment(millstoneId,form);
}


export default MillstoneChatCompoent;