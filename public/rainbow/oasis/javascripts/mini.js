import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceInterfaceComponent from "/rainbow/javascripts/compoent/OasisAnnounceInterfaceComponent.js"

import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js'; 
import {OasisCommunityDirectoryComponent} from "/rainbow/oasis/javascripts/oasis-community-directory-component.js";


const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,, currentOch] = segments;




const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent,communitydirectory: OasisCommunityDirectoryComponent
    },
    data() {

      const physicalScreenWidth = window.screen.width;
 
      return {
        isLoadingMiniApp: false, // 初始不盲目开启转圈
        _loadStartTime: 0,
        _antiFlickerTimer: null,
        insideLargeScreen: physicalScreenWidth >= 1400 ,
        currentOch,
        appViewUrl: ""
      }
    },
    watch: {
        appViewUrl(newUrl) {
            if (newUrl) {
                // 如果上一次的延迟显示还没触发，先清理
                if (this._antiFlickerTimer) clearTimeout(this._antiFlickerTimer);
                
                // 快网速静默加载（200ms门槛）。如果微应用在200ms内闪开，用户感知不到Loading
                this._antiFlickerTimer = setTimeout(() => {
                    this.isLoadingMiniApp = true;
                    this._loadStartTime = Date.now();
                }, 200);
            }
        },
        oaisiChannelList: {
            async handler(newList) {
                if (newList && newList.length > 0) {
                    const channelMetaInfo = this.getChannelDataV(currentOch, newList);
                    document.title = channelMetaInfo.channelName;
                    this.appViewUrl = channelMetaInfo.appViewUrl + currentOch;
                }
            },
            deep: true, // Necessary if the array content changes but the reference doesn't
            immediate: true // Optional: run immediately on load
        }
    },
    methods: {
        showCommunityDirectoryV(){
            this.$refs.communitydirectoryModal.doShowCommunityDirectoryModalV();
        },
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleObjectLoaded() {
            // 如果在 200ms 黄金门槛内微应用就完工了（秒开）
            if (this._antiFlickerTimer && !this.isLoadingMiniApp) {
                clearTimeout(this._antiFlickerTimer); // 掐断定时器
                this._antiFlickerTimer = null;
                return;
            }
    
            // 如果网速慢，Loading 已经显现了，我们需要确保动画播放足够完整（至少 400ms）再收尾
            const elapsedTime = Date.now() - this._loadStartTime;
            const minDuration = 400; 
    
            if (elapsedTime < minDuration) {
                setTimeout(() => {
                    this.isLoadingMiniApp = false;
                }, minDuration - elapsedTime);
            } else {
                this.isLoadingMiniApp = false; // 加载超过门槛，立即关闭
            }
        }
        
    },
    mounted() {
        window.addEventListener('resize', () => {
          this.insideLargeScreen = window.innerWidth >= 1400;
        });
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

    }
}


let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(OasisAnnounceInterfaceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}

const mini = app.mount('#app');

window.oasisMiniPage = mini;

(async () => {
    await mini.userAdapter(); // auth.js init
    await mini.loadSubNav(); // sub nav component .js init 
    
    await mini.loadAnnounceAndFastLinkAndChannelListUseHandleV(currentOasisHandle);
    
})();
