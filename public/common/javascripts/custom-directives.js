const DirectiveComponent = {
    data() {
        return {
        }
     },
    directives: {
        autoheight: {
            // 指令的定义
            mounted(el) {
                autoHeight(el);
                el.addEventListener("keyup", () => {
                    autoHeight(el);
                });
            }
            
        }
    }
}
function autoHeight(elem) {
    elem.style.height = "auto";
    elem.scrollTop = 0; // 防抖动
    elem.style.height = elem.scrollHeight + "px";
}
export {DirectiveComponent ,autoHeight }