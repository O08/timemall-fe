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
});
var EventFeedScene = Object.freeze({
    "POD": "pod", // e - pod
    "STUDIO": "studio"// e - studio
});  
var EventFeedMark = Object.freeze({
    "CREATED": "created", // e - pod
    "PROCESSED": "processed"// e - studio
}); 
var EventFeedCode = Object.freeze({
    "UPDATE_EVENT_FEED_MARK": "n-0001", 
    "SEND_STUDIO_MESSAGE_NOTICE": "n-0002" ,
    "SEND_POD_MESSAGE_NOTICE": "n-0003" 
}); 
var CommercialPaperTag = Object.freeze({
    "CREATED": "1", //创建
    "PUBLISH": "2" , // 上线
    "OFFLINE": "3", // 下线
    "END": "4" , // 完成
    "DELIVERING": "5" // 交付中
}); 
var CommercialPaperDeliverTag = Object.freeze({
    "CREATED": "1", //创建
    "REVISION": "2" , // 修订
    "DELIVERED": "3" // 已交付
}); 
var MpsTag = Object.freeze({
    "CREATED": "1", //创建
    "PUBLISH": "2" , // 上线
    "OFFLINE": "3", // 下线
    "END": "4" , // 完成
}); 
var MpsType= Object.freeze({
    "FROM_MILLSTONE": "1", // millstone order
    "FROM_PLAN": "2"  // 自建
}); 
var MpsChainTag= Object.freeze({
    "PUBLISH": "1", // 运行中
    "OFFLINE": "2"  // 休止
}); 
var EmailNoticeEnum=Object.freeze({
    "CELL_ORDER_RECEIVING": "cell_order_receiving",  // cell order receiving email notice
    "CELL_PLAN_ORDER_RECEIVING": "cell_plan_order_receiving"  // cell plan order 

}); 
RefundSceneEnum=Object.freeze({
    "CELL_PLAN_ORDER": "CELL_PLAN_ORDER"  // cell plan order 
}); 
CellPlanOrderTag=Object.freeze({
    "CREATING": "0",  // 订单创建中
    "CREATED": "1",  // 已创建订单 
    "WAITING_PAY": "2",  // 等待支付
    "PAID": "3",  // 已支付 
    "DELIVERING": "4",  // 交付中 
    "COMPLETED": "5",  // 订单履约完成 
    "CANCELLED": "6",  //  取消订单 
    "REFUNDED": "7",  // 已退款
    "FAIL": "8",  // 失败
    "INVALID": "9"  // 失效
}); 
CellPlanType=Object.freeze({
    "BIRD": "bird",  // basic plan
    "EAGLE": "eagle",  // standard plan 
    "ALBATROSS": "albatross",  // premium plan
}); 





export {
    EmailNoticeEnum,RefundSceneEnum,CellPlanOrderTag,CellPlanType,
    CommercialPaperTag,CommercialPaperDeliverTag,MpsTag,MpsType,MpsChainTag,
    EventFeedScene,EventFeedMark,EventFeedCode,
    ObjMark,ObjTag,OasisMark,CommissionTag,
    PriceSbu, CellStatus,WorkflowStatus,BillStatus,ObjOd
} ;