import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';

import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
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
        channelOptions: [
        ],
        channelSelectedItem: "",
        shareObj:{
            item: {},
            shortLink: "",
            deepLink: "",
            embedCode: ""
        },
        link_market_pagination: {
            url: "/api/v1/web/affiliate/outreach_link_ind",
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
                    this.link_market_pagination.size = response.ind.size;
                    this.link_market_pagination.current = response.ind.current;
                    this.link_market_pagination.total = response.ind.total;
                    this.link_market_pagination.pages = response.ind.pages;
                    this.link_market_pagination.records = response.ind.records;
                    this.link_market_pagination.paging = this.doPaging({current: response.ind.current, pages: response.ind.pages, size: 5});

                }
            }
        }
      }
    },
    methods: {
        loadChannelListV(){
            loadChannelList(this);
        },
        copyValueToClipboardV(content){
            copyValueToClipboard(content);
        },
        removeLinkItemV(){
            removeLinkItem(this.removelinkMarketingId);
        },
        filterLinkTableV(){
            filterLinkTable();
        },
        retrieveLinkTableV(){
            retrieveLinkTable();
        },
        showShareLinkModalV(item){
            this.shareObj.item=item;
            this.shareObj.shortLink=item.shortLink;
            this.channelSelectedItem=item.outreachChannelId;
            this.shareObj.deepLink=EnvWebsite.PROD+"/mall/cell-detail?cell_id=" +  item.cellId+ "&brand_id=" + item.supplierBrandId + "&influencer=" + item.brandId+ "&chn="+item.outreachChannelId+"&market=link";
            this.shareObj.embedCode=this.getEmbedCodeTextV(item);
             $("#shareModal").modal("show");
        },
        showRemoveLinkModalV(linkMarketingId){
            this.removelinkMarketingId=linkMarketingId;
            $("#removeEntryModal").modal("show");
        },
        closeRemoveLinkModalV(){
            $("#removeEntryModal").modal("hide");

        },
        editEmbedCodeChannelV(){
            this.shareObj.embedCode=this.getEmbedCodeTextV(this.shareObj.item);
            $("#embedCode").val(this.shareObj.embedCode);
        },
        getEmbedCodeTextV(item){
         return '<iframe src="' + EnvWebsite.PROD  +'/mall/cell-widget?influencer=' + item.brandId + '&chn=' + this.channelSelectedItem + '&sort=add_time" loading="lazy" data-with-title="true"  frameborder="0" height="350" width="100%" ></iframe>';
        },
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        }
    },
    watch: {
        'channelSelectedItem': function(newV, oldV){
            if(newV){
                this.editEmbedCodeChannelV();
            }
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
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.component("model-select",ModelSelect);
const marketing = app.mount('#app');

window.marketing = marketing;
let customAlert = new CustomAlertModal();
// init
marketing.pageInit(marketing.link_market_pagination);
marketing.loadChannelListV();
marketing.userAdapter(); // auth.js


function retrieveLinkTable(){
    const tmpq = marketing.link_market_pagination.param.q;
 
    initQueryParam();
    marketing.link_market_pagination.param.q = tmpq;
 
    marketing.reloadPage(marketing.link_market_pagination);
}

function initQueryParam(){
    marketing.link_market_pagination.param = {
      q: '',
      viewsLeft: '',
      viewsRight: '',
      revshareRight: '',
      saleVolumeLeft: '',
      saleVolumeRight: '',
      salesLeft: '',
      salesRight: '',
      supplierAccountAgeLeft: '',
      supplierAccountAgeRight: '',
      heartbeat: '',
      blue: '',
      planPriceLeft: '',
      planPriceRight: '',
      offline: '',
      revshareLeft: '',
      sort: ""
    }
    marketing.link_market_pagination.current = 1;
    marketing.link_market_pagination.size = 10;
}

function filterLinkTable(){
    marketing.link_market_pagination.param.current = 1;
    marketing.reloadPage(marketing.link_market_pagination);
}

async function doRemoveLinkItem(linkMarketingId){

    const url="/api/v1/web/affiliate/del_link_marketing";
    const model={
        linkMarketingId: linkMarketingId
    }
    
    return await fetch(url,{method: "DELETE",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

}
async function fetchChannelList(){
    const url="/api/v1/web/affiliate/outreach?size=100000&current=1";
    return await fetch(url);
}
async function removeLinkItem(linkMarketingId){
    const response =  await doRemoveLinkItem(linkMarketingId);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        $("#removeEntryModal").modal("hide");
        marketing.filterLinkTableV();
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
       var channelArr=[];
       data.outreach.records.forEach(element => {
        channelArr.push({value: element.outreachChannelId,text: element.channelName});
       });
       appObj.channelOptions=channelArr;
    }
}


