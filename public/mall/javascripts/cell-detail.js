import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import {goHome,goLoginPage,goBackAndReload} from "/common/javascripts/pagenav.js";
import { getQueryVariable } from "/common/javascripts/util.js";

const RootComponent = {
    data() {
        return {
            profile: {},
            selectedSbu: '',
            total: 0
        }
    },
    methods: {
        loadCellInfoV(){
            const cellId= getQueryVariable("cell_id");
            if(!cellId){
                return;
            }
            this.profile = getIntroInfoForCell(cellId);
            if(!this.profile.content){
                this.profile.content = []
            }
        },
        computeTotalFeeV(){
            computeTotalFee()
        },
        orderNowV(){
            orderNow()
        }
    },
    created(){
      this.loadCellInfoV();
    }
}
const SellerComponent = {
    data() {
        return {
            brandProfile: {}
        }
    },
    methods: {
       loadBrandInfoV(){
           const brandId= getQueryVariable("brand_id");
            if(!brandId){
                return;
            }
            this.brandProfile = getBrandProfile(brandId)
       }
    },
    created(){
        this.loadBrandInfoV();
    }
    
}
const app = createApp(RootComponent);
app.mixin(SellerComponent);
app.mixin(new Auth({need_permission : false}));

const cellDetailPage = app.mount('#app');


window.cellDetail = cellDetailPage;
/**
 * intro -------------
 */
function getIntroInfoForCell(cellId){
    var res = {};
    $.ajaxSetup({async: false});
    const url = "/api/v1/web_mall/services/{cell_id}/intro".replace("{cell_id}",cellId);
    $.get(url,function(data) {
        if(data.code == 200){
            res = data.profile
        }
       })
         .fail(function(data) {
           // place error code here
         });
    return res;
}
function order(cellId){
    const dto= {
        sbu: cellDetailPage.selectedSbu,
        quantity: cellDetailPage.total
    }
    const url = "/api/v1/web_mall/services/{cell_id}/order".replace("{cell_id}",cellId);
       $.ajax({
        url: url,
        data: JSON.stringify(dto),
        type: "post",
        dataType:"json",
        contentType: "application/json",
        success:function(data){
          // todo 
          if(data.code == 200){
            alert("成功预定")
          }
        },
        error:function(){
          //alert('error'); //错误的处理
        }
      });   
}


function orderNow(){
    const cellId= getQueryVariable("cell_id");
    if(!cellId || !cellDetailPage.total || !cellDetailPage.quantity 
        || cellDetailPage.total<=0 || cellDetailPage.quantity<=0){
            return
    }
    // 用户未登录，跳到登录页面
    if(!cellDetailPage.user_already_login){
        goLoginPage();
        return
    }
    order(cellId); // todo
}
function getSbuPrice()
{
   const selectedFee = cellDetailPage.profile.fee.filter(item=>item.sbu===cellDetailPage.selectedSbu)[0];
   return selectedFee.price;
}
function computeTotalFee(){
    if(cellDetailPage.selectedSbu === "" || !cellDetailPage.quantity ){
        cellDetailPage.total = 0;
        return ;
    }
    cellDetailPage.total  = getSbuPrice() * cellDetailPage.quantity;
}


/**
 * about seller ----------------
 */


function getBrandProfile(brandId)
{
    var res = {}
    $.ajaxSetup({async: false});
    const url = "/api/v1/web_mall/brand/{brand_id}/profile".replace("{brand_id}",brandId);
    $.get(url,function(data) {
        if(data.code == 200){
            res = data.profile
        }
       })
         .fail(function(data) {
           // place error code here
         });
    return res;
}



