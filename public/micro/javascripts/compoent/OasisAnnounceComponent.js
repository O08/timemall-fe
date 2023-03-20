import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

const RootComponent = {
    data() {
      return {
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
     }
}
async function getAnnounce(oasisId){
    const url = "/api/v1/team/oasis/announce/{oasis_id}".replace("{oasis_id}",oasisId);
    return axios.get(url);
}
function loadAnnounce(){
    const oasisId =  getQueryVariable("oasis_id");
    if(!oasisId){
        return;
    }
    return getAnnounce(oasisId);
}

export default OasisAnnounceComponent;
