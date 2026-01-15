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
     return adaptiveImageUri(rawAvifUri,this.device.supportAvif);
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

function adaptiveImageUri(rawAvifUri,supportAvif){
    var renderUrl= rawAvifUri;
    if(rawAvifUri && typeof rawAvifUri === 'string' && rawAvifUri.slice(-5)==='.avif'){
        renderUrl = supportAvif ? rawAvifUri: rawAvifUri.slice(0,rawAvifUri.length-5);
    }
    return renderUrl;
}