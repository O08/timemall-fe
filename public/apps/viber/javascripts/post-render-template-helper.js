const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
const AppViberPostEmbedFacetEnum = Object.freeze({
  "ATTACHMENT": "attachment",
  "IMAGE": "image",
  "THIRD_PARTY_IMAGE": "third_party_image",
  "THIRD_PARTY_VIDEO": "third_party_video",
  "THIRD_PARTY_AUDIO": "third_party_audio",
  "LINK": "link",
  "APPLICATION": "application"
});

export function usePostRenderHelper() {



  const formatContentWithLinksV = (content) => {
    if (!content) return '';
    content = escapeHtml(content);

    const formattedContent = content.replace(urlRegex, '<a href="$1" target="_blank" class="content-link">$1</a>');
    return `<div class="post-text">${formattedContent}</div>`;
  }
  const postHasEmbedAudioV = (post) => {
    return post?.embed?.facet == AppViberPostEmbedFacetEnum.THIRD_PARTY_AUDIO && post?.embed?.audios.length > 0;
  }
  const postHasEmbedVideoV= (post)=>{
    return post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_VIDEO && post?.embed?.videos.length>0;
  }
  const postHasEmbedImageV= (post)=>{
    return (post?.embed?.facet==AppViberPostEmbedFacetEnum.IMAGE || 
                post?.embed?.facet==AppViberPostEmbedFacetEnum.THIRD_PARTY_IMAGE) && post?.embed?.images.length>0;
  }
  const postHasEmbedAttachmentV=(post)=>{
    return post?.embed?.facet==AppViberPostEmbedFacetEnum.ATTACHMENT && post?.embed?.attachments.length>0;
  }
  const postHasEmbedLinkV=(post)=>{
    return post?.embed?.facet==AppViberPostEmbedFacetEnum.LINK && post?.embed?.links.length>0;
  }
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }



  return { formatContentWithLinksV, postHasEmbedAudioV,postHasEmbedVideoV,postHasEmbedImageV,postHasEmbedAttachmentV,postHasEmbedLinkV}

}