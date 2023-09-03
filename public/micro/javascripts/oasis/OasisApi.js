import axios from 'axios';
const OasisApi = {

    followOasis: followOasis

}
async function joinOasis(dto){
    const url="/api/v1/team/be_oasis_member?oasisId="+dto.oasisId + "&brandId="+dto.brandId;
    return await axios.put(url,dto);
}
function followOasis(oasisId,brandId){
    const dto={
        oasisId:oasisId,
        brandId: brandId
    }
    return joinOasis(dto);

}
export default OasisApi;