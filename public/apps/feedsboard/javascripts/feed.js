import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import Pagination  from "/common/javascripts/pagination-vue.js";
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import { getQueryVariable } from "/common/javascripts/util.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";

import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const fontSizeArr = ['14px', '16px', '18px', '20px', '22px'];
const backgroundArr = [
  "#1a1a1a", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff",
  "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff",
  "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff",
  "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2",
  "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"
];

// 自定义图片工具
const linkImageIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi ql-fill bi-image" viewBox="0 0 16 16">
<path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
<path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
</svg>`;

const ImageFormat = Quill.import('formats/image');

class CustomInlineStyleImage extends ImageFormat {
  static create(value) {
    const node = super.create(value);


    node.setAttribute('alt','paper image');
    node.setAttribute('style', 'display:block; max-width:100%; height:auto; margin:1.2rem auto 1.2rem 0; border-radius:6px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.06));');

    const absoluteSafePlaceholder = 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22180%22%3E%3Crect%20width%3D%22300%22%20height%3D%22180%22%20fill%3D%22rgba%28128%2C128%2C128%2C0.08%29%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%23888888%22%3E%E5%9B%BE%E7%89%87%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5%3C%2Ftext%3E%3C%2Fsvg%3E';
    node.setAttribute('onerror', `this.onerror=null; this.src='${absoluteSafePlaceholder}'; this.style.maxWidth='200px'; this.style.opacity='0.6';`);
    return node;
  }
}
Quill.register(CustomInlineStyleImage, true);

// 自定义嵌入视频工具
const embedVideoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi ql-fill bi-film" viewBox="0 0 16 16">
<path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm4 0v6h8V1zm8 8H4v6h8zM1 1v2h2V1zm2 3H1v2h2zM1 7v2h2V7zm2 3H1v2h2zm-2 3v2h2v-2zM15 1h-2v2h2zm-2 3v2h2V4zm2 3h-2v2h2zm-2 3v2h2v-2zm2 3h-2v2h2z"/>
</svg>`;

const BlockEmbed = Quill.import('blots/block/embed');

class EmbedVideoBlot extends BlockEmbed {
  static create(value) {
    const div = document.createElement('div');
    div.innerHTML = value.trim();
    const iframeNode = div.querySelector('iframe');
    
    // 默认兜底样式（16:9 横屏）
    let finalStyle = 'display:block; max-width:100%; width:100%; aspect-ratio:16/9; margin:1.5rem auto; border-radius:8px; background-color:#000; border:none;';

    if (iframeNode) {
      // 核心智能化逻辑：提取原始代码中的 width 和 height 数值
      const rawWidth = parseInt(iframeNode.getAttribute('width'));
      const rawHeight = parseInt(iframeNode.getAttribute('height'));

      // 如果成功提取到了宽高数值，且高度大于宽度，则铁证如山：这是一条 9:16 的竖屏视频
      if (!isNaN(rawWidth) && !isNaN(rawHeight) && rawHeight > rawWidth) {
        // 为竖屏视频量身定制样式：
        // 强制比例设为 9/16
        // 必须限制它的最大宽度（推荐 340px 左右），否则竖屏视频铺满 100% 屏幕宽度会占据好几屏高度，严重撑破网页！
        finalStyle = 'display:block; max-width:340px; width:100%; aspect-ratio:9/16; margin:1.5rem auto; border-radius:8px; background-color:#000; border:none;';
      }

      // 注入计算后的最优样式
      iframeNode.setAttribute('style', finalStyle);
      
      return iframeNode;
    } else {
      // 直连降级兜底
      const fallback = document.createElement('iframe');
      fallback.setAttribute('src', value);
      fallback.setAttribute('style', finalStyle);
      fallback.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
      return fallback;
    }
  }

  static html(node) { return node.outerHTML; }
  static value(node) { return node.outerHTML; }
}


EmbedVideoBlot.blotName = 'embed-video';
EmbedVideoBlot.tagName = 'iframe';

Quill.register(EmbedVideoBlot, true);

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);


const toolbarOptions = [
  [{ 'size': fontSizeArr }],  
  [{ 'color': [] }, { 'background': backgroundArr },{ 'align': [] },'bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block','link','text-to-image','text-to-video'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' },{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  ['clean']                                         // remove formatting button
];

var quill = ""; // init in mounted


const currentFeedId= window.location.pathname.split('/').pop();
const currentChannel= window.location.pathname.split('/').at(-2);
const sandboxEnv= getQueryVariable("sandbox");

const RootComponent = {
    data() {
      return {
        btn_ctl: {
          material_uploading: false
        },
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        newFeedComment:{
          feedId: currentFeedId,
          content: "",
          safeMode: "0"
        },
        attachmentsArr: [],
        commentArr: [],
        commentList_pagination: {
          url: "/api/open/v1/app/feed/comment/list",
          size: 20,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          isLoading: false,
          param: {
            feedId: currentFeedId
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.commentList_pagination.size = response.comment.size;
                  this.commentList_pagination.current = response.comment.current;
                  this.commentList_pagination.total = response.comment.total;
                  this.commentList_pagination.pages = response.comment.pages;
                  this.commentList_pagination.records = response.comment.records;
                  this.commentList_pagination.isLoading = false;
                  this.commentArr.push(...response.comment.records);
                  // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
              }
          }
      },
        editFeedObj: {
          id: "",
          title: "",
          preface: "",
          richMediaContent: "",
          ctaPrimaryLabel: "",
          ctaSecondaryLabel: "",
          ctaPrimaryUrl: "",
          ctaSecondaryUrl: "",
          coverUrl: ""
        },
        historyFeed:{
          id: "",
          title: "",
          preface: "",
          richMediaContent: "",
          ctaPrimaryLabel: "",
          ctaSecondaryLabel: "",
          ctaPrimaryUrl: "",
          ctaSecondaryUrl: "",
          coverUrl: ""
        },
        focusModal:{
          message: "",
          confirmHandler:()=>{

          }
        },
        oasisRole: []
      }
    },
    methods: {
      findFeedAttachmemtsV(){
        findFeedAttachmemts(currentFeedId).then(response=>{
          if(response.data.code == 200){

            this.attachmentsArr=response.data.attachments;

          }
        })
      },
      uploadAttachmentV(e){
        uploadAttachment(e,this);
      },
      deleteAttachmentV(id){
        deleteAttachment(id).then(response=>{
          if(response.data.code == 200){

            this.findFeedAttachmemtsV();

          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }
        })
      },
      previewFeedCoverV(e){
        previewFeedCover(e,this);
       },
       reSelectFeedCoverFileV(){
         $("#file_cover").trigger("click");
       },
       removeFeedCoverFileV(){
        document.getElementById("file_cover").value=null;
        this.editFeedObj.coverUrl = "";
        removeFeedCover().then(response=>{
          if(response.data.code == 200){

            this.fetchFeedInfoV();

          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }
        })
       },
      showEditFeedModalV(){
        resetEditFeedModel(this.historyFeed);
        $("#editFeedModal").modal("show");
       },
       closeEditFeedModalV(){

        resetEditFeedModel(this.historyFeed);
        $("#editFeedModal").modal("hide");
       },
       changeFeedV(){

        changeFeed(this).then(response=>{

          if(response.data.code == 200){

            this.closeEditFeedModalV();
            this.fetchFeedInfoV();

          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }

        });
       },
      fetchFeedInfoV(){
        fetchFeedInfoBO(currentFeedId).then(response=>{
          if(response.data.code == 200){

             this.historyFeed=response.data.feed;
             document.title = !!this.historyFeed ? this.historyFeed.title + " | Feed" : "访问的内容不存在或已被删除";

          }
        });
      },
      showDeleteFocusModalV(){
        this.focusModal.message="注意，帖子删除后不可恢复！";
        this.focusModal.confirmHandler=()=>{
          deleteFeedBO(currentFeedId).then(response=>{
            if(response.data.code==200){
              this.fetchFeedInfoV();
              $("#focusModal").modal("hide"); // hide modal

            }
            if(response.data.code!=200){
              const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(error); 
            }
            
          }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        }
        $("#focusModal").modal("show"); // show modal
      },
      highlightFeedV(){
        this.historyFeed.highlight= this.historyFeed.highlight=='0' ? '1' : '0';
        highlightFeedBO(this.historyFeed.highlight,currentFeedId);
      },
      pinFeedV(){

        this.historyFeed.pin= this.historyFeed.pin=='0' ? '1' : '0';
        pinFeedBO(this.historyFeed.pin,currentFeedId);

      },
      manageCommentFeatureV(){

        this.historyFeed.commentTag= this.historyFeed.commentTag=='0' ? '1' : '0';
        manageCommentFeature(this.historyFeed.commentTag ,currentFeedId);

      },
      publishNewFeedCommentV(){
        if(!this.newFeedComment.content){
          return;
        }
        publishNewFeedComment(this).then(response=>{
          if(response.data.code==200){
            this.newFeedComment.content="";// reset
            this.newFeedComment.safeMode="0";
            this.commentArr = [];
            this.commentList_pagination.current=1;

            this.reloadPage(this.commentList_pagination);

            var textarea = $('#input_comment');
            textarea.css("height","61px");


          }
        });
      },
      deleteFeedCommentV(id){
        deleteFeedComment(id).then(response=>{
          if(response.data.code==200){
            // remove comment from comment list
            this.commentArr = this.commentArr.filter(item => item.id !== id)

          }
        })
      },
      fetchOasisRoleInfoV(){
        const brandId = this.getIdentity().brandId;
        fetchOasisRoleInfo(currentChannel,brandId).then(response=>{
           if(response.data.code == 200){
             this.oasisRole = response.data.role.tier;
           }
        })
      },
      isChannelAdminRoleV(){
        return this.oasisRole.filter(e=> e == "admin").length>0;
      },
      isFeedAuthorRoleV(){
        const brandId = this.getIdentity().brandId;
        return this.historyFeed.authorBrandId == brandId;
      },
      refreshPageV(){
        window.location.reload();
      },
      copyPostUrlV(){
        const postUrl = EnvWebsite.PROD+"/fb/" + currentChannel + "/" + currentFeedId;
        copyValueToClipboard(postUrl);
      },
      autoHeightV(event){
        var elem = event.target;
        elem.style.height = "auto";
        elem.scrollTop = 0; // 防抖动
        
        elem.style.height = elem.scrollHeight + "px";
        if(elem.scrollHeight==0){
            elem.style.height=61 + "px";
        }
        if(elem.scrollHeight>128){
            elem.style.height=128 + "px";
        }
      },
      downLoadFileUriV(fileName,uri){
        return uri + "&download=true&downloadName=" + encodeURIComponent(fileName);
      },
    },
    mounted(){
        quill = new Quill('#editor', {
          modules: {
            toolbar: toolbarOptions 
          },
          theme: 'snow'
        });

        // 获取当前编辑器容器组件范围
        const editorContainer = document.querySelector('#editor').parentElement;

        // ====================================================
        // 【选中文本转图片】按钮逻辑
        // ====================================================
        const imgBtn = editorContainer.querySelector('.ql-text-to-image');
        if (imgBtn) {
          // 注入自定义图片图标
          imgBtn.innerHTML = linkImageIcon;
          imgBtn.setAttribute('title', '将选中文本转换为图片链接插入');

          imgBtn.addEventListener('click', () => {
            // 传入 true，在点击按钮失去焦点时，强制夺回最后高亮的文本范围
            const range = quill.getSelection(true);

            if (!range || range.length === 0) {
              customAlert.alert('请先在编辑器中选中一段图片 URL 链接文本！');
              return;
            }

            // 提取选中的明文地址
            const selectedText = quill.getText(range.index, range.length).trim();

            if (!selectedText.startsWith('http://') && !selectedText.startsWith('https://')) {
              customAlert.alert('链接识别失败，请确保选中内容以 http:// 或 https:// 开头');
              return;
            }

            // 执行原地替换操作
            quill.deleteText(range.index, range.length);          //  擦除纯文本网址
            quill.insertEmbed(range.index, 'image', selectedText); //  插入带样式和onerror防护的图片
            quill.setSelection(range.index + 1);                  // 光标后移
          });
        }

        // ====================================================
        // 【选中 iframe 转视频组件】按钮逻辑
        // ====================================================
        const videoBtn = editorContainer.querySelector('.ql-text-to-video');
        if (videoBtn) {
          // 注入自定义视频相机图标
          videoBtn.innerHTML = embedVideoIcon;
          videoBtn.setAttribute('title', '将选中的 iframe 代码转换为嵌入式视频组件');

          videoBtn.addEventListener('click', () => {
            // 同样强制拉回高亮文本焦点
            const range = quill.getSelection(true);

            if (!range || range.length === 0) {
              customAlert.alert('请先在编辑器中选中一整段 <iframe>...</iframe> 代码文本！');
              return;
            }

            // 直接抓取用户高亮选中的纯文本 HTML 代码
            const selectedHtmlCodeRaw = quill.getText(range.index, range.length).trim();
            if (!selectedHtmlCodeRaw.startsWith('<iframe') || !selectedHtmlCodeRaw.endsWith('</iframe>')) {
              customAlert.alert('识别失败，请输入完整的视频嵌入代码（必须以 <iframe 开头，以 </iframe> 结尾）！');
              return;
            }

            // 利用正则安全、精确地抠出 src 属性里面的纯网址（兼容单引号、双引号、无协议头等所有复杂格式）
            const srcMatch = selectedHtmlCodeRaw.match(/src=["']([^"']+)["']/i);
            if (!srcMatch || !srcMatch[1]) {
              customAlert.alert('【安全拦截】无法解析该代码中的 src 视频播放源地址！');
              return;
            }

            // 拿到干净的、没有任何 HTML 标签干扰的 URL 字符串
            let videoUrl = srcMatch[1].trim();
            let finalHtmlCode = selectedHtmlCodeRaw;

            // 只针对提取出的 URL 变量进行协议补齐，并安全回填，绝对不破坏原本 iframe 的内部属性（如 scrolling 等）
            if (videoUrl.startsWith('//')) {
              videoUrl = 'https:' + videoUrl;
              // 使用正则捕获组 $1 优雅安全地将 https: 塞回 HTML 中
              finalHtmlCode = selectedHtmlCodeRaw.replace(/src=["']\/\/([^"']+)["']/i, `src="https://$1"`);
            }

            // 精简、精准的官方视频播放专用“二级域名”白名单，去掉干扰的 :// 前缀，完美兼容 www. 和 v. 等子域名
            const trustedDomains = [
              'player.bilibili.com',
              'www.youtube.com',
              'www.youtube-nocookie.com',
              'v.qq.com',
              'player.youku.com'
            ];

            // 正向判定检查——核对解析出的真实视频网址中，是否包含了白名单里的合规域名
            const isTrusted = trustedDomains.some(domain => videoUrl.includes(domain));

            if (!isTrusted) {
              customAlert.alert('【安全拦截】系统检测到该代码指向未授权的外部视频服务器！支持视频平台：Bilibili、优酷、腾讯视频、Youtube。');
              return;
            }

            quill.deleteText(range.index, range.length);                 // 抹除选中的大段文本
            quill.insertEmbed(range.index, 'embed-video', finalHtmlCode); // 将清洗完美的 finalHtmlCode 插入为组件
            quill.setSelection(range.index + 1);                         // 光标后移
          });
        }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

     

        
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const feedPage = app.mount('#app');

window.feedPage = feedPage;



feedPage.fetchFeedInfoV();
feedPage.pageInit(feedPage.commentList_pagination);
feedPage.fetchOasisRoleInfoV();
feedPage.findFeedAttachmemtsV();

async function fetchFeedInfo(feedId){
  const url="/api/open/v1/app/feed/{id}".replace("{id}",feedId);
  return await axios.get(url);
}

async function deleteFeed(feedId){

  const url="/api/v1/app/feed/{id}".replace("{id}",feedId);
  return await axios.delete(url);

}
async function deleteFeedCover(feedId){
  const url="/api/v1/app/feed/{id}/cover".replace("{id}",feedId);
  return await axios.delete(url);
}
async function doEditFeed(dto){

  const url = "/api/v1/app/feed/edit";
  return await axios.put(url,dto);

}

async function doHighlightFeed(tag,feedId){
  const dto={
    feedId: feedId,
    tag: tag
  }
  const url="/api/v1/app/feed/toggle_highlight";
  return await axios.put(url,dto);
}
async function doPinFeed(tag,feedId){
  const dto={
    feedId: feedId,
    tag: tag
  }
  const url="/api/v1/app/feed/toggle_pin";
  return await axios.put(url,dto);
}

// close or open comment feature
async function doManageCommentFeature(tag,feedId){
  const dto={
    feedId: feedId,
    tag: tag
  }
  const url="/api/v1/app/feed/toggle_comment";
  return await axios.put(url,dto);
}

async function doChangeFeedCover(feedId,files){
  var fd = new FormData();
  fd.append('coverFile', files);
  const url = "/api/v1/app/feed/{id}/cover".replace("{id}",feedId);
  return await axios.put(url, fd);
}

async function doPublishNewComment(dto){

  const url ="/api/v1/app/feed/comment/new";
  return await axios.post(url,dto);

}

async function doDeleteFeedComment(id){

  const url="/api/open/v1/app/feed/comment/{id}".replace("{id}",id);
  return await axios.delete(url);

}
async function doFetchOasisRoleInfo(params){
  const url = "/api/open/app/oasis/role";
  return await axios.get(url,{params});
}

async function doFetchAttachments(feedId){
  const url="/api/open/v1/app/feed/{id}/attachments".replace("{id}",feedId);
  return await axios.get(url);
}
async function doUploadAttachment(file,feedId){
  var fd = new FormData();
  fd.append('feedId', feedId);
  fd.append('attachment', file);
  const url = "/api/v1/app/feed/attachment/add";
  return await axios.post(url, fd);
}
async function doDeleteAttachment(id){
  const url="/api/v1/app/feed/attachment/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}
async function deleteAttachment(id){
  return await doDeleteAttachment(id);
}
async function findFeedAttachmemts(feedId){
  return await doFetchAttachments(feedId);
}
async function removeFeedCover(){
  return await deleteFeedCover(currentFeedId);
}
async function changeFeedCover(){
  const coverFile = document.getElementById("file_cover").files[0];
  return await doChangeFeedCover(currentFeedId,coverFile);
}
async function fetchOasisRoleInfo(channel,brandId){
  const params = {
    channel: channel,
    brandId: brandId
  }
  return await doFetchOasisRoleInfo(params);
}
async function highlightFeedBO(tag,feedId){

  return await doHighlightFeed(tag,feedId);

}
async function pinFeedBO(tag,feedId){
  return await doPinFeed(tag,feedId);
}
async function fetchFeedInfoBO(feedId){
  return await fetchFeedInfo(feedId);
}

async function deleteFeedBO(feedId){
  return await deleteFeed(feedId);
}

async function manageCommentFeature(tag,feedId){
  return await doManageCommentFeature(tag,feedId);
}

async function publishNewFeedComment(appObj){
  
  return await doPublishNewComment(appObj.newFeedComment);
}

async function deleteFeedComment(id){
  return await doDeleteFeedComment(id);
}

async function changeFeed(appObj){
  if(!quill.getText().trim()){
    customAlert.alert("需要输入帖子正文！")
    return;
 }
 if(!appObj.editFeedObj.title){
   customAlert.alert("需要输入帖子标题！")
   return;
 }

 if(!!appObj.editFeedObj.ctaPrimaryUrl && !isValidHttpUrlNeedScheme(appObj.editFeedObj.ctaPrimaryUrl )){
  customAlert.alert("优选CTA链接无效，需要调整！")
  return;
 }
 if(!!appObj.editFeedObj.ctaSecondaryUrl && !isValidHttpUrlNeedScheme(appObj.editFeedObj.ctaSecondaryUrl )){
  customAlert.alert("次选CTA链接无效，需要调整！")
  return;
 }


 appObj.editFeedObj.richMediaContent = quill.getSemanticHTML();


  // max length == 60000
  if(appObj.editFeedObj.richMediaContent.length>60000){
    customAlert.alert("帖子正文内容长度超出容量，需要重新调整！")
    return;
  }

 
  return await doEditFeed(appObj.editFeedObj);

}
function resetEditFeedModel(feed){

  feedPage.editFeedObj=JSON.parse(JSON.stringify(feed));
  feedPage.editFeedObj.id=currentFeedId;
   quill.root.innerHTML = '';
   quill.clipboard.dangerouslyPasteHTML(0, feedPage.editFeedObj.richMediaContent);  
  
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
 


        // upload feed cover file
        changeFeedCover().then(response=>{

          if(response.data.code == 200){
            appObj.editFeedObj.coverUrl = URL2;
            appObj.fetchFeedInfoV();
          }
          if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error);
          }
        })


    };

   feedCoverImgFile.src = URL.createObjectURL(file);

}

const container = document.querySelector("micro-app");


container.onscroll = () => {
  if (feedPage.commentList_pagination.isLoading) return;

  const alreadyBottom = Math.ceil(container.clientHeight + container.scrollTop + 300) >= container.scrollHeight;
  const hasMore = feedPage.commentList_pagination.current +1 <= feedPage.commentList_pagination.pages;


  if (alreadyBottom && hasMore) {
    feedPage.commentList_pagination.isLoading= true;
    feedPage.commentList_pagination.current++;
    feedPage.reloadPage(feedPage.commentList_pagination);
  }
};


function uploadAttachment(e, appObj) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }


  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 50; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("文件最大为50M!");
    return false;
  }

  appObj.btn_ctl.material_uploading = true;

  // upload product cover file
  doUploadAttachment(file,currentFeedId).then(response => {

    if (response.data.code == 200) {


      appObj.findFeedAttachmemtsV();

    }
    if (response.data.code != 200) {
      const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
      customAlert.alert(error);
    }
    appObj.btn_ctl.material_uploading = false;

    var fileInputEl=document.getElementById("feed_attachment_file");
    if(!!fileInputEl){
      fileInputEl.value=null;
    }

  })

}