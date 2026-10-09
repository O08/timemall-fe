
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import { formatCmpctNumber } from "/common/javascripts/util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

function explainOasisMark(mark){
    var markDesc="未知";
    switch(mark){
      case '1':
        markDesc="草稿"
          break;
      case '2':
        markDesc="运营中"
          break;
      case '3':
        markDesc="无管理员"
           break;
      case '4':
        markDesc="违规封禁"
           break;
    }
    return markDesc;
}
const  OasisCommunityDirectoryComponent = {
  data () {
      return{
        oasisAvatarDefault: oasisAvatarDefault,
        communityDirectorySearchKey: "",
        communityDirectory: {
            records:[]
        }
      }
  },
  methods: {

    explainOasisMarkV(mark){
        return explainOasisMark(mark);
    },
    retrieveCommunityGridV(){
        OasisApi.getAListOfJoinedOases(this.communityDirectorySearchKey).then(response=>{
            if(response.data.code == 200){
                this.communityDirectory = response.data.joined;
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error); 
           }
        })
    },

    formatCmpctNumberV(number){
        return formatCmpctNumber(number);
    },
    doShowCommunityDirectoryModalV(){

        this.communityDirectorySearchKey="";

        OasisApi.getAListOfJoinedOases(this.communityDirectorySearchKey).then(response=>{
            if(response.data.code == 200){
                this.communityDirectory = response.data.joined;
                $("#communityDirectoryModal").modal("show");
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error); 
           }
        })


    },
  },
  template: `

  <div class="modal fade community-directory" id="communityDirectoryModal" tabindex="-1" aria-labelledby="communityDirectoryTitle" aria-modal="true" role="dialog">
  <div class="modal-dialog modal-fullscreen-lg-down modal-dialog-centered">
    <div class="modal-content scrollbar-hide">
      <div class="directory-body">
        <div class="directory-header">
          <div>
          </div>
          <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="关闭">
          </button>
        </div>

        <label class="directory-search">
          <i class="bi bi-search"></i>
          <input @keyup.enter.native="retrieveCommunityGridV" v-model="communityDirectorySearchKey" id="communitySearch" type="text" maxlength="72" placeholder="搜索部落" autocomplete="off" aria-label="搜索部落">
        </label>

        <div class="directory-section-heading">
          <strong id="directoryHeading">已加入的部落</strong>
        </div>

        <div class="community-grid" id="communityGrid">

            <a class="text-decoration-none community-card-wrp" :key="community.id" v-for='community in communityDirectory.records' :href="'/'+community.handle">

                <div  class="community-card">
                    <div class="community-avatar">
                    <img :src="community.avatar || oasisAvatarDefault" @error="e => { e.target.src = oasisAvatarDefault }">
                    </div>
                    <span class="community-name">{{community.title}}</span>
                    <span class="community-category">{{community.subtitle}}</span>
                    <span class="community-metadata">
                    <span>{{formatCmpctNumberV(community.membership)}} 位成员</span>
                    <span class="unread-state">{{explainOasisMarkV(community.mark)}}</span>
                    </span>
                </div>

            </a>

        </div>

        <div v-if="communityDirectory?.records.length==0"  class="directory-empty-state" id="directoryEmptyState">
          <div>
            <i class="bi bi-search fs-3"></i>
            <div class="mt-3 fw-semibold text-light">没有找到相关部落</div>
            <div class="small mt-1">换个关键词试试</div>
          </div>
        </div>

        <footer class="directory-footer">
          <a href='/rainbow/discovery-oasis'>
            <button class="discovery-link" type="button">
            <span class="discovery-icon"><i class="bi bi-plus-lg"></i></span>
            <span>
                <span class="d-block discovery-title">发现部落</span>
                <span class="d-block discovery-description">
                浏览并加入感兴趣的部落
                </span>
            </span>
            <i class="bi bi-chevron-right ms-2"></i>
            </button>
          </a>
        </footer>
      </div>
    </div>
  </div>
</div>
  `,

}
export {OasisCommunityDirectoryComponent}