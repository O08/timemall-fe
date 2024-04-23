import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import SkillComponent from "/estudio/javascripts/studio-setting-profile-skill.js";
import BrandLinksSettingCompoent from "/estudio/javascripts/compoent/BrandLinksSettingCompoent.js";
import BrandAvatorAndBannerSetting from "/estudio/javascripts/compoent/BrandAvatorAndBannerSetting.js";
import BrandBasicSetting from "/estudio/javascripts/compoent/BrandBasicSetting.js";

import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import defaultExperienceImage from '/common/images/default-experience.jpg';
import defaultBrandBanner from '/common/images/default-brand-banner.jpg';
import defaultAvatarImage from '/avator.webp';
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

const RootComponent = {
    data() {
        return {
            defaultExperienceImage,
            defaultBrandBanner,
            defaultAvatarImage,
            btn_ctl: {
                activate_general_save_btn: false
            },
            brand: {
                avator: defaultAvatarImage,
                banner: defaultBrandBanner
            },
            identity: {},
            brandProfile: {
                skills: [],
                links: [],
                experience: []
            },
            tmpMillstone: {
                startYear: "",
                startMonth: "",
                endYear: "",
                endMonth: "",
                inProgress: false,
                title: ""
            }, // 新建临时millstone
            currentMillstoneIndex: 0, // 正在添加描述的millstone 
            tmpMillstioneDesc: {
                startYear: "",
                startMonth: "",
                endYear: "",
                endMonth: "",
                inProgress: false,
                title: "",
                story: ""

            } // 新建临时的millstone 描述
             
        }
    },
    methods: {
        loadBrandProfileV(){
            loadBrandProfile();
        },
         showAddExperienceModalV(){
            showAddExperienceModal();
         },
         showAddExperieneDescModalV(index){
             this.currentMillstoneIndex = index;
            showAddExperieneDescModal();
         },
         addExperienceV(){
            addExperience();
         },
         addExperienceDescV(){
            addExperienceDesc();
         },
         editExperienceV(index){
            editExperience(index);
         },
         modifyExperienceV(index){
            modifyExperience(index);
         },
         removeExperienceV(index){
            removeExperience(index);
         },
         editExperienceDescV(experienceIndex,descIndex){
            editExperienceDesc(experienceIndex,descIndex)
         },
         removeExperienceDescV(experienceIndex,descIndex){
            removeExperienceDesc(experienceIndex,descIndex);
         },
         modifyExperienceDescV(experienceIndex,descIndex){
            modifyExperienceDesc(experienceIndex,descIndex);
         },
         settingBrandBasicInfoV(){
            setBrandBasicInfo();
         }
         
    },
    computed:{
        validateExperienceModal(){
            return validateModal(this.tmpMillstone);
             
         },
         validateExperienceDescModal(){
            return validateModal(this.tmpMillstioneDesc) ;
         },
         validateExperienceDateV(){
            // inprogress true ,dont validate
            if(this.tmpMillstone.inProgress){
                return false;
            }
            return validateDate(this.tmpMillstone.startYear,
                this.tmpMillstone.startMonth,
                this.tmpMillstone.endYear,
                this.tmpMillstone.endMonth);
        },
        validateExperienceDescDateV(){
             // inprogress true ,dont validate
             if(this.tmpMillstioneDesc.inProgress){
                return false;
            }
            return validateDate(this.tmpMillstioneDesc.startYear,
                this.tmpMillstioneDesc.startMonth,
                this.tmpMillstioneDesc.endYear,
                this.tmpMillstioneDesc.endMonth);
        }
    },
    watch: {
        'tmpMillstone.inProgress': function(newV, oldV){
            if(newV){
                this.tmpMillstone.endYear ="";
                this.tmpMillstone.endMonth ="";
            }
        },
        'tmpMillstioneDesc.inProgress': function(newV, oldV){
            if(newV){
                this.tmpMillstioneDesc.endYear ="";
                this.tmpMillstioneDesc.endMonth ="";
            }
        }
    }
}
const app = createApp(RootComponent);

app.mixin(SkillComponent);
app.mixin(BrandLinksSettingCompoent);
app.mixin(BrandAvatorAndBannerSetting);
app.mixin(BrandBasicSetting);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(new BrandInfoComponent({need_init: false}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO,need_init: false
}));

app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.component("model-select",ModelSelect);

const settingProfilePage = app.mount('#app');
window.cProfile = settingProfilePage;
// init 
settingProfilePage.loadBrandProfileV();
settingProfilePage.initBrandBasicSettingConfigV(); // brandBasicSeetting.js
settingProfilePage.userAdapter(); // auth.js
settingProfilePage.loadBrandInfo(); // load-brandinfo.js
settingProfilePage.initEventFeedCompoentV();

async function getBrandProfile(brandId){
    const url = "/api/v1/web_mall/brand/{brand_id}/profile".replace("{brand_id}",brandId);
    return await axios.get(url);
}

async function updateExperienceForBrand(brandId,dto){
    const url = "/api/v1/web_estudio/brand/{brand_id}/experience".replace("{brand_id}",brandId);
    return await axios.put(url,dto)  
}

async function updateBasicInfoForBrand(brandId,dto){
    const url = "/api/v1/web_estudio/brand/{brand_id}/basic_info".replace("{brand_id}",brandId);
    return await axios.put(url,dto)  
}

function loadBrandProfile(){
    const brandId =  settingProfilePage.getIdentity().brandId; // Auth.getIdentity();
    getBrandProfile(brandId).then(response=>{
        if(response.data.code ==200){
        // set identity
        const profile = response.data.profile;
        settingProfilePage.identity.brand = profile.brand;
        settingProfilePage.identity.title = profile.title;
        settingProfilePage.identity.location = profile.location;
        // location todo
        // set brand
        settingProfilePage.brand.avator = profile.avator;
        settingProfilePage.brand.banner = profile.cover;
        // set skill
        settingProfilePage.brandProfile.skills = !profile.skills ? [] : profile.skills;

        // set links
        settingProfilePage.brandProfile.links = !profile.links ? [] : profile.links;
        // set experience
        settingProfilePage.brandProfile.experience = !profile.experience ? [] : profile.experience;

        // set basic info
        settingProfilePage.initBasicSettingV(profile);


        }
    })
}
function setBrandExperience(){
    const brandId =  settingProfilePage.getIdentity().brandId; // Auth.getIdentity();
    const dto = {
        history: {
            experience: settingProfilePage.brandProfile.experience
        }
    }
    updateExperienceForBrand(brandId,dto);
}
function setBrandBasicInfo(){
    // todo ip location
    const brandId =  settingProfilePage.getIdentity().brandId; // Auth.getIdentity();
    if(!settingProfilePage.identity.location){
        settingProfilePage.identity.location = "中国大陆"
    }
    updateBasicInfoForBrand(brandId,settingProfilePage.identity).then(response=>{
        if(response.data.code==200){
            settingProfilePage.btn_ctl.activate_general_save_btn = false;
        }
    });
}




function showAddExperienceModal(){
    // clear modal tmp data
    var tmp = emptyTmpMillstoneData();
    settingProfilePage.tmpMillstone = tmp;
    $("#newExperienceModal").modal("show");
}
function showAddExperieneDescModal(){
    // clear modal tmp data
    var tmp = emptyTmpMillstoneDescData();
    settingProfilePage.tmpMillstioneDesc = tmp;
    $("#newExperienceDescModal").modal("show");
}
function addExperience(){
    // check input
    // handle data
   const newMillstone = {};
   const tmpMillstone = settingProfilePage.tmpMillstone;
   newMillstone.title =  tmpMillstone.title;
   newMillstone.subTitle = tmpMillstone.subtitle;
   newMillstone.start = tmpMillstone.startYear + "/" + tmpMillstone.startMonth;
   newMillstone.end = tmpMillstone.endYear + "/" + tmpMillstone.endMonth;
   if(tmpMillstone.inProgress){
    newMillstone.end = ""
   }
   newMillstone.entrys = [];
   settingProfilePage.brandProfile.experience.unshift(newMillstone);
   // save
   setBrandExperience();
   // close modal
   closeExperienceModal();
}
function addExperienceDesc(){
    const index = settingProfilePage.currentMillstoneIndex;
    if(!settingProfilePage.brandProfile.experience[index].entries){
        settingProfilePage.brandProfile.experience[index].entries= [];
    }
    const newDesc = {};
    const tmp = settingProfilePage.tmpMillstioneDesc;
    newDesc.title = tmp.title;
    newDesc.start = tmp.startYear + "/" + tmp.startMonth;
    newDesc.end = tmp.endYear + "/" + tmp.endMonth;
    if(tmp.inProgress){
        newDesc.end = ""
    }
    newDesc.story = tmp.story;
    settingProfilePage.brandProfile.experience[index].entries.push(newDesc);
   // save
   setBrandExperience();
   // close modal
   closeExperienceDescModal();
}

function emptyTmpMillstoneData(){
    return {
        startYear: "",
        startMonth: "",
        endYear: "",
        endMonth: "",
        inProgress: false,
        title: ""
    };
}
function emptyTmpMillstoneDescData(){
    return {
        startYear: "",
        startMonth: "",
        endYear: "",
        endMonth: "",
        inProgress: false,
        title: "",
        story: ""
    };
}
function editExperience(index){
    const tmp = settingProfilePage.brandProfile.experience[index];
    settingProfilePage.tmpMillstone = emptyTmpMillstoneDescData();
    settingProfilePage.tmpMillstone.title = tmp.title;
    settingProfilePage.tmpMillstone.subtitle= tmp.subTitle;

    settingProfilePage.tmpMillstone.startYear = tmp.start.split("/")[0]; // startYear: 2022/2
    settingProfilePage.tmpMillstone.startMonth = tmp.start.split("/")[1]; 
    //  end date not empty 
    if(!!tmp.end){
        settingProfilePage.tmpMillstone.endYear = tmp.end.split("/")[0]; // startYear: 2022/2
        settingProfilePage.tmpMillstone.endMonth = tmp.end.split("/")[1]; 
    }
    if(tmp.end === ""){
        settingProfilePage.tmpMillstone.inProgress = true; 
    }
    // set modal mode : edit
    settingProfilePage.tmpMillstone.mode = "edit";
    // set tmp index
    settingProfilePage.tmpMillstone.index = index;
    // show modal
    $("#newExperienceModal").modal("show");
    
}

function modifyExperience(index){
    // check input
    // handle data
    const millstone = settingProfilePage.brandProfile.experience[index];
    const tmpMillstone = settingProfilePage.tmpMillstone;
    millstone.title =  tmpMillstone.title;
    millstone.subTitle = tmpMillstone.subtitle;
    millstone.start = tmpMillstone.startYear + "/" + tmpMillstone.startMonth;
    millstone.end = tmpMillstone.endYear + "/" + tmpMillstone.endMonth;
    if(tmpMillstone.inProgress){
        millstone.end = ""
    }
    // update back end data
    setBrandExperience();
    // close modal
    closeExperienceModal();
}

function modifyExperienceDesc(experienceIndex,descIndex){
    // check input
    // handle data
    const item = settingProfilePage.brandProfile.experience[experienceIndex].entries[descIndex];
    const tmp = settingProfilePage.tmpMillstioneDesc;
    item.title =  tmp.title;
    item.story = tmp.story;
    item.start = tmp.startYear + "/" + tmp.startMonth;
    item.end = tmp.endYear + "/" + tmp.endMonth;
    if(tmp.inProgress){
        item.end = ""
    }
    // update back end data
    setBrandExperience();
    // close modal
    closeExperienceDescModal();
}

function removeExperience(index){
    settingProfilePage.brandProfile.experience.splice(index,1);
    // update back end data todo
    setBrandExperience();
    // close modal
    closeExperienceModal();
}
function removeExperienceDesc(experienceIndex,descIndex){
    settingProfilePage.brandProfile.experience[experienceIndex].entries.splice(descIndex,1);
    // update 
    setBrandExperience();
    // close modal
    closeExperienceDescModal();
}
function editExperienceDesc(experienceIndex,descIndex){
    settingProfilePage.tmpMillstioneDesc = emptyTmpMillstoneDescData();
    const tmp = settingProfilePage.brandProfile.experience[experienceIndex].entries[descIndex];
    settingProfilePage.tmpMillstioneDesc.title = tmp.title;
    settingProfilePage.tmpMillstioneDesc.story= tmp.story;

    settingProfilePage.tmpMillstioneDesc.startYear = tmp.start.split("/")[0]; // startYear: 2022/2
    settingProfilePage.tmpMillstioneDesc.startMonth = tmp.start.split("/")[1]; 
    //  end date not empty 
    if(!!tmp.end){
        settingProfilePage.tmpMillstioneDesc.endYear = tmp.end.split("/")[0]; // startYear: 2022/2
        settingProfilePage.tmpMillstioneDesc.endMonth = tmp.end.split("/")[1]; 
    }
    if(tmp.end === ""){
        settingProfilePage.tmpMillstioneDesc.inProgress = true; 
    }
    // set modal mode : edit
    settingProfilePage.tmpMillstioneDesc.mode = "edit";
    // set tmp index
    settingProfilePage.tmpMillstioneDesc.experienceIndex = experienceIndex;
    settingProfilePage.tmpMillstioneDesc.descIndex = descIndex;

    // show newExperienceDescModalLabel
    $("#newExperienceDescModal").modal("show");
} 
function validateDate(startYear,startMonth,endYear,endMonth){
    if(!startYear
        && !startMonth
        && !endYear
        && !endMonth
        ){
            return false;
    }
    if(!!startYear && !endYear){
        return false;
    }
    if((!!startYear&& !!endYear)
       && (Number(endYear)>Number(startYear))) {
        return false;
    }
    if((!!startYear&& !!endYear)
       && (Number(endYear)==Number(startYear))
       && (!endMonth || Number(endMonth)>=Number(startMonth))
       ) {
        return false;
    }
    return true;
}

function validateModal(modal){
    return !modal.title
              || !modal.startYear
              || !modal.startMonth
              || ((!modal.inProgress) && (
                   !modal.endYear
                  || !modal.endMonth || 
                  validateDate(modal.startYear,modal.startMonth,modal.endYear,modal.endMonth)
                  ));
}

function closeExperienceModal(){
    // close modal
    $("#newExperienceModal").modal("hide");
    // clear tmp data
    settingProfilePage.tmpMillstone = emptyTmpMillstoneData();
}

function closeExperienceDescModal(){
    // close modal
    $("#newExperienceDescModal").modal("hide");
    // clear tmp data
    settingProfilePage.tmpMillstioneDesc = emptyTmpMillstoneDescData();
}