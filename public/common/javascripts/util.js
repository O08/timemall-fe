// get url variable value
export function getQueryVariable(variable){
    var query = window.location.search.substring(1);
           var vars = query.split("&");
           for (var i=0;i<vars.length;i++) {
                   var pair = vars[i].split("=");
                   if(pair[0] == variable){return pair[1];}
           }
           return(false);
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
