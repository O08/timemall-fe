import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
// todo
import defaultOasisPreviewImage from '/micro/images/oasis-default-building.jpeg';
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'  


const RootComponent = {
    data() {
        return {
            defaultOasisPreviewImage,
            oasisgrid_pagination: {
                url: "/api/v1/team/oasis",
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
                        this.oasisgrid_pagination.size = response.oasis.size;
                        this.oasisgrid_pagination.current = response.oasis.current;
                        this.oasisgrid_pagination.total = response.oasis.total;
                        this.oasisgrid_pagination.pages = response.oasis.pages;
                        this.oasisgrid_pagination.records = response.oasis.records;
                        // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        retrieveOasisGridV(){
            retrieveOasisGrid();
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
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));

const disOasis = app.mount('#app');

window.disOasis = disOasis;

// init
disOasis.pageInit(disOasis.oasisgrid_pagination);

function retrieveOasisGrid(){
    disOasis.reloadPage(disOasis.oasisgrid_pagination);
}