import {OasisInvitationComponent} from '/micro/oasis/javascripts/oasis-option-invitation-component.js'; 
import {OasisOptionSponsorComponent} from '/micro/oasis/javascripts/oasis-option-sponsor-component.js'; 
import {OasisCollectAccountComponent} from '/micro/oasis/javascripts/oasis-option-collect_account-component.js'; 
import {OasisOptionJoinComponent} from '/micro/oasis/javascripts/oasis-option-join-component.js'; 

const OasisOptionModalsComponent = {
    components: {
        OasisInvitation: OasisInvitationComponent,
        OasisSponsor: OasisOptionSponsorComponent,
        OasisCollectAccount: OasisCollectAccountComponent,
        OasisJoin: OasisOptionJoinComponent
    },
    props: ['oasis_id','brand_id','oasis_announce',],
    emits: ['follow-success','unfollow-success'],
    data () {
        return{
            oasisId: this.oasis_id,
        }
    },
    methods: {
        doShowInvitationModalV(){
            this.$refs.oasisinvitationModal.showOasisInvitationModalV();
        },
        doShowSponsorModalV(){
            this.$refs.oasisSponsorModal.showOasisSponsorModalV();
        },
        doShowCollectAccountModalV(){
            this.$refs.oasisCollectAccountModal.showOasisCollectAccountModalV();
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

    `,


   
  }
  export {OasisOptionModalsComponent}