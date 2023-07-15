import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
// todo
import defaultObjPreviewImage from '/common/images/default-cell-preview.jpg'
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';

const RootComponent = {
    data() {
        return {
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
        retrievePaperGridV(){
            retrievePaperGrid();
        }
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
app.mixin(new Auth({need_permission : true}));

const disCommercialPaperPage = app.mount('#app');

window.disCommercialPaperPage = disCommercialPaperPage;

// init
disCommercialPaperPage.pageInit(disCommercialPaperPage.papergrid_pagination);
function retrievePaperGrid(){
    disCommercialPaperPage.reloadPage(disCommercialPaperPage.papergrid_pagination);
}