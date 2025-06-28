import {OasisInvitationComponent} from '/rainbow/oasis/javascripts/oasis-option-invitation-component.js'; 
import {OasisOptionSponsorComponent} from '/rainbow/oasis/javascripts/oasis-option-sponsor-component.js'; 
import {OasisCollectAccountComponent} from '/rainbow/oasis/javascripts/oasis-option-collect_account-component.js'; 
import {OasisOptionJoinComponent} from '/rainbow/oasis/javascripts/oasis-option-join-component.js'; 
import {OasisAdminWithdrawComponent} from '/rainbow/oasis/javascripts/oasis-option-admin-withdraw-component.js'; 
import {OasisOptionReportComponent} from '/rainbow/oasis/javascripts/oasis-option-report-component.js'; 


const OasisOptionModalsComponent = {
    components: {
        OasisInvitation: OasisInvitationComponent,
        OasisSponsor: OasisOptionSponsorComponent,
        OasisCollectAccount: OasisCollectAccountComponent,
        OasisJoin: OasisOptionJoinComponent,
        OasisAdminWithdraw: OasisAdminWithdrawComponent,
        OasisReport: OasisOptionReportComponent
    },
    props: ['oasis_id','brand_id','oasis_announce',],
    emits: ['follow-success','unfollow-success'],
    data () {
        return{
            oasisId: this.oasis_id,
        }
    },
    methods: {
        doShowReportModalV(){
            this.$refs.oasisReportModal.showOasisReportModalV();
        },
        doShowInvitationModalV(){
            this.$refs.oasisinvitationModal.showOasisInvitationModalV();
        },
        doShowSponsorModalV(){
            this.$refs.oasisSponsorModal.showOasisSponsorModalV();
        },
        doShowCollectAccountModalV(){
            this.$refs.oasisCollectAccountModal.showOasisCollectAccountModalV();
        },
        doShowAdminWithdrawModalV(){
            this.$refs.oasisAdminWithdrawModal.showOasisCollectAccountModalV();
        },
        handleJoinSuccessEventV(){
            this.$emit('follow-success', '');
        },
        handleUnfollowSuccessEventV(){
            this.$emit('unfollow-success', '');
        },
        doFollowOasisV(){
            this.$refs.oasisJoinModal.followOasisV();
        },
        doUnFollowOasisV(){
            this.$refs.oasisJoinModal.unfollowOasisV();
        }
    },
    template: `
    <oasis-invitation ref="oasisinvitationModal" :oasis_id="oasisId"/>
    <oasis-sponsor ref="oasisSponsorModal" :oasis_id="oasisId"/>
    <oasis-collect-account  ref="oasisCollectAccountModal" :oasis_id="oasisId" :current_user_brand_id="brand_id" />
    <oasis-join @unfollow-success="$emit('unfollow-success')"  @follow-success="$emit('follow-success')" ref="oasisJoinModal" :oasis_announce="oasis_announce" :oasis_id="oasisId" :current_user_brand_id="brand_id" />
    <oasis-admin-withdraw ref="oasisAdminWithdrawModal" :oasis_id="oasisId"/>
    <oasis-report ref="oasisReportModal" :oasis_id="oasisId"/>

    `,


   
  }
  export {OasisOptionModalsComponent}