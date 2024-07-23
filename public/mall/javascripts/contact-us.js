import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

const RootComponent = {
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content') || tag.startsWith('sub-nav')
}
const contactUsPage = app.mount('#app');
window.ContactUsPage = contactUsPage;