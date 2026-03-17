import { useAliyunOssUtil } from "./file-upload-util.js";
import {AppViberPostEmbedFacetEnum,AppViberFileSceneEnum} from "/common/javascripts/tm-constant.js";
import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';

import { ViberBaseApi } from "./viber-base-api.js";



let customAlert = new CustomAlertModal();

const {uploadPostFile} = useAliyunOssUtil();

const currentChannel = window.location.pathname.split('/').pop();


const ERROR_MESSAGES = {
    40042: "操作失败，可能原因：您已被禁言或已被移出部落"
};
function handleApiError(response, defaultMsg = "操作失败，请检查网络"){
    const { code, message } = response.data;
    const error = ERROR_MESSAGES[code] || `${defaultMsg}。异常信息：${message || ''}`;
    customAlert.alert(error);
}

function validateAndProcessCover(file, callback) {
    if (!file || !file.type.startsWith('image/')) return;
    
    if (file.size > 5 * 1024 * 1024) {
        customAlert.alert('封面图片大小不能超过5MB: ' + file.name);
        return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
        const isTooLarge = img.width >= 4096 || img.height >= 4096 || (img.width * img.height >= 9437184);
        if (isTooLarge) {
            URL.revokeObjectURL(objectUrl);
            customAlert.alert("图片单边长度不能超过4096像素,且总像素不能超过9437184");
            return;
        }
        // 校验通过，执行回调把结果给 Vue 实例
        callback(objectUrl);
    };
    img.src = objectUrl;
}

let globalPageCounter = 0;

function generateUniqueId() {
    return `page-${Date.now()}-${globalPageCounter++}`;
}

function processMangaPages(files, currentImages, callback) {
    const MAX_PAGES = 45;
    const MAX_SIZE = 5 * 1024 * 1024;
    const remaining = MAX_PAGES - currentImages.length;

    if (files.length > remaining) {
        customAlert.alert(`最多只能再上传 ${remaining} 个页面 (限制总数 ${MAX_PAGES})`);
        return;
    }

    // Process files one by one to ensure page order is preserved
    files.forEach((file, index) => {
        if (file.size > MAX_SIZE) {
            customAlert.alert(`图片 [${file.name}] 超过 5MB，已跳过`);
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file); // 1. Use Blob URL instead of Base64 (Faster)

        img.onload = () => {
            const { width, height } = img;
            // 2. Pixel validation
            if (width >= 4096 || height >= 4096 || (width * height >= 9437184)) {
                URL.revokeObjectURL(objectUrl);
                customAlert.alert(`已跳过图片 [${file.name}] ，原因：图片单边长度不能超过4096像素,且总像素不能超过9437184`);
                return;
            }

            // 3. Construct Data Structure
            const pageData = {
                pageId: generateUniqueId(),
                alt: file.name,
                aspectRatio: { height, width },
                contentType: file.type,
                size: file.size,
                rawFile: file,
                link: objectUrl,     // Local preview
                innerUrl: objectUrl  // Local preview
            };

            callback(pageData); // Send back to Vue
        };
        img.src = objectUrl;
    });
}

/**
 * 漫画发布前置处理（分段并行版）
 * 限制最大并发数为 5，兼顾速度与低端设备稳定性
 */
async function preHanderForCreateComicPost(post) {
    if (!post || !post.images?.length) return;

    // 1. 初始化数据结构
    post.embed.comic = {
        title: post.title,
        genre: post.genre,
        chapter: post.chapter,
        images: new Array(post.images.length), // 预分配，防乱序
        cover: ""
    };

    const CONCURRENCY_LIMIT = 5; // 🔥 限制并发数：每次最多 5 个请求
    const queue = [...post.images.entries()]; // [[0, img], [1, img]...]
    
    // 2. 定义单个上传工作单元
    const worker = async () => {
        while (queue.length > 0) {
            const [index, img] = queue.shift(); // 从队列头部取任务
            
            try {
                // 调用内网上传接口
                const res = await uploadPostFile(img.rawFile, currentChannel, AppViberFileSceneEnum.IMAGE);
                
                if (res.data.code === 200) {
                    // 严格按索引写入，保证页码顺序
                    post.embed.comic.images[index] = {
                        link: res.data.link,
                        innerUrl: res.data.link,
                        contentType: img.contentType,
                        type: 'file',
                        alt: img.alt,
                        size: img.size
                    };
                } else {
                    throw new Error(`第 ${index + 1} 页上传失败: ${res.data.message}`);
                }
            } catch (err) {
                // 只要有一张失败，抛出错误，Promise.all 会捕获
                throw err;
            }
        }
    };

    // 3. 封面上传（作为一个独立任务）
    const uploadCoverTask = async () => {
        if (!post.coverRawFile) return;
        const res = await uploadPostFile(post.coverRawFile, currentChannel, AppViberFileSceneEnum.IMAGE);
        if (res.data.code === 200) {
            post.embed.comic.cover = res.data.link;
        }
    };

    // 4. 启动并发池
    const pool = Array(Math.min(CONCURRENCY_LIMIT, post.images.length))
        .fill(null)
        .map(() => worker());

    // 5. 并行执行所有任务
    await Promise.all([...pool, uploadCoverTask()]);
    
    // 检查数组中是否有 undefined (由于严格索引写入，如果漏掉某页会是 undefined)
    if (post.embed.comic.images.includes(undefined)) {
        throw new Error("部分漫画页面上传未完成，请重试");
    }
}



export const comicEditorMethods = {
    validateCreateComicPostFormV() {
        const obj = this.newComicPostObj;
        
        // 1. Basic field validation (trimming whitespace for safety)
        const hasTitle = obj.title && obj.title.trim().length > 0;
        const hasGenre = obj.genre && obj.genre.trim().length > 0;
        const hasChapter = obj.chapter && obj.chapter.trim().length > 0;
        
        // 2. Media validation (Cover and at least one manga page)
        const hasCover = !!obj.cover;
        const hasPages = obj.images && obj.images.length > 0;

        return hasTitle && hasGenre && hasChapter && hasCover && hasPages;
    },
    async createComicPostV() {
        this.isPublishingComicPost = true;
        try {
            await preHanderForCreateComicPost(this.newComicPostObj);
            
            const res = await ViberBaseApi.createPost(
                currentChannel, 
                this.newComicPostObj.textMsg, 
                this.newComicPostObj.embed
            );

            if (res.data.code === 200) {
                // Success: Update UI and clear memory
                this.feedArr.unshift(res.data.post);
                $("#publishComicModal").modal("hide");
                
                // CRITICAL: Clear Blob URLs after success to free RAM
                this.clearComicMemoryV(); 
            } else {
                handleApiError(res);
            }
        } catch (error) {
            console.error("Comic Publish Error:", error);
            customAlert.alert(`处理失败，异常信息: ${error.message}`);
        } finally {
            this.isPublishingComicPost = false;
        }
    },
    clearComicMemoryV() {
        this.newComicPostObj.images.forEach(img => {
            const url = img.link;
            if (url?.startsWith('blob:')) window.URL.revokeObjectURL(url);
        });
        // 封面图也要清理
        if (this.newComicPostObj.cover?.startsWith('blob:')) {
            window.URL.revokeObjectURL(this.newComicPostObj.cover);
        }
    },
    showCreateComicPostModalV() {
        // 1. 清理 input 缓存（防止连续两次选同一张图不触发 change）
        ['comicCoverUpload', 'comicPagesUpload'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = null;
        });

        // 2. 内存清理：如果 images 里有旧的 Blob，必须先释放
        if (this.newComicPostObj?.images?.length > 0) {
            this.clearComicMemoryV();
        }

        // 3. 重置数据结构
        this.newComicPostObj = {
            textMsg: "",
            title: "",
            genre: "",
            cover: "",
            chapter: "",
            images: [],
            coverRawFile: "",
            embed: {
                facet: AppViberPostEmbedFacetEnum.COMIC,
                comic: {}
            }
        };

        // 4. 显示 Modal
        $("#publishComicModal").modal("show");
    },
    closeCreateComicPostModalV() {
        $("#publishComicModal").modal("hide");
    },
    handleComicCoverUploadV(e) {
        const file = e.target.files[0];
        
        validateAndProcessCover(file, (newUrl) => {
            // 清理旧封面内存
            if (this.newComicPostObj.cover?.startsWith('blob:')) {
                URL.revokeObjectURL(this.newComicPostObj.cover);
            }
            
            // 赋值
            this.newComicPostObj.cover = newUrl;
            this.newComicPostObj.coverRawFile = file;
        });
    },
    handleComicPagesUploadV(e) {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;

        // Call the external helper
        processMangaPages(files, this.newComicPostObj.images, (newPage) => {
            // Vue 3 automatically detects this push
            this.newComicPostObj.images.push(newPage);
        });

        // Reset the input so the same files can be selected again
        e.target.value = null;
    },
    
    deleteComicPageV(pageId) {
        // 1. 释放内存（如果不在乎这几MB内存，这行也可以删，但建议保留以防45张大图卡顿）
        const img = this.newComicPostObj.images.find(i => i.pageId === pageId);
        if (img?.link?.startsWith('blob:')) URL.revokeObjectURL(img.link);
    
        // 2. 一行搞定删除
        this.newComicPostObj.images = this.newComicPostObj.images.filter(i => i.pageId !== pageId);
    },

    onReOrderComicPagesV(event) { event.apply(this.newComicPostObj.images); },
    onInsertComicPagesV(event) { this.newComicPostObj.images.splice(event.index, 0, event.data); }
};
