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


var OasisMark = Object.freeze({
    "CREATED": "1", // 创建
    "PUBLISH": "2" // 发布
});

var CommissionTag = Object.freeze({
    "CREATED": "1", // 创建
    "ACCEPT": "2", // 接受任务
    "DENY": "3", // 拒绝任务
    "FINISH": "4", // 完成任务
    "ABOLISH": "5", // 审核不通过，废除任务
    "ADD_TO_NEED_POOL":"6" // 审核通过，进入需求池
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
    "DELIVERING": "5", // 交付中
    "CLOSED":"6" // 关单
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
var EmailNoticeEnum= Object.freeze({
    "CELL_ORDER_RECEIVING": "cell_order_receiving", 
    "CELL_PLAN_ORDER_RECEIVING": "cell_plan_order_receiving"  
}); 
var RefundSceneEnum=Object.freeze({
    "CELL_PLAN_ORDER": "CELL_PLAN_ORDER"  // cell plan order 
}); 
var CellPlanOrderTag=Object.freeze({
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
var CellPlanType=Object.freeze({
    "BIRD": "bird",  // basic plan
    "EAGLE": "eagle",  // standard plan 
    "ALBATROSS": "albatross",  // premium plan
}); 
var SseEventBusScene=Object.freeze({
    "PRIVATE": "PRIVATE"

}); 
var GroupChatPolicyRel=Object.freeze({
    "READ": "read",
    "READ_WRITE": "read_write"
}); 
var FromWhere=Object.freeze({
    "USER_NEED_STORY": "user_need_story",
    "PLAN_SEARCH": "plan_search",
    "CELL_SEARCH": "cell_search",
    "OASIS_SEARCH": "oasis_search",
    "TALENT_SEARCH": "talent_search",
    "BUSINESS_PAPER_SEARCH": "business_paper_search"
}); 
var DataLayerCellEvent=Object.freeze({
    "IMPRESSIONS": "impressions",
    "CLICKS": "clicks",
    "APPOINTMENTS": "appointments",
    "PURCHASES": "purchases"
}); 
var CodeMappingTypeEnum=Object.freeze({
    "OCCUPATION": "occupation",
    "INDUSTRY": "industry"
}); 

var EnvWebsite=Object.freeze({
    "PROD": "https://bluvarri.com"
}); 




export {
    EmailNoticeEnum,RefundSceneEnum,CellPlanOrderTag,CellPlanType,SseEventBusScene,GroupChatPolicyRel,FromWhere,DataLayerCellEvent,
    CommercialPaperTag,CommercialPaperDeliverTag,MpsTag,MpsType,MpsChainTag,
    EventFeedScene,EventFeedMark,EventFeedCode,
    OasisMark,CommissionTag,
    PriceSbu, CellStatus,WorkflowStatus,BillStatus,CodeMappingTypeEnum,EnvWebsite
} ;