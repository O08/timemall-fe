import "/common/javascripts/import-jquery.js";
import { goLoginPage,goWelcome } from "../../common/javascripts/pagenav";
import {Api} from "/common/javascripts/common-api.js"
import "/common/javascripts/pagenav.js";




export default function Auth(params) {
    const {
        need_permission = false
      } = params   
     return {
        data() {
            return {
                user_already_login: false
               
            }
        },
        methods: {
            userAdapter(){
                var responese = Api.getUserInfo()
                if(responese.code == 200){
                   this.user_already_login = true;
                   setTidentity(responese.user);
                   return
                }
                if(responese.code !== 200 && need_permission){
                  goLoginPage()
                  return
                }
                if(responese.code !== 200 && !need_permission){
                    this.user_already_login = false;
                }
            },
            logout(){
                var responese = Api.logout()
                if(responese.code == 200){
                   this.user_already_login = false;
                   goWelcome();
                }
            },
            getIdentity(){
                return getTidentity();
            },
            isEmptyObjV(obj){
                return $.isEmptyObject(obj);
            }
        },
        created: function() {
            this.userAdapter();
        }
    }
    
}


  // save user base info
  function setTidentity(tidentity){
    var identity = getTidentity();
    if(!identity || identity.expired > new Date() ){
        identity = tidentity;
        identity.expired = new Date();
        identity.expired.setDate(identity.expired.getDate()+1);
        localStorage.setItem("Tidentity001",JSON.stringify(identity));
    }
    
}
function getTidentity(){
    const identity = localStorage.getItem("Tidentity001");
    return JSON.parse(identity);
}
