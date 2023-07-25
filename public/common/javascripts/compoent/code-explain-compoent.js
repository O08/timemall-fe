import {CellPlanOrderTag,CellPlanType} from "/common/javascripts/tm-constant.js";

const CodeExplainComponent = {

   methods: {
    explainCellPlanOrderTagV(tag){
        return explainCellPlanOrderTag(tag);
    },
    explainCellPlanTypeV(planType){
        return explainCellPlanType(planType);
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
export {
    CodeExplainComponent
}