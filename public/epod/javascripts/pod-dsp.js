import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"

const RootComponent = {
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
const dspPage = app.mount('#app');
window.cDsp = dspPage;