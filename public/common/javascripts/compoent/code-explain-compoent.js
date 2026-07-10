import {
    SupplierLevelEnum,SupplierStatusEnum,CoopApplicationStatusEnum,CoopProgramStatusEnum,CoopProgramWrokModeEnum,
    AppMeetrEventStatusEnum,AppMeetrEventTypeEnum,AppMeetrDurationTypeEnum,AppMeetrEventCategoryEnum,
    OasisEquityOrderStatusEnum,MentorshipStatusEnum,OrderStatusEnum,ProductStatus,AppRedeemShippingTypeEnum,RedeemOrderStatusEnum,SubsOfferStatusEnum,SubsOfferTypeEnum,SubsBillCalendarEnum,SubscriptionStatusEnum,ProposalProjectStatusEnum,CellPlanOrderTag,CellPlanType,CommissionTag,FromWhere,DspCaseStatus,VirtualOrderTag
} from "/common/javascripts/tm-constant.js";

const CodeExplainComponent = {

   methods: {
    explainCoopApplicationStatusEnumV(status){
        return explainCoopApplicationStatusEnum(status);
    },
    explainCoopProgramStatusEnumV(status){
        return explainCoopProgramStatusEnum(status);
    },
    explainCoopProgramWrokModeEnumV(workMode){
        return explainCoopProgramWrokModeEnum(workMode);
    },
    explainMentorshipStausV(status){
        return explainMentorshipStaus(status);
    },
    explainMentorshipHonorV(honor){
        return explainMentorshipHonor(honor);
    },
    explainDspCaseStatusV(status){
        return explainDspCaseStatus(status);
    },
    explainCellPlanOrderTagV(tag){
        return explainCellPlanOrderTag(tag);
    },
    explainCellPlanTypeV(planType){
        return explainCellPlanType(planType);
    },
    explainOasisCommissionTagV(tag){
        return explainOasisCommissionTag(tag);
    },
    explainOpenDataFromWhereV(dataSource){
        return explainOpenDataFromWhere(dataSource);
    },
    explainVirtualProductTagV(tag){
        return explainVirtualProductTag(tag);
    },
    explainProposalProjectStatusV(projectStatus){
        return explainProposalProjectStatus(projectStatus);
    },
    explainSubscriptionStatusV(status){
        return explainSubscriptionStatus(status);
    },
    explainSubsBillCalendarV(billCalendar){
        return explainSubsBillCalendar(billCalendar);
    },
    explainSubscriptionOfferStatusV(status){
        return explainSubscriptionOfferStatus(status);
    },
    explainSubscriptionOfferTypeV(offerType){
        return explainSubscriptionOfferType(offerType);
    },
    explainMpsDifficultyV(level){
        return explainMpsDifficulty(level);
    },
    explainAppRedeemOrderStatusV(status){
        return explainAppRedeemOrderStatus(status);
    },
    explainAppRedeemShippingTypeV(shippingType){
        return explainAppRedeemShippingType(shippingType);
    },
    explainProductStausV(status){
        return explainProductStaus(status);
    },
    explainMembershipOrderStatusV(status){
        return explainMembershipOrderStatus(status);
    },
    explainOasisEquityOrderStausV(status){
      return explainOasisEquityOrderStaus(status);
    },
    explainSwitchEnumV(code){
        return explainSwitchEnum(code);
    },
    explainSupplierLevelV(level){
      return explainSupplierLevel(level);
    },
    explainSupplierStatusV(status){
      return explainSupplierStatus(status);
    },
    explainAppMeetrEventStatusEnumV(status){
        return explainAppMeetrEventStatusEnum(status);
    },
    explainAppMeetrDurationTypeEnumV(durationType){
        return explainAppMeetrDurationTypeEnum(durationType);
    },
    explainAppMeetrEventTypeEnumV(eventType){
        return explainAppMeetrEventTypeEnum(eventType);
    },
    explainAppMeetrEventCategoryEnumV(category){
        return explainAppMeetrEventCategoryEnum(category);
    }
   }
}
function explainSubsBillCalendar(billCalendar){
    var billCalendarDesc="";
    switch(billCalendar){
        case SubsBillCalendarEnum.MONTHLY:
            billCalendarDesc="月付";
            break; 
        case SubsBillCalendarEnum.QUARTERLY:
                billCalendarDesc="季付";
                break; 
        case SubsBillCalendarEnum.YEARLY:
            billCalendarDesc="年付";
            break;     
    }
    return billCalendarDesc;

}
function explainSubscriptionOfferType(offerType){
    var offerTypeDesc = "";
    switch(offerType){

        case SubsOfferTypeEnum.PAY_QUARTERLY_DISCOUNT_COUPON_SP:
            offerTypeDesc="季付折扣优惠";
            break; 
        case SubsOfferTypeEnum.PAY_YEARLY_DISCOUNT_COUPON_SP:
            offerTypeDesc="年付折扣优惠";
            break; 
        case SubsOfferTypeEnum.FIRST_PERIOD_DISCOUNT_PROMO_CODE_SP:
            offerTypeDesc="首月折扣优惠优惠码";
            break;  
        case SubsOfferTypeEnum.FIRST_PERIOD_CASH_PROMO_CODE_SP:
            offerTypeDesc="首期现金减免优惠码";
            break; 
        case SubsOfferTypeEnum.FULL_ITEM_DISCOUNT_PROMO_CODE:
            offerTypeDesc="全店通用折扣优惠码";
            break;       
    }
    return offerTypeDesc;
}

function explainSubscriptionOfferStatus(status){
    var statusDesc = "";
    switch(status){

        case SubsOfferStatusEnum.DRAFT:
            statusDesc="待上线";
            break; 
        case SubsOfferStatusEnum.ONLINE:
            statusDesc="发放中";
            break; 
        case SubsOfferStatusEnum.OFFLINE:
            statusDesc="已下线";
            break;   
    }
    return statusDesc;
}

function explainSubscriptionStatus(status){
    var statusDesc = "";
    switch(status){

        case SubscriptionStatusEnum.ACTIVE:
            statusDesc="订阅中";
            break; 
        case SubscriptionStatusEnum.TRIALING:
            statusDesc="试用中";
            break; 
        case SubscriptionStatusEnum.INCOMPLETE:
            statusDesc="等待支付";
            break; 
        case SubscriptionStatusEnum.INCOMPLETE_EXPIRED:
            statusDesc="已过期";
            break;   
        case SubscriptionStatusEnum.UNPAID:
            statusDesc="支付失败";
            break;
        case SubscriptionStatusEnum.CANCELED:
            statusDesc="已取消";
            break;   
        case SubscriptionStatusEnum.CLOSED:
            statusDesc="已关闭";
            break;       
    }
    return statusDesc;
}
function explainProposalProjectStatus(status){
    var statusDesc = "";
    switch(status){
        case ProposalProjectStatusEnum.DRAFT:
            statusDesc="待签约";
            break; 
        case ProposalProjectStatusEnum.SIGNED:
            statusDesc="已签约";
            break; 
        case ProposalProjectStatusEnum.DELIVERING:
            statusDesc="正在交付";
            break; 
        case ProposalProjectStatusEnum.COMPLETED:
            statusDesc="已关单";
            break;   
        case ProposalProjectStatusEnum.SUSPENDED:
        statusDesc="已中止";
        break;       
    }
    return statusDesc;
}

function explainDspCaseStatus(status){
    var statusDesc = "";
    switch(status){
        case DspCaseStatus.PENDING:
            statusDesc="等待处理";
            break; 
        case DspCaseStatus.PROCESSING:
            statusDesc="处理中";
            break; 
        case DspCaseStatus.COMPLAINT:
            statusDesc="申诉中";
            break; 
        case DspCaseStatus.RESOLVED:
            statusDesc="已解决";
            break;    
    }
    return statusDesc;
}
function explainCellPlanType(planType){
    var planTypeDesc="";
    switch(planType){
        case CellPlanType.BIRD:
            planTypeDesc="小鸟";
            break; 
        case CellPlanType.EAGLE:
            planTypeDesc="老鹰";
            break; 
        case CellPlanType.ALBATROSS:
            planTypeDesc="信天翁";
            break; 
    }
    return planTypeDesc;

}

function explainCellPlanOrderTag(tag){
    var orderTagDesc="";
    switch(tag){
        case CellPlanOrderTag.CREATING:
            orderTagDesc="订单创建中";
            break; 
        case CellPlanOrderTag.CREATED:
            orderTagDesc="已创建订单";
                break; 
        case CellPlanOrderTag.WAITING_PAY:
            orderTagDesc="等待支付";
            break; 
        case CellPlanOrderTag.PAID:
            orderTagDesc="已支付";
                break; 
        case CellPlanOrderTag.DELIVERING:
            orderTagDesc="交付中";
                break; 
        case CellPlanOrderTag.COMPLETED:
            orderTagDesc="履约完成";
                break;  
        case CellPlanOrderTag.CANCELLED:
            orderTagDesc="取消订单";
            break; 
        case CellPlanOrderTag.REFUNDED:
            orderTagDesc="已退款";
                break; 
        case CellPlanOrderTag.FAIL:
            orderTagDesc="失败";
                break; 
        case CellPlanOrderTag.INVALID:
            orderTagDesc="失效";
                break; 
    }
    return orderTagDesc;
}


function explainMembershipOrderStatus(status){
    var statusDesc="未知";
    switch(status){
        case OrderStatusEnum.CREATING:
            statusDesc="订单创建中";
            break; 
        case OrderStatusEnum.CREATED:
            statusDesc="已创建订单";
                break; 
        case OrderStatusEnum.PAID:
            statusDesc="支付成功";
                break; 
        case OrderStatusEnum.SHIPPED:
            statusDesc="已发货";
                break; 
        case OrderStatusEnum.COMPLETED:
            statusDesc="履约完成";
                break;  
        case OrderStatusEnum.CANCELLED:
            statusDesc="已取消";
            break; 
        case OrderStatusEnum.FAIL:
            statusDesc="失败";
                break; 
        case OrderStatusEnum.INVALID:
            statusDesc="失效";
                break; 
        case OrderStatusEnum.REFUNDED:
            statusDesc="已退款";
                break;         
    }
    return statusDesc;
}

function explainOasisCommissionTag(tag){
    var desc="";
    switch(tag){
        case CommissionTag.CREATED:
            desc="待审核"
            break;
        case CommissionTag.ACCEPT:
            desc="履约中"
            break;
        case CommissionTag.DENY:
            desc="已拒绝"
            break;
        case CommissionTag.FINISH:
            desc="已交付"
            break;
        case CommissionTag.ABOLISH:
            desc="已废除"
            break;
        case CommissionTag.ADD_TO_NEED_POOL:
            desc="派发中"
            break;
        case CommissionTag.FIND_NEW_SUPPLIER:
            desc="退回派发中"
            break;    
    }
    return desc;
}
function explainOpenDataFromWhere(dataSourceCode){
    var desc="";
    switch(dataSourceCode){
        case FromWhere.USER_NEED_STORY:
            desc="用户需求"
            break;
        case FromWhere.PLAN_SEARCH:
            desc="单品搜索"
            break;
        case FromWhere.CELL_SEARCH:
            desc="特约搜索"
            break;
        case FromWhere.OASIS_SEARCH:
            desc="部落搜索"
            break;
        case FromWhere.TALENT_SEARCH:
            desc="品牌银行搜索"
            break;
        case FromWhere.BUSINESS_PAPER_SEARCH:
            desc="商单搜索"
            break;
        case FromWhere.VIRTUAL_PRODUCT_SEARCH:
            desc="虚拟商品搜索"
        break;
        default:
            desc = '其他';
            break;
    }
    return desc;
}

function explainVirtualProductTag(tag){
    var desc="";
    switch(tag){
        case VirtualOrderTag.CREATING:
            desc="订单创建中"
            break;
        case VirtualOrderTag.CREATED:
            desc="已创建订单"
            break;
        case VirtualOrderTag.WAITING_PAY:
            desc="等待支付"
            break;
        case VirtualOrderTag.PAID:
            desc="已支付"
            break;
        case VirtualOrderTag.DELIVERING:
            desc="交付中"
            break;
        case VirtualOrderTag.COMPLETED:
            desc="履约完成"
            break;
        case VirtualOrderTag.CANCELLED:
            desc="已取消订单"
            break;
        case VirtualOrderTag.REFUNDED:
            desc="已退款"
            break;
        case VirtualOrderTag.REMITTANCE:
            desc="已打款关单"
            break;
        case VirtualOrderTag.APPLY_REFUND:
            desc="申请退款"
            break;
        case VirtualOrderTag.FAIL:
            desc="处理失败"
            break;
        case VirtualOrderTag.INVALID:
            desc="已失效"
            break;    
    }
    return desc;
}
function explainMpsDifficulty(level){
  var levelDesc="";
  switch(level){
    case "easy":
        levelDesc="初级"
        break;
    case "medium":
        levelDesc="中级"
        break;
    case "advanced":
        levelDesc="高级"
        break;
    case "expert":
        levelDesc="专家"
        break;
    case "master":
        levelDesc="大师"
        break;

}
  return levelDesc;
}

function explainAppRedeemOrderStatus(status){
    var statusDesc="未知";
    switch(status){
      case RedeemOrderStatusEnum.CREATED:
        statusDesc="新建订单"
          break;
      case RedeemOrderStatusEnum.PAID:
        statusDesc="已付款"
          break;
      case RedeemOrderStatusEnum.DELIVERING:
        statusDesc="交付中"
          break;
      case RedeemOrderStatusEnum.COMPLETED:
        statusDesc="已关单"
          break;
      case RedeemOrderStatusEnum.CANCELLED:
        statusDesc="已取消"
          break;
      case RedeemOrderStatusEnum.REFUNDED:
        statusDesc="已退款"
            break;
      case RedeemOrderStatusEnum.FAIL:
        statusDesc="失败"
          break;
      case RedeemOrderStatusEnum.INVALID:
        statusDesc="失效"
          break;    
    }
    return statusDesc;
}

function explainAppRedeemShippingType(shippingType){
    var shippingTypeDesc="未知";
    switch(shippingType){
        case AppRedeemShippingTypeEnum.LOGISTICS:
            shippingTypeDesc="物流发货";
            break; 
        case AppRedeemShippingTypeEnum.EMAIL:
            shippingTypeDesc="邮箱发货";
            break; 
        case AppRedeemShippingTypeEnum.OTHERS:
            shippingTypeDesc="其他方式";
            break; 
    }
    return shippingTypeDesc;

}

function explainProductStaus(status){
    var statusDesc="未知";
    switch(status){
      case ProductStatus.Draft:
        statusDesc="草稿"
          break;
      case ProductStatus.Online:
        statusDesc="售卖中"
          break;
      case ProductStatus.Offline:
        statusDesc="已下架"
          break;   
    }
    return statusDesc;

}

function explainMentorshipStaus(status){
    var statusDesc="未知";
    switch(status){
      case MentorshipStatusEnum.APPLICATION:
        statusDesc="候选中"
          break;
      case MentorshipStatusEnum.TRAINING:
        statusDesc="研习中"
          break;
      case MentorshipStatusEnum.GRADUATED:
        statusDesc="已毕业"
          break;   
    }
    return statusDesc;

}

function explainOasisEquityOrderStaus(status){
    var statusDesc="未知";
    switch(status){
      case OasisEquityOrderStatusEnum.HOLDING:
        statusDesc="待回收"
          break;
      case OasisEquityOrderStatusEnum.REDEEMED:
        statusDesc="已注销"
          break;
      case OasisEquityOrderStatusEnum.WRITE_OFF:
        statusDesc="已核销"
          break;   
      case OasisEquityOrderStatusEnum.BUY_PENDING:
      statusDesc="正在支付"
          break;
      case OasisEquityOrderStatusEnum.REDEEM_PENDING:
      statusDesc="正在回收"
          break;
      case OasisEquityOrderStatusEnum.WRITE_OFF_PENDING:
      statusDesc="正在兑换"
          break;  
    }
    return statusDesc;

}


function explainMentorshipHonor(mentorHonor){
    if(!mentorHonor) return ;

    var mentorHonorDesc="未知";
    switch(mentorHonor){
      case "1":
        mentorHonorDesc="新晋导师"
          break;
      case "2":
        mentorHonorDesc="星级导师"
          break;
      case "3":
        mentorHonorDesc="王牌导师"
          break;  
      case "4":
        mentorHonorDesc="殿堂导师"
            break;      
    }
    return mentorHonorDesc;

}

function explainSwitchEnum(code){
    var codeDesc = "未知";
    switch(code){

        case "0":
            codeDesc="否";
            break; 
        case "1":
            codeDesc="是";
            break; 
    }
    return codeDesc;
}
function explainSupplierStatus(status){
    var statusDesc="未知";
    switch(status){
      case SupplierStatusEnum.ACTIVE:
        statusDesc="正常"
          break;
      case SupplierStatusEnum.BLACKLISTED:
        statusDesc="拉黑"
          break;
      case SupplierStatusEnum.TERMINATED:
        statusDesc="淘汰"
          break;   
      case SupplierStatusEnum.FROZEN:
        statusDesc="冻结"
          break;   
    }
    return statusDesc;

}
function explainSupplierLevel(level){
  var levelDesc="未知";
  switch(level){
    case SupplierLevelEnum.STRATEGIC:
      levelDesc="战略型"
        break;
    case SupplierLevelEnum.LEVERAGE:
      levelDesc="杠杆型"
        break;
    case SupplierLevelEnum.BOTTLENECK:
      levelDesc="瓶颈型"
        break;   
    case SupplierLevelEnum.ROUTINE:
      levelDesc="常规型"
        break;   
  }
  return levelDesc;

}

function explainAppMeetrEventStatusEnum(status){
    var statusDesc = "未知";
    switch(status){

        case AppMeetrEventStatusEnum.PREPARING:
            statusDesc="筹办中";
            break; 
        case AppMeetrEventStatusEnum.CANCELLED:
            statusDesc="已取消";
            break; 
    }
    return statusDesc;
}

function explainAppMeetrEventTypeEnum(eventType){
    var eventTypeDesc = "未知";
    switch(eventType){

        case AppMeetrEventTypeEnum.ONLINE:
            eventTypeDesc="线上";
            break; 
        case AppMeetrEventTypeEnum.OFFLINE:
            eventTypeDesc="线下";
            break; 
        case AppMeetrEventTypeEnum.HYBRID:
            eventTypeDesc="混合";
            break;     
    }
    return eventTypeDesc;
}

function explainAppMeetrDurationTypeEnum(durationType){
    var durationTypeDesc = "未知";
    switch(durationType){

        case AppMeetrDurationTypeEnum.MINUTES:
            durationTypeDesc="分钟";
            break; 
        case AppMeetrDurationTypeEnum.HOURS:
            durationTypeDesc="小时";
            break; 
        case AppMeetrDurationTypeEnum.DAYS:
            durationTypeDesc="天";
            break; 
        case AppMeetrDurationTypeEnum.WEEKS:
            durationTypeDesc="周";
            break; 
        case AppMeetrDurationTypeEnum.MONTHS:
            durationTypeDesc="月";
  
    }
    return durationTypeDesc;
}

function explainAppMeetrEventCategoryEnum(category){
    var categoryDesc = "未知";
    switch(category){

        case AppMeetrEventCategoryEnum.TECHNOLOGY:
            categoryDesc="科技";
            break; 
        case AppMeetrEventCategoryEnum.SOCIAL_ACTIVITY:
            categoryDesc="社交聚会";
            break; 
        case AppMeetrEventCategoryEnum.HOBBIES_PASSIONS:
            categoryDesc="兴趣爱好";
            break; 
        case AppMeetrEventCategoryEnum.SPORTS_FITNESS:
            categoryDesc="运动健身";
            break; 
        case AppMeetrEventCategoryEnum.TRAVEL_OUTDOOR:
            categoryDesc="旅游户外";
        case AppMeetrEventCategoryEnum.CAREER_BUSINESS:
            categoryDesc="商业";
            break; 
        case AppMeetrEventCategoryEnum.GAMES:
            categoryDesc="游戏";
            break; 
        case AppMeetrEventCategoryEnum.DANCING:
            categoryDesc="舞蹈";
            break; 
        case AppMeetrEventCategoryEnum.MUSIC:
            categoryDesc="音乐";
            break; 
        case AppMeetrEventCategoryEnum.HEALTH_WELLBEING:
            categoryDesc="健康养生";   
        case AppMeetrEventCategoryEnum.ART_CULTURE:
            categoryDesc="文化艺术";
            break; 
        case AppMeetrEventCategoryEnum.SCIENCE_EDUCATION:
            categoryDesc="教育";
            break; 
        case AppMeetrEventCategoryEnum.PETS_ANIMALS:
            categoryDesc="萌宠";
            break; 
        case AppMeetrEventCategoryEnum.WRITING:
            categoryDesc="写作";
            break; 
        case AppMeetrEventCategoryEnum.PARENTS_FAMILY:
            categoryDesc="亲子家庭";     
  
    }
    return categoryDesc;
}

function explainCoopApplicationStatusEnum(status){
    var statusDesc = "未知";
    switch(status){

        case CoopApplicationStatusEnum.PENDING:
            statusDesc="待审核";
            break; 
        case CoopApplicationStatusEnum.APPROVED:
            statusDesc="已同意";
            break; 
        case CoopApplicationStatusEnum.REJECTED:
            statusDesc="已否决";
            break;     
    }
    return statusDesc;
}
function explainCoopProgramStatusEnum(status){
    var statusDesc = "未知";
    switch(status){

        case CoopProgramStatusEnum.RECRUITING:
            statusDesc="匹配中";
            break; 
        case CoopProgramStatusEnum.CLOSED:
            statusDesc="已关闭";
            break; 
        case CoopProgramStatusEnum.INVALID:
            statusDesc="已失效";
            break;   
        case CoopProgramStatusEnum.FREEZE:
            statusDesc="已冻结";
            break;        
    }
    return statusDesc;
}
function explainCoopProgramWrokModeEnum(workmode){
    var workmodeDesc = "未知";
    switch(workmode){

        case CoopProgramWrokModeEnum.FULL_TIME:
            workmodeDesc="全职";
            break; 
        case CoopProgramWrokModeEnum.PART_TIME:
            workmodeDesc="兼职";
            break; 
        case CoopProgramWrokModeEnum.FLEXIBLE:
            workmodeDesc="不限";
            break;     
    }
    return workmodeDesc;
}

export {
    CodeExplainComponent
}