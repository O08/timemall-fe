<script setup>

  import { ref, onMounted , nextTick, onUpdated,computed} from 'vue';

  import { usePostRenderHelper } from "./javascripts/post-render-template-helper.js";
  import { getFileIcon,formatFileSize } from "/common/javascripts/util.js";


  defineProps({
    feed: Object
  });

  const { postHasEmbedLocalAudioV,postHasEmbedComicV,formatContentWithLinksV, postHasEmbedThirdAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV } = usePostRenderHelper()

  const onIntersectAudio = async (isIntersecting, audio) => {
      // 如果已经 ready 了，直接返回，防止重复 fetch(HEAD)
      if (!isIntersecting || audio.ready || audio.loadFail) return;

      try {
          const response = await fetch(audio.url, { method: 'HEAD' });
          if (response.ok) {
              audio.ready = true; // 此时 Vue 已经能监听到这个属性了
          } else {
              audio.loadFail = true;
          }
      } catch (e) {
          audio.loadFail = true;
      }
  };


  const vIntersect = {
    mounted(el, binding) {
      const options = {
        root: null,
        rootMargin: '200px', // 提前 200px 加载，体验更流畅
        threshold: 0.01
      };

      const observer = new IntersectionObserver(([entry]) => {
        // 检查 binding.value 是否存在且是函数
        if (binding.value && typeof binding.value === 'function') {
          binding.value(entry.isIntersecting, entry);
        }
      }, options);

      el._observer = observer;
      observer.observe(el);
    },
    unmounted(el) {
      if (el._observer) {
        el._observer.disconnect();
        delete el._observer;
      }
    }
  };

  const imageViewer=ref({
                images: [],
                imageIndex: ""
            });

  const comicReader= ref({
                images: [],
                title: "",
                chapter: ""
            });       

  const imageViewerIsOpen = ref(false);   
  const comicReaderIsOpen = ref(false);   

  
      

   // comic reader
  const openComicReader = (comic) => {

    comicReader.value.images=comic.images;
    comicReader.value.title=comic.title;
    comicReader.value.chapter=comic.chapter;

    comicReaderIsOpen.value=true;
  }
  const closeComicReader = () => {
    comicReaderIsOpen.value=false;
  }

    // image viewer
  const openImageViewer = (images, imageIndex) => {

    imageViewer.value.images=images;
    imageViewer.value.imageIndex=imageIndex;

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
  <div class="post-audio-widget" v-if="postHasEmbedLocalAudioV(feed)">
    <div class="post-audios">
      <div v-for="(audio,index) in feed.embed.audios" class="post-audio" :key="`${feed.postId}-${index}`" :class="{'audio-failed': audio.loadFail}">
        <div  v-intersect="(isVis) => onIntersectAudio(isVis, audio)" class="w-100" style="min-height: 54px;">

          <audio v-if="audio.ready && !audio.loadFail" 
            controls 
            preload="none" 
            :src="audio.url"
            @error.once="audio.loadFail = true"
            class="post-audio-player w-100">
              您的浏览器不支持音频播放。
          </audio>

          <div v-else-if="audio.loadFail" class="audio-error-container">
            <div class="audio-error-content">
              <i class="fa-solid fa-volume-up"></i>
              <p class="audio-error-text">音频加载失败</p>
            </div>
          </div>
          <div v-else class="audio-skeleton  d-flex align-items-center justify-content-center" style="height: 54px; background: #141414; border-radius: 8px;">
            正在加载内容...
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="post-audio-widget" v-if="postHasEmbedThirdAudioV(feed)">
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
    <div v-for="(video,index) in feed.embed.videos" class="post-video" :key="feed.postId+'-vd-'+index" :class="{'video-failed': video.loadFail}">
      <div v-intersect="(isVis) => { if(isVis && !video.loadFail) video.ready = true }" class="video-container">
        <video v-if="video.ready && !video.loadFail" 
              class="post-video-player" 
              controls 
              controlslist="nodownload" 
              preload="metadata"
              :src="video.url"
              @error.once="video.loadFail = true">
          您的浏览器不支持视频播放。
        </video>
        <div v-else-if="video.loadFail" class="video-error-container">
          <div class="video-error-content">
            <i class="fas fa-video-slash"></i>
            <p class="video-error-text">视频加载失败</p>
            <p class="video-error-hint">视频地址可能已失效</p>
          </div>
        </div>
        <div v-else class="video-skeleton">
          <i class="fas fa-play-circle"></i>
        </div>
      </div>
    </div>
  </div>

  <div class="post-comic-widget" v-if="postHasEmbedComicV(feed)">
    <div class="comic-cover-wrapper">
      <div class="comic-cover" @click="openComicReader(feed.embed.comic)">
        <div class="comic-card-content">
          <!-- 封面图片 -->
          <img loading="lazy" :src="feed.embed.comic.cover"  alt="漫画封面" class="cover-image">

          <!-- 渐变遮罩 - 只在底部 -->
          <div class="gradient-overlay"></div>

          <!-- 左下角信息区 -->
          <div class="comic-info-overlay">
            <h2 class="comic-title">{{feed.embed.comic.title}}</h2>
            <div class="comic-chapter">{{feed.embed.comic.chapter}}</div>
            <div class="genre-tag-wrapper">
              <div class="genre-tag">{{feed.embed.comic.genre}}</div>
            </div>
          </div>

          <!-- hover阅读提示 -->
          <div class="read-overlay">
            <div class="read-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>点击阅读</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="post-images-grid-widget" v-if="postHasEmbedImageV(feed)">
    <div class="post-images-grid" :class="'grid-' + (feed.embed.images.length>4 ? 'many' : feed.embed.images.length)">
      <div v-for="(image,index) in feed.embed.images" class="post-image-item" :class="{'image-failed': image.loadFail}">
        <img loading="lazy" v-if="!image.loadFail" @click="openImageViewer(feed.embed.images,index)" :src="image.link" alt="动态图片" @error.once="e => { image.loadFail=true }" style="cursor: pointer;">
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
        <img loading="lazy" :src="link.image" alt="预览图片" @error.once="e => { link.imageLoadFail=true }">
      </div>
      <div class="post-link-preview-content">
        <div class="post-link-preview-domain">{{link.domain}}</div>
        <div class="post-link-preview-title">{{link.title}}</div>
        <div class="post-link-preview-description">{{link.description}}</div>
      </div>
    </a>
  </div>

  
   <Teleport defer to=".modals" v-if="imageViewerIsOpen">
      <!-- 图片查看器 -->
      <div  class="modal-container">
        <div class="modal show"  data-bs-backdrop="static" tabindex="-1">

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
    </Teleport>



    <Teleport defer to=".modals" v-if="comicReaderIsOpen">
      <!-- 漫画阅读器 -->
      <div  class="modal-container">
        <div class="modal show"  data-bs-backdrop="static" tabindex="-1" >
          <div class="modal-dialog comic-reader-widget">

            <div class="reader-header">
              <div style="width: 64px;"></div>
              <div class="reader-info">
                <h3 class="reader-title">{{comicReader.title}}</h3>
                <p class="reader-chapter">{{comicReader.chapter}}</p>
              </div>
              <button class="comic-viewer-close" @click="closeComicReader">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="reader-content">
              <div class="reader-panels">
                <!-- 面板 1 -->
                <div v-for="storeyboard in comicReader.images" class="panel-wide" :class="{'image-viewer-failed': storeyboard?.loadFail}">
                  <img  v-if="!storeyboard.loadFail" :src="storeyboard.link"  @error.once="storeyboard.loadFail=true" loading="lazy" alt="漫画内容">
                  <div v-else class="image-viewer-error">
                    <div class="image-viewer-error-content">
                      <i class="fa-solid fa-image"></i>
                      <p class="image-viewer-error-text">图片加载失败</p>
                    </div>
                  </div>
                </div>
                <!-- 章节结束 -->
                <div class="chapter-end">
                  <div class="end-badge">
                    <span>- 本话完 -</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

    

</template>

