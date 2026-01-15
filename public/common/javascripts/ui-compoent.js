
import "/common/javascripts/import-jquery.js";

function CustomAlertModal(){

    this.alert = function(message){
        var alertModalHtmlString='<div class="modal  fade alertModal" tabindex="-1" aria-hidden="false"><div class="modal-dialog">' + '<div style="padding: 8px;" class="modal-content">' + message + '</div></div></div>';
        var modalBox = document.createElement('div');
        modalBox.innerHTML = alertModalHtmlString.trim();
        document.body.appendChild(modalBox);

        var modalElement = $(modalBox).find('.modal');
        modalElement.modal('show');
        
        // 设置定时器
        var timer = setTimeout(function() {
            if (modalElement.hasClass('show')) {  // 检查模态框是否仍在显示
                modalElement.modal('hide');
            }
        }, 6000);
        
        // 监听模态框隐藏事件，清除定时器并移除元素
        modalElement.on('hidden.bs.modal', function () {
            clearTimeout(timer);  // 清除定时器
            $(this).remove();
        });
    }
  }

  export { CustomAlertModal}