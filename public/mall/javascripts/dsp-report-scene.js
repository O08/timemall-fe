import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { getQueryVariable } from "/common/javascripts/util.js";

const virtualOrderId= getQueryVariable("order_id");

const RootComponent = {
    data() {
        return {
            virtualOrder: {
                scene: "虚拟商品订单",
                orderId: virtualOrderId
            }
        }}
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);

const reportScenePage = app.mount('#app');
window.ReportScenePage = reportScenePage;