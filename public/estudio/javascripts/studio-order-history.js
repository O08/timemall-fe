import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"



const RootComponent = {
    data() {
        return {
            transpagination:{
                url: "/api/v1/web_estudio/brand/transaction",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                },
                responesHandler: (response)=>{
                    // mock data todo: need to remove 
                    // response = mockTransData();
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
         
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));

const transactionPage = app.mount('#app');
window.cTransaction= transactionPage;
