import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
import axios from 'axios';
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";
const  OasisOptionSponsorComponent = {
  props: ['oasis_id'],
  data () {
      return{
        oasisId: this.oasis_id,
        amount: "",
        brandAccount:{
          drawable: 0.00
        },
        oasisAccount:{
            drawable: 0.00
        }
      }
  },
  methods: {
      transformInputNumberV(event){
          return transformInputNumberAsPositive(event);
      },
    topUptoOasisV(){
      OasisApi.topUptoOasis(this.amount,this.oasisId).then(response=>{
          if(response.data.code == 200){
              this.closeTopUpOasisModelV();
              this.amount="";
              customAlert.alert("打款成功，感谢您对部落的助力，祝您生活愉快");
          }else{
              customAlert.alert(response.data.message);
          }
      });
    },
    closeTopUpOasisModelV(){
      closeTopUpOasisModel();
    },
    retrieveOasisFinInfoV(){
      OasisApi.retrieveOasisFinInfo(this.oasisId).then(response=>{
          if(response.data.code == 200){
              this.oasisAccount.drawable = response.data.billboard.drawable;
          }
        });
    },
    retrieveBrandFinInfoV(){
      retrieveBrandFinInfo().then(response=>{
          if(response.data.code == 200){
              this.brandAccount.drawable = response.data.billboard.drawable;
          }
      });
    },
    showOasisSponsorModalV(){
      this.amount = "";
      showOasisSponsorModal(this.retrieveOasisFinInfoV,this.retrieveBrandFinInfoV);
    },

  },
  template: `<div class="modal-container">
              
  <!-- Modal -->
  <div class="modal fade" id="topUpToOasisModal" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content text-color-dark">
        <div class="modal-header">
          <h1 class="modal-title fs-5">助力部落</h1>
          <button type="button" id="closeTopUpToOasisModal" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body d-flex justify-content-center">
          <form>
            <div class="mt-3">
              <label for="t1" class="form-label">您的账户余额<a class="url-link-sm-1 ms-1 go-topup" href="/estudio/studio-shop">充值</a></label>
              <input :value="brandAccount.drawable" type="text" maxlength="255" class="form-control" disabled id="t1">
            </div> 
            <div class="mt-3">
              <label for="t2" class="form-label">部落余额</label>
              <input id="t2" :value="oasisAccount.drawable" type="text" maxlength="255" class="form-control" disabled>
            </div> 
            <div class="mt-3">
              <label for="t3" class="form-label">助力金额</label>
              <input id="t3" v-model="amount" placeholder="请输入助力金额" @input="transformInputNumberV($event)" min="1" max="50000" type="number" class="form-control">
            </div> 
            <div class="help-text fs-6 ms-1 mt-1">
              <i class="bi bi-question-circle"></i><span class="ms-1">特别提示：助力金额将转化为同等数额的贡献值</span>
            </div>
          </form>
          
        </div>
        <div class="modal-footer btn-light">
          <button  v-preventreclick 
          :class="{'disabled': !amount || (brandAccount.drawable < amount) , 
          'btn-primary': !!amount || (brandAccount.drawable >= amount) ,
          'btn-secondary': !amount || (brandAccount.drawable < amount)  }"
          @click="topUptoOasisV" type="button"  class="btn btn-primary">赞助</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

}

function closeTopUpOasisModel(){
  $("#topUpToOasisModal").modal("hide");
}

async function getBrandFinInfo(){
  const url= "/api/v1/team/finance_board";
  return await axios.get(url);
}

function retrieveBrandFinInfo(){
  return getBrandFinInfo();
}
async function showOasisSponsorModal(retrieveOasisFinInfoV,retrieveBrandFinInfoV){
  await retrieveOasisFinInfoV();
  await retrieveBrandFinInfoV();
  $("#topUpToOasisModal").modal("show");

}
export {OasisOptionSponsorComponent}