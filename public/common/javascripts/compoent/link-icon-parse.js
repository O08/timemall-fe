import weiboIcon from '/common/linkicon/sina-weibo.png';
import tiktokIcon from '/common/linkicon/tiktok.png';
import websiteIcon from '/common/linkicon/web.png';
import xiaohongshuIcon from '/common/linkicon/xiaohongshu.png';
import biliIcon from '/common/linkicon/bili-favicon.png';


var domains = Object.freeze({
    "Bili": "bilibili.com",
    "Weibo": "weibo.com",
    "Tiktok": "douyin.com",
    "Xiaohongshu": "xiaohongshu.com"
});
export function parseLinkUri(uri){
    // if link not have http:// or https://
    if(!uri.startsWith("http://") && !uri.startsWith("https://")){
        uri="https://" + uri;
    }
    return uri;
}

export function getLinkIconUrl(link){

    // if link not have http:// or https://
    if(!link.startsWith("http://") && !link.startsWith("https://")){
        link="https://" + link;
    }
    
    var a = document.createElement("a");
    a.href=link;
    var domain = a.hostname;
    var linkIcon ;
    switch(true){
        case domain.includes(domains.Bili):
            linkIcon = biliIcon;
            break; 
        case domain.includes(domains.Tiktok):
            linkIcon = tiktokIcon;
            break; 
        case domain.includes(domains.Weibo):
            linkIcon = weiboIcon;
            break; 
        case domain.includes(domains.Xiaohongshu):
            linkIcon = xiaohongshuIcon;
            break; 
        default:
            linkIcon = websiteIcon;
            break; 
    }

    return linkIcon;


}