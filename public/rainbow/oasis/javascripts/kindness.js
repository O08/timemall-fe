import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import { debounce } from 'lodash';
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Auth from "/estudio/javascripts/auth.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

import { transformInputNumberAsPositive } from "/common/javascripts/util.js";



import {goErrorByReplace} from "/common/javascripts/pagenav.js";

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,] = segments;

const RootComponent = {
    data() {
       return {
        oasisAvatarDefault,
        total: 5,
        cnt: 1,
        init_finish: false,
        isSubmitting: false,
        announce: {},
        focusModal:{
            feed: "",
            confirmHandler:()=>{

            }
        }
       }
    },
    methods: {
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        },
        changeCntV(cnt){
            this.cnt=cnt;
        },
        explainOasisMarkEnumV(mark){
            if(mark=='2') return '运营中';
            return '经营异常';
        },

        showSponsorFocusModalV(){
            this.focusModal.feed=this.totalAmount+" 元";
            this.focusModal.confirmHandler=()=>{
                this.topUptoOasisV();
            };
            $("#focusModal").modal("show"); // show modal
        },
        closeSponsorFocusModalV(){
            $("#focusModal").modal("hide");
        },

        topUptoOasisV: debounce(function() {

            if(this.announce.mark!='2') return;
            
            if (this.isSubmitting) return;
            this.isSubmitting = true;

            OasisApi.topUptoOasis(this.totalAmount, this.announce.id)
                .then(response => {
                    if (response.data.code == 200) {
                        this.cnt = 1;
                        customAlert.alert("打款成功，感谢您对部落的助力，祝您生活愉快");
                    } else {
                        customAlert.alert(response.data.message);
                    }
                })
                .catch(error => {
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
                })
                .finally(() => {
                    this.isSubmitting = false;
                    this.closeSponsorFocusModalV();
                });

        }, 300, { leading: true, trailing: false }) ,
       
        async loadAnnounceV(){
            const response = await OasisApi.loadAnnounceUsingHandle(currentOasisHandle);
            
            if(response.data.code == 200 && !response.data.announce){
                goErrorByReplace();
                return;
            }
            if(response.data.code == 200){
                this.announce = response.data.announce;
                document.title = "助力部落 · " + this.announce.title;
            }
            this.init_finish=true;
        }
    },
    computed: {
        totalAmount() {
            return this.cnt * 5;
        }
    },
}

let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);



const kindness = app.mount('#app');

window.kindnessPage = kindness;

kindness.loadAnnounceV();



