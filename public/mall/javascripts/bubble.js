import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
// import InfiniteLoading from "v3-infinite-loading";
// import "v3-infinite-loading/lib/style.css"; 

import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";

// var Sticky = require('sticky-js');
// var sticky = new Sticky('.sticky');
// sticky.update();


const RootComponent = {
    data() {
        return {
            cellListInfo: {},
            cells: {},
            count: 10,
            queryParam: initQueryParam()
        }
    },
    methods: {
        loadCellListsV(){
            loadCellLists();
        },
        loadAllCellForBrandV(){
            loadAllCellForBrand();
        },
        infiniteHandler(){
            infiniteBrandCell();
        },
        initServiceTabV(){
            initServiceTab();
        }

    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
// app.component("infinite-loading", InfiniteLoading);
const bubblePage = app.mount('#app');
window.bubble = bubblePage;

function getMutilpleCellList(brandId)
{
    const url = "/api/v1/web_mall/brand/{brand_id}/celllist".replace("{brand_id}",brandId);
    $.get(url,function(data) {
        if(data.code == 200){
            bubblePage.cellListInfo = data.cellListInfo;
        }
       })
         .fail(function(data) {
           // place error code here
         });
}
function getBrandMutipleCell(param){
    var res = {};
    $.ajaxSetup({async: false});
    $.get('/api/v1/web_mall/brandCells', param,function(data) {
        if(data.code == 200){
            res = data.cells;
        }
       })
         .fail(function(data) {
           // place error code here
         });
    return res;
 }

 function initQueryParam(){
    return {
      brandId: getQueryVariable("brand_id"),
      sbu: 'day',
      current: 1,
      size: 2
    }
   }
function loadAllCellForBrand(){
    // getMutipleCell(); // todo 
    mockCells();

}
function loadCellLists()
{
    const brandId= getQueryVariable("brand_id");
            if(!brandId){
                return;
            }
    getMutilpleCellList(brandId);// todo
    // mockCellListInfo();
}
function initServiceTab(){
    if(!bubblePage.queryParam.brandId){
        return
    }
    const data = getBrandMutipleCell(bubblePage.queryParam);
    bubblePage.cells = data.records;
    bubblePage.queryParam.pages = data.pages;
    
}
function infiniteBrandCell(){
    if(!bubblePage.queryParam.brandId){
        return
    }
    if(bubblePage.queryParam.current +1 > bubblePage.queryParam.pages){
        return ;
    
    }
    // loading data
    bubblePage.queryParam.current = bubblePage.queryParam.current + 1;
    const data =getBrandMutipleCell(bubblePage.queryParam);
    bubblePage.cells.push(...data.records);
    bubblePage.queryParam.pages = data.pages;
}

function mockCells()
{
    const example = {
        "code": 2,
        "message": "sunt dolore in magna",
        "cells": {
            "records": [
                {
                    "brand": "David",
                    "avator": "http://dummyimage.com/234x60",
                    "title": "为你写诗，为你舞",
                    "price": 69,
                    "id": "87",
                    "sbu": "Day",
                    "preview": "https://picsum.photos/200/300"
                }
            ],
            "total": 21,
            "size": 66,
            "current": 98,
            "pages": 46
        }
    }
   bubblePage.cells = example.cells.records;
}
// init 
bubblePage.loadCellListsV();
// bubblePage.loadAllCellForBrandV();
bubblePage.initServiceTabV();

//文档高度
function getDocumentTop() {
    var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}
//可视窗口高度
function getWindowHeight() {
    var windowHeight = 0;
    if (document.compatMode == "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}

//滚动条滚动高度
function getScrollHeight() {
    var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
    if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
    }

    if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
}


/*
当滚动条滑动，触发事件，判断是否到达最底部
然后调用ajax处理函数异步加载数据
*/
window.onscroll = function () {
    //监听事件内容
    if (getScrollHeight() == getWindowHeight() + getDocumentTop()) {
        //当滚动条到底时,这里是触发内容
        //异步请求数据,局部刷新dom
        // service library 激活时，滚动到底部需要加载数据
       const serviceTabIsActive = $("#service-tab-pane").hasClass("active");
       if(serviceTabIsActive){
        bubblePage.infiniteHandler();
       }
    }
}
