import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";


import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const currentProductId= window.location.pathname.split('/').pop();
const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
        return {
          productId: currentProductId,
          reportOptions: [],
          reportForm: this.initReportForm(),
          productNotFound: false,
          profile: {
            inventory: "",
            productName: "",
            productDesc: "",
            thumbnail: "",
            price: "",
            warmReminder: "",
            productId: "",
            status: ""
          }
        }
    },
    methods: {

      productStatusClassV(profile){
        return profile.status=='3' ? "pi-status-off" : "pi-status-on";
      },
      getProductInfoV(){
        if(!this.productId){
          this.productNotFound = true;
          return ;
        }
        getProductInfo(this.productId).then(response=>{
          const profile = response.data && response.data.profile;
          if(response.data.code==200 && !!profile){
             this.profile = profile;
             this.productNotFound = false;
             const documentTitle = !this.profile.productName ? "商品详情": this.profile.productName;

             document.title = documentTitle + " - 实物商品";
          } else {
             this.productNotFound = true;
          }
        }).catch(error=>{
          this.productNotFound = true;
        })
      },
      newReportCaseV(){
        newReportCase(this.reportForm).then(response=>{
            if(response.data.code==200){

              customAlert.alert("举报/投诉记录已追加到档案库，可通过【个人中心】-【争端解决】了解最新的处理情况");
              
              document.querySelector('#caseMaterialFile').value = null;

              $("#reportOasisModal").modal("hide"); 

            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        })
      },
      showOasisReportModalV(){

          this.reportForm=this.initReportForm();
          

          showOasisReportModal(         
              this.loadReportIssueListV
          );
      },
      loadReportIssueListV(){
          loadReportIssueList(this);
      },
      validateReportFormV(){
        return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
      },
      initReportForm(){

        if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
           document.querySelector('#caseMaterialFile').value = null;
        }

        return {
            fraudType: "",
            scene: "实物商品",
            sceneUrl: currentDomain+"/mall/physical/" + currentProductId,
            caseDesc: "",
            material: ""
        }
      },
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

const physicalProduct = app.mount('#app');
window.physicalProductPage = physicalProduct;

physicalProduct.getProductInfoV();

async function fetchProduct(productId){
  const url = "/api/v1/web_mall/physical_product/{product_id}/info".replace("{product_id}",productId);
  return await axios.get(url);
}

async function getProductInfo(productId){
  return await fetchProduct(productId);
}


// report feature


async function newReportCase(reportForm){
  
  const materialFile =  $('#caseMaterialFile')[0].files[0];

  var form = new FormData();
  if(!!materialFile){
    form.append("material",materialFile);
  }
  form.append("fraudType",reportForm.fraudType);
  form.append("scene",reportForm.scene);
  form.append("sceneUrl",reportForm.sceneUrl);
  form.append("caseDesc",reportForm.caseDesc);
  return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj){
  const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE,"");
  var data = await response.json();
  if(data.code==200){
     
     appObj.reportOptions=data.codes.records;

  }
}

async function showOasisReportModal(loadReportIssueListV){
    await loadReportIssueListV();
    $("#reportOasisModal").modal("show");
}


$(function(){
	$(".tooltip-nav").tooltip();
});