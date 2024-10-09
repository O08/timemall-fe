import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";


async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
}
const RootComponent = {
    data() {
      return {
        editLinkObj: {
        },
        addLinkObj: {},
        link_pagination: {
            url: "/api/v1/web/affiliate/ppc/link",
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
                    this.link_pagination.size = response.link.size;
                    this.link_pagination.current = response.link.current;
                    this.link_pagination.total = response.link.total;
                    this.link_pagination.pages = response.link.pages;
                    this.link_pagination.records = response.link.records;
                    this.link_pagination.paging = this.doPaging({current: response.link.current, pages: response.link.pages, max: 5});

                }
            }
        }
      }
    },
    methods: {
        renameLinkNameV(){
          renameLinkName(this.editLinkObj.linkName,this.editLinkObj.id);
        },
        addLinkV(){
          addLink(this.addLinkObj);
        },
        removeLinkV(id){
          removeLink(id);
        },
        retrieveLinkTableV(){
          retrieveLinkTable();
        },
        filterLinkTableV(){
            filterLinkTable();
        },
        showAddLinkModalV(){
             this.addLinkObj={};
            $("#addLinkModal").modal("show");
        },
        showEditLinkModalV(link){
            this.editLinkObj=JSON.parse(JSON.stringify(link));
            $("#editLinkModal").modal("show");
        },
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        },
        copyValueToClipboardV(copyContent){
          copyValueToClipboard(copyContent);
        },
         transformInputTextV(e){
            return transformInputText(e);
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
const cpcLink = app.mount('#app');

window.cpcLinkPage = cpcLink;
let customAlert = new CustomAlertModal();
// init
cpcLink.pageInit(cpcLink.link_pagination);


function retrieveLinkTable(){
    const tmpq = cpcLink.link_pagination.param.q;
 
    initQueryParam();
    cpcLink.link_pagination.param.q = tmpq;
 
    cpcLink.reloadPage(cpcLink.link_pagination);
}

function initQueryParam(){
    cpcLink.link_pagination.param = {
      q: '',
      viewsLeft: '',
      viewsRight: '',
      ipVolumeLeft: '',
      ipVolumeRight: '',
      earningLeft: '',
      earningRight: '',
      sort: ""
    }
    cpcLink.link_pagination.current = 1;
    cpcLink.link_pagination.size = 10;
}

function filterLinkTable(){
    cpcLink.link_pagination.param.current = 1;
    cpcLink.reloadPage(cpcLink.link_pagination);
}

async function doRemoveLink(id){

    const url="/api/v1/web/affiliate/ppc/link";
    const model={
        id: id
    }
    
    return await fetch(url,{method: "DELETE",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

  }

  async function doAddLink(dto){

    const url="/api/v1/web/affiliate/ppc/link";

    
    return await fetch(url,{method: "POST",body: JSON.stringify(dto),headers:{
		'Content-Type':'application/json'
	}});

  }
  async function doRenameLinkName(linkName,id){

    const url="/api/v1/web/affiliate/ppc/rename_link";
    const model={
        linkName: linkName,
        id: id
    }
    
    return await fetch(url,{method: "PUT",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

  }

  async function renameLinkName(linkName,id){
    if(!linkName){
        return
    }
    const response =  await doRenameLinkName(linkName,id);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        cpcLink.filterLinkTableV();
        $("#editLinkModal").modal("hide");

    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }

  async function addLink(addLinkObj){

    const response =  await doAddLink(addLinkObj);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        cpcLink.filterLinkTableV();
        $("#addLinkModal").modal("hide");
    }
    if(data.code==40021){
      customAlert.alert("监测码已被使用，请重新编辑"); 
      return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }

  async function  removeLink(id){
    const response =  await doRemoveLink(id);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        // todo reload
        cpcLink.filterLinkTableV();
    }
    if(data.code==40029){
      customAlert.alert("链接存在访问记录，不能移除，详情前往 【CPC推广】 -> 【绩效表现】查看！"); 
      return;
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      customAlert.alert(error); 
    }
  }

  function  transformInputText(e){
    var val = e.target.value.replace(/[^\a-\z\A-\Z0-9\_]/g,'');// type int
    const needUpdate = (val !== e.target.value);
    if(needUpdate){
        e.target.value=val;
        e.currentTarget.dispatchEvent(new Event('input')); // update v-model
    }
}