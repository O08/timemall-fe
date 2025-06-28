import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
import axios from 'axios';

import { transformInputNumberAsPositive } from "/common/javascripts/util.js";

const  OasisAdminWithdrawComponent = {
    props: ['oasis_id'],
    data () {
        return{
          oasisId: this.oasis_id,
          oasisAccount:{
            drawable: 0.00
          },
          withdrawAmount: "",
        }
    },
    methods: {
        showOasisCollectAccountModalV(){
            this.withdrawAmount="";
            showOasisAdminWithdrawModal(this.retrieveOasisFinInfoV)
        },
        transformInputNumberV(event){
            return transformInputNumberAsPositive(event);
        },
        retrieveOasisFinInfoV(){
            OasisApi.retrieveOasisFinInfo(this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.oasisAccount.drawable = response.data.billboard.drawable;
                }
            });
        },
        withdrawFromOasisV(){
            withdrawFromOasis(this.withdrawAmount,this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.withdrawAmount="";
                    customAlert.alert("资金已转移到账户");
                    $("#adminWidthdrawModal").modal("hide");
                }else{
                    customAlert.alert(response.data.message);
                }
            });
        }
    },
    template: `<div class="modal-container">
              
    <!-- Modal -->
    <div class="modal fade" id="adminWidthdrawModal" data-bs-backdrop="static" tabindex="-1">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content text-color-dark">
          <div class="modal-header">
            <h1 class="modal-title fs-5">取出资金</h1>
            <button type="button"  class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex justify-content-center">
            <form>
              <div class="mt-3">
                <label for="oasisAccountDrawable" class="form-label">部落余额</label>
                <input :value="oasisAccount.drawable" type="text" maxlength="255" class="form-control" disabled id="oasisAccountDrawable">
              </div> 
              <div class="mt-3">
                <label for="withdrawAmount" class="form-label">取出金额</label>
                <input id="withdrawAmount" placeholder="请输入取出金额"  @input="transformInputNumberV($event)" min="1" max="50000" step="1" v-model="withdrawAmount" type="number" class="form-control">
              </div> 
              <div class="help-text fs-6 ms-1 mt-1">
              <i class="bi bi-question-circle"></i><span class="ms-1">本功能只对管理员开放</span>
            </div>
            </form>
            
          </div>
          <div class="modal-footer btn-light">
            <button   v-preventreclick 
            :class="{'disabled': !withdrawAmount || (oasisAccount.drawable < withdrawAmount )  , 
            'btn-primary': !!withdrawAmount && (oasisAccount.drawable >= withdrawAmount ) ,
            'btn-secondary': !withdrawAmount || (oasisAccount.drawable < withdrawAmount )   }"
            @click="withdrawFromOasisV" type="button"  class="btn btn-primary">取出</button>
          </div>
        </div>
      </div>
    </div>
  </div>`
}

export {OasisAdminWithdrawComponent}



async function oasisWithdraw(dto){
    const url="/api/v1/team/oasis/admin_withdraw";
    return await axios.put(url,dto);
}

function withdrawFromOasis(amount,oasisId){
    const dto={
        amount: amount,
        oasisId: oasisId
       }
    return oasisWithdraw(dto);
  }


async function showOasisAdminWithdrawModal(retrieveOasisFinInfoV){

    await retrieveOasisFinInfoV();
    $("#adminWidthdrawModal").modal("show");

}