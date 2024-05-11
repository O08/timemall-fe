import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


const RootComponent = {
    data() {
        return {
            btn_ctl: {
                activate_show_add_template_model__btn: false,
                activate_save_mps_chain__btn: false
            },
            chain: {
                title: "",
                tag: ""
            },
            template: {},
            templateDetail: {},
            newTemplate: {
                title: "",
                sow: "",
                piece: "",
                bonus: "",
                firstSupplier: "",
                duration: "",
                chainId: ""
            },
            putTemplate: {
                title: "",
                sow: "",
                piece: "",
                bonus: "",
                firstSupplier: "",
                duration: "",
                chainId: ""
            },
            supplier:{
                records: []
            }

        }
},
  
    methods: {
        validateNewTemplateV(){
            if(!!this.newTemplate.title && !!this.newTemplate.sow 
                && !!this.newTemplate.piece && !!this.newTemplate.bonus 
                && !!this.newTemplate.deliveryCycle && !!this.newTemplate.contractValidityPeriod
                && ((!this.newTemplate.firstSupplier && !this.newTemplate.duration)
                     || (!!this.newTemplate.firstSupplier && !!this.newTemplate.duration))){

                return true;
            }
            return false;
        },
        validatePutTemplateV(){
            if(!!this.putTemplate.title && !!this.putTemplate.sow 
                && !!this.putTemplate.piece && !!this.putTemplate.bonus 
                && !!this.putTemplate.deliveryCycle && !!this.putTemplate.contractValidityPeriod
                && ((!this.putTemplate.firstSupplier && !this.putTemplate.duration)
                     || (!!this.putTemplate.firstSupplier && !!this.putTemplate.duration))){

                return true;
            }
            return false;
        },
        showNewChainTemplateModalV(){
            this.newTemplate={};
            $('.iput').val("");
            $("#newChainTemplateModal").modal("show"); // hide modal

        },
        removeTemplateV(id){
            removeTemplate(id).then(response=>{
                if(response.data.code==200){
                    this.findAllTemplateOwnedChainV(); // refresh 
                    this.templateDetail={}; // reset templateDetail
                }
            })
        },
        newMpsTemplateV(){
            newMpsTemplate(this.newTemplate).then(response=>{
                if(response.data.code==200){
                    $("#newChainTemplateModal").modal("hide"); // hide modal
                    this.findAllTemplateOwnedChainV(); // refresh 
                    this.newTemplate={}; // reset 
                    $('.iput').val(""); // reset suplier selector
                }
            })
        },
        putMpsTemplateV(){
            modifyMpsTemplate(this.putTemplate).then(response=>{
                if(response.data.code==200){
                    this.findAllTemplateOwnedChainV(); // refresh 
                    this.templateDetail={}; // reset templateDetail
                    $("#editChainTemplateModal").modal("hide"); // hide modal

                }
            });
        },
        findChainInfoV(){
            const chainId = getQueryVariable("chain_id");
            if(!chainId){
                return  ;
            }
            findChainInfo(chainId).then(response=>{
                if(response.data.code==200){
                    this.chain=response.data.chain;
                }
            })
        },
        saveMpsChainV(){
            saveMpsChain(this.chain.title,this.chain.tag);
            
        },
        findAllTemplateOwnedChainV(){
            const chainId = getQueryVariable("chain_id");
            if(!chainId){
                return ;
            }
            findAllTemplateOwnedChain(chainId).then(response=>{
                if(response.data.code==200){
                   this.template=response.data.template;
                }
            })
        },
        findTemplateDetailV(templateId){
            findTemplateDetail(templateId).then(response=>{
                if(response.data.code==200){
                    this.templateDetail=response.data.detail;
                }
            });
        },
        fetchFirstSupplierV(){
            fetchFirstSupplier().then(response=>{
                if(response.data.code==200){
                    this.supplier=response.data.supplier;
                }
            });
        },
        // search selector
        showOptionV(){
            showOption();
        },
        searchV(){
            search();
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        },
        queryVariableHasChainIdV(){
            const chainId = getQueryVariable("chain_id");
            this.btn_ctl.activate_show_add_template_model__btn=!!chainId;
        },
        inEditChainModeV(){
          const option = getQueryVariable("option");
          return option==='edit';
        },
        showEditTemplateModelV(){
            this.putTemplate=JSON.parse(JSON.stringify(this.templateDetail));// deep copy
            $('#put_iput_supplier').val(this.templateDetail.firstSupplierName);
            $("#editChainTemplateModal").modal("show"); // show modal
        },
        transformInputNumberV(event){
            var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
            var min = Number(event.target.min);
            var max = Number(event.target.max);
            event.target.value = transformInputNumber(val, min, max);
            if(val !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        }
    },
    created() {
       this.findChainInfoV();
       this.findAllTemplateOwnedChainV();
       this.fetchFirstSupplierV();
       this.queryVariableHasChainIdV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new BrandInfoComponent({need_init: true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
    
const chainSettingPage = app.mount('#app');
window.chainSettingPage = chainSettingPage;

async function updateMpsTemplate(dto){
    const url="/api/v1/web_estudio/brand/mps_chain/new_template";
    return await axios.put(url,dto);

}

async function addMpsTemplate(dto){
    const url="/api/v1/web_estudio/brand/mps_chain/new_template";
    return await axios.post(url,dto);
}
async function doRemoveTemplate(id){
    const url="/api/v1/web_estudio/brand/mps_template/{id}".replace("{id}",id);
    return await axios.delete(url);
}

async function fetchChainInfo(chainId){
    const url = "/api/v1/web_estudio/mps/chain/{chain_id}".replace("{chain_id}",chainId);
    return await axios.get(url);
}
async function fetchTemplateDetail(templateId){
    const url="/api/v1/web_estudio/mps_chain/template/{id}".replace("{id}",templateId);
    return await axios.get(url);
}
async function addMpsChain(dto){
    const url="/api/v1/web_estudio/brand/mps_chain/new";
    return await axios.post(url,dto);
}
async function updateMpsChain(dto){
    const url ="/api/v1/web_estudio/brand/mps_chain/chain";
    return await axios.put(url,dto);
}
async function fetchAllTemplateOwnedChain(chainId){
    const url="/api/v1/web_estudio/mps_chain/template?chainId="+chainId;
    return await axios.get(url);
}
async function doFetchFirstSupplier(q){
    const url="/api/v1/web_estudio/mps_chain/supplier?q="+q;
    return await axios.get(url);
}
function fetchFirstSupplier(){
    const q= $('.iput').val();
    return doFetchFirstSupplier(!q ? "": q);
}
function modifyMpsTemplate(template){
    template.chainId=getQueryVariable("chain_id");

    return updateMpsTemplate(template);
}
function removeTemplate(id){
    return doRemoveTemplate(id);
}
function newMpsTemplate(template){

    template.chainId=getQueryVariable("chain_id");

    return addMpsTemplate(template);
}

function findTemplateDetail(templateId){
    return fetchTemplateDetail(templateId);
}
function findAllTemplateOwnedChain(chainId){
 
    return fetchAllTemplateOwnedChain(chainId);
}
function findChainInfo(chainId){
  
    return fetchChainInfo(chainId);
}
function addMpsChainB(title){
    const dto={
        title: title
    }
    return addMpsChain(dto);
}
function modifyMpsChainB(title,tag){
    const chainId = getQueryVariable("chain_id");
    const dto={
        title: title,
        tag: tag,
        id: chainId
    }
    return updateMpsChain(dto);
}
function saveMpsChain(title,tag){
    const chainId = getQueryVariable("chain_id");
    if(!chainId){
        addMpsChainB(title).then(response=>{
            if(response.data.code==200){
                addChainIdToUrl(response.data.chainId);
                chainSettingPage.btn_ctl.activate_show_add_template_model__btn=true;
                chainSettingPage.btn_ctl.activate_save_mps_chain__btn=false;
            }
            if(response.data.code!=200){
                alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        }).catch(error=>{
            alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
        });
    }
    if(chainId){
       modifyMpsChainB(title,tag).then(response=>{
        if(response.data.code==200){
            chainSettingPage.btn_ctl.activate_save_mps_chain__btn=false;
        }
        if(response.data.code!=200){
            alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
        alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
    }
   
}
function addChainIdToUrl(chainId){
    const id = getQueryVariable("chain_id");
    if(!id){
        let url = "/estudio/studio-chain-setting?chain_id="+ chainId
        history.pushState(null, "", url);
    }
}

// search selector start
function showOption() {
    $('.op-list').toggleClass('hidden');
    $('.iop').show();
}
$(document).on('click', '.iop', function () {
    $('.op-list').addClass('hidden');
    var text = $(this).text();
    $('.iput').val(text);
    chainSettingPage.newTemplate.firstSupplier=$(this).attr("id"); // for add
    chainSettingPage.putTemplate.firstSupplier=$(this).attr("id"); // for update
    if(!chainSettingPage.newTemplate.firstSupplier){
        chainSettingPage.newTemplate.duration="";
        chainSettingPage.newTemplate.firstSupplier="";
        chainSettingPage.newTemplate.firstSupplierName="";

    }
    if(!chainSettingPage.putTemplate.firstSupplier){
        chainSettingPage.putTemplate.duration="";
        chainSettingPage.putTemplate.firstSupplier="";
        chainSettingPage.putTemplate.firstSupplierName="";

    }
})
function search() {
    $('.iop').show();
    chainSettingPage.fetchFirstSupplierV();
    
}
$(document).on("click",function (e) {
    if ('iput' != e.target.className) {
        $('.op-list').addClass('hidden');
    }
});
// search selector end

function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }