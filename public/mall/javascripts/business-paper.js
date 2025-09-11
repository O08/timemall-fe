import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import defaultAvatarImage from '/common/icon/panda-kawaii.svg';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { Ftime,formatCmpctNumber } from "/common/javascripts/util.js";
import {goLoginPage,goError} from "/common/javascripts/pagenav.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { getQueryVariable } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';



let customAlert = new CustomAlertModal();



const RootComponent = {
    data() {
        return {
            loading: true,
            display: "normal",

            defaultAvatarImage,
            paperDetail: {
                skills: []
            },
            clientInfo: {}
        }
    },
    methods: {
       
        findPaperDetailV(){
            findPaperDetail().then(response=>{
                if(response.data.code==200){
                    this.paperDetail=response.data.detail;
                    if(!response.data.detail){
                        goError();
                    }
                    if(!!response.data.detail){
                        const documentDescription= !this.paperDetail.sow ? "" :  this.paperDetail.sow.substring(0,Math.min(156,this.paperDetail.sow.length));
                        renderPageMetaInfo(this.paperDetail.title,documentDescription);

                        findCleintMetric(this.paperDetail.purchaserId);
                    }

                    setTimeout(() => {
                        this.loading = false;
                    }, 1500);
                }
                if(response.data.code!=200){
                    goError();
                }
            }).catch(error=>{
                goError();
            });
        },
        orderReceivingV(){
            orderReceiving().then(response=>{
                if(response.data.code==200){

                    $("#orderReceivingSuccessModal").modal("show"); // show success modal

                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        closeOrderReceivingSuccessModalV(){
            $("#orderReceivingSuccessModal").modal("hide"); // show success modal
        },
        getRate(total,part){
            if(!total || Number(total)==0){
                return "0";
            }
            return (Number(part) * 100 / Number(total)).toFixed(0) ;
        },
        getPublishTimeV(date){
    
            var timespan = (new Date(date)).getTime()/1000;
             return Ftime(timespan);
         },
         formatCmpctNumberV(number){
            if(!number || Number(number)==0){
                return "0";
            }

            return formatCmpctNumber(Number(number));
        },
        formatDateV(datestr) {
            var date = new Date(datestr);
            var year = date.getFullYear();
        
        
            var month = date.getMonth() + 1;
        
        
            var day = date.getDate();
        
        
            return `${year}年${month}月${day}日`;
        
      
        }
    },
    created(){
       var displayWay = getQueryVariable("display");
       if(!!displayWay){
          this.display=displayWay;
       }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}

// app.component("infinite-loading", InfiniteLoading);
const bpPage = app.mount('#app');
window.glbBpPage = bpPage;

// init 
bpPage.findPaperDetailV();

async function fetchPaperDetail(paperId){
    const url="/api/public/commercial_paper/{id}/detail".replace("{id}",paperId);
    return await axios.get(url);
}
async function fetchClientInfo(brandId){
    const url="/api/v1/web_mall/brand/{id}/mps/metrics/query".replace("{id}",brandId);
    return await axios.get(url);
}
async function doOrderReceiving(dto){
    const url="/api/v1/web_estudio/mps_paper/order_receiving";
    return await axios.post(url,dto);
}
function orderReceiving(){
    const paperId=window.location.pathname.split('/').pop();
      // 用户未登录，跳到登录页面
      if(!bpPage.user_already_login){
        goLoginPage();
        return
    }
    const dto={
        paperId: paperId
    }
    return doOrderReceiving(dto);
}

async function findCleintMetric(brandId){
    fetchClientInfo(brandId).then(response=>{
        if(response.data.code==200){
            bpPage.clientInfo=response.data.metric;
        }
    })
}
async function findPaperDetail(){
    const paperId=window.location.pathname.split('/').pop();
    return fetchPaperDetail(paperId);
}

function renderPageMetaInfo(title,description){
    document.title = title + "｜商单";
    var keywords="bluvarri,商单,居家办公,远程工作";
    document.getElementsByTagName('meta')["description"].content = description;
    document.getElementsByTagName('meta')["keywords"].content = keywords+","+title;
}


$(function(){
	$(".tooltip-nav").tooltip();
});
