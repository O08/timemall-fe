
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
import {EnvWebsite} from "/common/javascripts/tm-constant.js";

const  OasisInvitationComponent = {
  props: ['oasis_id'],
  data () {
      return{
        oasisAvailableFriendsForInvation: [],
        oasisFriendsQueryParam:{
            q: "",
            oasisId: this.oasis_id
        },
        oasisUrl: EnvWebsite.PROD+"/rainbow/oasis/home?oasis_id=" + this.oasis_id
      }
  },
  methods: {
    getAvailableFriendsWhenInvationV(){

      this.oasisFriendsQueryParam.oasisId=this.oasis_id; //from oasisAnnounceComponent.js
      OasisApi.fetchFriendListNotInOasis(this.oasisFriendsQueryParam.q,this.oasisFriendsQueryParam.oasisId).then(response=>{
          if(response.data.code==200){
              this.oasisAvailableFriendsForInvation=response.data.friend.records;
          }
      });

  },
  inviteBrandV(friend){
      OasisApi.inviteBrand(friend.brandId,this.oasis_id).then(response=>{
          if(response.data.code==200){
              friend.invited="1";// 标记为已邀请
          }
      });
  },
  copyOasisInvitationLinkToClipboardV(){

    const content =  this.oasisUrl;
    copyValueToClipboard(content);

  },
  showOasisInvitationModalV(){

    this.oasisFriendsQueryParam.q="";
    this.getAvailableFriendsWhenInvationV();
    $("#invitationModal").modal("show");

  },
  },
  template: `<div class="modal-container">
  <!-- share or invite Modal -->
  <div class="modal fade" id="invitationModal" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content text-color-dark">
        <div class="modal-header">
          <h1 class="modal-title fs-5">邀请伙伴加入部落</h1>
          <button type="button"  class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          
          <div class="search-container">

          <div>
            <div class="tb-search">
              <div class="tb-search-group">
                <i class="bi bi-search"></i>
                <input @keyup.enter.native="getAvailableFriendsWhenInvationV" v-model="oasisFriendsQueryParam.q" type="search" class="input_search"
                  placeholder="搜索好友..." autocomplete="off">
              </div>
            </div>
          </div>

          </div>
           
          <div class="friend-list-container">
            <ul class="list-group">
              <li v-for="friend in oasisAvailableFriendsForInvation" class="list-group-item">
                <div class="friend-head">
                  <img  class="oasis-avatar" :src="adaptiveImageUriV(friend.avatar) || defaultAvatarImage" @error.once="e => { e.target.src = defaultAvatarImage }">
                  {{friend.title}}
                </div>
                <button 
                :class="{'disabled': friend.invited=='1','btn-outline-secondary': friend.invited=='1', 'btn-outline-success': friend.invited!='1'}"
                 v-preventreclick @click="inviteBrandV(friend)" class="btn link-btn" type="button" >
                  {{friend.invited=='1' ? '已邀请' : '邀请'}}
                </button>
              </li>
              
              
            </ul>
          </div>

          <div class="link-invite-section">
            <div class="other-invite">或者，将链接贴到博客论坛</div>

            <div class="invite-link-container">
              <div class="invite-link-wrp">
                <div class="link-content-block">
                  <input type="text" class="input-link"
                  :value="oasisUrl" disabled>
                </div>
                <div>
                  <button 
                   v-preventreclick @click="copyOasisInvitationLinkToClipboardV" type="button" class="btn btn-primary link-btn">复制</button>
                </div>

              </div>
            </div>

          </div>
          

        </div>
      </div>
    </div>
  </div>
</div>`,

}
export {OasisInvitationComponent}