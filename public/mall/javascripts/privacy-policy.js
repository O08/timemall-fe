import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

const RootComponent = {
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
const privacyPolicy = app.mount('#app');
window.PrivacyPolicy = privacyPolicy;