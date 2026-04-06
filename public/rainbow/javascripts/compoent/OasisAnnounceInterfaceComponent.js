import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";


const OasisAnnounceInterfaceComponent = {
    data() {
      return {
        channelSort: [],
        oaisiChannelList: [],
        getChannelDataV: null,

        oasisId: "",
        oasisHandle: "",
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
        async loadAnnounceUseExternalOasisIdV(oasisId){
            this.doLoadAnnounceUseOasisIdV(oasisId);
        },
        async loadAnnounceUseExternalOasisHandleV(oasisHandle){
            this.doLoadAnnounceUseOasisHandleV(oasisHandle);
        },
        async loadFastLinkUseExternalOasisIdV(oasisId){
            this.doLoadFastLinkUseOasisIdV(oasisId);
        },


        async doLoadAnnounceUseOasisHandleV(oasisHandle){
            if(!oasisHandle){
                window.location.href="/rainbow/teixcalaanli";
                return ;
            }
            const response = await OasisApi.loadAnnounceUsingHandle(oasisHandle);
            if (response.data.code == 200) {
                this.announce = response.data.announce;
                if (!this.announce) {
                    window.location.href = "/rainbow/teixcalaanli";
                    return;
                }
                this.oasisId = this.announce.id;
                this.oasisHandle= this.announce.handle;

                const oasisHomeUrl="/" + this.announce.handle;
                if (this.announce.mark == '4' && window.location.pathname!==oasisHomeUrl) {
                    window.location.href = oasisHomeUrl;
                }
            }
        },
        async doLoadAnnounceUseOasisIdV(oasisId){
            if(!oasisId){
                window.location.href="/rainbow/teixcalaanli";
                return ;
            }
            const response = await OasisApi.loadAnnounceUsingId(oasisId);

            if(response.data.code == 200){
                this.announce = response.data.announce;
                if(!this.announce){
                    window.location.href="/rainbow/teixcalaanli";
                    return
                }
                this.oasisId = this.announce.id;
                this.oasisHandle= this.announce.handle;

                const oasisHomeUrl="/" + this.announce.handle;
                // change url to handle address for '/rainbow/oasis/home' path
                if(window.location.pathname ==='/rainbow/oasis/home'){
                    window.history.replaceState(null, "",  oasisHomeUrl);
                }
                else if (this.announce.mark == '4' && window.location.pathname!==oasisHomeUrl) {
                    window.location.href = oasisHomeUrl;

                }

            

            }
        },
        doLoadFastLinkUseOasisIdV(oasisId){
            if(!oasisId){
                return ;
            }
            OasisApi.fetchFastLinks(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.fastlinks =  response.data.link.length==0 ? this.defaultFastLink :  response.data.link;
                }
            })
        },
        doLoadOasisChannelListUseOasisIdV(oasisId){
            if(!oasisId){
                return ;
            }
            const { channelSort, oaisiChannelList, getChannelDataV } = OasisApi.fetchchannelList(oasisId);
        
            this.channelSort = channelSort;
            this.oaisiChannelList = oaisiChannelList;
            this.getChannelDataV = getChannelDataV;
        },
        initiatorRoleV(){
            const brandId = this.getIdentity().brandId;
            return brandId == this.announce.initiator;
        },
        refreshChannelListV(){
            const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(this.oasisId); 
            this.channelSort=channelSort;
            this.oaisiChannelList=oaisiChannelList,
            this.getChannelDataV=getChannelDataV;
        },


        async loadAnnounceAndFastLinkAndChannelListUseHandleV(oasisHandle,fallback){
            if(!oasisHandle) return;
            await this.doLoadAnnounceUseOasisHandleV(oasisHandle);
            if (typeof fallback === 'function') {
                fallback(this.oasisId); 
            }
            this.doLoadFastLinkUseOasisIdV(this.oasisId);
            this.doLoadOasisChannelListUseOasisIdV(this.oasisId);
        },
        async loadAnnounceAndFastLinkAndChannelListUseHandleOrOasisIdV(oasisHandle,oasisId){
            if(oasisId){
                this.oasisId=oasisId;
                await this.doLoadAnnounceUseOasisIdV(oasisId);
            }
            if(!oasisId){
                await this.doLoadAnnounceUseOasisHandleV(oasisHandle);
            }
            this.doLoadFastLinkUseOasisIdV(this.oasisId);
            this.doLoadOasisChannelListUseOasisIdV(this.oasisId);
        }

        
    }
}


export default OasisAnnounceInterfaceComponent;
