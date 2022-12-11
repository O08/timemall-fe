const Pagination = {
    methods: {
        pageInit(info){
           info.param.current = 1;
           info.param.size = info.size;
           // if url handler not empty
           if(!!info.urlHandler){
              info.urlHandler(info);
            }
           this.pageDataSource(info);
        },
        pageGo(info,to){
           if(info.current == to){
            return
           }
           info.param.current = to;
           info.param.size = info.size;
           this.pageDataSource(info);
        },
        pageNext(info){
            // last page , return
            if(info.current == info.pages){
                return;
            }
            info.param.current = info.current + 1;
            info.param.size = info.size;
            this.pageDataSource(info);
        },
        pagePre(info){
            // first page , return
            if(info.current == 1){
                return;
            }
            info.param.current = info.current - 1;
            info.param.size = info.size;
            this.pageDataSource(info);
        },
        reloadPage(info){
            this.pageDataSource(info);
        },
        pageDataSource(info){
             
            $.get(info.url,info.param,function(data) {
                    info.responesHandler(data);
               })
        }
        
    }

}

export default Pagination;
