import axios from 'axios';
const StudioApi = {

    doFetchFirstSupplier: doFetchFirstSupplier
    
}

async function doFetchFirstSupplier(q){
    const url="/api/v1/web_estudio/brand/supplier/query?size=200&current=1&status=ACTIVE&q="+q;
    return await axios.get(url);
}

export default StudioApi;