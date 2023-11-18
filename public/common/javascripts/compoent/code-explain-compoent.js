import {CellPlanOrderTag,CellPlanType,CommissionTag,FromWhere} from "/common/javascripts/tm-constant.js";

const CodeExplainComponent = {

   methods: {
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
    }
   }
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
            orderTagDesc="订单履约完成";
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
function explainOasisCommissionTag(tag){
    var desc="";
    switch(tag){
        case CommissionTag.CREATED:
            desc="待审核"
            break;
        case CommissionTag.ACCEPT:
            desc="处理中"
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
            desc="基地搜索"
            break;
        case FromWhere.TALENT_SEARCH:
            desc="大贤者搜索"
            break;
        case FromWhere.BUSINESS_PAPER_SEARCH:
            desc="商单搜索"
            break;
        default:
            desc = '其他';
            break;
    }
    return desc;
}

export {
    CodeExplainComponent
}