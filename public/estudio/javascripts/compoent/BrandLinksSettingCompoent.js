import axios from 'axios';
import { isValidHttpUrl } from "/common/javascripts/util.js";
const BrandLinksSettingCompoent = {
    data(){
        return {
            btn_ctl: {
                activate_links_save_btn: false
            }
        }
    },
    methods: {
         validateLinkFormV(){
          var linkValidated=this.brandProfile.links.filter(link=>(!link.linkTitle || !isValidHttpUrl(link.uri))).length==0;
          return linkValidated && this.btn_ctl.activate_links_save_btn;
         },
         validateLinkTitleV(index){
          this.btn_ctl.activate_links_save_btn=true;
         },
         validateLinkUriV(index){
           this.btn_ctl.activate_links_save_btn=true;

         },
         addLinkV(){
            this.brandProfile.links.push({});
          },
          removeLinkV(index){
              this.brandProfile.links.splice(index,1);
              this.btn_ctl.activate_links_save_btn= true;
          },
          settingLinksV(){
            this.brandProfile.links = this.brandProfile.links.filter(link=>{
              return link.linkTitle && link.uri;
            })
            settingLinks(this.brandProfile.links).then(response=>{
              if(response.data.code==200){
                this.btn_ctl.activate_links_save_btn = false;
              }
           });
          }
    }

}

async function updateLinksForBrand(dto){
    const url = "/api/v1/web_studio/brand/links";
    return await axios.put(url,dto)  
  }
function settingLinks(links){  
    const dto = {
      link: {
        records: links
      }
  
    }
   return updateLinksForBrand(dto)
  }


  export default BrandLinksSettingCompoent;
