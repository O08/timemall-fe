import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';
import { getQueryVariable } from "/common/javascripts/util.js";


const RootComponent = {
    data() {
      return {

        visit_pagination: {
            url: "/api/v1/web/affiliate/ppc/visit",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
              visitTime: '',
              batch: '',
              valid: "",
              pay: "",
              sort: ""
            },
            paging: {},
            responesHandler: (response)=>{
                if(response.code == 200){

                    this.visit_pagination.size = response.visit.size;
                    this.visit_pagination.current = response.visit.current;
                    this.visit_pagination.total = response.visit.total;
                    this.visit_pagination.pages = response.visit.pages;
                    this.visit_pagination.records = response.visit.records;
                    this.visit_pagination.paging = this.doPaging({current: response.visit.current, pages: response.visit.pages, max: 5});

                }
            }
        }
      }
    },
    methods: {

        retrieveVisitTableV(){
            retrieveVisitTable();
        },
        filterVisitTableV(){
            filterVisitTable();
        },
        downLoadVisitDataV(){
          downLoadVisitData()
        },
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        },
        userInputDatePickerHandlerV(e){    

          // delete date
          var needUpdate = false;
          if (!!e.inputType && e.inputType.startsWith("delete")) {
            e.target.value="";
            e.target.dataset.olddate="";
            needUpdate=true;
          }
          $("#" + e.target.id).datepicker("setDate", e.target.dataset.olddate);
          if(!!e.data || needUpdate){
              e.currentTarget.dispatchEvent(new Event('input')); // update v-model
          }

      }
      

    },
    created(){
      this.visit_pagination.param.batch=getQueryVariable("batch");
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

        $( ".datepicker" ).datepicker({
          dateFormat: "yy-mm-dd",
          duration: "fast",
          onSelect: function(selectedDate,inst) {
              if(inst.lastVal !=selectedDate){
                  document.getElementById(inst.id).dataset.olddate=selectedDate;
                  document.getElementById(inst.id).dispatchEvent(new Event('input'))
                  document.getElementById(inst.id).dispatchEvent(new Event('change'))
              }
          }
      });
      $( ".datepicker" ).datepicker( $.datepicker.regional[ "zh-CN" ] );

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
const ppcVisit = app.mount('#app');

window.ppcVisitPage = ppcVisit;
// init
ppcVisit.pageInit(ppcVisit.visit_pagination);


function retrieveVisitTable(){
    const tmpq = ppcVisit.visit_pagination.param.q;
 
    initQueryParam();
    ppcVisit.visit_pagination.param.q = tmpq;
 
    ppcVisit.reloadPage(ppcVisit.visit_pagination);
}

function initQueryParam(){
    ppcVisit.visit_pagination.param = {
      q: '',
      visitTime: '',
      batch: '',
      valid: "",
      pay: "",
      sort: ""
    }
    ppcVisit.visit_pagination.current = 1;
    ppcVisit.visit_pagination.size = 10;
}

function filterVisitTable(){
    ppcVisit.visit_pagination.param.current = 1;
    ppcVisit.reloadPage(ppcVisit.visit_pagination);
}

async function doDownload(dto){
  const url="/api/v1/web/affiliate/ppc/visit/download?" + new URLSearchParams(dto).toString();
  var link = document.createElement("a");
  link.download = 'PPC访问明细-ppc-visit-record.csv';
  link.href = url;
  link.click();
  link.remove();
}

async function downLoadVisitData(){

  doDownload(ppcVisit.visit_pagination.param);

}


