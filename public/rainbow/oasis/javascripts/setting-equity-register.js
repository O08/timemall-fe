import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from "axios";

import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import Pagination  from "/common/javascripts/pagination-vue.js";
import {renderDateToDayInChina, transformInputNumberAsRangePositiveDecimal,transformInputNumberAsPositive } from "/common/javascripts/util.js";



let customAlert = new CustomAlertModal();

const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,] = segments;

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
});


const RootComponent = {
    data() {
      return {
        tooltip: {
          visible: false,
          x: 0,
          y: 0,
          data: {}
        },
        sliderMin: 1,
        sliderMax: 5,
        init_finish: false,
        oasisAvatarDefault,
        oasisId: "",
        oasisHandle: "",
        announce: {},
        oasisAccount: {},
        trendChart:[],
        oassisLatestEquitySummary: {},
        lineTrendConfig: {
          width: 600,
          height: 240,
          padding: 60,   // Left/Right margin
          baseY: 180,    // Where the "zero" line roughly is
          maxHeight: 130 // Max height of the peaks
        },
        newPeriod:{
          oasisId: "",
          price: "",
          shares: "",
          earningYield: ""
        },
        period_pagination: {
          url: "/api/v1/team/oasis/equity/period/query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          param: {
            oasisId: ""
          },
          paramHandler: (info)=>{
              info.param.oasisId = this.oasisId;
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.period_pagination.size = response.period.size;
                  this.period_pagination.current = response.period.current;
                  this.period_pagination.total = response.period.total;
                  this.period_pagination.pages = response.period.pages;
                  this.period_pagination.records = response.period.records;
                  this.period_pagination.paging = this.doPaging({current: response.period.current, pages: response.period.pages, size: 5});
  
              }
          }
      },
      }
    },

    methods: {
      renderDateToDayInChinaV(dateStr) {
        return renderDateToDayInChina(dateStr)
      },
      transformInputNumberAsPositiveV(event) {
        return transformInputNumberAsPositive(event);
      },
      transformInputNumberAsRangePositiveDecimalV(event) {
        return transformInputNumberAsRangePositiveDecimal(event);
      },
      registerPeriodV() {
        if(!this.newPeriod.shares || !this.newPeriod.price) return;
        if(Number(this.newPeriod.shares)<10){
          customAlert.alert("注册份数最少为 10 份")
          return
        }
        registerPeriod(this.newPeriod).then(response => {
          if (response.data.code == 200) {

            this.reloadPage(this.period_pagination);
            this.closeIssueEquityModalV();

          }
          if (response.data.code != 200) {
            const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
            customAlert.alert(error);
          }
        }).catch(error => {
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },
      findOasisBalanceSummaryV() {
        findOasisBalanceSummary(this.oasisId).then(response => {
          if (response.data.code == 200) {
            this.trendChart = response.data.chart;
          }
        });
      },
      loadOasisLatestPeriodEquitySummaryV() {
        OasisApi.loadOasisLatestPeriodEquitySummary(this.oasisId).then(response => {
          if (response.data.code == 200) {

            this.oassisLatestEquitySummary = response.data.summary;

          }
        })
      },
      showIssueEquityModalV() {
        this.newPeriod = {
          oasisId: this.oasisId,
          price: "1",
          shares: "10",
          earningYield: "1.13"
        }
        $("#issueEquityModal").modal("show");
      },
      closeIssueEquityModalV() {
        $("#issueEquityModal").modal("hide");
      },
      retrieveOasisFinInfoV() {
        OasisApi.retrieveOasisFinInfo(this.oasisId).then(response => {
          if (response.data.code == 200) {
            this.oasisAccount.drawable = response.data.billboard.drawable;
          }
        });
      },
      setMultiplierV(toEarningYield) {
        this.newPeriod.earningYield = toEarningYield;
      },
      async initPageDataV() {
        const response = await OasisApi.loadAnnounceUsingHandle(currentOasisHandle);
        if (response.data.code == 200) {
          this.announce = response.data.announce;

          if (!this.announce || this.announce.initiator != this.getIdentity().brandId) {
            window.location.href = "/rainbow/teixcalaanli";
          }

          this.oasisId = this.announce.id;
          this.oasisHandle = this.announce.handle;

          this.findOasisBalanceSummaryV();
          this.loadOasisLatestPeriodEquitySummaryV();
          this.retrieveOasisFinInfoV();

          this.pageInit(this.period_pagination);


        }
      },
      periodSoldProgress(period) {
        const getRatio = (period) => (Number(period.shares) > 0 ? (100 * Number(period.sold)) / Number(period.shares) : 0);
        return Number(getRatio(period).toFixed(2));
      },
      writeOffProgress(period) {
        const getRatio = (period) => (Number(period.shares) > 0 ? (100 * (Number(period.redemption) + Number(period.writeOff))) / Number(period.shares) : 0);
        return Number(getRatio(period).toFixed(2));
      },
      showTooltip(event, point) {
    
        // 兼容鼠标 event.currentTarget 和 触摸 event.target
        const target = event.currentTarget || event.target;
        const container = target.closest('.chart-container');
        const rect = container.getBoundingClientRect();

        this.tooltip.visible = true;
        this.tooltip.data = point;

        // 这里的比例计算需要严格基于 currentTarget 的实际尺寸
        const scaleX = rect.width / 600;
        const scaleY = rect.height / 240;

        this.tooltip.x = point.x * scaleX;
        this.tooltip.y = (point.y * scaleY) - 40;
      },
      hideTooltip() {
        this.tooltip.visible = false;
      },
      displayTbCredit(period) {
        const numericFee = Number(period.price) * Number(period.shares);
        return currencyFormatter.format(numericFee);
      },
        
    },
    computed: {

      totalCredit(){
        const numericFee = this.newPeriod.price ? Number(this.newPeriod.shares)*Number(this.newPeriod.price) : 0;
        return currencyFormatter.format(numericFee);
      },


      sliderBackground() {
        const percentage = ((this.newPeriod.earningYield - this.sliderMin) / (this.sliderMax - this.sliderMin)) * 100;
        return {
          // 左侧蓝色进度，右侧深色轨道
          background: `linear-gradient(to right, #3b82f6 ${percentage}%, #000 ${percentage}%)`
        };
      },

      pieStyle(){
        let currentDegree = 0;
        const gradients = this.pieData.map(item => {
            const start = currentDegree;
            const end = currentDegree + (parseFloat(item.percentage) * 3.6);
            currentDegree = end;
            return `${item.color} ${start}deg ${end}deg`;
        });

        return `conic-gradient(from 0deg, ${gradients.join(', ')})`;

      },
      pieData() {
        const s = this.oassisLatestEquitySummary || {};
        const total = parseFloat(s.shares) || 0;
        
        // 核心字段映射
        const writeOffVal = parseFloat(s.writeOff) || 0;     // 已核销
        const redemptionVal = parseFloat(s.redemption) || 0; // 已注销
        // 待回收 = 总份额 - 已核销 - 已注销
        const pendingVal = Math.max(0, total - writeOffVal - redemptionVal);

        if (total === 0) {
           return [{ label: '无数据', percentage: 0, color: '#334155' }];
        }

        const getP = (val) => ((val / total) * 100).toFixed(2);

        return  [
          { label: '已核销', percentage: getP(writeOffVal), color: '#794cdb' },
          { label: '已注销', percentage: getP(redemptionVal), color: '#10b981' },
          { label: '待回收', percentage: getP(pendingVal), color: '#f59e0b' }
        ]
     
  
      },
      // 1. Calculate the coordinates for each data point
      mappedPoints() {
        // 防御处理：如果没有数据，返回空数组
        if (!this.trendChart || this.trendChart.length === 0) return [];

        const { padding, width, baseY, maxHeight } = this.lineTrendConfig;
        const drawableWidth = width - padding * 2;
        
        // 提取数值
        const values = this.trendChart.map(d => parseFloat(d.balance) || 0);
        const maxVal = Math.max(...values);
        // 如果最大值为0，设为1防止除以零
        const safeMax = maxVal === 0 ? 1 : maxVal;

        return this.trendChart.map((item, index) => {
            const val = parseFloat(item.balance) || 0;
            return {
                // 计算 X：如果只有一个点，放在中间；多个点则平分
                x: this.trendChart.length > 1 
                   ? padding + (index * (drawableWidth / (this.trendChart.length - 1)))
                   : width / 2,
                // 计算 Y
                y: baseY - (val / safeMax) * maxHeight,
                reportMonth: item.reportMonth,
                balance: item.balance
            };
        });
      },
      // 2. Format coordinates into the "x1,y1 x2,y2" string for <polyline>
      pointString() {
        return this.mappedPoints.map(p => `${p.x},${p.y}`).join(' ');
      }
    },
    mounted() {
      document.addEventListener('touchstart', (e) => {
        // 如果点击的不是 line trend SVG 内部的热区，则隐藏
        if (!e.target.closest('g')) {
          this.tooltip.visible = false;
        }
      }, { passive: true });
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

    }
}



let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingRegisterEquity = app.mount('#app');

window.settingRegisterEquityPage = settingRegisterEquity;

// init
settingRegisterEquity.initPageDataV();

async function doFetchOasisBalanceSummary(oasisId){
  const url = "/api/v1/team/oasis/{id}/balance/trend".replace("{id}",oasisId);
  return await axios.get(url);
}

async function doRegisterNewPeriod(dto){
  const url = "/api/v1/team/oasis/equity/register";
  return await   axios.post(url, dto);
}

async function registerPeriod(dto){
  return await doRegisterNewPeriod(dto);
}

async function findOasisBalanceSummary(oasisId){
  return await doFetchOasisBalanceSummary(oasisId);
}
