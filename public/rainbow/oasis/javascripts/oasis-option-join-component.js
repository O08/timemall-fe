import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
import axios from 'axios';
const  OasisOptionJoinComponent = {
  props: ['oasis_id','oasis_announce',],
  emits: ['follow-success','unfollow-success'],

  data () {
      return{
        oasisId: this.oasis_id,
        inputPrivateCode: "",
      }
  },
  methods: {
    followOasisV(){
      if(this.oasis_announce.canAddMember == '0'){
         return
      }
      if(this.oasis_announce.canAddMember == '1' && this.oasis_announce.forPrivate=='1'){
          this.inputPrivateCode = "";
          $("#inputPrivateCodeModal").modal("show");
          return
      }
      const privateCode="";
      OasisApi.followOasis(this.oasisId,privateCode).then(response=>{
          if(response.data.code==200){
              // this.loadJoinedOases();
              this.$emit('follow-success', '');
              $("#inputPrivateCodeModal").modal("hide");
          }
          if(response.data.code==40030){
             customAlert.alert("部落已停止招新，加入失败！"); 
          }
          if(response.data.code==40031){
             customAlert.alert("邀请码校验不通过，加入失败！"); 
          }
          if(response.data.code==40009){
             customAlert.alert("部落可容纳成员已达最大值，加入失败！"); 
          }
          if(response.data.code==40033){
            customAlert.alert("已加入部落，请不要重复操作！"); 
         }
      });
    },
    followPrivateOasisV(){
        OasisApi.followOasis(this.oasisId,this.inputPrivateCode).then(response=>{
            if(response.data.code==200){

                this.$emit('follow-success', '');

            }
            if(response.data.code==40030){
                customAlert.alert("部落已停止招新，加入失败！"); 
              }
              if(response.data.code==40031){
                customAlert.alert("邀请码校验不通过，加入失败！"); 
              }
              if(response.data.code==40009){
                customAlert.alert("部落可容纳成员已达最大值，加入失败！"); 
              }
        });
    },
    unfollowOasisV(){
   
      unfollowOasisB(this.oasisId).then(response=>{
          if(response.data.code==200){
              this.$emit('unfollow-success', '');
          }
      });
    },
    
  },
  template: `<div class="modal-container">
  <!-- Modal -->
  <div class="modal fade" id="inputPrivateCodeModal" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content text-color-dark">
        <div class="modal-header">
          <h1 class="modal-title fs-5">请输入邀请码</h1>
          <button type="button"  class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body d-flex justify-content-center">
          
          <form> 
            <div class="mt-3">
              <input v-model="inputPrivateCode" type="text" class="form-control">
            </div> 
          </form>

        </div>
        <div class="modal-footer btn-light">
          <button @click="followPrivateOasisV"
          :class="{'disabled': !inputPrivateCode, 
                'btn-primary': !!inputPrivateCode,
                'btn-secondary': !inputPrivateCode }"
           v-preventreclick type="button" class="btn btn-primary">加入</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

}

async function unfollowOasis(oasisId){
  const url ="/api/v1/team/oasis/unfollow?oasisId="+oasisId;
  return await axios.delete(url);
}

function unfollowOasisB(oasisId){

  return unfollowOasis(oasisId);
}

export {OasisOptionJoinComponent}