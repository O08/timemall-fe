
import "/common/javascripts/import-jquery.js";

function CustomAlertModal(){

    this.alert = function(message){
        var alertModalHtmlString='<div class="modal  fade" id="alertModal" tabindex="-1" ><div class="modal-dialog">' + '<div style="padding: 8px;" class="modal-content">' + message + '</div></div></div>';
        var modalEl = document.createElement('div');
        modalEl.innerHTML = alertModalHtmlString.trim();
        document.body.appendChild(modalEl);
        $("#alertModal").modal("show");
        $("#alertModal").delay(6000).slideUp(100, function () {
             $(this).modal("hide"); 
             $(this).remove();
        });
    }
  }

  export { CustomAlertModal}