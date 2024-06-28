import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";



const RootComponent = {
    data() {
        return {
        }
    },
    methods: {

        copyValueToClipboardV(el){
            var codeSampleEl= el.target.parentNode;
            var i=0;
            do {
                if(codeSampleEl.classList.contains("code-sample")){
                    i=10;
                }else{
                  codeSampleEl=codeSampleEl.parentNode;
                }
            }
            while (i<10);
            var codeBodyEl=codeSampleEl.firstChild;
            if(!codeBodyEl.classList.contains("code-sample-body")){
                codeBodyEl=codeBodyEl.nextSibling;
            }
            var lineNumberCodeEl=codeBodyEl.firstChild.firstChild.firstChild;
            var lineText="";
            if(lineNumberCodeEl.tagName=='CODE'){
                lineText=lineNumberCodeEl.innerText;
            }
            console.log("aa:" + lineText)
            var copyContent=codeBodyEl.innerText;
            if(!!lineText){
                copyContent=copyContent.replace(lineText,"");
            }
            copyValueToClipboard(copyContent);

        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
const apiReference = app.mount('#app');
window.apiReference = apiReference;



const firstScrollSpyEl = document.querySelector('[data-bs-spy="scroll"]')
firstScrollSpyEl.addEventListener('activate.bs.scrollspy', () => {
  
    var element = document.getElementById("bdSidebar");
    if(element.classList.contains("show")){
        $('#bdSidebar').offcanvas('hide');
    }

})