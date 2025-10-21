import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";
import {ProductStatus} from "/common/javascripts/tm-constant.js";

import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { transformInputNumberAsPositiveDecimal,transformInputNumberAsPositive } from "/common/javascripts/util.js";


import "vue-search-select/dist/VueSearchSelect.css";
import {ModelSelect}  from 'vue-search-select';

import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';


import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const currentOch = getQueryVariable("och");

const fontSizeArr = ['14px', '16px', '18px', '20px', '22px'];
const backgroundArr = [
  "#1a1a1a", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff",
  "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff",
  "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff",
  "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2",
  "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"
];

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

const toolbarOptions = [
    [{ 'size': fontSizeArr }],  // custom dropdown
    [{ 'color': [] }, { 'background': backgroundArr }],          // dropdown with defaults from theme
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    [{ 'align': [] }],
    ['link'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    ['clean']                                         // remove formatting button
];

var quillForNewProductModalShippingTerm = ""; // init in mounted
var quillForEditProductModalShippingTerm = ""; // init in mounted

const RootComponent = {
    data() {
        return {

            btn_ctl:{
                material_uploading: false,
                editGenreModal_already_change:false
            },
            genres:[],
            genreOptions: [],
            genreSelectedItem: "",
            newGenre:{
              channel: currentOch,
              genreName: ""
            },
            editGenre:{
                channel: currentOch,
                genreName: "",
                genreId: ""
            },
            general: {
                channelName: "",
                channelDesc: "",
                och: ""
            },
            newProduct: this.initNewProductV(),
            productProfile: {},
            editProduct:{
                productId: "",
                productName: "",
                productCode: "",
                price: "",
                inventory: "",
                salesQuota: "",
                salesQuotaType: "per_person",
                releaseAt: "",
                estimatedDeliveryAt: "",
                genreId: "",
                shippingType: "email",
                shippingTerm: "",
                warmReminder: "",
                productThumbnailFileUrl: "",
                productThumbnailFile: ""
            },
            productList_pagination: {
                url: "/api/v1/app/redeem/admin/product/list",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {
                    q: '',
                    status: '',
                    genreId: '',
                    channel: currentOch
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.productList_pagination.size = response.product.size;
                        this.productList_pagination.current = response.product.current;
                        this.productList_pagination.total = response.product.total;
                        this.productList_pagination.pages = response.product.pages;
                        this.productList_pagination.records = response.product.records;
                        this.productList_pagination.paging = this.doPaging({current: response.product.current, pages: response.product.pages, size: 5});

                    }
                }
            },
        }
    },
    methods: {
        validateEditProductFormCanSaveV(){
            if( !this.editProduct.productName || !this.editProduct.productCode || !this.editProduct.price || !this.editProduct.inventory
                || !this.editProduct.salesQuota || !this.editProduct.salesQuotaType || !this.editProduct.releaseAt || !this.editProduct.estimatedDeliveryAt
                || !this.genreSelectedItem || !this.editProduct.shippingType  || !this.editProduct.warmReminder 
                || Number(this.editProduct.price)==0){
                 return false
            }
            if( this.editProduct.productName!=this.productProfile.productName || this.editProduct.productCode!=this.productProfile.productCode 
                || this.editProduct.price!=this.productProfile.price || this.editProduct.inventory!=this.productProfile.inventory 
                || this.editProduct.salesQuota!=this.productProfile.salesQuota || this.editProduct.salesQuotaType!=this.productProfile.salesQuotaType 
                || this.editProduct.releaseAt!=this.productProfile.releaseAt || this.editProduct.estimatedDeliveryAt!=this.productProfile.estimatedDeliveryAt 
                || this.editProduct.shippingType!=this.productProfile.shippingType 
                || this.editProduct.shippingTerm!=this.productProfile.shippingTerm || this.editProduct.warmReminder!=this.productProfile.warmReminder 
                ||  this.genreSelectedItem!=this.productProfile.genreId
                ){
                 return true
             }
 
            return false;
        },
        validateNewProductFormV(){
           if(!!this.newProduct.channel && !!this.newProduct.productName && !!this.newProduct.productCode && !!this.newProduct.price && !!this.newProduct.inventory
               && !!this.newProduct.salesQuota && !!this.newProduct.salesQuotaType && !!this.newProduct.releaseAt && !!this.newProduct.estimatedDeliveryAt
               && !!this.genreSelectedItem && !!this.newProduct.shippingType && !!this.newProduct.shippingTerm && !!this.newProduct.warmReminder 
               && !!this.newProduct.productThumbnailFileUrl && Number(this.newProduct.price)>0){
                return true
            }

           return false;
        },
        initNewProductV(){

            var fileInputEl=document.getElementById("file_thumbnail");
            if(!!fileInputEl){
                fileInputEl.value=null;
            }
            this.genreSelectedItem="";


           return {
            channel: currentOch,
            productName: "",
            productCode: "",
            price: "",
            inventory: "",
            salesQuota: "",
            salesQuotaType: "per_person",
            releaseAt: "",
            estimatedDeliveryAt: "",
            genreId: "",
            shippingType: "email",
            shippingTerm: "",
            warmReminder: "",
            productThumbnailFileUrl: "",
            productThumbnailFile: "",
          }
        },
        changeGenreSortV(genreId,direction){
           changeGenreSort(genreId,direction).then(response=>{
            if(response.data.code==200){
              this.loadGenreListV();
            }
            if(response.data.code!=200){
              const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(error); 
            }
          })
        },
        loadGenreListV(){
            loadGenreList(currentOch).then(response=>{
                if(response.data.code == 200){

                  this.genres=response.data.genre;

                  var genreArr=[{value:"",text:"请选择品类"}];
                  response.data.genre.forEach(element => {
                    genreArr.push({value: element.genreId,text: element.genreName});
                  });
                  this.genreOptions=genreArr;
                }
            });
        },
        filterProductListV(){
            this.productList_pagination.current = 1;
            this.reloadPage(this.productList_pagination);
        },
        searchProductListV(){
            this.productList_pagination.current = 1;
            this.productList_pagination.param.status="";
            this.productList_pagination.param.genreId="";
            this.reloadPage(this.productList_pagination);
        },
        fetchChannelGeneralInfoV(){
            AppApi.fetchChannelGeneralInfo(currentOch).then(response=>{
                if(response.data.code == 200){
                    this.general= !response.data.channel ? {} : response.data.channel;
                    this.general.och = currentOch;
                    document.title = this.general.channelName + " | 商品管理";
                }
            });
        },

        showAddProductGenreModalV(){
            this.newGenre.genreName="";
            $("#addProductGenreModal").modal("show");
        },
        closeCreateGenreModalV(){
            $("#addProductGenreModal").modal("hide");
        },
        createGenreV(){
            createGenre(this.newGenre).then(response=>{
                if(response.data.code == 200){
                    this.loadGenreListV();
                    $("#addProductGenreModal").modal("hide");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        showEditProductGenreModalV(genre){
            $("#generMangementModal").modal("hide");
            this.editGenre.genreName=genre.genreName;
            this.editGenre.genreId=genre.genreId;
            this.btn_ctl.editGenreModal_already_change=false;
            $("#editProductGenreModal").modal("show");
        },
        changeGenreNameV(){
            changeGenreName(this.editGenre).then(response=>{
                if(response.data.code == 200){
                    this.loadGenreListV();
                    this.closeEditGenreModalV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        closeEditGenreModalV(){
            $("#editProductGenreModal").modal("hide");

            this.showProductGenreManagementModalV();
        },
        showProductGenreManagementModalV(){
            $("#generMangementModal").modal("show");
        },
        delGenreV(genreId){
            delGenre(genreId).then(response=>{
                if(response.data.code == 200){
                    this.loadGenreListV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        onlineProductV(productId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForProduct(productId,ProductStatus.Online).then(response=>{
                if(response.data.code == 200){
                    this.reloadPage(this.productList_pagination);
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        offlineProductV(productId){
            // code 1--draft ; 2--onsale; 3--offsale;
            onOrOffSaleForProduct(productId,ProductStatus.Offline).then(response=>{
                if(response.data.code == 200){
                    this.reloadPage(this.productList_pagination);
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        showNewProductModalV(){
            this.newProduct= this.initNewProductV();
            this.genreSelectedItem="";
            // focus bug fix
            var el=document.getElementById('newProductModal');
            disableFocusTabbable(el);
            // editor
            quillForNewProductModalShippingTerm.root.innerHTML = '';
            $("#newProductModal").modal("show");
        },
        createProductV(){
            createProduct(this).then(response=>{
                if(response.data.code == 200){
                    
                    this.reloadPage(this.productList_pagination);
                    this.closeNewProductModalV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        closeNewProductModalV(){
            $("#newProductModal").modal("hide");
        },
        showEditProductModalV(productId){

            findProductProfile(productId).then(response=>{
                if(response.data.code == 200){
                    const productInfo=response.data.product;

                    this.editProduct={
                        productId: productInfo.productId,
                        productName: productInfo.productName,
                        productCode: productInfo.productCode,
                        price: productInfo.price,
                        inventory: productInfo.inventory,
                        salesQuota: productInfo.salesQuota,
                        salesQuotaType: productInfo.salesQuotaType,
                        releaseAt: productInfo.releaseAt,
                        estimatedDeliveryAt: productInfo.estimatedDeliveryAt,
                        genreId: productInfo.genreId,
                        shippingType: productInfo.shippingType,
                        shippingTerm: productInfo.shippingTerm,
                        warmReminder: productInfo.warmReminder,
                        productThumbnailFileUrl: productInfo.thumbnail,
                        productThumbnailFile: ""
                    }

                    this.genreSelectedItem=productInfo.genreId;

                    var fileInputEl=document.getElementById("edit_file_thumbnail");
                    if(!!fileInputEl){
                        fileInputEl.value=null;
                    }

                    quillForEditProductModalShippingTerm.root.innerHTML = '';
                    quillForEditProductModalShippingTerm.clipboard.dangerouslyPasteHTML(0, productInfo.shippingTerm);  
                    this.productProfile=JSON.parse(JSON.stringify(this.editProduct));


                     // focus bug fix
                    var el=document.getElementById('editProductModal');
                    disableFocusTabbable(el);

                    $("#editProductModal").modal("show");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
       
        },
        editProductV(){
            editProduct(this).then(response=>{
                if(response.data.code == 200){
                    
                    this.reloadPage(this.productList_pagination);
                    this.closeEditProductModalV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        closeEditProductModalV(){
            $("#editProductModal").modal("hide");
        },
        deleteProductV(productId){
            deleteProduct(productId).then(response=>{
                if(response.data.code == 200){
                    
                    this.reloadPage(this.productList_pagination);
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        previewEditProductThumbnailV(e){
            previewEditProductThumbnail(e,this);
        },
        previewNewProductThumbnailV(e){
            previewNewProductThumbnail(e,this);
        },
        userInputDatePickerHandlerV(e){    

            if(!e.target.dataset.olddate){
                e.target.dataset.olddate="2022-02-21";
            }
            e.target.value =  e.target.dataset.olddate;
            $("#" + e.target.id).datepicker("setDate", e.target.dataset.olddate);
            if(!!e.data){
                e.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
    
        },
        transformInputNumberAsPositiveDecimalV(e){
           return transformInputNumberAsPositiveDecimal(e);
        },
        transformInputNumberAsPositiveV(e){
           return transformInputNumberAsPositive(e);
        },
        transformInputTextV(e){
            return transformInputText(e);
        }
        
    },
    mounted(){
        quillForNewProductModalShippingTerm=new Quill('#editorForNew', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });
        quillForEditProductModalShippingTerm=new Quill('#editorForChange', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });
    },
    updated(){
        
        $(function() {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

  

  }
}

let app =  createApp(RootComponent);
app.component("model-select",ModelSelect);

app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(Pagination);
app.mixin(ImageAdaptiveComponent);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);


const redeemAppProduct = app.mount('#app');

window.redeemAppProductPage = redeemAppProduct;


// init 
redeemAppProduct.userAdapter(); // auth.js
redeemAppProduct.pageInit(redeemAppProduct.productList_pagination);
redeemAppProduct.fetchChannelGeneralInfoV();
redeemAppProduct.loadGenreListV();


async function fetchGenreList(channel,q){
    const url="/api/v1/app/redeem/genre/list?channel="+channel+"&q="+q;
    return await axios.get(url);
}

async function doCreateGenre(dto){
    const url="/api/v1/app/redeem/genre/new";
    return await axios.post(url,dto);
}
async function doDelGenre(genreId){
    const url="/api/v1/app/redeem/genre/{id}/remove".replace("{id}",genreId);
    return await axios.delete(url);
}
async function doChangeGenreName(dto){
    const url="/api/v1/app/redeem/genre/edit";
    return await axios.put(url,dto);
}
async function modifyProductStatus(productId,status){
    var url = "/api/v1/app/redeem/admin/product/mark";
    const dto = {
      productId,
      status
    }
    return await axios.put(url,dto);
} 


async function doCreateProduct(appObj){
    var form=new FormData();
    form.append("channel",appObj.newProduct.channel);
    form.append("productName",appObj.newProduct.productName);
    form.append("productCode",appObj.newProduct.productCode);
    form.append("price",appObj.newProduct.price);
    form.append("inventory",appObj.newProduct.inventory);
    form.append("salesQuota",appObj.newProduct.salesQuota);
    form.append("salesQuotaType",appObj.newProduct.salesQuotaType);
    form.append("releaseAt",appObj.newProduct.releaseAt);
    form.append("estimatedDeliveryAt",appObj.newProduct.estimatedDeliveryAt);
    form.append("genreId",appObj.genreSelectedItem);
    form.append("shippingType",appObj.newProduct.shippingType);
    form.append("shippingTerm",appObj.newProduct.shippingTerm);
    form.append("warmReminder",appObj.newProduct.warmReminder);
    form.append("thumbnail",appObj.newProduct.productThumbnailFile);

    var url="/api/v1/app/redeem/product/new";
    return await axios.post(url,form);
}

async function fetchProductInfo(productId){
    const url="/api/v1/app/redeem/product/{id}/profile".replace("{id}",productId);
    return await axios.get(url);
}
async function doEditProduct(appObj){
    var form=new FormData();
    form.append("productId",appObj.editProduct.productId);
    form.append("productName",appObj.editProduct.productName);
    form.append("productCode",appObj.editProduct.productCode);
    form.append("price",appObj.editProduct.price);
    form.append("inventory",appObj.editProduct.inventory);
    form.append("salesQuota",appObj.editProduct.salesQuota);
    form.append("salesQuotaType",appObj.editProduct.salesQuotaType);
    form.append("releaseAt",appObj.editProduct.releaseAt);
    form.append("estimatedDeliveryAt",appObj.editProduct.estimatedDeliveryAt);
    form.append("genreId",appObj.genreSelectedItem);
    form.append("shippingType",appObj.editProduct.shippingType);
    form.append("shippingTerm",appObj.editProduct.shippingTerm);
    form.append("warmReminder",appObj.editProduct.warmReminder);
    form.append("thumbnail",appObj.editProduct.productThumbnailFile);

    var url="/api/v1/app/redeem/product/change";
    return await axios.put(url,form);
}
async function removeProduct(productId){
    const url="/api/v1/app/redeem/admin/product/{id}/remove".replace("{id}",productId);
    return await axios.delete(url);
}
async function doChangeProductCover(productId,thumbnail){
    var fd = new FormData();
    fd.append('productId', productId);
    fd.append('thumbnail', thumbnail);
    const url = "/api/v1/app/redeem/product/thumbnail/change";
    return await axios.put(url, fd);
}

async function doChangeGenreSort(genreId,direction){
    const dto={
        genreId: genreId,
        direction: direction
    }
    const url="/api/v1/app/redeem/genre/sort";
    return await axios.put(url,dto)
}
async function changeGenreSort(genreId,direction){
    return await doChangeGenreSort(genreId,direction);
}
async function changeProductCover(){
    const thumbnailFile = document.getElementById("edit_file_thumbnail").files[0];
    const productId=redeemAppProduct.editProduct.productId;
    return await doChangeProductCover(productId,thumbnailFile);
}
async function deleteProduct(productId){
   return await removeProduct(productId);
}
async function editProduct(appObj){


    if(!quillForEditProductModalShippingTerm.getText().trim()){
        customAlert.alert("权益须知未填写！")
        return;
     }

    // max length == 3000
    if(appObj.editProduct.shippingTerm.length>3000){
      customAlert.alert("权益须知内容长度超出容量，需要重新调整！")
      return;
    }
   return await doEditProduct(appObj);
}
async function findProductProfile(productId){
    return await fetchProductInfo(productId);
}
async function createProduct(appObj){

    if(!quillForNewProductModalShippingTerm.getText().trim()){
        customAlert.alert("权益须知未填写！")
        return;
     }

    appObj.newProduct.shippingTerm = quillForNewProductModalShippingTerm.getSemanticHTML();


    // max length == 3000
    if(appObj.newProduct.shippingTerm.length>3000){
      customAlert.alert("权益须知内容长度超出容量，需要重新调整！")
      return;
    }
 
  return await  doCreateProduct(appObj);
}


async function onOrOffSaleForProduct(productId,status){
    return await modifyProductStatus(productId,status);
}
async function changeGenreName(dto){
   return await doChangeGenreName(dto);
}
async function delGenre(genreId){
   return await doDelGenre(genreId);
}
async function createGenre(dto){
   return await doCreateGenre(dto);
}

async function loadGenreList(channel){
   return await fetchGenreList(channel,'');
}


function previewNewProductThumbnail(e,appObj){

    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.newProduct.productThumbnailFile = file;

    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
  
    const feedThumbnailImgFile = new Image();
      feedThumbnailImgFile.onload = ()=> {
  
          // validate image pixel
          if(!(feedThumbnailImgFile.width>=99 && feedThumbnailImgFile.height>=99 && feedThumbnailImgFile.width<4096 && feedThumbnailImgFile.height<4096 && feedThumbnailImgFile.height * feedThumbnailImgFile.width <9437184)){
              console.log("current image: width=" + feedThumbnailImgFile.width + "  height="+feedThumbnailImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
   
  
          appObj.newProduct.productThumbnailFileUrl = URL2;
  
  
      };
  
     feedThumbnailImgFile.src = URL.createObjectURL(file);
  
}


function previewEditProductThumbnail(e,appObj){

    const file = e.target.files[0];
    if(!file){
        return ;
    }
    appObj.editProduct.productThumbnailFile = file;

    const URL2 = URL.createObjectURL(file);
  
    // validate image size <=6M
    var size = parseFloat(file.size);
    var maxSizeMB = 6; //Size in MB.
    var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
    if (size > maxSize) {
        customAlert.alert("图片最大为6M!");
        return false;
    }
  
    const feedThumbnailImgFile = new Image();
      feedThumbnailImgFile.onload = ()=> {
  
          // validate image pixel
          if(!(feedThumbnailImgFile.width>=99 && feedThumbnailImgFile.height>=99 && feedThumbnailImgFile.width<4096 && feedThumbnailImgFile.height<4096 && feedThumbnailImgFile.height * feedThumbnailImgFile.width <9437184)){
              console.log("current image: width=" + feedThumbnailImgFile.width + "  height="+feedThumbnailImgFile.height);
              customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
              return false;
          }
          appObj.btn_ctl.material_uploading=true; 

           // upload product cover file
        changeProductCover().then(response=>{

            if(response.data.code == 200){
              appObj.editProduct.productThumbnailFileUrl = URL2;
              redeemAppProduct.reloadPage(redeemAppProduct.productList_pagination);
            }
            if(response.data.code!=200){
              const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(error);
            }
            appObj.btn_ctl.material_uploading=false; 

        })
   
  
  
  
      };
  
     feedThumbnailImgFile.src = URL.createObjectURL(file);
  
}


quillForEditProductModalShippingTerm.on('text-change', () => {
    redeemAppProduct.editProduct.shippingTerm =quillForEditProductModalShippingTerm.getSemanticHTML();
 });

 quillForNewProductModalShippingTerm.on('text-change', () => {
    redeemAppProduct.newProduct.shippingTerm =quillForEditProductModalShippingTerm.getSemanticHTML();
 });



 $( ".datepicker" ).datepicker({
    dateFormat: "yy-mm-dd",
    duration: "fast",
    onSelect: function(selectedDate,inst) {
        if(inst.lastVal !=selectedDate){
            document.getElementById(inst.id).dataset.olddate=selectedDate;
            document.getElementById(inst.id).dispatchEvent(new Event('input'))
            document.getElementById(inst.id).dispatchEvent(new Event('change'))
        }
    }
});



$( ".datepicker" ).datepicker( $.datepicker.regional[ "zh-CN" ] );


function disableFocusTabbable(element){


    var  focusableEls =  element.querySelectorAll('a[href], .ql-editor, area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
     var focusableElsArr = Array.prototype.slice.call(focusableEls);
   
     focusableElsArr.forEach(e=>{
        e.setAttribute("tabindex", "-1");
     })

    
}

function  transformInputText(e){
    var val = e.target.value.replace(/[^\a-\z\A-\Z0-9\_]/g,'');// type int
    const needUpdate = (val !== e.target.value);
    if(needUpdate){
        e.target.value=val;
        e.currentTarget.dispatchEvent(new Event('input')); // update v-model
    }
}
