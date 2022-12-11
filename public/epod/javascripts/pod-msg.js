import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

const RootComponent = {
    data() {
        return {
            contact: {},
            transpagination:{
                url: "/api/v1/web_epod/me/transaction",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.transpagination.size = response.transactions.size;
                        this.transpagination.current = response.transactions.current;
                        this.transpagination.total = response.transactions.total;
                        this.transpagination.pages = response.transactions.pages;
                        this.transpagination.records = response.transactions.records;
                    }
                }
            }
        }
    },
    methods: {
        showContactInfoV(brandId){
            showContactInfo(brandId);
        }
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);
    },
    updated(){
        $(function() {
            console.log("aaa");
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
const msgPage = app.mount('#app');
window.pMsg= msgPage;

async function getBrandContact(brandId)
{
    const url = "/api/v1/web_epod/brand/{brand_id}/contact".replace("{brand_id}",brandId);
    return await axios.get(url);
    
}
function findBrandContactInfo(brandId){
   getBrandContact(brandId).then(response=>{
    if(response.data.code==200){
        msgPage.contact = response.data.contact;
    }
   });
}


function showContactInfo(brandId){
    findBrandContactInfo(brandId);
    $("#displayModal").modal("show");
}

