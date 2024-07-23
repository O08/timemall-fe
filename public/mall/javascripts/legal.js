import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

const RootComponent = {
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);

const legalPage = app.mount('#app');
window.LegalPage = legalPage;