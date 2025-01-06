import axios from 'axios';
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";


const BubbleInviteComponent = {
    data() {
      return {
        joinedOases:{},
        checkedOasisId: "",
        searchOasesQ: "",
        displayOases: []
      }
    },
    methods: {
        retrieveOasesCreatedV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            retrieveOasesCreated(brandId).then(response=>{
                if(response.data.code==200){
                    this.joinedOases=response.data.joined;
                    this.displayOases = response.data.joined.records;
                }
            });
        },
        inviteBrandV(){
            const brandId = this.queryParam.brandId; // from bubble .js
            OasisApi.inviteBrand(brandId,this.checkedOasisId).then(response=>{
                if(response.data.code==200){
                    this.checkedOasisId=""; // 复位
                    customAlert.alert("已发送邀请");
                    $("#inviteModal").modal("hide");
                }
            });
        },
        searchOasesV(){
            this.displayOases = this.joinedOases.records.filter(e=>{return matchTitle(e.title,this.searchOasesQ)});
        }
    },
    created(){

    }
}
async function getOasisCreated(brandId){
    const url="/api/v1/team/joinedOases?brandId=" + brandId;
    return await axios.get(url);
}

function retrieveOasesCreated(brandId,q){
    return getOasisCreated(brandId,q);
}
function matchTitle(raw,substr){
    return raw.includes(substr);
}
export default BubbleInviteComponent;
