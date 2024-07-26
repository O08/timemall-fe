import "/common/javascripts/import-jquery.js";
import { goLoginPage,goWelcome } from "../../common/javascripts/pagenav";
import {Api} from "/common/javascripts/common-api.js"
import "/common/javascripts/pagenav.js";
import defaultAvatarImage from '/common/icon/panda-kawaii.svg';




export default function Auth(params) {
    const {
        need_permission = false,need_init = true
      } = params   
     return {
        data() {
            return {
                user_already_login: false,
                defaultAvatarImage

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
            },
            removeIdentity(){
                localStorage.removeItem("Tidentity001");
            }
        },
        created: function() {
            if(need_init){
                this.userAdapter();
            }
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
