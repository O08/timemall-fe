import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene,CoopApplicationStatusEnum,CoopProgramStatusEnum} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { renderDateInChina } from "/common/javascripts/util.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            registrantModalTitle: "",
            editProgramObj:{
                description: "",
                topics: [],
                thumbnailUrl: ""
            },
            editProgramObjHistory: {
              topics: []
            },
            newProgramObj: {
                description: "",
                topics: []
            },
            program_pagination:{
                url: "/api/v1/web_pod/cooperation/posted/programs",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.program_pagination.size = response.program.size;
                        this.program_pagination.current = response.program.current;
                        this.program_pagination.total = response.program.total;
                        this.program_pagination.pages = response.program.pages;
                        this.program_pagination.records = response.program.records;
                        this.program_pagination.paging = this.doPaging({current: response.program.current, pages: response.program.pages, size: 5});

                    }
                }
            },
            registrantList_pagination: {
                url: "/api/v1/web_pod/cooperation/program/applications",
                size: 50,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                isLoading: false,
                param: {
                  q: '',
                  eventId: ''
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.registrantList_pagination.size = response.application.size;
                        this.registrantList_pagination.current = response.application.current;
                        this.registrantList_pagination.total = response.application.total;
                        this.registrantList_pagination.pages = response.application.pages;
                        this.registrantList_pagination.records = response.application.records;
                        this.registrantList_pagination.isLoading = false;
                        this.registrantList_pagination.paging = this.doPaging({current: response.application.current, pages: response.application.pages, size: 5});

                    }
                }
            },
        }
    },
    methods: {
      validateNewProgramModalV() {
        const form = this.newProgramObj;
    
        if (!form.title || !form.workMode  || 
          !form.thumbnail || !form.description || 
          form.topics.length === 0) {
          return false;
        }

        if(form.onlineLink &&  !isValidHttpUrlNeedScheme(form.onlineLink)){
          return false;
        }

        return true;
      },
      validateEditProgramModalV() {
        const form = this.editProgramObj;
        const historyForm=this.editProgramObjHistory;
    
        if (!form.title || !form.workMode  || !form.description || 
          form.topics.length === 0) {
          return false;
        }

        if(form.onlineLink &&  !isValidHttpUrlNeedScheme(form.onlineLink)){
          return false;
        }

        if(form.status==CoopProgramStatusEnum.FREEZE){
          return false;
        }


        const dataChanged=(form.title!=historyForm.title || form.workMode!=historyForm.workMode 
            || form.onlineLink!=historyForm.onlineLink 
           || JSON.stringify(form.topics) !== JSON.stringify(historyForm.topics) 
           || form.status!=historyForm.status || form.description!=historyForm.description
          );

        return dataChanged;
      },
        approvedProgramApplicationV(application){
          auditProgramApplication(application.applicationId,CoopApplicationStatusEnum.APPROVED).then(response=>{
            if(response.data.code==200){
              application.status=CoopApplicationStatusEnum.APPROVED;
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        rejectedProgramApplicationV(application){
          auditProgramApplication(application.applicationId,CoopApplicationStatusEnum.REJECTED).then(response=>{
            if(response.data.code==200){
              application.status=CoopApplicationStatusEnum.REJECTED;
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        initProgramListV(){
          this.program_pagination.current = 1;
          this.program_pagination.param.q="";
          this.reloadPage(this.program_pagination);
        },
        publishProgramV(){
          publishProgram(this.newProgramObj).then(response=>{
            if(response.data.code==200){
              this.initProgramListV();
              $("#publishModal").modal("hide");
            }
            if (response.data.code == 40007) {
              customAlert.alert("源能余额不足，操作失败，发布合作项目需扣除 10 源能，可前往【薪动商号】-【补给商城】进行补给。");
              return;
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        showRegistrantsModalV(program){
            this.registrantList_pagination.records=[];
            this.registrantList_pagination.param.q="";
            this.registrantList_pagination.current=1;
            this.registrantList_pagination.param.programId=program.programId;
            this.pageInit(this.registrantList_pagination);
            this.registrantModalTitle=program.title;

            $("#registrantsModal").modal("show");

          },
        closeRegistrantsModalHandlerV(){
            $("#registrantsModal").modal("hide");
        },
        searchRegistrantsV(){
          this.registrantList_pagination.current=1;
          this.reloadPage(this.registrantList_pagination);
        },
        renderDateInChinaV(dateStr){
            return renderDateInChina(dateStr);
        },
        deleteOneProgramV(programId){
          deleteProgram(programId).then(response=>{
            if(response.data.code == 200){
                 this.reloadPage(this.program_pagination);
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error); 
            }
    
          });
        },
        showNewProgramModalV(){
             const coverInput = document.getElementById('coverInput');
             if (coverInput) {
               coverInput.value = '';
             }
             this.newProgramObj={
               title: "",
               thumbnailUrl: "",
               thumbnail: "",
               inputTopic: "",
               workMode: "flexible",
               description: "",
               onlineLink: "",
               topics: []
             }
             $("#publishModal").modal("show");
        },
        showEditProgramModalV(program){

          this.editProgramObj=JSON.parse(JSON.stringify(program));
          const tmpThumbnailUrl=this.editProgramObj.thumbnail;

          this.editProgramObj.inputTopic="";
          this.editProgramObj.thumbnail="";
          this.editProgramObj.thumbnailUrl=tmpThumbnailUrl;
  
             const coverInput = document.getElementById('editCoverInput');
             if (coverInput) {
               coverInput.value = '';
             } 

             this.editProgramObjHistory=JSON.parse(JSON.stringify(this.editProgramObj));

            $("#editModal").modal("show");
        },
        editProgramV(){
          editProgram(this.editProgramObj).then(response => {
            if (response.data.code == 200) {
              this.reloadPage(this.program_pagination);
              $("#editModal").modal("hide");
            }

            if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
            }

          });
        },
        previewEditProgramThumbnailV(e){
            previewEditProgramThumbnail(e,this);
        },
        previewNewProgramThumbnailV(e){
          previewNewProgramThumbnail(e,this);
        },
        addNewProgramTopicV(){
          const tagValue = this.newProgramObj.inputTopic;
          const topics =  this.newProgramObj.topics;
          this.newProgramObj.inputTopic = ''; 

          if (!tagValue || topics.includes(tagValue) || topics.length >= 5) {
            return;
          }

          this.newProgramObj.topics = [...topics, tagValue];
        },
        removeNewProgramTopicV(index){
          this.newProgramObj.topics.splice(index, 1);
        },
        retrieveProgramV(){
            this.program_pagination.current=1;
            this.program_pagination.size=10;
            this.reloadPage(this.program_pagination);
        },
        removeEditProgramTopicV(index){
          this.editProgramObj.topics.splice(index, 1);
        },
        addEditProgramTopicV(){
          const tagValue = this.editProgramObj.inputTopic;
          const topics =  this.editProgramObj.topics;
          this.editProgramObj.inputTopic = ''; 

          if (!tagValue || topics.includes(tagValue) || topics.length >= 5) {
            return;
          }

          this.editProgramObj.topics = [...topics, tagValue];
        }
    },
    created() {
        this.pageInit(this.program_pagination);
    },
    updated(){
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(CodeExplainComponent);

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                postedProgram.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const postedProgram = app.mount('#app');
window.postedProgramPage= postedProgram;




async function doPublishProgram(formData){
  const url="/api/v1/web_pod/cooperation/program/new";
  return await axios.post(url,formData);
}

async function doEditProgram(dto){
  const url="/api/v1/web_pod/cooperation/program/edit";
  return await axios.put(url,dto);
}
async function doChangeProgramThumbnail(programId,thumbnail){
  const url="/api/v1/web_pod/cooperation/program/thumbnail/change";
  var form = new FormData();
  form.append("programId",programId);
  form.append("thumbnail",thumbnail);
  return await axios.put(url,form);
}

async function doDeleteProgram(programId){
  const url="/api/v1/web_pod/cooperation/program/{id}/del".replace("{id}",programId);
  return await axios.delete(url);
}

async function doAuditProgramApplication(dto){
  const url="/api/v1/web_pod/cooperation/program/application/audit";
  return await axios.put(url,dto);
}

async function auditProgramApplication(applicationId,status){
    const dto={
      applicationId: applicationId,
      status: status
    }
    return await doAuditProgramApplication(dto);
}
async function deleteProgram(programId){
  return await doDeleteProgram(programId);
}

async function changeProgramThumbnail(programId,thumbnail){
  return await doChangeProgramThumbnail(programId,thumbnail);
}
async function editProgram(program){

   const dto = {
     programId: program.programId,
     title: program.title,
     workMode: program.workMode,
     description: program.description,
     onlineLink: program.onlineLink,
     topics:  program.topics,
     status: program.status
  }  
  return await doEditProgram(dto);
  
}

async function publishProgram(newProgramObj){

  var form = new FormData();
  form.append("thumbnail",newProgramObj.thumbnail);
  form.append("title",newProgramObj.title);
  form.append("description",newProgramObj.description);
  form.append("topics",newProgramObj.topics.join(','));
  form.append("workMode",newProgramObj.workMode);
  form.append("onlineLink",newProgramObj.onlineLink);
   return await doPublishProgram(form);
}


function previewNewProgramThumbnail(e, appObj) {

  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const URL2 = URL.createObjectURL(file);

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("图片最大为6M!");
    document.querySelector('#coverInput').value = ''; // reset file input
    return false;
  }

  const feedThumbnailImgFile = new Image();
  feedThumbnailImgFile.onload = () => {

    // validate image pixel
    if (!(feedThumbnailImgFile.width >= 99 && feedThumbnailImgFile.height >= 99 && feedThumbnailImgFile.width < 4096 && feedThumbnailImgFile.height < 4096 && feedThumbnailImgFile.width * feedThumbnailImgFile.height < 9437184)) {
      customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
      document.querySelector('#coverInput').value = ''; // reset file input
      return false;
    }

    appObj.newProgramObj.thumbnail = file;

    appObj.newProgramObj.thumbnailUrl = URL2;


  };

  feedThumbnailImgFile.src = URL.createObjectURL(file);

}



function previewEditProgramThumbnail(e,appObj){

  const file = e.target.files[0];
  if (!file) {
    return;
  }


  const URL2 = URL.createObjectURL(file);

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("图片最大为6M!");
    document.querySelector('#editCoverInput').value = ''; // reset file input
    return false;
  }

  const feedThumbnailImgFile = new Image();
  feedThumbnailImgFile.onload = () => {

    // validate image pixel
    if (!(feedThumbnailImgFile.width >= 99 && feedThumbnailImgFile.height >= 99 && feedThumbnailImgFile.width < 4096 && feedThumbnailImgFile.height < 4096 && feedThumbnailImgFile.width * feedThumbnailImgFile.height < 9437184)) {
      customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
      document.querySelector('#editCoverInput').value = ''; // reset file input
      return false;
    }

 
    changeProgramThumbnail(appObj.editProgramObj.programId,file).then(response=>{
      if(response.data.code == 200){
           
        appObj.editProgramObj.thumbnailUrl = URL2;
        appObj.editProgramObj.thumbnail= URL2; // 更新主图显示

        appObj.reloadPage(appObj.program_pagination); // 更新table

      }
 
      if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
      }

    });




  };

  feedThumbnailImgFile.src = URL.createObjectURL(file);
}


// Enable popovers 
$('[data-bs-toggle="popover"]').popover();

  $(function(){
	$(".tooltip-nav").tooltip();
});

  