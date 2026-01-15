import { getLinkPreview } from "link-preview-js";




const parseOneLink= async (url)=>{
   
    const linkInfo = await getLinkPreview(url, {
        followRedirects: `manual`,
        handleRedirects: (baseURL, forwardedURL) => {
            const urlObj = new URL(baseURL);
            const forwardedURLObj = new URL(forwardedURL);
            if (
                forwardedURLObj.hostname === urlObj.hostname ||
                forwardedURLObj.hostname === "www." + urlObj.hostname ||
                "www." + forwardedURLObj.hostname === urlObj.hostname
            ) {
                return true;
            } else {
                return false;
            }
        },
        onResponse: (response, doc, URL) => {

            if (!response.description) {
                response.description = doc('p').first().text();
            }

            return response;
        },
    });

    return linkInfo
}

export default parseOneLink;


