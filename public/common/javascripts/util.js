// get url variable value
export function getQueryVariable(variable){
        const url = new URL(window.location.href);
        const value = url.searchParams.get(variable);
        return value;
  }

  export function getDaysBetween(date_1, date_2) {
        // 计算两个日期之间的差值
        let totalDays,diffDate
        let myDate_1 = Date.parse(date_1)
        let myDate_2 = Date.parse(date_2)
        // 将两个日期都转换为毫秒格式，然后做差
        diffDate = Math.abs(myDate_1 - myDate_2) // 取相差毫秒数的绝对值
       
        totalDays = Math.floor(diffDate / (1000 * 3600 * 24)) // 向下取整

        return totalDays    // 相差的天数
}
export function getSecondsBetween(date_1,date_2){
   var dif = Math.round(date_1 - date_2) / 1000;
   return dif;
}
export function parseIpLocationCityInfo(cityInfo){
      if (!!cityInfo) {
          cityInfo = cityInfo.replace("|", " ");
          var cityList = cityInfo.split(" ");
          if (cityList.length > 0) {
              // 国内的显示到具体的市
              if ("中国"==cityList[0]) {
                  if (cityList.length > 2) {
                      return cityList[2];
                  }
                  if (cityList.length > 1) {
                      return cityList[1];
                  }
              }
              // 国外显示到国家
              return cityList[0];
          }
      }
      return "未知";
}

export function  transformInputNumberAsPositive(e){
    var val = Number(e.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
    var min = Number(e.target.min);
    var max = Number(e.target.max);
    e.target.value = transformInputAsNumber(val, min, max);
    const firstCodeIsZero= e.data=='0' && !e.target.value;
    const supportCodes = ["0", "1", "2","3","4","5","6","7","8","9"];
    const needUpdate = firstCodeIsZero || (val !== Number(e.target.value)) || (!!e.data && !supportCodes.includes(e.data));
    if(needUpdate){
        e.currentTarget.dispatchEvent(new Event('input')); // update v-model
    }
}

function transformInputAsNumber(val,min,max){
    val = val ? val == 0 ? 0 : val : val; // cope with 0000000
    return val < min ? "" : val > max ? max : val;
}

export function transformInputNumberAsPositiveDecimal(e){
    var val = e.target.value.match(/\d+(\.\d{0,2})?/) ? e.target.value.match(/\d+(\.\d{0,2})?/)[0] : '';// type positve number
    var max = e.target.max;
    e.target.value = transformInputNumberDecimal(val, max);
    const firstCodeIsZero= e.data=='0' && !e.target.value;
    const supportCodes = ["0", "1", "2","3","4","5","6","7","8","9","."];
    const inputCodeValid = !!e.data && !supportCodes.includes(e.data);
    const needUpdate = firstCodeIsZero || (Number(val) != Number(e.target.value)) || inputCodeValid;

    if(needUpdate){
      e.currentTarget.dispatchEvent(new Event('input')); // update v-model
    }
}

function transformInputNumberDecimal(val,max){
    return  Number(val) > Number(max) ? max : val.split('').pop() === '.' || !val || val.endsWith(".0") ? val : Number(val);
}


export function formatCmpctNumber(number) {
    var options = {
        notation: "compact",
        compactDisplay: "short",
    };
    const usformatter = Intl.NumberFormat("zh-CN", options);
    return usformatter.format(number);
}

/**
 * Unix时间戳转换为当前时间多久之前
 * @param timespan  int         Unix时间戳
 * @return timeSpanStr  string      转换之后的前台需要的字符串
 */
export function Ftime (timespan) {
    var dateTime = new Date(timespan * 1000);
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    //当前时间
    var now = Date.parse(new Date());  //typescript转换写法
    var milliseconds = 0;
    var timeSpanStr;
    //计算时间差
    milliseconds = (now / 1000) - timespan;

    //一分钟以内
    if (milliseconds <= 60) {
        timeSpanStr = '刚刚';
    }
    //大于一分钟小于一小时
    else if (60 < milliseconds && milliseconds <= 60 * 60) {
        timeSpanStr = Math.ceil((milliseconds / (60))) + ' 分钟前';
    }
    //大于一小时小于等于一天
    else if (60 * 60 < milliseconds && milliseconds <= 60 * 60 * 24) {
        timeSpanStr = Math.ceil(milliseconds / (60 * 60)) + ' 小时前';
    }
    //大于一天小于等于15天
    else if (60 * 60 * 24 < milliseconds && milliseconds <= 60 * 60 * 24 * 30) {
        timeSpanStr = Math.ceil(milliseconds / (60 * 60 * 24)) + ' 天前';
    }
    //大于一个月小于一年
    else if (60 * 60 * 24 * 30 < milliseconds && milliseconds <= 60 * 60 * 24 * 30 * 12){
        timeSpanStr = Math.ceil(milliseconds / (60 * 60 * 24 * 30)) + ' 个月前';
    }
    //超过一年显示
    else {
        timeSpanStr = Math.ceil(milliseconds / (60 * 60 * 24 * 30 * 12)) + ' 年前';
    }
    return timeSpanStr;
}


const isValidUrl = urlString=> {
    var url;
    try { 
          url =new URL(urlString); 
    }
    catch(e){ 
      return false; 
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
export function isValidHttpUrl(urlString){
var valid= isValidUrl(urlString);

if(!valid && urlString.includes('.') && !urlString.endsWith('.')){
valid = true;
}
return valid;
}

export  function isValidHttpUrlNeedScheme(urlString){
  if(urlString.startsWith("http://") || urlString.startsWith("https://") ){
    return isValidHttpUrl(urlString);
  }
  return false;
  
}

export function validateEmailOrPhoneInput(input) {
  var combinedRegex = /^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}|1[3-9]\d{9})$/;
  return combinedRegex.test(input);
}

export function renderDateInChina(dateStr){
    if(!dateStr){
        return ""
    }
       
    var targetDate =new Date(dateStr);
    const year=targetDate.getFullYear();
    const month=targetDate.getMonth()+1;
    const day=targetDate.getDate();
    const hour=targetDate.getHours();
    const minute=targetDate.getMinutes();

    return `${year}年${month}月${day}日 ${hour}:${minute}`;

}

export function renderDateToDayInChina(dateStr){
    if(!dateStr){
        return ""
    }
       
    var targetDate =new Date(dateStr);
    const year=targetDate.getFullYear();
    const month=targetDate.getMonth()+1;
    const day=targetDate.getDate();

    return `${year}年${month}月${day}日`;
}

export function getDayName(d){
		

   var td=new Date();
   td=new Date(td.getFullYear(),td.getMonth(),td.getDate());
   var od=new Date(d);
   od=new Date(od.getFullYear(),od.getMonth(),od.getDate());
   var xc=(od-td)/1000/60/60/24;
   if(xc<-2){
      return -xc+"天前";
   }else if(xc<-1){
      return "前天";
   }else if(xc<0){
      return "昨天";
   }else if(xc==0){
      return "今天";
   }else if(xc<2){
      return "明天";
   }else if(xc<3){
      return "后天";
   }else{
      return xc+"天后";
   }
}



export function formatTime(date) {
    if(!date) return;
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    
    return renderDateToDayInChina(date);
}


// 根据文件名和类型获取图标
export function getFileIcon(fileName) {
    if(!fileName) return 'fas fa-file';
    const ext = fileName.split('.').pop().toLowerCase();
    
    // 文档类
    if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'fas fa-file-excel';
    if (['ppt', 'pptx'].includes(ext)) return 'fas fa-file-powerpoint';
    if (['pdf'].includes(ext)) return 'fas fa-file-pdf';
    
    // 压缩文件
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'fas fa-file-archive';
    
    // 代码文件
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'h'].includes(ext)) {
        return 'fas fa-file-code';
    }
    
    // 音频
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return 'fas fa-file-audio';
    
    // 视频
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) return 'fas fa-file-video';
    
    // 图片
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return 'fas fa-file-image';
    
    // 文本文件
    if (['txt', 'md', 'log'].includes(ext)) return 'fas fa-file-alt';
    
    // 默认
    return 'fas fa-file';
}

// 格式化文件大小
export function formatFileSize(bytes) {
    if(!bytes) return;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 数字格式化函数
export function formatNumber(num) {
    if(num=='0') return num;
    if(!num) return;
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num.toString();
}
