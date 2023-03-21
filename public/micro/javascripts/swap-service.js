import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import defaultBgImage from '/avator.webp'
import Pagination  from "/common/javascripts/pagination-vue.js";


const RootComponent = {
    data() {
      return {
        objgrid_pagination: {
            url: "/api/v1/team/obj/me",
            size: 12,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
              brandId: "",
              mark: "1" // todo change to enum
            },
            paramHandler: (info)=>{
                info.param.brandId = this.getIdentity().brandId; // Auth.getIdentity();
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
        },
        todoGrid_pagination: {
            url: "/api/v1/team/obj/todo",
            size: 12,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
              brandId: "",
            },
            paramHandler: (info)=>{
                info.param.brandId = this.getIdentity().brandId; // Auth.getIdentity();
             },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.todoGrid_pagination.size = response.obj.size;
                    this.todoGrid_pagination.current = response.obj.current;
                    this.todoGrid_pagination.total = response.obj.total;
                    this.todoGrid_pagination.pages = response.obj.pages;
                    this.todoGrid_pagination.records = response.obj.records;
                    // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                }
            }
        }
      }
    },
    methods: {
       filterObjV(mark){
        // init param
        this.objgrid_pagination.param.mark = mark;
        this.objgrid_pagination.param.current = 1;
         this.reloadPage(this.objgrid_pagination);
       },
       loadCooperationObjV(){
        this.filterObjV("1");
       },
       loadOwnedObjV(){
        this.filterObjV("2");
       },
       loadTodoObjV(){
        this.todoGrid_pagination.param.current = 1;
         this.reloadPage(this.todoGrid_pagination);
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
app.mixin(TeicallaanliSubNavComponent);
app.mixin(Pagination);

const swapService = app.mount('#app');

window.swapService = swapService;

// init
swapService.pageInit(swapService.objgrid_pagination);

async function tagObj(dto){
    const url = "/api/v1/team/obj/tag";
    return await axios.put(url,dto)  
}
