import "/common/javascripts/import-jquery.js";
import { goLoginPage,goWelcome } from "../../common/javascripts/pagenav";
import {Api} from "/common/javascripts/common-api.js"
import "/common/javascripts/pagenav.js";
// import defaultAvatarImage from '/common/icon/panda-kawaii.svg';

const defaultAvatarImage = new URL(
    '/common/icon/panda-kawaii.svg',
    import.meta.url
);

//除navigator.onLine属性之外，为了更好地确定网络是否可用，HTML5还定义了两个事件：online和offline。
//当网络从离线变为在线或者从在线变为离线时，分别触发这两个事件。这两个事件在window对象上触发。
var EventUtil = {
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    }
};



export default function Auth(params) {
    const {
        need_permission = false,need_init = true
      } = params   
     return {
        data() {
            return {
                user_already_login: false,
                defaultAvatarImage,
                auth_init_finish: false

            }
        },
        methods: {
            userAdapter(){
                Api.getUserInfo().then(response => {

                    if(response.data.code == 200){
                        this.user_already_login = true;
                        setTidentity(response.data.user);
                        return
                     }
                     if(response.data.code !== 200 && need_permission){
                       goLoginPage()
                       return
                     }
                     if(response.data.code !== 200 && !need_permission){
                         this.user_already_login = false;
                     }

                }).catch(error => {
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
                }).finally(() => {
                    this.auth_init_finish=true;
                });

           
            },
            logout(){
                var responese = Api.logout()
                if(responese.code == 200){
                   this.user_already_login = false;
                   goWelcome();
                }
            },
            getIdentity(){
                var userInfo=  getTidentity();
                if(!userInfo && !this.auth_init_finish){
                    this.userAdapter();
                    userInfo= getTidentity();
                }
                return !userInfo ? {} : userInfo;
            },
            isEmptyObjV(obj){
                return $.isEmptyObject(obj);
            },
            removeIdentity(){
                localStorage.removeItem("Tidentity001");
            },
            refreshIdentity(){
                this.removeIdentity();
                this.userAdapter();
            }
        },
        created: function() {
            if(need_init){
                this.userAdapter();
            }
            // EventUtil.addHandler(window, "offline", function() {
            //     window.location.href="/pwa-bad-network";
            // });
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



