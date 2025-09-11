import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {EventFeedScene,MpsTag,MpsType,MpsChainTag} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import  StudioApi from "/estudio/javascripts/compoent/StudioApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
const RootComponent = {
    data() {
        return {
            supplierOptions: [
            ],
            supplierSelectedItem: "",
            error:{},
            newMps:{
                title: "",
                chainId: ""
            },
            newFastPaper: generateEmptyFastPaper(),
            supplier:{
                records: []
            },
            mpsFund: {},
            mpsTopUpAmount: "",
            mps_list_pagination:{
                url: "/api/v1/web_estudio/brand/mps",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: ""
                },
                paging: {},
                responesHandler: (response)=>{

                    if(response.code == 200){
                        this.mps_list_pagination.size = response.mps.size;
                        this.mps_list_pagination.current = response.mps.current;
                        this.mps_list_pagination.total = response.mps.total;
                        this.mps_list_pagination.pages = response.mps.pages;
                        this.mps_list_pagination.records = response.mps.records;
                        this.mps_list_pagination.paging = this.doPaging({current: response.mps.current, pages: response.mps.pages, size: 5});
                    }
                }
            },
            mps_chain_pagination:{
                url: "/api/v1/web_estudio/brand/mps_chain",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: ""
                },
                paging: {},
                responesHandler: (response)=>{

                    if(response.code == 200){
                        this.mps_chain_pagination.size = response.chain.size;
                        this.mps_chain_pagination.current = response.chain.current;
                        this.mps_chain_pagination.total = response.chain.total;
                        this.mps_chain_pagination.pages = response.chain.pages;
                        this.mps_chain_pagination.records = response.chain.records;
                        this.mps_chain_pagination.paging = this.doPaging({current: response.chain.current, pages: response.chain.pages, size: 5});
                    }
                }
            },
            mps_chain_search_pagination:{
                url: "/api/v1/web_estudio/brand/mps_chain",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    tag: MpsChainTag.PUBLISH
                },
                paging: {},
                responesHandler: (response)=>{

                    if(response.code == 200){
                        this.mps_chain_search_pagination.size = response.chain.size;
                        this.mps_chain_search_pagination.current = response.chain.current;
                        this.mps_chain_search_pagination.total = response.chain.total;
                        this.mps_chain_search_pagination.pages = response.chain.pages;
                        this.mps_chain_search_pagination.records = response.chain.records;
                        this.mps_chain_search_pagination.paging = this.doPaging({current: response.chain.current, pages: response.chain.pages, size: 5});
                    }
                }
            }
        }
    },
    methods: {
        removeNewModalSkillV(index){
            this.newFastPaper.skills.splice(index, 1);
        },
        addSkillInNewModalV(event){
            addSkillInNewModal(event)
        },
        deleteContentOrTagFromNewModalSkillV(event){
            deleteContentOrTagFromNewModalSkill(event);
        },
        showNewFastPaperModalV(){
            this.supplierSelectedItem="";
            
            this.newFastPaper=generateEmptyFastPaper(),
            $("#newFastPaperModal").modal("show"); // hide modal
        },
        showMpsModalV(){
            this.searchV();// load template info
            $("#newMpsModal").modal("show"); // hide modal
        },
        closeMpsModalHandlerV(){
            // reset
            this.newMps={};
            $('.iput').val("");
        },
        closeTopUpFundModalHandlerV(){
            this.mpsTopUpAmount = "";
            this.error="";
        },
        retrieveMpsChainListByTagV(){
            retrieveMpsChainListByTag();
        },
        retrieveMpsListByTagV(){
            retrieveMpsListByTag();
        },
        resetAndRetrieveMpsListV(){
            resetAndRetrieveMpsList();
        },
        filterMpsListV(filter){
            filterMpsList(filter);
        },
        findMpsFundInfoV(){
          findMpsFundInfo().then(response=>{
            if(response.data.code==200){
                this.mpsFund = response.data.fund;
            }
          })
        },
        topUpMpsFundV(){
            topUpMpsFundB(this.mpsFund.id,this.mpsTopUpAmount).then(response=>{
                if(response.data.code==200){
                    $("#topUpFundModal").modal("hide"); // hide modal
                    this.findMpsFundInfoV();
                    this.mpsTopUpAmount = ""; // reset modal
                    this.error="";
                }
                if(response.data.code!=200){
                    this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                }
            }).catch(error=>{
                this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
            });
        },
        addAMpsV(){
            addAMps(this.newMps).then(response=>{
                if(response.data.code==200){
                    $("#newMpsModal").modal("hide"); // hide modal
                    this.reloadPage(this.mps_list_pagination);
                      // reset
                    this.newMps={};
                    $('.iput').val("");
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        taggingMpsV(chainId,mpsId,tag){
            taggingMps(chainId,mpsId,tag).then(response=>{
                if(response.data.code==200){
                    this.reloadPage(this.mps_list_pagination);
                    this.reloadPage(this.mps_chain_pagination);
                }
            });
        },
        appleMpsFundAccountV(){
            appleMpsFundAccount().then(response=>{
                if(response.data.code==200){
                    this.findMpsFundInfoV();
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            })
            .catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        retrieveMpsChainTbV(){
            retrieveMpsChainTb();
        },
        retrieveMpsTbV(){
            retrieveMpsTb();
        },
        closeNewFastPaperHandlerV(){
            // reset
            this.newFastPaper=generateEmptyFastPaper();
            this.supplierSelectedItem="";
            $('.iput').val("");
        },
        validateNewFastPaperV(){
            if(!!this.newFastPaper.mpsTitle && !!this.newFastPaper.title && !!this.newFastPaper.sow 
                && !!this.newFastPaper.piece && !!this.newFastPaper.bonus 
                && !!this.newFastPaper.deliveryCycle && !!this.newFastPaper.contractValidityPeriod
                && !!this.newFastPaper.difficulty && !!this.newFastPaper.location 
                && !!this.newFastPaper.bidElectricity
                && ((!this.supplierSelectedItem && !this.newFastPaper.duration)
                     || (!!this.supplierSelectedItem && !!this.newFastPaper.duration))){

                return true;
            }
            return false;
        },
        fetchFirstSupplierV(){
            fetchFirstSupplier(this);
        },
        createOneFastMpsV(){
            this.newFastPaper.firstSupplier=this.supplierSelectedItem;
            createOneFastMps(this.newFastPaper).then(response=>{
                if(response.data.code==200){
                    $("#newFastPaperModal").modal("hide"); // hide modal
                    this.reloadPage(this.mps_list_pagination);
                      // reset
                    this.newFastPaper=generateEmptyFastPaper();
                    this.supplierSelectedItem="";
                    $('.iput').val("");
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });

        },
        // search selector
        showOptionV(){
            showOption();
        },
        searchV(){
            search();
        },
        explainMpsTypeV(mpsType){
         return explainMpsType(mpsType);
        },
        exlpainMpsTagV(mpsTag){
          return exlpainMpsTag(mpsTag);
        },
        explianMpsChainTagV(chainTag){
            return explianMpsChainTag(chainTag);
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
    updated(){
        
        $(function() {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    },
    watch: {
        'supplierSelectedItem': function(newV, oldV){
            if(!newV){
                this.newFastPaper.duration="";
            }
        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO,need_init: false
}));
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
} 

app.mixin(new FriendListCompoent({need_init: false}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: false,
            onMessage: (e)=>{
                mpsPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

app.component("model-select",ModelSelect);
    
const mpsPage = app.mount('#app');
window.cMpsPage = mpsPage;

// init
mpsPage.userAdapter(); // auth.js
mpsPage.initEventFeedCompoentV();

mpsPage.fetchPrivateFriendV();// FriendListCompoent.js
mpsPage.sseInitV();// Ssecompoent.js


mpsPage.pageInit(mpsPage.mps_list_pagination);
mpsPage.pageInit(mpsPage.mps_chain_pagination);
mpsPage.pageInit(mpsPage.mps_chain_search_pagination);
mpsPage.findMpsFundInfoV();
mpsPage.fetchFirstSupplierV();

async function doApplyMpsFundAccount(){
    const url="/api/v1/web_estudio/mps_fund/apply_account";
    return await axios.post(url);
}

async function fetchMpsFundInfo(){
    const url = "/api/v1/web_estudio/brand/mps/fund";
    return await axios.get(url);
}

async function topUpMpsFund(dto){
    const url="/api/v1/web_estudio/mps/top_up_to_fund";
    return await axios.post(url,dto);
}
async function newMps(dto){
    const url="/api/v1/web_estudio/brand/mps/new";
    return await axios.post(url,dto);
}
async function doTaggingMps(dto){
    const url="/api/v1/web_estudio/mps/tag";
    return await axios.put(url,dto);
}
async function newFastMps(dto){
    const url="/api/v1/web_estudio/brand/mps/new_fast_paper";
    return await axios.post(url,dto);
}
function createOneFastMps(newFastPaper){
    var dto = JSON.parse(JSON.stringify(newFastPaper));
    dto.skills=JSON.stringify(newFastPaper.skills);
   return newFastMps(dto);
}
function taggingMps(chainId,mpsId,tag){
    const dto={
        mpsId: mpsId,
        tag: tag,
        chainId: chainId
    }
    return doTaggingMps(dto);
}
function appleMpsFundAccount(){
    return doApplyMpsFundAccount();
}
function findMpsFundInfo(){
    return fetchMpsFundInfo();
}
function topUpMpsFundB(mpsfundId,amount){
   const dto={
    mpsfundId: mpsfundId,
    amount: amount
   }
   return topUpMpsFund(dto);
}
function addAMps(mps){
    return newMps(mps);
}
function retrieveMpsChainListByTag(){
    mpsPage.mps_chain_pagination.current=1;
    mpsPage.reloadPage(mpsPage.mps_chain_pagination);
};
function resetAndRetrieveMpsList(){
    mpsPage.mps_list_pagination.current=1;
    mpsPage.mps_list_pagination.param={tag: ""};
    mpsPage.reloadPage(mpsPage.mps_list_pagination);
}
function retrieveMpsChainTb(){
    mpsPage.mps_chain_pagination.current=1;
    mpsPage.mps_chain_pagination.param.tag="";// reset tag
    mpsPage.reloadPage(mpsPage.mps_chain_pagination);
}
function retrieveMpsTb(){
    mpsPage.mps_list_pagination.current=1;
    mpsPage.reloadPage(mpsPage.mps_list_pagination);
}
function filterMpsList(filter){
    mpsPage.mps_list_pagination.current=1;
    mpsPage.mps_list_pagination.param.q="";
    mpsPage.mps_list_pagination.param.tag="";// reset tag
    mpsPage.mps_list_pagination.param.filter=filter;
    mpsPage.reloadPage(mpsPage.mps_list_pagination);
}
function retrieveMpsListByTag(){
    mpsPage.mps_list_pagination.current=1;
    mpsPage.reloadPage(mpsPage.mps_list_pagination);
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
    mpsPage.newMps.chainId=$(this).attr("id");
})
function search() {
    $('.iop').show();
    mpsPage.mps_chain_search_pagination.param.q=$('.iput').val();
    mpsPage.reloadPage(mpsPage.mps_chain_search_pagination);
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

function explainMpsType(mpsType){
    var mpsTypeDesc="";
    switch(mpsType){
        case MpsType.FROM_MILLSTONE:
            mpsTypeDesc="订单";
            break; 
        case MpsType.FROM_TEMPLATE:
            mpsTypeDesc="模版商单";
                break; 

        case MpsType.FAST:
            mpsTypeDesc="快捷商单";
                break; 
    }
    return mpsTypeDesc;
}
function exlpainMpsTag(mpsTag){
    var mpsTagDesc="";
    switch(mpsTag){
        case MpsTag.CREATED:
            mpsTagDesc="新建";
            break; 
        case MpsTag.PUBLISH:
            mpsTagDesc="运行中";
                break; 
        case MpsTag.OFFLINE:
            mpsTagDesc="已下线";
                break; 
        case MpsTag.END:
            mpsTagDesc="完成";
                break; 
    }
    return mpsTagDesc;
}
function explianMpsChainTag(chainTag){
    var chainTagDesc="";
    switch(chainTag){
        case MpsChainTag.PUBLISH:
            chainTagDesc="运行中";
            break; 
        case MpsChainTag.OFFLINE:
            chainTagDesc="休止";
                break; 
    }
    return chainTagDesc;
};
function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }


  $(function(){
	$(".tooltip-nav").tooltip();
});

 async function fetchFirstSupplier(appObj){

    StudioApi.doFetchFirstSupplier("").then(response=>{
        if(response.data.code==200){
            var suplierArr=[{value:"",text:"请选择"}];
            response.data.supplier.records.forEach(element => {
             suplierArr.push({value: element.id,text: element.brandName});
            });
            appObj.supplierOptions=suplierArr;
         }
    });
    
}

function generateEmptyFastPaper(){
    return {
        mpsTitle: "",
        title: "",
        sow: "",
        piece: "",
        bonus: "",
        firstSupplier: "",
        duration: "",
        difficulty: "easy",
        location: "远程",
        bidElectricity: "1",
        skills: []
    }
}


async function addSkillInNewModal(e){
    

    var tag = e.target.value.replace(/\s+/g, ' ');
    var tags=mpsPage.newFastPaper.skills;
    if(tag.length > 0 && !tags.includes(tag)){
        if(tags.length < 5){
            mpsPage.newFastPaper.skills.push(tag);
        }
    }
    e.target.value = "";

}

// tmp_global_val
var gl_tag_before_del_in_new_modal='';
async function deleteContentOrTagFromNewModalSkill(e){

    if (e.keyCode == 8 || e.keyCode == 46) {
        
        if(e.target.value.length==0 && gl_tag_before_del_in_new_modal.length==0 && mpsPage.newFastPaper.skills.length>0){
            mpsPage.newFastPaper.skills.pop();
        }
    }
    gl_tag_before_del_in_new_modal=e.target.value;

}