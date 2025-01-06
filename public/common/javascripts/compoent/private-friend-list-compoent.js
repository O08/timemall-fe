import  PrivateApi from "/micro/arch/javascripts/PrivateApi.js";
import { Ftime } from "/common/javascripts/util.js";
import {SseEventBusScene} from "/common/javascripts/tm-constant.js";


export default function FriendListCompoent(params)  {

    const {
        need_init = true
      } = params  

    return {
        data(){
            return {
                friends:{
                    records: [],
                    totalUnRead: 0
                }
            }
        },
        methods: {
            fetchPrivateFriendV(){
    
                PrivateApi.fetchPrivateFriend({q:""}).then(response=>{
                   if(response.data.code==200){
                      this.friends=response.data.friend;
                      const totalUnRead = this.friends.records.reduce(
                        (accumulator, currentValue) => accumulator + Number(currentValue.unread),
                        0,
                      );
                      this.friends.totalUnRead=totalUnRead;
                   }
                });
            },
            getPublishTimeV(date){
    
               var timespan = (new Date(date)).getTime()/1000;
                return Ftime(timespan);
            },
            onMessageHandler(e){
                console.log("msg is :" + e.data);
                var data= JSON.parse(e.data);
               if(data.scene===SseEventBusScene.PRIVATE){
                  this.fetchPrivateFriendV();
               }
            }
        },
        created() {
            if(need_init){
                this.fetchPrivateFriendV();
            }
        }
    }
    
}

