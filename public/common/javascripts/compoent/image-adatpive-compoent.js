import axios from 'axios';


const ImageAdaptiveComponent = {
   data(){
    return {
        device:{
            supportAvif: false
        }
    }
   },
   methods: {
    adaptiveImageUriV(rawAvifUri){
        var renderUrl= rawAvifUri;
        if(rawAvifUri&&rawAvifUri.slice(-5)==='.avif'){
            renderUrl = this.device.supportAvif ? rawAvifUri: rawAvifUri.slice(0,rawAvifUri.length-5);
        }
        console.log("img url:"+renderUrl);
        return renderUrl;
    }
  },
   created(){
    this.device.supportAvif=document.getElementsByClassName("avif").length>0;
     console.log("device support avif:" + this.device.supportAvif);
    }
}
export {
    ImageAdaptiveComponent
}