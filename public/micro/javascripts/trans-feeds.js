import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

const RootComponent = {
    data() {
      return {
      }
    },
    methods: {
        loadTransV(){
            loadTrans();
        }
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TeicallaanliSubNavComponent);

const teamFinanceTrans = app.mount('#app');

window.teamFinanceTrans = teamFinanceTrans;

async function getTrans(fid){
    const url="/api/v1/team/trans/{fid}".replace("{fid}",fid);
    return await axios.get(url);
}


function loadTrans(){
    const brandId =  teamFinanceTrans.getIdentity().brandId; // Auth.getIdentity();
    return getTrans(brandId);
}