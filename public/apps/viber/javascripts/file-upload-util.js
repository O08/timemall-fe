import axios from 'axios';



async function fetchOssSignature(channel,extName){
    return await axios.get('/api/v1/app/viber/feed/get_post_signature_for_oss_upload', {
            params: {
                channel: channel,
                extName: extName
            }
        });
}

async function uploadToOSS(file, signature) {
    const formData = new FormData();

    // WARNING: THE ORDER OF FIELDS IS CRITICAL FOR ALIYUN OSS
    // 'file' MUST BE THE LAST FIELD.
    formData.append('key', signature.objectName);
    formData.append('policy', signature.encodedPolicy);
    formData.append('OSSAccessKeyId', signature.ossAccessKeyId);
    formData.append('success_action_status', '200'); // Force OSS to return 200 instead of 204
    formData.append('signature', signature.postSignature);
    formData.append('file', file); // <--- MUST BE LAST

    return await axios.post(signature.host, formData, { timeout: 120000 });


}

function getSafeExtension(file) {
    const filename = file.name || "";
    const lastDotIndex = filename.lastIndexOf('.');
    
    // 1. Try Filename first (Standard case: "photo.jpg")
    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
    
    // 2. Fallback to MIME Type (Edge case: "image_12345" with type "image/jpeg")
    if (file.type && file.type.includes('/')) {
        const mimeExt = file.type.split('/').pop().toLowerCase();
        // Map 'jpeg' to 'jpg' if you prefer shorter extensions
        return mimeExt === 'jpeg' ? 'jpg' : mimeExt;
    }
    
    // 3. Ultimate fallback (Safety net)
    return "unknown"; 
}

async function uploadSingleFileToOSS(file, channelId, attempt = 1) {
    const MAX_RETRIES = 3;

    try {
        const ext = getSafeExtension(file);

        const sigResponse = await fetchOssSignature(channelId, ext);
        const sig = sigResponse.data.signature; 

        if (!sig || !sig.postSignature) {
            throw new Error("Failed to obtain a valid OSS signature from the backend.");
        }

        const uploadResponse = await uploadToOSS(file, sig);

        if (uploadResponse.status === 200) {
            const rawEtag = uploadResponse.headers.etag || uploadResponse.headers.ETag || "";
            return {
                status: 200,
                objectName: sig.objectName,
                host: sig.host,
                etag: rawEtag.replace(/"/g, '')
            };
        }
        
        throw new Error(`OSS Server Error: ${uploadResponse.status}`);

    } catch (error) {
        // 高可用判定逻辑
        // isNetworkError: 涵盖了断网、DNS解析失败、连接被重置
        const isNetworkError = !error.response;
        // isTimeout: Axios 设定的超时
        const isTimeout = error.code === 'ECONNABORTED';
        // isServerError: 阿里云 OSS 临时抖动 (500, 502, 503, 504)
        const isServerError = error.response?.status >= 500;

        if (attempt < MAX_RETRIES && (isNetworkError || isTimeout || isServerError)) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.warn(`[HA] Upload failed for ${file.name}, retrying (${attempt}/${MAX_RETRIES}) after ${delay}ms...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            // 递归调用时确保返回结果
            return uploadSingleFileToOSS(file, channelId, attempt + 1);
        }

        // 如果是业务错误 (403, 413, 400) 或达到最大重试次数
        console.error(`[Fatal] ${file.name} upload failed:`, error.message);
        throw error; 
    }
}



async function doUploadPostFile(file,channel,scene){
    var fd = new FormData();
    fd.append('file', file);
    fd.append('channel', channel);
    fd.append('scene', scene);

    const url="/api/v1/app/viber/feed/file/upload";
    return await axios.post(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 120秒超时
    });

}

/**
 * 高可用上传逻辑：负责重试和异常判定
 */
async function uploadPostFile(file, channel, scene, attempt = 1) {
    const MAX_RETRIES = 3;

    try {
        const response = await doUploadPostFile(file, channel, scene);

        if (response.data && response.data.code === 200) {
            return response;
        }
        
        // 如果后端返回非 200（如 500），抛出异常进入 catch
        throw new Error(response.data?.message || "Server Error");

    } catch (error) {
        //  弱网判定逻辑
        const isNetworkError = !error.response; // 断网、DNS 错误
        const isTimeout = error.code === 'ECONNABORTED'; // 请求超时
        const isServerError = error.response?.status >= 500; // OSS/服务器抖动

        if (attempt < MAX_RETRIES && (isNetworkError || isTimeout || isServerError)) {
            // 指数退避：1s, 2s, 4s...
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.warn(`[HA] 上传失败，正在进行第 ${attempt}/${MAX_RETRIES} 次重试，等待 ${delay}ms...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // 🌟 递归调用：必须 return，确保最终成功的结果能层层返回
            return uploadPostFile(file, channel, scene, attempt + 1);
        }

        // 4. 彻底失败（重试耗尽或 403/413 等业务错误）
        console.error(`[Fatal] ${file.name} 最终上传失败:`, error.message);
        throw error; 
    }
}

export function useAliyunOssUtil() {
    return { uploadSingleFileToOSS ,uploadPostFile}
}

