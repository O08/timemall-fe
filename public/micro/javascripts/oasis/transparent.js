import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import defaultAvatarImage from '/avator.webp';

const RootComponent = {
    data() {
        return {
            defaultAvatarImage,
            member: {}
        }
    },
    methods: {
        loadMemberV(){
            loadMember().then(response=>{
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
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
const teamOasisMemberPage = app.mount('#app');

window.teamOasisMemberPage = teamOasisMemberPage;
// init 
teamOasisMemberPage.loadMemberV();

async function getMember(oasisId){
    const url="/api/v1/team/member?oasisId=" + oasisId;
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
function loadMember(){
    const oasisId = getQueryVariable("oasis_id");
    return getMember(oasisId);
}