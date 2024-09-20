import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js"









const RootComponent = {
    data() {
    },
    methods: {
       
        fetchHtmlCodeV(){
            const och=window.location.pathname.split('/').pop();
            fetchHtmlCode(och).then(response=>{
                if(response.data.code == 200){

                    document.documentElement.innerHTML=response.data.htmlCode;

                }
            })
        }
    },
    created(){
        
        this.fetchHtmlCodeV();
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

        
    }
}

let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));



const htmlIdea = app.mount('#app');

window.htmlIdeaPage = htmlIdea;

async function doFetchHtmlCode(och){
    const url= "/api/public/team/app/html/{oasis_channel_id}/info".replace("{oasis_channel_id}",och);
    return await axios.get(url);
}

async function fetchHtmlCode(och){
   return doFetchHtmlCode(och);
}

