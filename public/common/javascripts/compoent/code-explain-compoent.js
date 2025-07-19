import {ProposalProjectStatusEnum,CellPlanOrderTag,CellPlanType,CommissionTag,FromWhere,DspCaseStatus,VirtualOrderTag} from "/common/javascripts/tm-constant.js";

const CodeExplainComponent = {

   methods: {
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
   }
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
            desc="部落搜索"
            break;
        case FromWhere.TALENT_SEARCH:
            desc="朋友圈搜索"
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

export {
    CodeExplainComponent
}