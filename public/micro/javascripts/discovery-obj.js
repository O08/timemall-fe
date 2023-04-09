import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
// todo
import defaultObjPreviewImage from '/common/images/default-cell-preview.jpg'
import {PriceSbu} from "/common/javascripts/tm-constant.js";


const RootComponent = {
    data() {
        return {
            defaultObjPreviewImage,
            objgrid_pagination: {
                url: "/api/v1/team/obj",
                size: 12,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                q: ''
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.objgrid_pagination.size = response.obj.size;
                        this.objgrid_pagination.current = response.obj.current;
                        this.objgrid_pagination.total = response.obj.total;
                        this.objgrid_pagination.pages = response.obj.pages;
                        this.objgrid_pagination.records = response.obj.records;
                        // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        retrieveObjGridV(){
            retrieveObjGrid();
        },
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
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
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
const disObj = app.mount('#app');

window.disObj = disObj;

// init
disObj.pageInit(disObj.objgrid_pagination);

function retrieveObjGrid(){
    disObj.reloadPage(disObj.objgrid_pagination);
}