import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import defaultAvatarImage from '/avator.webp'

const RootComponent = {
    data() {
      return {}
    },
    methods: {

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

const joinOasis = app.mount('#app');

window.joinOasis = joinOasis;