import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";


async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
}

const RootComponent = {
    data() {
      return {
        addLinkMarketingObj:{
        },
        channelOptions: [
        ],
        channelSelectedItem: "",
        choice_pagination: {
            url: "/api/v1/web/affiliate/choice_product",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
                heartbeat:"",
                blue: "",
                sort: ""
            },
            paging: {},
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.choice_pagination.size = response.product.size;
                    this.choice_pagination.current = response.product.current;
                    this.choice_pagination.total = response.product.total;
                    this.choice_pagination.pages = response.product.pages;
                    this.choice_pagination.records = response.product.records;
                    this.choice_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, size: 5});

                }
            }
        }
      }
    },
    methods: {
        addLinkMarketingV(){
            addLinkMarketing(this.addLinkMarketingObj.cellId,this.channelSelectedItem);
        },
        loadChannelListV(){
            loadChannelList(this);
        },
        removeProductFromChoiceV(cellId){
            removeProductFromChoice(cellId);
        },
        retrieveProductTableV(){
            retrieveProductTable();
        },
        filterPrductTableV(){
            filterPrductTable();
        },
        showAddEntryModalV(item){
            this.channelSelectedItem="";
            this.addLinkMarketingObj.cellId=item.cellId;
            this.addLinkMarketingObj.productName=item.productName;
            this.addLinkMarketingObj.planPrice=item.planPrice;
        
            $("#addEntryModal").modal("show");
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
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

app.component("model-select",ModelSelect);
app.mixin(Pagination);
app.mixin(DirectiveComponent);

const productManagement = app.mount('#app');

window.productManagement = productManagement;
let customAlert = new CustomAlertModal();

// init
productManagement.pageInit(productManagement.choice_pagination);
productManagement.loadChannelListV();
productManagement.userAdapter(); // auth.js

function retrieveProductTable(){
    const tmpq = productManagement.choice_pagination.param.q;
 
    initQueryParam();
    productManagement.choice_pagination.param.q = tmpq;
 
    productManagement.reloadPage(productManagement.choice_pagination);
}

function initQueryParam(){
    productManagement.choice_pagination.param = {
      q: '',
      supplierAccountAgeLeft: '',
      heartbeat: '',
      blue: '',
      planPriceLeft: '',
      revshareLeft: '',
      viewsLeft: '',
      viewsRight: '',
      planPriceRight: '',
      revshareRight: '',
      supplierAccountAgeRight: '',
      saleVolumeLeft: '',
      saleVolumeRight: '',
      offline: '',
      sort: ""
    }
    productManagement.choice_pagination.current = 1;
    productManagement.choice_pagination.size = 10;
}

function filterPrductTable(){
    productManagement.choice_pagination.param.current = 1;
    productManagement.reloadPage(productManagement.choice_pagination);
}

async function doRemoveProductFromChoice(cellId){

    const url="/api/v1/web/affiliate/del_choice_product";
    const model={
        cellId: cellId
    }
    
    return await fetch(url,{method: "DELETE",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

}
async function fetchChannelList(){
    const url="/api/v1/web/affiliate/outreach?size=100000&current=1";
    return await fetch(url);
}
async function doAddLinkMarketing(cellId,outreachChannelId){

    const url="/api/v1/web/affiliate/new_product_marketing";
    const model={
        cellId: cellId,
        outreachChannelId:outreachChannelId
    }
    
    return await fetch(url,{method: "POST",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

}
async function addLinkMarketing(cellId,outreachChannelId){
    if(!outreachChannelId){
        return
    }
    const response =  await doAddLinkMarketing(cellId,outreachChannelId);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        $("#addEntryModal").modal("hide");
        customAlert.alert("添加分销成功，可前往【营销】 -> 【通用分销】查看！"); 

    }
    if(data.code==40021){
        customAlert.alert("相应商品的分销渠道已经设置，可继续选择其他分销渠道或者重新选择商品品！"); 
        return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
}
async function loadChannelList(appObj){
    const response = await fetchChannelList();
    var data = await response.json();
    if(data.code==200){
       var channelArr=[{value:"",text:"请选择渠道"}];
       data.outreach.records.forEach(element => {
        channelArr.push({value: element.outreachChannelId,text: element.channelName});
       });
       appObj.channelOptions=channelArr;
    }
}

async function removeProductFromChoice(cellId){
    const response =  await doRemoveProductFromChoice(cellId);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        customAlert.alert("产品已从橱窗成功移除！"); 
        productManagement.filterPrductTableV();
    }
    if(data.code==40021){
        customAlert.alert("存在带货链接，不能移除商品，继续移除请前往 【营销】 -> 【通用分销】移除与该产品有关的分销数据！"); 
        return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
}
