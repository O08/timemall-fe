import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";

const BubbleSwapCellComponent = {
    data() {
      return {
        swap: {
            sponsor: "",
            sponsorCellId: "",
            sponsorCellQuantity: "",
            sponsorCellSbu: "",
            partner: "",
            partnerCellId: "",
            partnerCellQuantity: "",
            partnerCellSbu: ""
        },
        swapHelper: {
            partnerCellTitle: "",
            partnerCellTotal: "",
            sponsorCellTitle: "",
            sponsorCellTotal: ""
        },
        supplierQ: "",
        myselfQ:"",
        myselfCells: {},
        supplierCells: {},
        myselfCellPricing: {},
        supplierCellPricing: {},
        selectedSupplierCellPricingSbu: "",
        selectedMyselfCellPricingSbu: ""
      }
    },
    methods: {
        swapServiceV(){
            swapService(this.swap).then(response=>{
                if(response.data.code==200){
                    // $("#swapServiceModal").modal("hide");

                }
            });
        },
        loadSupplierServiceV(){
            const brandId= getQueryVariable("brand_id");
            retrieveSupplierService(brandId,this.supplierQ).then(response=>{
                if(response.data.code==200){
                    this.supplierCells=response.data.cells;
                }
            });
        },
        loadMyselfServiceV(){
            const brandId = this.getIdentity().brandId; // Auth.getIdentity();
            retrieveMyselfService(brandId,this.myselfQ).then(response=>{
                if(response.data.code==200){
                    this.myselfCells=response.data.cells;
                }
            });
        },
        getSupplierCellPricingV(cellId){
            retrieveCellPricing(cellId).then(response=>{
                if(response.data.code==200){
                    this.supplierCellPricing = response.data.pricing;
                }
            });
        },
        onSelectedSupplierCellV(){
            const cell=this.supplierCells.records.filter(cell=>{ return cell.id===this.swap.partnerCellId})[0];
            this.swapHelper.partnerCellTitle = cell.title;
            this.swapHelper.partnerCellTotal = cell.price;
            this.swap.partnerCellSbu = "day";
            this.swap.partnerCellQuantity = 1;
            this.swap.partner = getQueryVariable("brand_id");
            // load this cell pricing
           this.getSupplierCellPricingV(cell.id);
        },
        computeSupplierTotalFeeV(){
           this.swapHelper.partnerCellTotal = 
            getSbuPrice(this.supplierCellPricing.fee,this.swap.partnerCellSbu) * this.swap.partnerCellQuantity;

        },
        getMyselfCellPricingV(cellId){
            retrieveCellPricing(cellId).then(response=>{
                if(response.data.code==200){
                    this.myselfCellPricing = response.data.pricing;
                }
            });
        },
        onSelectedMyselfCellV(){
            const cell=this.myselfCells.records.filter(cell=>{ return cell.id===this.swap.sponsorCellId})[0];
            this.swapHelper.sponsorCellTitle = cell.title;
            this.swapHelper.sponsorCellTotal = cell.price;
            this.swap.sponsorCellSbu = "day";
            this.swap.sponsorCellQuantity = 1;
            this.swap.sponsor = this.getIdentity().brandId; // Auth.getIdentity();
               // load this cell pricing
           this.getMyselfCellPricingV(cell.id);


        },
        computeMyselfTotalFeeV(){
            this.swapHelper.sponsorCellTotal = 
            getSbuPrice(this.myselfCellPricing.fee,this.swap.sponsorCellSbu) * this.swap.sponsorCellQuantity;
        }


    },
    created(){

    }
}
async function swapCell(dto){
    const url="/api/v1/team/swap_cell";
    return await axios.put(url,dto);
}
async function getServicesForBrand(brandId,q){
    const url="/api/v1/web_mall/brandCells?q="+q+ "&brandId="+brandId+"&size=12&current=1&sbu=day";
    return await axios.get(url);
}
async function getCellPricing(cellId){
    const url ="/api/v1/web_estudio/cell/{cell_id}/pricing".replace("{cell_id}",cellId);
    return await axios.get(url);
}

function swapService(dto){
    return swapCell(dto);
}
function retrieveSupplierService(brandId,q){
   return getServicesForBrand(brandId,q);
}
function retrieveMyselfService(brandId,q){
    return getServicesForBrand(brandId,q);
 }
 function retrieveCellPricing(cellId){
    return getCellPricing(cellId);
 }
 function getSbuPrice(fees,sbu)
{
   const selectedFee = fees.filter(item=>item.sbu===sbu)[0];
   return selectedFee.price;
}
export default BubbleSwapCellComponent;
