import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceComponent from "/micro/javascripts/compoent/OasisAnnounceComponent.js"
import { getQueryVariable } from "/common/javascripts/util.js";

const RootComponent = {
    data() {
        return {
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

const teamOasisMemberPage = app.mount('#app');

window.teamOasisMemberPage = teamOasisMemberPage;

async function getMember(oasisId){
    const url="/api/v1/team/member?oasisId=" + oasisId;
    return axios.get(url);
}
function loadMember(){
    const oasisId = getQueryVariable("oasis_id");
    return getMember(oasisId);
}