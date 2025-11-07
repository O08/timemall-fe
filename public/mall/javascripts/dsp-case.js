import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from "axios";
import Auth from "/estudio/javascripts/auth.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { transformInputNumberAsPositiveDecimal } from "/common/javascripts/util.js";
import {Api} from "/common/javascripts/common-api.js";


let customAlert = new CustomAlertModal();
const currentCaseNo = window.location.pathname.split('/').pop();
const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
        return {
            closedCommercialPaperId:"",
            webAppDomain: currentDomain,
            virtualProductOrderRefundObj: {
                orderId: "",
                term: ""
            },
            subscriptionBillrRefundObj: {
                billId: "",
                term: ""
            },
            oasisMembershipOrderRefundObj: {
                orderId: "",
                term: ""
            },
            offlineVirtualProductId: "",
            freezeUserId: "",
            blockOasisId: "",
            offlineCellId: "",
            settingWithdrawLimitObj: {
                caseNO: currentCaseNo,
                offOrOn: ""
            },
            editCaseGeneralObj: {},
            caseNO: currentCaseNo,
            caseProfile: {
                general: {},
                material: {}
            }
        }
    },
    methods: {
        transformInputNumberAsPositiveDecimalV(event){
            return transformInputNumberAsPositiveDecimal(event);
        },
        showCloseCommercialPaperModalV(){
            this.closedCommercialPaperId = "";
            $("#closeCommercialPaperModal").modal("show"); // show modal
        },
        showOfflineCellModalV(){
            this.offlineCellId = "";
            $("#offlineCellModal").modal("show"); // show modal
        },
        showBlockOasisModalV(){
            this.blockOasisId = "";
            $("#blockOasisModal").modal("show"); // show modal
        },
        showFreezeUserModalV(){
            this.freezeUserId = "";
            $("#freezeUserModal").modal("show"); // show modal
        },
        showOfflineVirtualProductModalV(){
            this.offlineVirtualProductId = "";
            $("#offlineVirtualProductModal").modal("show"); // show modal
        },
        offlineVirtualProductV(){
            offlineVirtualProduct(this.offlineVirtualProductId).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("下架成功");
                    $("#offlineVirtualProductModal").modal("hide"); // hide modal
                }
                if(response.data.code!=200){
                    customAlert.alert(response.data.message)
                }
            })
        },
        showSubscriptionBillRefundModalV(){
          this.subscriptionBillrRefundObj={};
          $("#subscriptionBillrRefundModal").modal("show"); // show modal
        },
        subscriptionBillRefundV(){
            Api.subscriptionBillRefund(this.subscriptionBillrRefundObj.billId, this.subscriptionBillrRefundObj.term).then(response => {
                if (response.data.code == 200) {
                    $("#subscriptionBillrRefundModal").modal("hide");
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }

            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });
        },
        showVirtualProductRefundModalV(){
            this.virtualProductOrderRefundObj={};
            $("#virtualProductOrderRefundModal").modal("show"); // show modal
        },
        virtualProductRefundV(){

            Api.virtualProductOrderRefund(this.virtualProductOrderRefundObj.orderId,this.virtualProductOrderRefundObj.term).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("订单已退款！");
                    $("#virtualProductOrderRefundModal").modal("hide"); // show modal

                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }

            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        freezeUserV(){
            freezeUser(this.freezeUserId).then(response=>{
                if(response.data.code==200){

                    customAlert.alert("冻结账号成功");
                    $("#freezeUserModal").modal("hide"); // show modal

                }
                if(response.data.code!=200){
                    customAlert.alert(response.data.message)
                }
            })
        },
        blockOasisV(){
            blockOasis(this.blockOasisId).then(response=>{
                if(response.data.code==200){

                    customAlert.alert("封禁成功");
                    $("#blockOasisModal").modal("hide"); // show modal

                }
                if(response.data.code!=200){
                    customAlert.alert(response.data.message)
                }
            })
        },
        offlineCellV(){
          offlineCell(this.offlineCellId).then(response=>{
            if(response.data.code==200){
                customAlert.alert("下架成功");
                $("#offlineCellModal").modal("hide"); // show modal

            }
            if(response.data.code!=200){
                customAlert.alert(response.data.message)
            }
          })
        },
        closeCommercialPaperV(){
            closeCommercialPaper(this.closedCommercialPaperId).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("关单成功");
                    $("#closeCommercialPaperModal").modal("hide"); // show modal
                }
                if(response.data.code!=200){
                    customAlert.alert(response.data.message)
                }
            })
        },
        recallWithdrawLimitV(){
            this.settingWithdrawLimitObj.offOrOn='0';
            settingWithdrawLimits(this.settingWithdrawLimitObj).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("解除限额成功")
                }
                if(response.data.code!=200){
                    customAlert.alert(response.data.message)
                }
            })
        },
        executeWithdrawLimitV(){
            this.settingWithdrawLimitObj.offOrOn='1';
            settingWithdrawLimits(this.settingWithdrawLimitObj).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("执行限额成功")
                }
                if(response.data.code!=200){
                    customAlert.alert(response.data.message)
                }
            })
        },
        fetchCaseInfoV(){
            fetchCaseInfo(this.caseNO).then(response=>{
                if(response.data.code==200){
                    this.caseProfile.general = response.data.general;
                    this.caseProfile.material = response.data.material;
                }
            })
        },
        modifyCaseInfoV(){
          modifyCaseInfo(this.editCaseGeneralObj).then(response=>{
            if(response.data.code==200){
                this.fetchCaseInfoV();
                $("#caseManagementModal").modal("hide"); // show modal
            }
            if(response.data.code!=200){
                customAlert.alert(response.data.message)
            }
          })
        },
        showCaseManagementModalV(){
            this.editCaseGeneralObj = JSON.parse(JSON.stringify(this.caseProfile.general ));
            $("#caseManagementModal").modal("show"); // show modal
        },
        validateCaseManagementForm(){
          return !!this.editCaseGeneralObj.caseStatus && !!this.editCaseGeneralObj.casePriority 
                   && (this.editCaseGeneralObj.caseStatus!=this.caseProfile.general.caseStatus
                   || this.editCaseGeneralObj.casePriority!=this.caseProfile.general.casePriority
                   || this.editCaseGeneralObj.solution!=this.caseProfile.general.solution
                   || this.editCaseGeneralObj.caseAmount!=this.caseProfile.general.caseAmount
                   || this.editCaseGeneralObj.claimAmount!=this.caseProfile.general.claimAmount);
        },
        showAddNewMaterialModalV(){
            document.querySelector('#caseMaterialFile').value = null;
            $("#caseMaterialModal").modal("show"); // show modal
        },
        uploadCaseMaterialV(){

          if(!document.querySelector('#caseMaterialFile') || !document.querySelector('#caseMaterialFile').value ){
            return;
          }  
          uploadCaseMaterialBO(this.caseNO).then(response=>{
            if(response.data.code==200){
                document.querySelector('#caseMaterialFile').value = null;
                this.fetchCaseInfoV();
                $("#caseMaterialModal").modal("hide"); // show modal
            }
            if(response.data.code!=200){
                customAlert.alert(response.data.message);
            }
          });
        },
        showOasisMembershipRefundModalV() {
            this.oasisMembershipOrderRefundObj.orderId="";
            this.oasisMembershipOrderRefundObj.term="";

            $("#oasisMembersipRefundModal").modal("show"); // show modal
        },
        oasisMembersipRefundV(){
            oasisMembersipRefund(this.oasisMembershipOrderRefundObj).then(response=>{
                if(response.data.code == 200){
                    customAlert.alert("订单已退款！");

                   $("#oasisMembersipRefundModal").modal("hide");
        
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
    }
}

let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);

const caseInfo = app.mount('#app');

window.caseInfoPage = caseInfo;

// init
caseInfo.fetchCaseInfoV();

async function doFetchCaseInfo(caseNO){
    const url ="/api/v1/team/dsp_case/{case_no}/info".replace("{case_no}",caseNO);
    return await axios.get(url);
}

async function changeCase(dto){
    const url = "/api/v1/team/dsp_case/change";
    return await axios.put(url,dto)
}

async function uploadCaseMaterial(caseNO,materialFile){
    var form = new FormData();
    form.append("material",materialFile);
    form.append("materialType","peacemaker");
    form.append("caseNO",caseNO);
    const url ="/api/v1/team/dsp_case/add_material";
    return await axios.post(url,form);
}

async function doSettingWithdrawLimits(dto){

    const url = "/api/v1/team/dsp_case/action/withdraw_limits";
    return await axios.put(url,dto);

}

async function doOfflineCell(cellId){
    const url = "/api/v1/team/dsp_case/action/cell/{id}/offline".replace("{id}",cellId);
    return await axios.put(url,{});
}

async function doBlockOasis(oasisId){
    const url = "/api/v1/team/dsp_case/action/oasis/{oasis_id}/freeze".replace("{oasis_id}",oasisId);
    return await axios.put(url,{});

}

async function doFreezeUser(userId){
    const url = "/api/v1/team/dsp_case/action/account/{user_id}/freeze".replace("{user_id}",userId);
    return await axios.put(url,{});
}
async function doOfflineVirtualProduct(productId){
    const url = "/api/v1/team/dsp_case/action/virtual/{product_id}/offline".replace("{product_id}",productId);
    return await axios.put(url,{});
}

async function doCloseCommercialPaper(id){
    const url = "/api/v1/team/dsp_case/action/mps/paper/{id}/close".replace("{id}",id);
    return await axios.put(url,{});
}
async function doOasisMembershipRefund(dto){
    const url="/api/v1/team/membership/open_order/refund";
    return await axios.post(url,dto);
}  
async function oasisMembersipRefund(dto){
    return await doOasisMembershipRefund(dto);
 }
async function closeCommercialPaper(id){
    return doCloseCommercialPaper(id);
}
async function offlineVirtualProduct(productId){
    return doOfflineVirtualProduct(productId);
}
async function freezeUser(userId){
    return await doFreezeUser(userId);
}
async function blockOasis(oasisId){
    return await doBlockOasis(oasisId);
}

async function offlineCell(cellId){
    return await doOfflineCell(cellId);
}
async function settingWithdrawLimits(dto){
    return await doSettingWithdrawLimits(dto);
}
async function uploadCaseMaterialBO(caseNO){
  
    if($('#caseMaterialFile')[0].files.length === 0){

        customAlert.alert("未选择文件");

        return;
    }

    const materialFile = $('#caseMaterialFile')[0].files[0];

    return await uploadCaseMaterial(caseNO,materialFile);
  
}

async function modifyCaseInfo(dto){
    return await changeCase(dto);
}
async function fetchCaseInfo(caseNO){
    return await doFetchCaseInfo(caseNO);
}


