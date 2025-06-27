import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";


const RootComponent = {
    data() {
        return {

            caseList_pagination: {
                url: "/api/v1/team/dsp_case/library",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {
                  q: '',
                  sort: "1",
                  casePriority: "",
                  caseStatus: ""
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.caseList_pagination.size = response.reportCase.size;
                        this.caseList_pagination.current = response.reportCase.current;
                        this.caseList_pagination.total = response.reportCase.total;
                        this.caseList_pagination.pages = response.reportCase.pages;
                        this.caseList_pagination.records = response.reportCase.records;
                        this.caseList_pagination.paging = this.doPaging({current: response.reportCase.current, pages: response.reportCase.pages, size: 5});

                    }
                }
            },
        }
    },
    methods: {
        retrieveCaseListV(){
            // refrest feed list
            this.caseList_pagination.current=1;
            this.reloadPage(this.caseList_pagination);
        },
        filterCaseListV(){
            this.caseList_pagination.param.casePriority="";
            this.caseList_pagination.param.caseStatus="";
            this.caseList_pagination.current=1;
            this.reloadPage(this.caseList_pagination);
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
app.mixin(new Auth({need_permission : true,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);


const dspCenter = app.mount('#app');

window.dspCenterPage = dspCenter;

// init 
dspCenter.pageInit(dspCenter.caseList_pagination);

