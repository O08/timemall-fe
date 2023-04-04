import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/micro/javascripts/compoent/TeicallaanliSubNavComponent.js"

import defaultObjPreviewImage from '/common/images/default-cell-preview.jpg'
import Pagination  from "/common/javascripts/pagination-vue.js";
import {ObjOd,ObjMark,ObjTag} from "/common/javascripts/tm-constant.js";



const RootComponent = {
    data() {
      return {
        defaultObjPreviewImage,
        pricing: {
            objId: "",
            price: ""
        },
        currentTarget: {},
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
       },
       changeSlideToFirstV(selector){
        $(selector).click();
       },
       changeSlideV(selector,swapNo){
        retrieveObjBySwapNo(swapNo,ObjOd.TARGET).then(response=>{
            if(response.data.code==200){
                this.currentTarget=response.data.obj;
                $(selector).click();
            }
        })
       },
       acceptCooperationV(swapNo){
         this.markObjV(swapNo,ObjMark.OWNED);
       },
       denyCooperationV(swapNo){
        this.markObjV(swapNo,ObjMark.DENY);
       },
       markObjV(swapNo, mark){
         markObjB(swapNo,mark).then(response=>{
            if(response.data.code==200){
                this.loadCooperationObjV();
            }
         })

       },
       saleObjV(objId){
           tagObjB(objId,ObjTag.PUBLISH).then(response=>{
            if(response.data.code==200){
                this.loadOwnedObjV();
            }
           })
       },
       offsaleObjV(objId){
        tagObjB(objId,ObjTag.OFFLINE).then(response=>{
            if(response.data.code==200){
                this.loadOwnedObjV();
            }
           })
       },
       useObjV(objId){
           useObjB(objId).then(response=>{
                if(response.data.code==200){
                    alert("成功生成订单，可在E-pod查看履约");
                }
           })
       },
       showPricingModalV(objId){
        this.pricing.objId=objId;
        this.pricing.price="";
        $("#pricingModal").modal("show");
       },
       settingObjPricingV(){
        settingObjPricing(this.pricing).then(response=>{
            if(response.data.code==200){
                this.loadOwnedObjV();
                $("#pricingModal").modal("hide");
            }
        });
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
async function getObjBySwapNo(swapNo,od){
    const url="/api/v1/team/obj/by_swapno?swapNo="+swapNo + "&od="+od;
    return await axios.get(url);
}
async function markObj(dto){
    const url="/api/v1/team/obj/mark";
    return await axios.put(url,dto);
}
async function useObj(objId){
    const url="/api/v1/team/obj/{obj_id}/using".replace("{obj_id}",objId);
    return await axios.put(url);
}
async function updateObjPricing(pricing){
    const url="/api/v1/team/obj/pricing";
    return await axios.put(url,pricing);
}
function settingObjPricing(pricing){
    return updateObjPricing(pricing);
}
function retrieveObjBySwapNo(swapNo,od){
    return getObjBySwapNo(swapNo,od);
}
function markObjB(swapNo,mark){
    const dto={
        swapNo: swapNo,
        mark: mark
    }
    return markObj(dto);
}
function tagObjB(objId,tag){
    const dto= {
        objId: objId,
        tag: tag
    }
    return tagObj(dto);
}
function useObjB(objId){
    return useObj(objId);
}
