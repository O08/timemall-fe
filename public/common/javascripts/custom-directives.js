import "/common/javascripts/import-jquery.js";
const DirectiveComponent = {
    data() {
        return {
        }
     },
    directives: {
        autoheight: {
            // 指令的定义
            mounted(el) {
                const adjust = () => autoHeight(el);
                
                // 1. 基础逻辑：监听输入
                el._autoHeightHandler = adjust;
                el.addEventListener("input", adjust);

                // 2. 环境兼容：如果是 Bootstrap Modal
                const modal = el.closest('.modal');
                if (modal) {
                    // 使用 jQuery 监听动画完成事件
                    $(modal).on('shown.bs.modal', adjust);
                    el._modalRef = modal;
                }

                // 3. 初始尝试（针对非 Modal 或已打开的情况）
                // 放在 nextTick 或 setTimeout 确保 DOM 属性已解析
                setTimeout(adjust, 0);
            },
            
            // 4. 数据兼容：v-model 改变时触发
            updated(el) {
                autoHeight(el);
            },

            unmounted(el) {
                el.removeEventListener("input", el._autoHeightHandler);
                // 记得解绑 jQuery 事件防止内存泄漏
                if (el._modalRef) {
                    $(el._modalRef).off('shown.bs.modal', el._autoHeightHandler);
                }
            }
            
        },
        preventreclick:{
            mounted(el,binding) {
                el.addEventListener('click', () => {
                    if (!el.disabled) {
                        el.disabled = true;
                        el.style.pointerEvents = "none";
                        el.style.cursor = "none";
                        setTimeout(() => {
                            el.disabled = false;
                            el.style.pointerEvents = "";
                            el.style.cursor = "";
                        }, binding.value || 1000)
                    }
                })
            }
        }
    }
}
function autoHeight(elem) {
    // 隐藏状态下 scrollHeight 为 0，此时不应操作，否则高度会变 0
    if (elem.offsetWidth <= 0 && elem.offsetHeight <= 0) return;

    elem.style.height = "auto";
    elem.scrollTop = 0; 
    elem.style.height = elem.scrollHeight + "px";
}
export {DirectiveComponent ,autoHeight }