import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
import axios from 'axios';

import { transformInputNumberAsPositive } from "/common/javascripts/util.js";

const  OasisCollectAccountComponent = {
  props: ['oasis_id','current_user_brand_id'],
  data () {
      return{
        oasisId: this.oasis_id,
        currentUserBrandId : this.current_user_brand_id,
        oasisAccount:{
          drawable: 0.00
        },
        collectAccountAmount: "",
        point: "",
      }
  },
  methods: {
    transformInputNumberV(event){
      return transformInputNumberAsPositive(event);
  },
    showOasisCollectAccountModalV(){
      this.collectAccountAmount="";
      showOasisCollectAccountModal(this.retrieveOasisFinInfoV,this.retrieveBrandPointV)
    },
    retrieveOasisFinInfoV(){
      OasisApi.retrieveOasisFinInfo(this.oasisId).then(response=>{
          if(response.data.code == 200){
              this.oasisAccount.drawable = response.data.billboard.drawable;
          }
        });
    },
    collectAccountV(){
      collectAccount(this.collectAccountAmount,this.oasisId).then(response=>{
          if(response.data.code == 200){
              // this.retrieveOasisFinInfoV();
              // this.retrieveBrandFinInfoV();
              // this.retrieveBrandPointV();
              this.collectAccountAmount="";
              customAlert.alert("收账成功");
              $("#collectAccountModal").modal("hide");
          }else{
              customAlert.alert(response.data.message);
          }
      });
    },
    retrieveBrandPointV(){

      retrieveBrandPoint(this.oasisId,this.currentUserBrandId).then(response=>{
          if(response.data.code == 200){
              this.point = response.data.point;
          }
      });
    },

  },
  template: `<div class="modal-container">
              
  <!-- Modal -->
  <div class="modal fade" id="collectAccountModal" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content text-color-dark">
        <div class="modal-header">
          <h1 class="modal-title fs-5">收账</h1>
          <button type="button" id="closeCollectAccountModal" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body d-flex justify-content-center">
          <form>
            <div class="mt-3">
              <label for="t1" class="form-label">部落余额</label>
              <input :value="oasisAccount.drawable" type="text" maxlength="255" class="form-control" disabled id="t1">
            </div> 
            <div class="mt-3">
              <label for="t2" class="form-label">累计贡献</label>
              <input id="t2" :value="point" type="text" maxlength="255" class="form-control" disabled>
            </div> 
            <div class="mt-3">
              <label for="t3" class="form-label">收账金额</label>
              <input id="t3" placeholder="请输入收账金额"  @input="transformInputNumberV($event)" min="1" max="50000" step="1" v-model="collectAccountAmount" type="number" class="form-control">
            </div> 
            <div class="help-text fs-6 ms-1 mt-1">
              <i class="bi bi-question-circle"></i><span class="ms-1">规则：每日只能收账一次,收账金额最大为部落余额的10%</span>
            </div>
          </form>
          
        </div>
        <div class="modal-footer btn-light">
          <button   v-preventreclick 
          :class="{'disabled': !collectAccountAmount || (oasisAccount.drawable < 10*collectAccountAmount ) || (point <  collectAccountAmount ) , 
          'btn-primary': !!collectAccountAmount && (oasisAccount.drawable >= 10*collectAccountAmount ) && (point >=collectAccountAmount ) ,
          'btn-secondary': !collectAccountAmount || (oasisAccount.drawable < 10*collectAccountAmount ) || (point < collectAccountAmount )  }"
          @click="collectAccountV" type="button"  class="btn btn-primary">收账</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

}

async function getBrandPintInOasis(oasisId,brandId){
  const url="/api/v1/team/point_in_oasis?oasisId="+ oasisId + "&brandId="+brandId;
  return await axios.get(url);
}
async function oasisCollectAccount(dto){
  const url="/api/v1/team/oasis/collect_account";
  return await axios.put(url,dto);
}
async function retrieveBrandPoint(oasisId,brandId){
  return getBrandPintInOasis(oasisId,brandId);
}

async function showOasisCollectAccountModal(retrieveOasisFinInfoV,retrieveBrandPointV){

  await retrieveOasisFinInfoV();
  await retrieveBrandPointV();
  $("#collectAccountModal").modal("show");


}

function collectAccount(amount,oasisId){
  const dto={
      amount: amount,
      oasisId: oasisId
     }
  return oasisCollectAccount(dto);
}

export {OasisCollectAccountComponent}