import axios from 'axios';
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import {RefundSceneEnum} from "/common/javascripts/tm-constant.js";

let customAlert = new CustomAlertModal();

var Api = {}


function getUserInfo(){

   var res={}
   $.ajaxSetup({async: false});
   $.get('/api/v1/web_mall/me',function(data) {
     res = data;
    })
      .fail(function(data) {
        // place error code here
        customAlert.alert('芜湖,系统裂开了！请稍后重试！')
      });
   return res;
 }
Api.getUserInfo = getUserInfo;

// logout
function logout(){

   var res={}
   $.ajaxSetup({async: false});
   $.get('/api/v1/web_mall/logout',function(data) {
     res = data;
    })
      .fail(function(data) {
        // place error code here
        customAlert.alert('芜湖,系统裂开了！请稍后重试！')
      });
   return res;
 }
Api.logout = logout;

// brand profile
async function getBrandProfile(brandId)
{
    const url = "/api/v1/web_mall/brand/{brand_id}/profile".replace("{brand_id}",brandId);
    return axios.get(url);
}

async function doSendOrderReceivingEmail(dto){
  const url="/api/v1/web_mall/email_notice";
  return await axios.post(url,dto);
}

async function doEstudioRefund(dto){
  const url="/api/v1/web_estudio/order/refund";
  return await axios.post(url,dto);
}

async function virtualProductOrderRefund(orderId,term){
  if(!orderId){
      return;
  }
  const dto={
     scene: RefundSceneEnum.VIRTUAL_ORDER,
     param: JSON.stringify({orderId: orderId,term: term})
  }
 return doEstudioRefund(dto);
}
async function subscriptionBillRefund(billId,term){
  if(!billId){
      return;
  }
  const dto={
     scene: RefundSceneEnum.SUBSCRIPTION,
     param: JSON.stringify({billId: billId,term: term})
  }
 return doEstudioRefund(dto);
}

function sendOrderReceivingEmail(noticeType,orderId){
  const dto={
      noticeType: noticeType,
      ref: JSON.stringify({orderId: orderId})
  }
  doSendOrderReceivingEmail(dto);
}

Api.getBrandProfile=getBrandProfile;
Api.sendOrderReceivingEmail=sendOrderReceivingEmail;
Api.virtualProductOrderRefund=virtualProductOrderRefund;
Api.subscriptionBillRefund=subscriptionBillRefund;

export {Api}