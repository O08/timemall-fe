import axios from 'axios';
const TeicallaanliSubNavComponent = {
    data() {
        return {
          joinedoases: [],
          invitedoases: []
        }
    },
    methods: {
        loadInvitedOases(){
            getAListOfInvitedOases().then(response=>{
                if(response.data.code == 200){
                    this.invitedoases = response.data.invited;
                }
            })
        },
        loadJoinedOases(){
            getAListOfJoinedOases().then(response=>{
                if(response.data.code == 200){
                    this.joinedoases = response.data.joinedoases;
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
async function getAListOfInvitedOases(){
    const url ="/api/v1/team/inviteOases";
    return axios.get(url);
}
async function getAListOfJoinedOases(){
    const url ="/api/v1/team/joinedOases";
    return axios.get(url);
}


export default TeicallaanliSubNavComponent;

