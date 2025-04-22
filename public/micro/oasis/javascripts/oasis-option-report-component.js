import "/common/javascripts/import-jquery.js";
import axios from 'axios';
import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";



import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;


const  OasisOptionReportComponent = {
    props: ['oasis_id'],
    data () {
        return{
          oasisId: this.oasis_id,
          reportOptions: [],
          reportForm: this.initReportForm()
        }
    },
    methods: {
      newReportCaseV(){
        newReportCase(this.reportForm).then(response=>{
          if(response.data.code==200){

            document.querySelector('#caseMaterialFile').value = null;

            $("#reportOasisModal").modal("hide"); // show success modal

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
        initReportForm(){

          if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
            document.querySelector('#caseMaterialFile').value = null;
          }

          return {
            fraudType: "",
            scene: "彩虹部落",
            sceneUrl: currentDomain+"/micro/oasis/home?oasis_id=" + this.oasisId,
            caseDesc: "",
            material: ""
          }
        },
        validateReportFormV(){
          return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
        }
    },
    template: `<div class="modal-container">
              
    <!-- Modal -->
    <div class="modal fade" id="reportOasisModal" data-bs-backdrop="static" tabindex="-1">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content text-color-dark">
          <div class="modal-header">
            <h1 class="modal-title fs-5">举报部落</h1>
            <button type="button"  class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex justify-content-center">
            <form class="w-100">
              <div class="pt-3">
                <ul class="list-group">
                  <li v-for="report in reportOptions" class="list-group-item">
                      <div class="form-check">
                      <input class="form-check-input" v-bind:value="report.itemCode"  v-model="reportForm.fraudType" type="radio" name="reportList">
                      <label class="form-check-label" for="reportList">
                          {{report.item}}
                      </label>
                      </div>
                  </li>
                </ul>
             </div>

             <div class="py-3">
              <div class="label-color field-label">详细描述（必填）</div>
              <div class="inputWrapper">
                  <div class="inputMaxLength">
                      <textarea v-model="reportForm.caseDesc" type="text" placeholder="填写具体违规内容和详细描述，更容易举报成功喔~" maxlength="200" rows="3" autocorrect="off" class="inputDefault textAreaDefault" style="padding-right: 38.92px; height: 150px;"></textarea>
                      <div class="maxLength">{{ (!reportForm || !reportForm.caseDesc) ? 200 : 200-reportForm.caseDesc.length}}</div>
                  </div>
              </div>
              <div class="label-color field-label">图片材料提交，支持jpg、png等格式（选填）</div>

              <input style="font-size: 12px;" id="caseMaterialFile" class="form-control  only-show-bottom mb-3" type="file" placeholder="选择举报材料">

             </div>

  



            </form>
            
          </div>
          <div class="modal-footer btn-light">
            <button 
            :class="{'disabled': !validateReportFormV(), 
              'btn-primary': validateReportFormV() ,
              'btn-secondary': !validateReportFormV()  }"
             v-preventreclick @click="newReportCaseV" type="button"  class="btn btn-primary">提交</button>
          </div>
        </div>
      </div>
    </div>
  </div>`
}


async function fetchCodeList(codeType,itemCode){
  const url="/api/v1/base/code_mapping?codeType="+codeType+"&itemCode="+itemCode;
  return await fetch(url);
}

async function addNewReportCase(form){

  const url ="/api/v1/team/dsp_case/new";
  return await axios.post(url,form);
  
}
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
  return await addNewReportCase(form);

}
async function loadReportIssueList(appObj){
  const response = await fetchCodeList(CodeMappingTypeEnum.REPORTISSUE,"");
  var data = await response.json();
  if(data.code==200){
     
     appObj.reportOptions=data.codes.records;

  }
}

async function showOasisReportModal(loadReportIssueListV){
    await loadReportIssueListV();
    $("#reportOasisModal").modal("show");
}


export {OasisOptionReportComponent}