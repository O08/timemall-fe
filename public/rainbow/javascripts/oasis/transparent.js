import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/rainbow/javascripts/compoent/OasisAnnounceComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import defaultAvatarImage from '/common/icon/panda-kawaii.svg';
import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js';

const currentOasisId = getQueryVariable("oasis_id");

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);

const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {

        return {
            channelSort, oaisiChannelList,getChannelDataV,
            defaultAvatarImage,
            currentOch: "oasis-home",
            q: "",
            member: {}
        }
    },
    methods: {
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        loadMemberV(){
            loadMember(this.q).then(response=>{
                if(response.data.code == 200){
                    this.member = response.data.member;
                }
            })
        },
        removeMemberV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            removeMemberB(this.oasisId,brandId);
        }
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
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}
const teamOasisMemberPage = app.mount('#app');

window.teamOasisMemberPage = teamOasisMemberPage;
// init 
teamOasisMemberPage.loadMemberV();
teamOasisMemberPage.userAdapter(); // auth.js init
teamOasisMemberPage.loadAnnounceV(); // oasis announce component .js init
teamOasisMemberPage.loadSubNav() // sub nav component .js init 
teamOasisMemberPage.loadFastLink() // announce  component .js init 

async function getMember(oasisId,q){
    const url="/api/v1/team/member?oasisId=" + oasisId+"&q="+q;
    return await axios.get(url);
}
async function removeMember(param){
    const url="/api/v1/team/oasis/remove_member";
    return await axios.delete(url,param);
}
function removeMemberB(oasisId,brandId){
    var form = new FormData();
    form.append("oasisId",oasisId);
    form.append("brandId",brandId);

    return removeMember(form);
}
function loadMember(q){
    const oasisId = getQueryVariable("oasis_id");
    return getMember(oasisId,q);
}