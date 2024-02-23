import {DataLayerCellEvent} from "/common/javascripts/tm-constant.js";

async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
  }
async function doUpoadScienceData(model){
   
    const url="/api/v1/web_mall/science";

    return await fetch(url,{method: "POST",body: JSON.stringify(model),headers:{
		'Content-Type':'application/json'
	}});

}
async function doUploadCellDataLayer(model){
  const url="/api/v1/data_layer/cell/indices";

  return await fetch(url,{method: "PUT",body: JSON.stringify(model),headers:{
  'Content-Type':'application/json'
  }});
}

export async function uploadCellDataLayer(event,indicesObj){
  console.log("capture data:"+indicesObj);
  if(!event){
    return;
  }
  var model={
    event: event,
    cell: {}
  }
  if(DataLayerCellEvent.IMPRESSIONS==event){
    model.cell.impressions=indicesObj;
  }
  if(DataLayerCellEvent.CLICKS==event){
    model.cell.clicks=indicesObj;
  }
  if(DataLayerCellEvent.APPOINTMENTS==event){
    model.cell.appointments=indicesObj;
  }
  if(DataLayerCellEvent.PURCHASES==event){
    model.cell.purchases=indicesObj;
  }
  const response= await doUploadCellDataLayer(model);
  await handleErrors(response);
  var data = await response.json();
  if(data.code==200){
    console.log("cell data layer capture success!!!");
  }
  if(data.code!==200){
    console.log("cell data layer capture fail!!!");
  }
}
// event is impression 
export async function uploadCellDataLayerWhenImpression(idsArr){
   var impressions=[];
   idsArr.forEach(element => {
     var impression ={ 
      cellId: element
     }
     impressions.push(impression);
   });
   if(impressions.length>0){
      uploadCellDataLayer(DataLayerCellEvent.IMPRESSIONS ,impressions);
   }
}


// event is clicks
export async function uploadCellDataLayerWhenClick(idsArr){
  var clicks=[];
  idsArr.forEach(element => {
    var click ={ 
      cellId: element
     }
     clicks.push(click);
  });
  if(clicks.length>0){
    uploadCellDataLayer(DataLayerCellEvent.CLICKS ,clicks);
  }
}

// event is appointments
export async function uploadCellDataLayerWhenAppointment(idsArr){
  var appointments=[];
  idsArr.forEach(element => {
    var appointment ={ 
      cellId: element
     }
     appointments.push(appointment);
  });
  if(appointments.length>0){
    uploadCellDataLayer(DataLayerCellEvent.APPOINTMENTS ,appointments);
  }
}

// event is purchase plan
export async function uploadCellDataLayerWhenBuyPlan(planType,cellId){
  if(!planType || ! cellId){
    return;
  }
  var purchases={
    planType: planType,
    cellId: cellId
  };

  uploadCellDataLayer(DataLayerCellEvent.PURCHASES ,purchases);


}

export async function uploadScienceData(snippet,details,fromWhere){
  

  if(!snippet){
    return;
  }

  const model={
    snippet: snippet,
    details: details,
    fromWhere: fromWhere
  }
  const response= await doUpoadScienceData(model);
  await handleErrors(response);
  var data = await response.json();
  if(data.code==200){
    console.log("open data capture success!!!");
  }
  if(data.code!==200){
    console.log("open data capture fail!!!");
  }
}

