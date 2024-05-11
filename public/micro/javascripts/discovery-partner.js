import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
// todo
import defaultAvatarImage from '/avator.png'
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {FromWhere} from "/common/javascripts/tm-constant.js";
import { uploadScienceData } from "/common/javascripts/science.js";
import {getLinkIconUrl,parseLinkUri} from "/common/javascripts/compoent/link-icon-parse.js";
import {Api} from "/common/javascripts/common-api.js";
import { parseIpLocationCityInfo } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


const RootComponent = {
    data() {
        return {
            brandProfile: {},
            typeOfBusinessOptions: [
                { value: "0", text: "非商业主体" },
                { value: "1", text: "独资经营" },
                { value: "2", text: "合伙经营" },
                { value: "3", text: "有限责任公司" },
                { value: "4", text: "C型股份制有限公司" },
                { value: "5", text: "S型股份制有限公司" },
                { value: "6", text: "B型股份制有限公司" },
                { value: "7", text: "非营利机构" },
                { value: "8", text: "个体户" },
                { value: "9", text: "合作社" },
                { value: "10", text: "社团" },
                { value: "11", text: "协会" },
                { value: "12", text: "党派" },
            ],
            defaultAvatarImage,
            talentgrid_pagination: {
                url: "/api/v1/team/talent",
                size: 30,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                q: ''
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.talentgrid_pagination.size = response.talent.size;
                        this.talentgrid_pagination.current = response.talent.current;
                        this.talentgrid_pagination.total = response.talent.total;
                        this.talentgrid_pagination.pages = response.talent.pages;
                        this.talentgrid_pagination.records = response.talent.records;
                        // this.paging = this.doPaging({current: response.cells.current, pages: response.cells.pages, max: 5});
                    }
                }
            }
        }
    },
    methods: {
        inNightV(){
            // 18:00 ~ 22:00
            const localTime=new Date().getHours();
            return localTime>=18 && localTime<=21;
        },
        parseIpLocationCityInfoV(cityInfo){
            return parseIpLocationCityInfo(cityInfo);
        },
        parseTypeOfBusinessV(code){
            console.log("code is :" + code);
            var targetArr= this.typeOfBusinessOptions.filter(e=> code === e.value );
            if(targetArr.length==0){
                return "未知数据";
            }
            return targetArr[0].text;
        },
        parseLinkUriV(uri){
            return parseLinkUri(uri);
          },
          getLinkIconUrlV(url){
            return getLinkIconUrl(url);
          },
        showPartnerInfoPreviewModalV(brandId){
            Api.getBrandProfile(brandId).then(response=>{
                if(response.data.code == 200){
                    this.brandProfile = response.data.profile;
                    this.brandProfile.brandId=brandId;
                    $("#partnerInfoPreviewModal").modal("show");
                }
            }).catch(error=>{
                alert("操作失败");
            });
        },
        closePartnerInfoPreviewModalV(){
            $("#partnerInfoPreviewModal").modal("hide");
        },
        retrieveTalentGridV(){
            retrieveTalentGrid();
            this.uploadScienceDataV();
        },
        uploadScienceDataV(){
            const snippet = this.talentgrid_pagination.param.q;
            const details= JSON.stringify(this.talentgrid_pagination.param);
            const fromWhere=FromWhere.TALENT_SEARCH;
            uploadScienceData(snippet,details,fromWhere);
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
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-search') 
}
const disTalent = app.mount('#app');

window.disTalent = disTalent;

// init
disTalent.pageInit(disTalent.talentgrid_pagination);

function retrieveTalentGrid(){
    disTalent.reloadPage(disTalent.talentgrid_pagination);
}