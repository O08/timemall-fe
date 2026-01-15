import axios from 'axios';

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);
  
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

            getAListOfInvitedOases(brandId).then(response=>{
                if(response.data.code == 200){
                    this.invitedoases = response.data.invited;
                }
            })
        },
        loadJoinedOases(){
            const brandId =  this.getIdentity().brandId; // Auth.getIdentity();
            getAListOfJoinedOases(brandId).then(response=>{
                if(response.data.code == 200){
                    this.joinedoases = response.data.joined;
                }
            })
        },
        loadSubNav(){
            this.loadInvitedOases();
            this.loadJoinedOases();
        }
    },
    created(){
       this.loadSubNav();
    }
}
async function getAListOfInvitedOases(brandId){
    const url ="/api/v1/team/invitedOases?brandId="+brandId;
    return axios.get(url);
}
async function getAListOfJoinedOases(brandId){
    const url ="/api/v1/team/joinedOases?brandId="+brandId;
    return axios.get(url);
}


export default TeicallaanliSubNavComponent;

