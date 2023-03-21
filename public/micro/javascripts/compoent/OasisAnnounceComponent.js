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
            loadAnnounce().then(response=>{
                if(response.data.code == 200){
                    this.announce = response.data.announce;
                }
            })
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
function loadAnnounce(){
    const oasisId =  getQueryVariable("oasis_id");
    if(!oasisId){
        return;
    }
    return getAnnounce(oasisId);
}

export default OasisAnnounceComponent;
