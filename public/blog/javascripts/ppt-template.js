import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import Pagination  from "/common/javascripts/pagination-vue.js";

const RootComponent = {
    data() {
        return {
            ppt_t_pagination:{
                url: "/api/v1/web_mall/resource",
                size: 24,
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
                        this.ppt_t_pagination.size = response.offer.size;
                        this.ppt_t_pagination.current = response.offer.current;
                        this.ppt_t_pagination.total = response.offer.total;
                        this.ppt_t_pagination.pages = response.offer.pages;
                        this.ppt_t_pagination.records = response.offer.records;
                        this.ppt_t_pagination.paging = this.doPaging({current: response.offer.current, pages: response.offer.pages, size: 5});

                    }
                }
            }, 
        }
    },
    methods: {
        retrievePptTemplateGridV(){
            retrievePptTemplateGrid();
        }
    },
    updated() {
        settingListener();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
const pptTemplatePage = app.mount('#app');
window.pptTemplatePage = pptTemplatePage;


pptTemplatePage.pageInit(pptTemplatePage.ppt_t_pagination);

function retrievePptTemplateGrid(){
    const tmp = pptTemplatePage.ppt_t_pagination.param.q;
    initQueryParam();
    pptTemplatePage.ppt_t_pagination.param.q = tmp;
 
    pptTemplatePage.reloadPage(pptTemplatePage.ppt_t_pagination);
 
}

function initQueryParam(){
    pptTemplatePage.ppt_t_pagination.param = {
        q: ""
    }
    pptTemplatePage.ppt_t_pagination.current = 1;
    pptTemplatePage.ppt_t_pagination.size = 24;
  }

function settingListener(){
    if(pptTemplatePage.ppt_t_pagination.records.length==0){
        return;
    }

    document.querySelector(".TemplateThumbnailVideo_videoPlayer").addEventListener('mouseover', function() {

        this.play();
      
      
      });
      
      document.querySelector(".TemplateThumbnailVideo_videoPlayer").addEventListener('mouseout', function() {
    
        this.pause();
      
        this.currentTime = 0;
      
      
      });

}


  
  
  