import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { transformInputNumberAsPositive,formatCmpctNumber } from "/common/javascripts/util.js";

async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
}

const RootComponent = {
    data() {
      return {
        gallery_pagination: {
            url: "/api/v1/web/affiliate/product",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
                heartbeat:"",
                blue: "",
                sort: "",
                provideInvoice: ""

            },
            paging: {},
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.gallery_pagination.size = response.product.size;
                    this.gallery_pagination.current = response.product.current;
                    this.gallery_pagination.total = response.product.total;
                    this.gallery_pagination.pages = response.product.pages;
                    this.gallery_pagination.records = response.product.records;
                    this.gallery_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, size: 5});

                }
            }
        }
      }
    },
    methods: {
        
        addProductToChoiceV(cellId){
            addProductToChoice(cellId);
        },
        retrieveProductTableV(){
            retrieveProductTable();
        },
        filterPrductTableV(){
            filterPrductTable();
        },
        transformInputNumberV(event){
          return transformInputNumberAsPositive(event);
        },
        formatCmpctNumberV(number){
            return formatCmpctNumber(number);
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
    return tag.startsWith('col-') || tag.startsWith('top-search') 
}
app.mixin(Pagination);
app.mixin(DirectiveComponent);
const gallery = app.mount('#app');

window.gallery = gallery;
let customAlert = new CustomAlertModal();
// init
gallery.pageInit(gallery.gallery_pagination);

function retrieveProductTable(){
    const tmpq = gallery.gallery_pagination.param.q;
 
    initQueryParam();
    gallery.gallery_pagination.param.q = tmpq;

    gallery.reloadPage(gallery.gallery_pagination);
}

function initQueryParam(){
    gallery.gallery_pagination.param = {
      q: '',
      supplierAccountAgeLeft: '',
      heartbeat: '',
      blue: '',
      planPriceLeft: '',
      provideInvoice: '',
      revshareLeft: '',
      viewsLeft: '',
      viewsRight: '',
      planPriceRight: '',
      revshareRight: '',
      supplierAccountAgeRight: '',
      saleVolumeLeft: '',
      saleVolumeRight: '',
      influencersLeft: '',
      influencersRight: '',
      sort: ""
    }
    gallery.gallery_pagination.current = 1;
    gallery.gallery_pagination.size = 10;
}
function filterPrductTable(){
    gallery.gallery_pagination.param.current = 1;
    gallery.reloadPage(gallery.gallery_pagination);
}

  async function doAddProductToChoice(cellId){

    const url="/api/v1/web/affiliate/add_product_to_choice";
    const model={
        cellId: cellId
    }
    
    return await fetch(url,{method: "POST",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

  }

  async function  addProductToChoice(cellId){
    const response =  await doAddProductToChoice(cellId);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        gallery.reloadPage(gallery.gallery_pagination);
        customAlert.alert("添加成功，可前往橱窗查看！");
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }

