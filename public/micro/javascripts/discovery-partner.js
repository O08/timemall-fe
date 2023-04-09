import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";
// todo
import defaultPartnerPreviewImage from '/common/images/default-cell-preview.jpg'

const RootComponent = {
    data() {
        return {
            defaultPartnerPreviewImage,
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
        retrieveTalentGridV(){
            retrieveTalentGrid();
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
const disTalent = app.mount('#app');

window.disTalent = disTalent;

// init
disTalent.pageInit(disTalent.talentgrid_pagination);

function retrieveTalentGrid(){
    disTalent.reloadPage(disTalent.talentgrid_pagination);
}