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