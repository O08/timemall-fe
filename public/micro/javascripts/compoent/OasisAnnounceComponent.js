import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";
import  OasisApi from "/micro/javascripts/oasis/OasisApi.js";

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
            OasisApi.loadAnnounce(oasisId).then(response=>{
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


export default OasisAnnounceComponent;
