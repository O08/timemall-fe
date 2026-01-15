import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
// todo
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import {FromWhere,EnvWebsite,CodeMappingTypeEnum} from "/common/javascripts/tm-constant.js";
import { uploadScienceData } from "/common/javascripts/science.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";

const defaultObjPreviewImage = new URL(
    '/common/images/default-cell-preview.jpg',
    import.meta.url
);
const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
        return {
            reportOptions: [],
            reportForm: this.initReportForm(),
            currentOpenPaper: {
                paperId: "",
                windowUrl: ""
            },
            defaultObjPreviewImage,
            papergrid_pagination: {
                url: "/api/v1/web_estudio/discover/commercial_paper",
                size: 30,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                q: ''
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.papergrid_pagination.size = response.paper.size;
                        this.papergrid_pagination.current = response.paper.current;
                        this.papergrid_pagination.total = response.paper.total;
                        this.papergrid_pagination.pages = response.paper.pages;
                        this.papergrid_pagination.records = response.paper.records;
                        // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        copyValueToClipboardV(){
            copyValueToClipboard(this.currentOpenPaper.windowUrl);
        },
        newTabDisplayPaperV(){
            let a = document.createElement("a");           
            a.setAttribute("href", this.currentOpenPaper.windowUrl);      
            a.setAttribute("target", "_blank");           
            a.click();    

        },
        showCommericalOrderPreviewModalV(paperId){
            const inframeUrl = "/business/paper/" + paperId +"?display=inframe";
            const windowUrl= "/business/paper/" + paperId;
            this.currentOpenPaper.paperId=paperId;
            this.currentOpenPaper.windowUrl=currentDomain+windowUrl;

            document.getElementById("commericalOrderPageInframe").src= inframeUrl;
            $("#commericalOrderPreviewModal").modal("show");
            history.pushState(null, "", windowUrl);

        },
        closeCommericalOrderPreviewModalV(){
            $("#commericalOrderPreviewModal").modal("hide");
            history.pushState(null, "", '/rainbow/discovery-commercial-order');

        },
        retrievePaperGridV(){
            retrievePaperGrid();
            this.uploadScienceDataV();
        },
        uploadScienceDataV(){
            const snippet = this.papergrid_pagination.param.q;
            const details= JSON.stringify(this.papergrid_pagination.param);
            const fromWhere=FromWhere.BUSINESS_PAPER_SEARCH;
            uploadScienceData(snippet,details,fromWhere);
        },
        newReportCaseV(){
          newReportCase(this.reportForm).then(response=>{
              if(response.data.code==200){
  
              document.querySelector('#caseMaterialFile').value = null;
  
              this.closeOasisReportModalV();
  
              }
              if(response.data.code!=200){
                  customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
              }
          })
        },
        closeOasisReportModalV(){         
            $("#reportOasisModal").modal("hide");
            $("#commericalOrderPreviewModal").modal("show");
        },
        showOasisReportModalV(){
  
            this.reportForm={
                fraudType: "",
                scene: "线上商单",
                sceneUrl: this.currentOpenPaper.windowUrl,
                caseDesc: "",
                material: ""
            }
            
  
            showOasisReportModal(         
                this.loadReportIssueListV
            );
        },
        loadReportIssueListV(){
            loadReportIssueList(this);
        },
        validateReportFormV(){
          return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
        },
        initReportForm(){
  
          if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
             document.querySelector('#caseMaterialFile').value = null;
          }
  
          return {
              fraudType: "",
              scene: "线上商单",
              sceneUrl: "",
              caseDesc: "",
              material: ""
          }
        },
    },
    updated(){
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}

const app =  createApp(RootComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.mixin(new Auth({need_permission : true}));
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-search') 
}
const disCommercialPaperPage = app.mount('#app');

window.disCommercialPaperPage = disCommercialPaperPage;

// init
disCommercialPaperPage.pageInit(disCommercialPaperPage.papergrid_pagination);
function retrievePaperGrid(){
    disCommercialPaperPage.reloadPage(disCommercialPaperPage.papergrid_pagination);
}




// report feature


async function newReportCase(reportForm) {

    const materialFile = $('#caseMaterialFile')[0].files[0];

    var form = new FormData();
    if (!!materialFile) {
        form.append("material", materialFile);
    }
    form.append("fraudType", reportForm.fraudType);
    form.append("scene", reportForm.scene);
    form.append("sceneUrl", reportForm.sceneUrl);
    form.append("caseDesc", reportForm.caseDesc);
    return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj) {
    const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE, "");
    var data = await response.json();
    if (data.code == 200) {

        appObj.reportOptions = data.codes.records;

    }
}

async function showOasisReportModal(loadReportIssueListV) {
    await loadReportIssueListV();
    $("#commericalOrderPreviewModal").modal("hide");
    $("#reportOasisModal").modal("show");
}

// report feature end