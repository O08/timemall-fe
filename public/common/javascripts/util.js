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


export function formatCmpctNumber(number) {
    var options = {
        notation: "compact",
        compactDisplay: "short",
    };
    const usformatter = Intl.NumberFormat("zh-CN", options);
    return usformatter.format(number);
}