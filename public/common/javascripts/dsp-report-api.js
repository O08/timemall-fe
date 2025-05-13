import axios from 'axios';
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

var DspReportApi = {}

async function fetchCodeList(codeType,itemCode){
  const url="/api/v1/base/code_mapping?codeType="+codeType+"&itemCode="+itemCode;
  return await fetch(url);
}

async function addNewReportCase(form){

  const url ="/api/v1/team/dsp_case/new";
  return await axios.post(url,form);
  
}
DspReportApi.addNewReportCase = addNewReportCase;
DspReportApi.fetchCodeList = fetchCodeList;

export {DspReportApi}