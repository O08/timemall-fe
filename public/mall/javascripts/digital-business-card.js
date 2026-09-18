import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {getLinkIconUrl,parseLinkUri} from "/common/javascripts/compoent/link-icon-parse.js";
import {Api} from "/common/javascripts/common-api.js";
import { parseIpLocationCityInfo } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import {goErrorByReplace} from "/common/javascripts/pagenav.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const lastSegment=window.location.pathname.split('/').pop();

const queryHandle=lastSegment?.replace("@blv.me","@blv.bi");

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;


const RootComponent = {
    data() {
        return {
            init_finish: false,
            queryHandle: queryHandle,
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
            ]
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
            var targetArr= this.typeOfBusinessOptions.filter(e=> code === e.value );
            if(targetArr.length==0){
                return "未知数据";
            }
            return targetArr[0].text;
        },
        parseLinkUriV(uri){
            return parseLinkUri(uri);
        },
        shareBrandBioV(){
            const copyContent = `${currentDomain}/${lastSegment}`;
            copyValueToClipboard(copyContent);
        },
        getLinkIconUrlV(url){
          return getLinkIconUrl(url);
        },
        loadBrandBioV(){
            document.title = '加载中...';
            Api.getBrandProfileByHandle(this.queryHandle).then(response=>{
                if (response.data.code == 200 && !response.data.profile) {
                    goErrorByReplace();
                    return
                }
                if(response.data.code == 200){
                    this.brandProfile = response.data.profile;
                    document.title = response.data.profile.brand + " | 班蔚";
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }

            }).catch(error=>{

                customAlert.alert("操作失败，请检查网络或联系技术支持。");

            }).finally(() => {
                this.init_finish = true;
            });
        }
    }
}


let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CodeExplainComponent);


const brandBio = app.mount('#app');

window.brandBioPage = brandBio;

brandBio.loadBrandBioV();// init
