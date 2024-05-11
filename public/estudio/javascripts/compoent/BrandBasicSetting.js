import "/common/javascripts/import-jquery.js";
import {CodeMappingTypeEnum} from "/common/javascripts/tm-constant.js";



const BrandBasicSetting = {

    data(){
        return {
            referenceSetting: {},
            explainTopic: [
                {title: "自由合作",content: "自由合作用来标记你的对外合作意向，默认为关闭，表示你不支持各种合作方式；处于开放状态，表示你愿意与其他感兴趣的第三方讨论各种合作方式；平台鼓励各种形式的开放与合作，同时也在努力打造一个受信任的合作环境，但依然要求你采用零信任的方式去拥抱合作，规避金融、道德等欺诈风险。"},
                {title: "合作资源",content: "合作的基础就是让各方的资源相互碰撞，补充你拥有的资源（比如：技术、设计、研发、流量、5万用户、5000资金），开始构建关系网络，着手超多合作吧。（支持最大长度 500 字符）"},
                {title: "自定义职业",content: "职业门类丰富，如果平台提供的数据中没有你的职业，你可以通过自定义职业进行DIY.（提示：自定义职业生效需要确保职业选择为自定义。支持最大长度 60 字符）"},
                {title: "夜间咨询",content: "夜间咨询处于开启状态，表示在每天夜晚(18:00 ～ 22:00)，你为有需要的用户提供无偿、免费的咨询服务。建议每次咨询时长设置为15min、30min 或者 1h。默认为关闭状态"}


            ],
            explain: {},

            brandTypeOptions: [
                { value: "0", text: "个人" },
                { value: "1", text: "机构" },
              ],
            brandTypeSelectedItem: "0",

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
            typeOfBusinessSelectedItem: "0",

            industryOptions: [],
            industrySelectedItem: "",

            occupationOptions: [],
            occupationSelectedItem: "",

            selfDefinedOccupation: "",
            supportFreeCooperation: false,
            hiring: false,
            availableForWork: false,
            freeNightCounsellor: false,
            cooperationScope:  ""
        }
    },
    methods: {
        autoHeightV(event){
            var elem = event.target;
            elem.style.height = "auto";
            elem.scrollTop = 0; // 防抖动
            
            elem.style.height = elem.scrollHeight + "px";
            if(elem.scrollHeight==0){
                elem.style.height=32 + "px";
            }
            if(elem.scrollHeight>400){
                elem.style.height=400 + "px";
            }
        },
        showExplainModelV(topic){
          
            this.explain = this.explainTopic[topic];
           $("#explainInfoModal").modal("show");

        },
        initBasicSettingV(profile){


            this.referenceSetting.brandTypeCode= !profile.brandTypeCode ? "0" : profile.brandTypeCode;
            this.referenceSetting.industryCode=profile.industryCode ;
            this.referenceSetting.occupationCode=profile.occupationCode;
            this.referenceSetting.selfDefinedOccupation=profile.occupationCode=='0' ? profile.occupation : "" ;
            this.referenceSetting.supportFreeCooperation=profile.supportFreeCooperation=="1" ? true : false;
            this.referenceSetting.cooperationScope=profile.cooperationScope;
            this.referenceSetting.hiring=profile.hiring=="1" ? true : false;
            this.referenceSetting.availableForWork=profile.availableForWork=="1" ? true : false;
            this.referenceSetting.typeOfBusiness= !profile.typeOfBusiness ? "0" : profile.typeOfBusiness;
            this.referenceSetting.freeNightCounsellor=profile.freeNightCounsellor=="1" ? true : false;





            // deep clone
           var referenceSettingClone= JSON.parse(JSON.stringify(this.referenceSetting));
           this.brandTypeSelectedItem=referenceSettingClone.brandTypeCode;
           this.industrySelectedItem=referenceSettingClone.industryCode;
           this.occupationSelectedItem=referenceSettingClone.occupationCode;
           this.selfDefinedOccupation=referenceSettingClone.selfDefinedOccupation;
           this.supportFreeCooperation=referenceSettingClone.supportFreeCooperation;
           this.cooperationScope=referenceSettingClone.cooperationScope;
           this.hiring=referenceSettingClone.hiring;
           this.availableForWork=referenceSettingClone.availableForWork;
           this.typeOfBusinessSelectedItem=referenceSettingClone.typeOfBusiness;
           this.freeNightCounsellor=referenceSettingClone.freeNightCounsellor;



        },
        canSaveBasicChangeV(){
            if(this.occupationSelectedItem=='0' && !this.selfDefinedOccupation){
                return false;
            }
            return (this.referenceSetting.brandTypeCode!=this.brandTypeSelectedItem 
                   || this.referenceSetting.industryCode!=this.industrySelectedItem 
                   || this.referenceSetting.occupationCode!=this.occupationSelectedItem
                   || this.referenceSetting.selfDefinedOccupation!=this.selfDefinedOccupation
                   || this.referenceSetting.supportFreeCooperation!=this.supportFreeCooperation
                   || this.referenceSetting.cooperationScope!=this.cooperationScope
                   || this.referenceSetting.hiring!=this.hiring
                   || this.referenceSetting.availableForWork!=this.availableForWork
                   || this.referenceSetting.typeOfBusiness!=this.typeOfBusinessSelectedItem
                   || this.referenceSetting.freeNightCounsellor!=this.freeNightCounsellor
                   )

        },
        initBrandBasicSettingConfigV(){
            loadOccupationList(this);
            loadIndustryList(this);
        },
        settingBasicInfoV(){
            modifyBasicSetting(this);
        }
       
    }
}

async function fetchCodeList(codeType,itemCode){
    const url="/api/v1/base/code_mapping?codeType="+codeType+"&itemCode="+itemCode;
    return await fetch(url);
}
async function putBasicSetting(dto){
    const url="/api/v1/web_estudio/brand/basic_setting";
    return await fetch(url,{method: "PUT",body: JSON.stringify(dto),headers:{
		'Content-Type':'application/json'
	}});
}
async function modifyBasicSetting(appObj){
    const selectedIndustry=appObj.industryOptions.filter(e=>e.value===appObj.industrySelectedItem);
    const dto={
        occupationCode: appObj.occupationSelectedItem,
        selfDefinedOccupation: appObj.selfDefinedOccupation,
        industryCode: appObj.industrySelectedItem,
        brandTypeCode: appObj.brandTypeSelectedItem,
        supportFreeCooperation: appObj.supportFreeCooperation ? "1" : "0",
        cooperationScope: appObj.cooperationScope,
        hiring: appObj.hiring ? "1" : "0",
        availableForWork: appObj.availableForWork ? "1" : "0",
        typeOfBusiness: appObj.typeOfBusinessSelectedItem,
        industry: selectedIndustry.length>0 ? selectedIndustry[0].text : "",
        freeNightCounsellor: appObj.freeNightCounsellor ? "1" : "0"
    }
    const response = await putBasicSetting(dto);
    var data = await response.json();
    if(data.code==200){
        appObj.loadBrandProfileV(); // studio-setting-profile.js function
    }

}
async function loadOccupationList(appObj){
    const response = await fetchCodeList(CodeMappingTypeEnum.OCCUPATION,"");
    var data = await response.json();
    if(data.code==200){
       var occupationArr=[];
       data.codes.records.forEach(element => {
        occupationArr.push({value: element.itemCode,text: element.item});
       });
       appObj.occupationOptions=occupationArr;
    }
}
async function loadIndustryList(appObj){
    const response = await fetchCodeList(CodeMappingTypeEnum.INDUSTRY,"");
    var data = await response.json();
    if(data.code==200){
       var arr=[];
       data.codes.records.forEach(element => {
        arr.push({value: element.itemCode,text: element.item});
       });
       appObj.industryOptions=arr;
    }
}
export default BrandBasicSetting;
