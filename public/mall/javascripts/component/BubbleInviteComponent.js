import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

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
                if(response.date.code==200){
                    this.joinedOases=response.data.joined;
                    this.displayOases = response.data.joined.records;
                }
            });
        },
        inviteBrandV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            inviteBrand(brandId,this.checkedOasisId);
        },
        searchOasesV(){
            this.displayOases = joinedOases.records.filter(matchTitle(e.title,this.searchOasesQ));
        }
    },
    created(){

    }
}
async function getOasisCreated(brandId){
    const url="/api/v1/team/joinedOases?brandId=" + brandId;
    return await axios.get(url);
}
async function inviteBrandToOasis(dto){
    const url="/api/v1/team/invite";
    return await axios.put(url,dto);
}
function inviteBrand(brandId,oasisId){
    const dto={
        oasisId: oasisId,
        brandId: brandId
    }
    return inviteBrandToOasis(dto);
}
function retrieveOasesCreated(brandId,q){
    return getOasisCreated(brandId,q);
}
function matchTitle(raw,substr){
    return raw.includes(substr);
}
export default BubbleInviteComponent;
