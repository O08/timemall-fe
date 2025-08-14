import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { getQueryVariable } from "/common/javascripts/util.js";

const virtualOrderId= getQueryVariable("order_id");
const commonId= getQueryVariable("subscription_id");

const sceneParma = getQueryVariable("scene");

var DspRefundSceneEnum=Object.freeze({
    "CELL_PLAN_ORDER": "cell_plan_order",  // cell plan order 
    "VIRTUAL_ORDER": "virtual_order",
    "SUBSCRIPTION": "subscription"
}); 

const RootComponent = {
    data() {
        return {
            dspCase: {
                scene: explainScene(sceneParma),
                orderId: virtualOrderId,
                commonId: commonId
            }
        }}
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);

const reportScenePage = app.mount('#app');
window.ReportScenePage = reportScenePage;

function explainScene(scene){
    var sceneDesc="";
    switch(scene){
        case DspRefundSceneEnum.CELL_PLAN_ORDER:
            sceneDesc="单品订单";
            break; 
        case DspRefundSceneEnum.VIRTUAL_ORDER:
            sceneDesc="虚拟商品订单";
            break; 
        case DspRefundSceneEnum.SUBSCRIPTION:
            sceneDesc="付费订阅";
            break; 
    }
    return sceneDesc;
}