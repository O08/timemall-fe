import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";


const RootComponent = {
    data() {
      return {
        link_pagination: {
            url: "/api/v1/web/affiliate/ppc/bill",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
              sort: "",
              tag: ""
            },
            paging: {},
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.link_pagination.size = response.bill.size;
                    this.link_pagination.current = response.bill.current;
                    this.link_pagination.total = response.bill.total;
                    this.link_pagination.pages = response.bill.pages;
                    this.link_pagination.records = response.bill.records;
                    this.link_pagination.paging = this.doPaging({current: response.bill.current, pages: response.bill.pages, size: 5});

                }
            }
        }
      }
    },
    methods: {
       

        filterCpcBillTableV(){
          filterCpcBillTable();
        },
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        }

    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
app.mixin(Pagination);
app.mixin(DirectiveComponent);
const cpcBill = app.mount('#app');

window.cpcBillPage = cpcBill;
// init
cpcBill.pageInit(cpcBill.link_pagination);


function filterCpcBillTable(){
    cpcBill.link_pagination.param.current = 1;
    cpcBill.reloadPage(cpcBill.link_pagination);
}
