import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";


async function requestCellId(brandId){
   return await axios.get("/api/v1/web_estudio/services/initialize?brandId="+ brandId)
}

export async function preHandleCellId(brandId){
    let cellId = getQueryVariable("cell_id");
    const option = getQueryVariable("option");
    if(option === "new" && !cellId){
        cellId =  (await requestCellId(brandId)).data.cellId;
    }
    return cellId;
}

export function addCellIdToUrl(cellId){
    const id = getQueryVariable("cell_id");
    if(!id){
        let url = "/estudio/studio-store-define-gig?tab=pricing&cell_id="+ cellId
        history.pushState(null, "", url);
    }
}
