import axios from 'axios';
import oasisAvatarDefault from "/rainbow/images/oasis-default-building.jpeg"
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

const TeicallaanliSubNavComponent = {
    data() {
        return {
          oasisAvatarDefault,
          joinedoases: {},
          invitedoases: {}
        }
    },
    methods: {
        loadInvitedOases(){
            const brandId =  this.getIdentity().brandId; // Auth.getIdentity();

            OasisApi.getAListOfInvitedOases(brandId).then(response=>{
                if(response.data.code == 200){
                    this.invitedoases = response.data.invited;
                }
            })
        },
        loadJoinedOases(){
            const brandId =  this.getIdentity().brandId; // Auth.getIdentity();
            OasisApi.getAListOfJoinedOases(brandId).then(response=>{
                if(response.data.code == 200){
                    this.joinedoases = response.data.joined;
                }
            })
        },
        loadSubNav(){
            this.loadInvitedOases();
            this.loadJoinedOases();
        }
    }
}


export default TeicallaanliSubNavComponent;

