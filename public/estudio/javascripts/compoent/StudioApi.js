import axios from 'axios';
const StudioApi = {

    doFetchFirstSupplier: doFetchFirstSupplier
    
}

async function doFetchFirstSupplier(q){
    const url="/api/v1/web_estudio/mps_chain/supplier?q="+q;
    return await axios.get(url);
}

export default StudioApi;