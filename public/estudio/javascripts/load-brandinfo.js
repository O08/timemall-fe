import axios from 'axios';
import defaultAvatarImage from '/common/icon/panda-kawaii.svg';

export default function BrandInfoComponent(params) {
    const {
        need_init = true
      } = params  
    return {
        data() {
            return {
                studio_brand: "",
                studio_brand_avatar: "",
                defaultAvatarImage
            }
        },
        methods: {
            loadBrandInfo(){
                getBrandInfo().then(response=>{
                    if(response.data.code == 200){
                        this.studio_brand = response.data.brand.brand;
                        this.studio_brand_avatar = response.data.brand.avatar;
                    }
                })
            }
        },
        created() {
            if(need_init){
                this.loadBrandInfo();
            }
        }
    }

}

async function getBrandInfo(){
    var url = "/api/v1/web_estudio/brand/info";
    return await axios.get(url);
}

