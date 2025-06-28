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
        editChannel: {
        },
        channelName_add: "",
        chn_pagination: {
            url: "/api/v1/web/affiliate/outreach",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            param: {
              sort: ""
            },
            paging: {},
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.chn_pagination.size = response.outreach.size;
                    this.chn_pagination.current = response.outreach.current;
                    this.chn_pagination.total = response.outreach.total;
                    this.chn_pagination.pages = response.outreach.pages;
                    this.chn_pagination.records = response.outreach.records;
                    this.chn_pagination.paging = this.doPaging({current: response.outreach.current, pages: response.outreach.pages, size: 5});

                }
            }
        }
      }
    },
    methods: {
        renameChannelNameV(){
            renameChannelName(this.editChannel.channelName,this.editChannel.outreachChannelId);
        },
        addChannelV(){
            addChannel(this.channelName_add);
        },
        removeChannelV(outreachChannelId){
            removeChannel(outreachChannelId);
        },
        retrieveChannelTableV(){
            retrieveChannelTable();
        },
        filterChannelTableV(){
            filterChannelTable();
        },
        showAddChannelModalV(){
             this.channelName_add="";
            $("#addChannelModal").modal("show");
        },
        showEditChannelModalV(channeItem){
            this.editChannel=JSON.parse(JSON.stringify(channeItem));
            $("#editChannelModal").modal("show");
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
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
app.mixin(Pagination);
app.mixin(DirectiveComponent);
const channel = app.mount('#app');

window.channel = channel;
let customAlert = new CustomAlertModal();
// init
channel.pageInit(channel.chn_pagination);


function retrieveChannelTable(){
    const tmpq = channel.chn_pagination.param.q;
 
    initQueryParam();
    channel.chn_pagination.param.q = tmpq;
 
    channel.reloadPage(channel.chn_pagination);
}

function initQueryParam(){
    channel.chn_pagination.param = {
      q: '',
      viewsLeft: '',
      viewsRight: '',
      saleVolumeLeft: '',
      saleVolumeRight: '',
      salesLeft: '',
      salesRight: '',
      sort: ""
    }
    channel.chn_pagination.current = 1;
    channel.chn_pagination.size = 10;
}

function filterChannelTable(){
    channel.chn_pagination.param.current = 1;
    channel.reloadPage(channel.chn_pagination);
}

async function doRemoveChannel(outreachChannelId){

    const url="/api/v1/web/affiliate/del_outreach_channel";
    const model={
        outreachChannelId: outreachChannelId
    }
    
    return await fetch(url,{method: "DELETE",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

  }

  async function doAddChannel(outreachName){

    const url="/api/v1/web/affiliate/new_outreach_channel";
    const model={
        outreachName: outreachName
    }
    
    return await fetch(url,{method: "POST",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

  }
  async function doRenameChannelName(outreachName,outreachChannelId){

    const url="/api/v1/web/affiliate/rename_outreach_channel";
    const model={
        outreachName: outreachName,
        outreachChannelId: outreachChannelId
    }
    
    return await fetch(url,{method: "PUT",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

  }

  async function renameChannelName(outreachName,outreachChannelId){
    if(!outreachName){
        return
    }
    const response =  await doRenameChannelName(outreachName,outreachChannelId);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        channel.filterChannelTableV();
        $("#editChannelModal").modal("hide");

    }
    if(data.code==40022){
      customAlert.alert("渠道名称不能重复！"); 
      return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }

  async function addChannel(outreachName){
    if(!outreachName){
        return
    }
    const response =  await doAddChannel(outreachName);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        channel.filterChannelTableV();
        $("#addChannelModal").modal("hide");
    }
    if(data.code==40022){
      customAlert.alert("渠道名称不能重复！"); 
      return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }

  async function  removeChannel(outreachChannelId){
    const response =  await doRemoveChannel(outreachChannelId);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        channel.filterChannelTableV();
        channel.channelName_add="";
    }
    if(data.code==40021){
      customAlert.alert("存在带货链接，不能移除渠道，继续移除请前往 【营销】 -> 【通用分销】移除与该产品有关的分销数据！"); 
      return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }