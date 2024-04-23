import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

const OasisAnnounceComponent = {
    data() {
      return {
        oasisId: "",
        announce: {}
      }
    },
    methods: {
        loadAnnounceV(){
            const oasisId =  getQueryVariable("oasis_id");
            if(!oasisId){
                window.location.href="/micro/teixcalaanli";
                return ;
            }
            loadAnnounce(oasisId).then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                    if(!this.announce){
                        window.location.href="/micro/teixcalaanli";
                    }
                }
            })
        },
        initiatorRoleV(){
            const brandId = this.getIdentity().brandId;
            return brandId == this.announce.initiator;
        }
    },
    created(){
        this.loadAnnounceV();
        this.oasisId =  getQueryVariable("oasis_id");
    }
}
async function getAnnounce(oasisId){
    const url = "/api/v1/team/oasis/announce/{oasis_id}".replace("{oasis_id}",oasisId);
    return await axios.get(url);
}
function loadAnnounce(oasisId){
    return getAnnounce(oasisId);
}

export default OasisAnnounceComponent;
