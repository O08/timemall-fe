import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";

let customAlert = new CustomAlertModal();

const fontSizeArr = ['14px', '16px', '18px', '20px', '22px'];
const backgroundArr = [
  "#1a1a1a", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff",
  "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff",
  "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff",
  "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2",
  "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"
];

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);




const currentOch = window.location.pathname.split('/').pop();

const sandboxEnv= getQueryVariable("sandbox");

const RootComponent = {
    data() {
      return {
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        currentOch,
        feedArr: [],
        guide: {
          layout: ""
        },
        newFeedObj: {
          channel: currentOch,
          ctaSecondaryUrl: "",
          ctaSecondaryLabel: "",
          ctaPrimaryUrl: "",
          ctaPrimaryLabel: "",
          richMediaContent: "",
          preface: "",
          title: ""
        },
        feedList_pagination: {
          url: "/api/v1/app/feed/list",
          size: 21,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          isLoading: false,
          param: {
            q: '',
            sort: "2",
            filter: "0",
            channel: currentOch
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.feedList_pagination.size = response.feed.size;
                  this.feedList_pagination.current = response.feed.current;
                  this.feedList_pagination.total = response.feed.total;
                  this.feedList_pagination.pages = response.feed.pages;
                  this.feedList_pagination.records = response.feed.records;
                  this.feedList_pagination.isLoading = false;
                  this.feedArr.push(...response.feed.records);
                  // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
              }
          }
      }
      }
    },
    methods: {
       previewFeedCoverV(e){
        previewFeedCover(e,this);
       },
       reSelectFeedCoverFileV(){
         $("#file_cover").trigger("click");
       },
       removeFeedCoverFileV(){
        document.getElementById("file_cover").value=null;
        this.newFeedObj.feedCoverFileUrl = "";

       },
       showNewFeedModalV(){
        resetNewFeedModel();
        $("#newFeedModal").modal("show");
       },
       closeNewFeedModalV(){

        resetNewFeedModel();
        $("#newFeedModal").modal("hide");
       },
       fetchChannelGiudeInfoV(){
        
        fetchChannelGiudeInfo(this.currentOch).then(response=>{
            if(response.data.code == 200){
                this.guide=response.data.guide;
            }
        })
       },
       retrieveFeedListV(){
         this.feedArr=[]; // reset feed 
         this.feedList_pagination.current = 1;
         this.reloadPage(this.feedList_pagination);
       },
       publishNewFeedV(){


        publishNewFeed(this).then(response=>{

          if(response.data.code == 200){
            this.closeNewFeedModalV();

            // refrest feed list
            this.feedList_pagination.param.q="";
            this.feedList_pagination.param.sort="2";
            this.feedList_pagination.param.filter="0";
            this.feedList_pagination.current=1;
            this.retrieveFeedListV();
          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }


        });
       },
        formatDateV(datestr) {
          var date = new Date(datestr);
          var year = date.getFullYear();
      
      
          var month = date.getMonth() + 1;
      
      
          var day = date.getDate();
      
      
          return `${year}年${month}月${day}日`;
      
    
        }
    
    
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

     

        // document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const feedsboardPage = app.mount('#app');

window.feedsboardPage = feedsboardPage;

feedsboardPage.pageInit(feedsboardPage.feedList_pagination);

feedsboardPage.fetchChannelGiudeInfoV();

const toolbarOptions = [
  [{ 'size': fontSizeArr }],  // custom dropdown
  [{ 'color': [] }, { 'background': backgroundArr }],          // dropdown with defaults from theme
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  [{ 'align': [] }],
  ['blockquote', 'code-block'],
  ['link'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  ['clean']                                         // remove formatting button
];

const quill = new Quill('#editor', {
  modules: {
    toolbar: toolbarOptions
  },
  theme: 'snow'
});


async function doPublishNewFeed(dto, coverFile){
  var form = new FormData();
    form.append("title",dto.title);
    form.append("preface",dto.preface);
    form.append("richMediaContent",dto.richMediaContent);
    form.append("ctaPrimaryLabel",dto.ctaPrimaryLabel);
    form.append("ctaPrimaryUrl",dto.ctaPrimaryUrl);
    form.append("ctaSecondaryLabel",dto.ctaSecondaryLabel);
    form.append("ctaSecondaryUrl",dto.ctaSecondaryUrl);
    form.append("channel",dto.channel);
    if(!!coverFile){
      form.append("coverFile",coverFile);
    }


    const url = "/api/v1/app/feed/new";

    return await   axios.post(url, form);

}

async function getChannelGiudeInfo(channel){
  const url="/api/v1/app/feed_channel/{channel}/guide".replace("{channel}",channel);
  return await axios.get(url);
}

async function fetchChannelGiudeInfo(channel){
  return await getChannelGiudeInfo(channel);
}
async function publishNewFeed(appObj){
  
  if(!quill.getText().trim()){
    customAlert.alert("需要输入帖子正文！")
    return;
 }
 if(!appObj.newFeedObj.title){
   customAlert.alert("需要输入帖子标题！")
   return;
 }

 if(!!appObj.newFeedObj.ctaPrimaryUrl && !isValidHttpUrlNeedScheme(appObj.newFeedObj.ctaPrimaryUrl )){
  customAlert.alert("优选CTA链接无效，需要调整！")
  return;
 }
 if(!!appObj.newFeedObj.ctaSecondaryUrl && !isValidHttpUrlNeedScheme(appObj.newFeedObj.ctaSecondaryUrl )){
  customAlert.alert("次选CTA链接无效，需要调整！")
  return;
 }


 appObj.newFeedObj.richMediaContent = quill.getSemanticHTML();


  // max length == 60000
  if(appObj.newFeedObj.richMediaContent.length>60000){
    customAlert.alert("帖子正文内容长度超出容量，需要重新调整！")
    return;
  }

  const coverFile = document.getElementById("file_cover").files[0];
 
  return await doPublishNewFeed(appObj.newFeedObj, coverFile)

}

function resetNewFeedModel(){

  feedsboardPage.newFeedObj={
          channel: currentOch,
          ctaSecondaryUrl: "",
          ctaSecondaryLabel: "",
          ctaPrimaryUrl: "",
          ctaPrimaryLabel: "",
          richMediaContent: "",
          preface: "",
          title: "",
          feedCoverFileUrl: ""
  };
  document.getElementById("file_cover").value=null;
  quill.root.innerHTML = '';

}
function previewFeedCover(e,appObj){

  const file = e.target.files[0];

  const URL2 = URL.createObjectURL(file);

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
      customAlert.alert("图片最大为6M!");
      return false;
  }

  const feedCoverImgFile = new Image();
    feedCoverImgFile.onload = ()=> {

        // validate image pixel
        if(!(feedCoverImgFile.width>=99 && feedCoverImgFile.height>=99 && feedCoverImgFile.width<4096 && feedCoverImgFile.height<4096 && feedCoverImgFile.width*feedCoverImgFile.height<9437184)){
            console.log("current image: width=" + feedCoverImgFile.width + "  height="+feedCoverImgFile.height);
            customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
            return false;
        }
 

        appObj.newFeedObj.feedCoverFileUrl = URL2;


    };

   feedCoverImgFile.src = URL.createObjectURL(file);

}

const container = document.querySelector("micro-app");


container.onscroll = () => {
  if (feedsboardPage.feedList_pagination.isLoading) return;

  const alreadyBottom = Math.ceil(container.clientHeight + container.scrollTop + 800) >= container.scrollHeight;
  const hasMore = feedsboardPage.feedList_pagination.current +1 <= feedsboardPage.feedList_pagination.pages;


  if (alreadyBottom && hasMore) {
    feedsboardPage.feedList_pagination.isLoading= true;
    feedsboardPage.feedList_pagination.current++;
    feedsboardPage.reloadPage(feedsboardPage.feedList_pagination);
  }
};


