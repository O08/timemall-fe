import axios from 'axios';
import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const BrandPersonalAccessTokenSetting = {

    data(){
      return {
          personalAccessTokens: [],
          generateTokenObj: {
            name: "",
            daysToLive: "",
            showResult: false,
            rawToken: ""
          },
          revokeTokenObj: {}

      }
    },
    methods: {

      isTokenExpiredV(expiresAt){
        return isTokenExpired(expiresAt);
      },
      copyTokenV(token){
        copyValueToClipboard(token);
      },
      selectPreset(days){
        this.generateTokenObj.daysToLive=days;
      },
      showGenerateTokenModalV(){
        this.generateTokenObj={
          name: "",
          daysToLive: "30",
          showResult: false,
          rawToken: ""
        }
        $("#generateTokenModal").modal("show");
      },
      showRevokeTokenModalV(token){
        this.revokeTokenObj=JSON.parse(JSON.stringify(token));
        $("#revokeTokenModal").modal("show");
      },
      generateOneTokenV(){
        if(!this.generateTokenObj.name) return;
        generateOneToken(this.generateTokenObj.name,this.generateTokenObj.daysToLive).then(response=>{
          if(response.status==200){

            this.generateTokenObj.showResult=true;
            this.generateTokenObj.rawToken=response.data.rawToken;

            this.loadTokenListV();
          }
          if(response.status!=200){
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.statusText);
          }
        }).catch(error=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
      removeOneTokenV(){
        removeOneToken(this.revokeTokenObj.id).then(response=>{
          if(response.data.code==200){
            this.loadTokenListV();
            $("#revokeTokenModal").modal("hide");
          }
          if(response.data.code!=200){
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
          }
        }).catch(error=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
      loadTokenListV(){
        loadTokenList().then(response=>{
          if(response.status==200){
            this.personalAccessTokens=response.data;
          }
          if(response.status!=200){
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.statusText);
          }
        }).catch(error=>{
          customAlert.alert("系统异常，请检查网络或者重新发送！")
        });
      },
    }

}


async function findTokenList(){
  const url="/api/v1/user/settings/pats/find";
  return await axios.get(url);
}

async function revokeOneToken(id){
  const url="/api/v1/user/settings/pats/{id}/del".replace("{id}",id);
  return await axios.delete(url);
}

async function doGenerateOneToken(dto){
  const url = "/api/v1/user/settings/pats/new";
  return await axios.post(url,dto);
}
async function generateOneToken(name,daysToLive){
  const dto={
    name: name,
    daysToLive: daysToLive
  }
  return await doGenerateOneToken(dto);
}
async function removeOneToken(id){
  return await revokeOneToken(id);
}
async function loadTokenList(){
  return await findTokenList();
}


function isTokenExpired(expiresAt, bufferMinutes = 5) {
  // 如果后端返回空、null 或 undefined，说明永不过期，直接返回 false
  if (expiresAt === null || expiresAt === undefined || expiresAt === '') {
    return false; 
  }

  let expireTimeMs = new Date(expiresAt).getTime();

  if (typeof expiresAt === 'number' && expiresAt.toString().length === 10) {
    expireTimeMs = expiresAt * 1000;
  }

  // 防止后端返回了其他乱七八糟的无效字符串
  if (isNaN(expireTimeMs)) {
    console.error("无效的 expiresAt 格式，默认视作未过期:", expiresAt);
    return false; 
  }

  // 计算对比时间（当前时间 + 提前缓冲量）
  const bufferMs = bufferMinutes * 60 * 1000;
  const currentTimeMs = Date.now() + bufferMs;

  // 如果当前时间超过了过期时间，则返回 true（已过期）
  return currentTimeMs >= expireTimeMs;
}

export default BrandPersonalAccessTokenSetting;