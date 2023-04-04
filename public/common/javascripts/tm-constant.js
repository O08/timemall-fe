var PriceSbu = new Map();
PriceSbu.set("second", "秒");
PriceSbu.set("minute", "分钟");
PriceSbu.set("hour","小时");
PriceSbu.set("day", "天");
PriceSbu.set("week", "周");
PriceSbu.set("month" ,"月");
PriceSbu.set("quarter", "季度");
PriceSbu.set( "year","年");

var CellStatus = Object.freeze({
    "Draft":1,
    "Online":2,
    "Offline":3
});

var WorkflowStatus = Object.freeze({
    "InQueue": 1, // 队列中
    "Auditing": 2, // 审计中
    "Audited": 3, // 审计完成
    "Starred": 4, // 已定稿，履约中
    "Suspend": 5, // 中止
    "Paused": 6, // 停止
    "Finish": 7 // 已经完成
});
var BillStatus = Object.freeze({
    "Created": 1, // 创建
    "Pending":2, // 未支付
    "Paid":3 // 已支付
});

var ObjOd = Object.freeze({
    "SPONSOR": "1", // 发起人
    "TARGET": "2" // 目标交易方
});
var ObjMark = Object.freeze({
    "COOPERATION": "1", // 合作意向
    "OWNED": "2", // 达成合作
    "END": "3", // 结束
    "DENY": "4" // 拒绝
    });   

var ObjTag = Object.freeze({
     "CREATED": "1", // 创建
     "PUBLISH": "2", // 上线交易
     "OFFLINE": "3", // 下线交易
     "IN_USE": "4" //已使用
});

var OasisMark = Object.freeze({
    "CREATED": "1", // 创建
    "PUBLISH": "2" // 发布
});

var CommissionTag = Object.freeze({
    "CREATED": "1", // 创建
    "ACCEPT": "2", // 接受任务
    "DENY": "3", // 拒绝任务
    "FINISH": "4" // 完成任务
})    
export {
    ObjMark,ObjTag,OasisMark,CommissionTag,
    PriceSbu, CellStatus,WorkflowStatus,BillStatus,ObjOd
} ;