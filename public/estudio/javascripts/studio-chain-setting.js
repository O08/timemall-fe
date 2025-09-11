import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import  StudioApi from "/estudio/javascripts/compoent/StudioApi.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
const RootComponent = {
    data() {
        return {
            btn_ctl: {
                activate_show_add_template_model__btn: false,
                activate_save_mps_chain__btn: false,
                activate_edit_template_save__btn: false
            },
            chain: {
                title: "",
                tag: "1"
            },
            template: {},
            templateDetail: {},
            newTemplate: generateEmptyTemplate(),
            putTemplate: {
                title: "",
                sow: "",
                piece: "",
                bonus: "",
                firstSupplier: "",
                duration: "",
                chainId: "",
                experience: "",
                skills: []
            },
            supplier:{
                records: []
            },
            supplierQ: ""

        }
},
  
    methods: {
            //tags
        removeEditModalSkillV(index){
            this.btn_ctl.activate_edit_template_save__btn=true;
            this.putTemplate.skills.splice(index, 1);
        },
        addSkillInEditModalV(event){
            addSkillInEditModal(event)
        },
        deleteContentOrTagFromEditModalSkillV(event){
            deleteContentOrTagFromEditModalSkill(event);
        },
        removeNewModalSkillV(index){
            this.newTemplate.skills.splice(index, 1);
        },
        addSkillInNewModalV(event){
            addSkillInNewModal(event)
        },
        deleteContentOrTagFromNewModalSkillV(event){
            deleteContentOrTagFromNewModalSkill(event);
        },
        validateNewTemplateV(){
            if(!!this.newTemplate.title && !!this.newTemplate.sow 
                && !!this.newTemplate.piece && !!this.newTemplate.bonus 
                && !!this.newTemplate.deliveryCycle && !!this.newTemplate.contractValidityPeriod
                && !!this.newTemplate.difficulty && !!this.newTemplate.location 
                && !!this.newTemplate.bidElectricity
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
                && !!this.putTemplate.difficulty && !!this.putTemplate.location 
                && !!this.putTemplate.bidElectricity
                && this.btn_ctl.activate_edit_template_save__btn
                && ((!this.putTemplate.firstSupplier && !this.putTemplate.duration)
                     || (!!this.putTemplate.firstSupplier && !!this.putTemplate.duration))){

                return true;
            }
            return false;
        },
        showNewChainTemplateModalV(){
            // load supplier info
            this.supplierQ="";
            this.fetchFirstSupplierV();
            
            this.newTemplate=generateEmptyTemplate(),
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
                    this.newTemplate=generateEmptyTemplate(); // reset 
                    $('.iput').val(""); // reset suplier selector
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        putMpsTemplateV(){
            modifyMpsTemplate(this.putTemplate).then(response=>{
                if(response.data.code==200){
                    this.findAllTemplateOwnedChainV(); // refresh 
                    this.templateDetail={}; // reset templateDetail
                    $("#editChainTemplateModal").modal("hide"); // hide modal

                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
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
            fetchFirstSupplier(this.supplierQ).then(response=>{
                if(response.data.code==200){
                    this.supplier=response.data.supplier;
                }
            });
        },
        // search selector
        showOptionV(){
            showOption();
        },
        searchV(event){
            search(event);
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
            // load supplier info
            this.supplierQ="";
            this.btn_ctl.activate_edit_template_save__btn=false;
            this.fetchFirstSupplierV();

            this.putTemplate=JSON.parse(JSON.stringify(this.templateDetail));// deep copy
            this.putTemplate.bonus=Number(this.putTemplate.bonus).toFixed(0);
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
       this.queryVariableHasChainIdV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(CodeExplainComponent);

app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                chainSettingPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);    
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

function fetchFirstSupplier(q){
    return StudioApi.doFetchFirstSupplier(!q ? "": q);
}
function modifyMpsTemplate(template){

    template.chainId=getQueryVariable("chain_id");
    var dto=JSON.parse(JSON.stringify(template));
    dto.skills=JSON.stringify(template.skills);

    return updateMpsTemplate(dto);
}
function removeTemplate(id){
    return doRemoveTemplate(id);
}
function newMpsTemplate(template){

    template.chainId=getQueryVariable("chain_id");
    var dto=JSON.parse(JSON.stringify(template));
    dto.skills=JSON.stringify(template.skills);

    return addMpsTemplate(dto);
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
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
        });
    }
    if(chainId){
       modifyMpsChainB(title,tag).then(response=>{
        if(response.data.code==200){
            chainSettingPage.btn_ctl.activate_save_mps_chain__btn=false;
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
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
    var targetSupplierId=$(this).attr("id");
    if(chainSettingPage.putTemplate.firstSupplier!=targetSupplierId){
        chainSettingPage.btn_ctl.activate_edit_template_save__btn=true; // for update
    }
    chainSettingPage.newTemplate.firstSupplier=targetSupplierId; // for add
    chainSettingPage.putTemplate.firstSupplier=targetSupplierId; // for update


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
function search(e) {
    $('.iop').show();
    chainSettingPage.supplierQ=e.target.value;
    chainSettingPage.fetchFirstSupplierV();
    
}
$(document).on("click",function (e) {
    if ('iput' != e.target.className) {
        $('.op-list').addClass('hidden');
    }
    if ('iput' == e.target.className) {
        $('.op-list').removeClass('hidden');
    }
});
// search selector end

function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }

  $(function(){
	$(".tooltip-nav").tooltip();
});


function generateEmptyTemplate(){
    return {
        title: "",
        sow: "",
        piece: "",
        bonus: "",
        firstSupplier: "",
        duration: "",
        chainId: "",
        difficulty: "easy",
        location: "远程",
        bidElectricity: "1",
        experience: "",
        skills: []
    }
}
async function addSkillInEditModal(e){
    
    var tag = e.target.value.replace(/\s+/g, ' ');
    var tags=chainSettingPage.putTemplate.skills;
    if(tag.length > 0 && !tags.includes(tag)){
        if(tags.length < 5){
            chainSettingPage.putTemplate.skills.push(tag);
            chainSettingPage.btn_ctl.activate_edit_template_save__btn=true;
        }
    }
    e.target.value = "";

}

// tmp_global_val
var gl_tag_before_del_in_edit_modal='';
async function deleteContentOrTagFromEditModalSkill(e){

    if (e.keyCode == 8 || e.keyCode == 46) {
        
        if(e.target.value.length==0 && gl_tag_before_del_in_edit_modal.length==0 && chainSettingPage.putTemplate.skills.length>0){
            chainSettingPage.putTemplate.skills.pop();
            chainSettingPage.btn_ctl.activate_edit_template_save__btn=true;
        }
    }
    gl_tag_before_del_in_edit_modal=e.target.value;

}

async function addSkillInNewModal(e){
    
    var tag = e.target.value.replace(/\s+/g, ' ');
    var tags=chainSettingPage.newTemplate.skills;
    if(tag.length > 0 && !tags.includes(tag)){
        if(tags.length < 5){
            chainSettingPage.newTemplate.skills.push(tag);
        }
    }
    e.target.value = "";

}

// tmp_global_val
var gl_tag_before_del_in_new_modal='';
async function deleteContentOrTagFromNewModalSkill(e){

    if (e.keyCode == 8 || e.keyCode == 46) {
        
        if(e.target.value.length==0 && gl_tag_before_del_in_new_modal.length==0 && chainSettingPage.newTemplate.skills.length>0){
            chainSettingPage.newTemplate.skills.pop();
        }
    }
    gl_tag_before_del_in_new_modal=e.target.value;

}