import axios from 'axios';
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
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
Api.getBrandProfile=getBrandProfile;

export {Api}