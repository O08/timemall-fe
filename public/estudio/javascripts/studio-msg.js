import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';


import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
const RootComponent = {
    data() {
        return {
        }
    },
    methods: {
         
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new BrandInfoComponent({need_init: true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : true,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
} 
app.mixin(new FriendListCompoent({need_init: true}));


app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                msgPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const msgPage = app.mount('#app');
window.cMsg= msgPage;


$(function(){
	$(".tooltip-nav").tooltip();
});