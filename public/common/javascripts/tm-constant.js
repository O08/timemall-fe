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

var ProductStatus = Object.freeze({
    "Draft": "1",
    "Online": "2",
    "Offline": "3"
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
    "FROM_TEMPLATE": "2",  // 模版生成商单
    "FAST": "3" // 快捷商单
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
    "CELL_PLAN_ORDER": "CELL_PLAN_ORDER",  // cell plan order 
    "VIRTUAL_ORDER": "VIRTUAL_ORDER",
    "SUBSCRIPTION": "SUBSCRIPTION"
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
    "BUSINESS_PAPER_SEARCH": "business_paper_search",
    "VIRTUAL_PRODUCT_SEARCH": "virtual_product_search"
}); 
var DataLayerCellEvent=Object.freeze({
    "IMPRESSIONS": "impressions",
    "CLICKS": "clicks",
    "APPOINTMENTS": "appointments",
    "PURCHASES": "purchases"
}); 
var CodeMappingTypeEnum=Object.freeze({
    "OCCUPATION": "occupation",
    "INDUSTRY": "industry",
    "REPORTISSUE": "fraud_type"
}); 

var EnvWebsite=Object.freeze({
    "PROD": "https://bluvarri.com",
    "PROD_WWW": "https://www.bluvarri.com",
    "PROD_WX_APPID": "wx6b5d8cfe8cfbece5",
    "PROD_WX_QRCONNECT_URI": "https://open.weixin.qq.com/connect/qrconnect",
    "LOCAL": "http://localhost"
}); 

var BrandAccessWay=Object.freeze({
    "RAW": "1",
    "BRAND": "2",
    "HANDLE": "3"
}); 

var MillstoneAc = Object.freeze({
    "OPEN": "1", // 创建
    "CLOSED": "0" // 发布
});

var DspCaseStatus = Object.freeze({
    "PENDING": "PENDING", // 等待处理
    "PROCESSING": "PROCESSING", // 处理中 
    "COMPLAINT": "COMPLAINT" , // 申诉
    "RESOLVED": "RESOLVED"  // 已解决

});

var VirtualOrderTag = Object.freeze({
    "CREATING": "0", // 订单创建中
    "CREATED": "1", // 已创建订单
    "WAITING_PAY": "2", // 等待支付
    "PAID": "3", // 已支付
    "DELIVERING": "4", // 交付中
    "COMPLETED":"5", // 订单履约完成
    "CANCELLED":"6", // 取消订单
    "REFUNDED":"7", // 已退款
    "REMITTANCE":"8", // 已打款关单
    "APPLY_REFUND":"9", // 申请退款
    "FAIL":"10", // 失败
    "INVALID":"11" // 失效

});
var ProposalProjectStatusEnum = Object.freeze({
    "DRAFT": "0", // 订单创建中
    "SIGNED": "1", // 已创建订单
    "DELIVERING": "2", // 等待支付
    "COMPLETED": "3", // 已支付
    "SUSPENDED": "4" // 交付中

});

var SubscriptionStatusEnum = Object.freeze({
    "ACTIVE": "active", // 订阅中
    "TRIALING": "trialing", // 试用中
    "INCOMPLETE": "incomplete", // 等待支付
    "INCOMPLETE_EXPIRED": "incomplete_expired", // 已过期
    "UNPAID": "unpaid" ,// 支付失败
    "CANCELED": "canceled", // 已取消
    "CLOSED": "closed" // 已关闭
});
var SubsBillCalendarEnum = Object.freeze({
    "MONTHLY": "monthly", // 月缴
    "QUARTERLY": "quarterly", // 季缴
    "YEARLY": "yearly"// 年缴
});
var SubsOfferStatusEnum = Object.freeze({
    "DRAFT": "1", // 待上线
    "ONLINE": "2", // 发放中
    "OFFLINE": "3"// 已下线
});
var SubsOfferTypeEnum = Object.freeze({
    "PAY_QUARTERLY_DISCOUNT_COUPON_SP": "pay_quarterly_discount_coupon_sp", //  季缴优惠
    "PAY_YEARLY_DISCOUNT_COUPON_SP": "pay_yearly_discount_coupon_sp", //  年缴优惠
    "FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP": "first_period_discount_promo_code_sp", // 首月折扣
    "FIRST_PERIOD_CASH_PROMO_CODE_SP": "first_period_cash_promo_code_sp", // 首月现金减免
    "FULL_ITEM_DISCOUNT_PROMO_CODE": "full_item_discount_promo_code"// 全店通用折扣
});

var RedeemOrderStatusEnum=Object.freeze({
    "CREATED": "0",  // 新建订单
    "PAID": "1",  // 已付款 
    "DELIVERING": "2",  // 交付中
    "COMPLETED": "3",  // 已关单 
    "CANCELLED": "4",  // 已取消 
    "REFUNDED": "5",  // 已退款
    "FAIL": "6",  //  失败 
    "INVALID": "7"  // 失效
}); 

var AppRedeemShippingTypeEnum = Object.freeze({
    "LOGISTICS": "logistics", // 物流发货
    "EMAIL": "email", // 邮箱发货
    "OTHERS": "others"// 其他方式
});

var OrderStatusEnum=Object.freeze({
    "CREATING": "0",  // 订单创建中
    "CREATED": "1",  // 已创建订单 
    "PAID": "2",  // 已支付
    "SHIPPED": "3",  // 已发货 
    "COMPLETED": "4",  // 订单履约完成 
    "CANCELLED": "5",  // 取消订单
    "FAIL": "6",  //  失败 
    "INVALID": "7" , // 失效
    "REFUNDED": "8" // 已退款
}); 

export {
    SubsBillCalendarEnum,SubsOfferStatusEnum,SubsOfferTypeEnum,RedeemOrderStatusEnum,AppRedeemShippingTypeEnum,OrderStatusEnum,
    MillstoneAc,DspCaseStatus,VirtualOrderTag,ProductStatus,ProposalProjectStatusEnum,SubscriptionStatusEnum,
    EmailNoticeEnum,RefundSceneEnum,CellPlanOrderTag,CellPlanType,SseEventBusScene,GroupChatPolicyRel,FromWhere,DataLayerCellEvent,
    CommercialPaperTag,CommercialPaperDeliverTag,MpsTag,MpsType,MpsChainTag,
    EventFeedScene,EventFeedMark,EventFeedCode,
    OasisMark,CommissionTag,
    PriceSbu, CellStatus,WorkflowStatus,BillStatus,CodeMappingTypeEnum,EnvWebsite,BrandAccessWay
} ;