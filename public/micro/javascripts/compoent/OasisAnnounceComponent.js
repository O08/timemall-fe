import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";

const OasisAnnounceComponent = {
    data() {
      return {
        oasisId: "",
        announce: {},
        fastlinks: [],
        defaultFastLink: [
            {
                "linkDetail": "招聘、求职平台",
                "linkUrl": "https://www.zhipin.com/",
                "logo": "https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/boss-logo.jpg",
                "title": "Boss直聘"
            },
            {
                "linkDetail": "线上文档",
                "linkUrl": "https://docs.qq.com/",
                "logo": "https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/texun-logo.jpg",
                "title": "腾讯文档"
            },
            {
                "linkDetail": "一站式办公服务平台",
                "linkUrl": "https://www.wps.cn/",
                "logo": "https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/wps-logo.jpg",
                "title": "WPS"
            },
            {
                "linkDetail": "AI 时代先进生产力平台",
                "linkUrl": "https://www.feishu.cn/",
                "logo": "https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/feishu-logo.png",
                "title": "飞书"
            },
            
        ]
      }
    },
    methods: {
        loadAnnounceV(){
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                window.location.href="/micro/teixcalaanli";
                return ;
            }
            OasisApi.loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce){
                        window.location.href="/micro/teixcalaanli";
                        return
                    }
                    if(this.announce.mark=='4' && window.location.pathname!=='/micro/oasis/home'){
                        window.location.href="/micro/oasis/home?oasis_id=" + oasisId;
                    }

                }
            })
        },
        initiatorRoleV(){
            const brandId = this.getIdentity().brandId;
            return brandId == this.announce.initiator;
        },
        loadFastLink(){
            const id  =  getQueryVariable("oasis_id");
            OasisApi.fetchFastLinks(id).then(response=>{
                if(response.data.code == 200){
                    this.fastlinks =  response.data.link.length==0 ? this.defaultFastLink :  response.data.link;
                }
            })
        }
    },
    created(){
        this.oasisId =  getQueryVariable("oasis_id");
    }
}


export default OasisAnnounceComponent;
