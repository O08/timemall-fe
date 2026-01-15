<script setup>

  import { ref, onMounted , nextTick, onUpdated,computed} from 'vue'
  import { usePostRenderHelper } from "/apps/viber/javascripts/post-render-template-helper.js";
  import { getFileIcon,formatFileSize } from "/common/javascripts/util.js";


  defineProps({
    feed: Object
  });

  const { formatContentWithLinksV, postHasEmbedAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV } = usePostRenderHelper()

  const imageViewer=ref({
                images: [],
                imageIndex: ""
            });

  const imageViewerIsOpen = ref(false);    

  
      
        

    // image viewer
  const openImageViewer = (images, imageIndex) => {

    imageViewer.value.images=images;
    imageViewer.value.imageIndex=imageIndex;

    console.log(imageViewer)

    imageViewerIsOpen.value=true;
  }

  const closeImageViewer = () => {
      imageViewerIsOpen.value=false;
  }
  const prevImage = () => {
    if (imageViewer.value.imageIndex > 0) {
      imageViewer.value.imageIndex--;
    }
  }
  const nextImage = () => {
    if (imageViewer.value.imageIndex < imageViewer.value.images.length - 1) {
      imageViewer.value.imageIndex++;
    }
  }    


  const currentImage = computed(() => {
     return imageViewer.value?.images?.[imageViewer.value?.imageIndex];
  });

  const handleImageError = () => {
    if (currentImage.value) {
      currentImage.value.loadFail = true;
    }
  };


  const downloadFileDirect=(url, filename)=> {
    const attachmentName=!filename ? "viber-attachment" : filename;
    const a = document.createElement('a');
    a.href = url;
    a.download = attachmentName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  // 检测并处理超长内容折叠
  const initContentCollapse = () => {
      const maxHeight = 200;
      const maxChars = 200;
      
      document.querySelectorAll('.post-text').forEach(el => {
          const postId = el.dataset.postId;
          const content = el.textContent;
          const height = el.scrollHeight;
          
          // 已经处理过的跳过
          if (el.dataset.collapsed === 'true') return;
          
          // 判断是否需要折叠
          if (content.length > maxChars || height > maxHeight) {
              el.dataset.collapsed = 'true';
              el.classList.add('content-collapsed');
              
              // 添加展开按钮
              const btn = document.createElement('button');
              btn.className = 'expand-btn';
              btn.textContent = '查看更多';
              btn.onclick = () => toggleContentExpand(el, btn);
              el.parentElement.appendChild(btn);
          }
      });
  }

  // 切换内容展开/折叠
  const  toggleContentExpand = (el, btn) => {
      if (el.classList.contains('content-collapsed')) {
          el.classList.remove('content-collapsed');
          el.classList.add('content-expanded');
          btn.textContent = '收起';
      } else {
          el.classList.remove('content-expanded');
          el.classList.add('content-collapsed');
          btn.textContent = '查看更多';
      }
  }



 onMounted(()=>{
    initContentCollapse();
  })


  onUpdated(() => {
    initContentCollapse();
  })



      
</script>
<template>
  <div v-if="feed?.textMsg" class="post-content" v-html="formatContentWithLinksV(feed?.textMsg)"></div>
  <div class="post-audio-widget" v-if="postHasEmbedAudioV(feed)">
    <div class="post-audios">
      <div v-for="(audio,index) in feed.embed.audios" class="post-audio" :class="{'audio-failed': audio.loadFail}">
        <audio v-if="!audio.loadFail"  class="post-audio-player" controls controlslist="nodownload">
          <source :src="audio.url" :type="audio.contentType" @error.once="e => { audio.loadFail=true }">
          您的浏览器不支持音频播放。
        </audio>
        <div v-else  class="audio-error-container">
          <div class="audio-error-content">
            <i class="fa-solid fa-volume-up"></i>
            <p class="audio-error-text">音频加载失败</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="post-video-widget" v-if="postHasEmbedVideoV(feed)">
    <div v-for="(video,index) in feed.embed.videos" class="post-video" :class="{'video-failed': video.loadFail}">
      <video v-if="!video.loadFail" class="post-video-player" controls controlslist="nodownload" preload="metadata">
        <source :src="video.url" :type="video.contentType" @error.once="e => { video.loadFail=true }">
        您的浏览器不支持视频播放。
      </video>
      <div v-if="video.loadFail" class="video-error-container">
        <div class="video-error-content">
            <i class="fas fa-video-slash"></i>
            <p class="video-error-text">视频加载失败</p>
            <p class="video-error-hint">视频地址可能已失效</p>
        </div>
      </div>
    </div>
  </div>
  <div class="post-images-grid-widget" v-if="postHasEmbedImageV(feed)">
    <div class="post-images-grid" :class="'grid-' + (feed.embed.images.length>4 ? 'many' : feed.embed.images.length)">
      <div v-for="(image,index) in feed.embed.images" class="post-image-item" :class="{'image-failed': image.loadFail}">
        <img v-if="!image.loadFail" @click="openImageViewer(feed.embed.images,index)" :src="image.link" alt="动态图片" @error.once="e => { image.loadFail=true }" style="cursor: pointer;">
        <div v-if="image.loadFail" class="image-error-container">
          <div class="image-error-content">
              <i class="fa-solid fa-image"></i>
              <p class="image-error-text">图片加载失败</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="post-attachments-widget" v-if="postHasEmbedAttachmentV(feed)">
    <div class="post-attachments">
      <div v-for="(attachment,index) in feed.embed.attachments" class="post-attachment-item">
        <div class="post-attachment-icon">
          <i :class="getFileIcon(attachment.fileName)"></i>
        </div>
        <div class="post-attachment-info">
          <div class="post-attachment-name">{{attachment.fileName}}</div>
          <div class="post-attachment-size">{{formatFileSize(attachment.size)}}</div>
        </div>
        <button @click="downloadFileDirect(attachment.url,attachment.fileName)" class="post-attachment-download" title="下载">
          <i class="fas fa-download"></i>
        </button>
      </div>
    </div>
  </div>
  <div class="post-link-preview-widget" v-if="postHasEmbedLinkV(feed)">
    <a :href="link.url" target="_blank" v-for="(link,index) in feed.embed.links" class="post-link-preview">
      <div v-if="link.image && !link.imageLoadFail" class="post-link-preview-image">
        <img :src="link.image" alt="预览图片" @error.once="e => { link.imageLoadFail=true }">
      </div>
      <div class="post-link-preview-content">
        <div class="post-link-preview-domain">{{link.domain}}</div>
        <div class="post-link-preview-title">{{link.title}}</div>
        <div class="post-link-preview-description">{{link.description}}</div>
      </div>
    </a>
  </div>

  
      <!-- 图片查看器 -->
    <div  class="modal-container">
      <div class="modal"  data-bs-backdrop="static" tabindex="-1" :class="{'show': imageViewerIsOpen}">

        <div class="modal-dialog image-viewer-widget">
          <div class="image-viewer-container">
            <button class="image-viewer-close" @click="closeImageViewer">
              <i class="fas fa-times"></i>
            </button>
            <button :disabled="imageViewer.imageIndex==0" class="image-viewer-prev" id="imageViewerPrev" @click="prevImage()">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="image-viewer-main" :class="{'viewer-failed': currentImage?.loadFail}">
              <img v-if="!currentImage?.loadFail" 
                  id="imageViewerImage" 
                  class="image-viewer-image" 
                  :src="currentImage?.link" 
                  alt="动态图片" 
                  @error.once="handleImageError">
              <div v-else class="image-viewer-error">
                <div class="image-viewer-error-content">
                  <i class="fa-solid fa-image"></i>
                  <p class="image-viewer-error-text">图片加载失败</p>
                </div>
              </div>
            </div>
            <button :disabled="imageViewer.imageIndex==imageViewer.images.length-1"  class="image-viewer-next" id="imageViewerNext" @click="nextImage()">
              <i class="fas fa-chevron-right"></i>
            </button>
            <div class="image-viewer-counter" id="imageViewerCounter">{{imageViewer.imageIndex+1}}/ {{imageViewer.images.length}}</div>
          </div>
        </div>

      </div>
    </div>

</template>

