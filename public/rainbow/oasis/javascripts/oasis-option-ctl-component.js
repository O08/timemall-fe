import {OasisOptionModalsComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-modals-component.js'; 

const OasisOptionCtlComponent = {
    components: {
      OasisOptionModals: OasisOptionModalsComponent
    },
    props: ['oasis_id','initiator_role','joinedoasis', 'oasis_announce','brand_id'],
    emits: ['follow-success','unfollow-success'],
    data () {
        return{
          oasisId: this.oasis_id,
          currentUserBrandId: this.brand_id
        }
    },
    methods: {
      inOasisV(){
        return inOasisB(this.joinedoasis,this.oasisId);
      },
      showReportModalV(){
 
        this.$refs.oasisOptionModals.doShowReportModalV();

      },
      showInvitationModalV(){
 
        this.$refs.oasisOptionModals.doShowInvitationModalV();

      },
      showSponsorModalV(){
 
        this.$refs.oasisOptionModals.doShowSponsorModalV();

      },
      showAdminWithdrawModalV(){
        this.$refs.oasisOptionModals.doShowAdminWithdrawModalV();
      },
      showCollectAccountModalV(){
 
        this.$refs.oasisOptionModals.doShowCollectAccountModalV();

      },
      handleUnfollowSuccessEventV(){
        this.$emit('unfollow-success', '');
      },
      handleJoinSuccessEventV(){
        this.$emit('follow-success', '');
      },
      followOasisV(){
        this.$refs.oasisOptionModals.doFollowOasisV();
      },
      unfollowOasisV(){
        this.$refs.oasisOptionModals.doUnFollowOasisV();
      },
      initiatorRoleV(){
        return this.currentUserBrandId == this.oasis_announce.initiator;
      }

    },
    template: `
<div class="nav-title  mt-3">
    <div id="oasis-more-option-menu" class="dropdown-center">

      <button type="button" class="btn btn-secondary dropdown-toggle btn-oasis-option" data-bs-toggle="dropdown" aria-expanded="false">
        <h3>{{oasis_announce.title}}</h3>
        <i class="bi bi-chevron-down"></i>
      </button>

      <ul class="dropdown-menu">

        <li>
          <a  class="dropdown-item"  :href="'/rainbow/oasis/membership?oasis_id='+oasisId">
            <button type="button" class="btn  oasis-option">
            <i class="bi bi-cart me-1"></i> 订阅会员
            </button>
          </a>
        </li>
        
      <li><a class="dropdown-item">
      <button @click="showSponsorModalV" v-preventreclick   type="button" class="btn  oasis-option">
        <i class="bi bi-droplet me-1"></i> 助力部落
      </button>
      </a>
    </li>
    <li><a class="dropdown-item">
      <button @click="showCollectAccountModalV" v-preventreclick   type="button" class="btn  oasis-option" >
        <i class="bi bi-coin me-1"></i> 每日收账
      </button>
        </a>
    </li>
    <li v-if="initiatorRoleV()">
      <a  class="dropdown-item" :href="'/rainbow/oasis/mini-assistant?oasis_id='+oasisId">
        <button type="button" class="btn oasis-option">
          <i class="bi bi-flask me-1"></i> 频道助手
        </button>
      </a>
    </li>
    
    <li v-if="!inOasisV() && oasis_announce.canAddMember == '1'"><a  class="dropdown-item">
      <button @click="followOasisV"  v-preventreclick  type="button" class="btn  oasis-option">
        <i class="bi bi-node-plus me-1"></i> 加入部落
      </button>
      </a>
    </li>
    <li v-if="inOasisV()&&!initiatorRoleV()">
      <a  class="dropdown-item">
        <button @click="unfollowOasisV"  v-preventreclick  type="button" class="btn oasis-option" >
          <i class="bi bi-box-arrow-right me-1"></i> 离开部落
        </button>
      </a>
    </li>
    <li v-if="initiatorRoleV()">
      <a  class="dropdown-item"  :href="'/rainbow/oasis/setting?oasis_id='+oasisId">
        <button type="button" class="btn  oasis-option">
          <i class="bi bi-gear me-1"></i> 部落设置
        </button>
      </a>
    </li>
    <li v-if="initiatorRoleV()">
      <a  class="dropdown-item">
        <button @click="showAdminWithdrawModalV" type="button" class="btn oasis-option">
          <i class="bi bi-piggy-bank me-1"></i> 取出资金
        </button>
      </a>
    </li>
    <li  v-if="oasis_announce.canAddMember == '1' && (initiatorRoleV() || (!initiatorRoleV() && oasis_announce.forPrivate == '0') )">
      <a  class="dropdown-item">
        <button @click="showInvitationModalV" v-preventreclick  type="button" class="btn oasis-option">
          <i class="bi bi-person-plus me-1"></i> 邀请&招新
        </button>
      </a>
    </li>
    <li>
      <a  class="dropdown-item">
        <button @click="showReportModalV" v-preventreclick  type="button" class="btn oasis-option">
          <i class="bi bi-flag me-1"></i> 举报部落
        </button>
      </a>
    </li>
    
      </ul>
    </div>
  </div>

<oasis-option-modals   @unfollow-success="$emit('unfollow-success')"  @follow-success="$emit('follow-success')" ref="oasisOptionModals" :oasis_announce="oasis_announce" :oasis_id="oasisId" :brand_id="currentUserBrandId" />
`,


   
  }

  function inOasisB(joinedoases, currentOasisId){
    if($.isEmptyObject(joinedoases)){
        return;
    }
   return  !!joinedoases.records.filter(e=>e.id === currentOasisId)[0]
}

  export {OasisOptionCtlComponent}