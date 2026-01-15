const Pagination = {
    methods: {
        pageInit(info){
           info.param.current = 1;
           info.param.size = info.size;
           
        //    this.pageDataSource(info);
              this.processflow(info);
        },
        pageGo(info,to){
           if(info.current == to){
            return
           }
           info.param.current = to;
           info.param.size = info.size;
        //    this.pageDataSource(info);
            this.processflow(info);
        },
        pageNext(info){
            // last page , return
            if(info.current == info.pages){
                return;
            }
            info.param.current = info.current + 1;
            info.param.size = info.size;
            // this.pageDataSource(info);
            this.processflow(info);
        },
        pagePre(info){
            // first page , return
            if(info.current == 1){
                return;
            }
            info.param.current = info.current - 1;
            info.param.size = info.size;
            // this.pageDataSource(info);
            this.processflow(info);
        },
        reloadPage(info){
            info.param.current = info.current;
            info.param.size = info.size;
            // this.pageDataSource(info);
            this.processflow(info);
        },
        pageDataSource(info){
            $.get(info.url,info.param,function(data) {
                    info.responesHandler(data);
               })
        },
        interceptor(info){
            if(!!info.urlHandler){
                info.urlHandler(info);
            }
            if(!!info.paramHandler){
                info.paramHandler(info);
            }
        },
        processflow(info){
            this.interceptor(info);
            this.pageDataSource(info);
        },
        doPaging({current, pages, size}) {
            if (!current || !pages || !size) return null;

            let rg= current + Math.floor(size/2);

            if(rg<size) rg=size;

            let max = Math.min(pages,rg);

            let min= Math.max(current - Math.floor(size/2),1);

             if(current>=size && (max-min+1)<size) min= max -size +1;

            let prev = current === 1 ? null : current - 1,
                    next = current === max ? null : current + 1,
                    items = [1]
        
            if (current === 1 && max === 1) return {current, prev, next, items}
          
        
            for (let i = min > 2 ? min : 2; i <= max; i++) items.push(i)

        
            if(items.length>size ) items[1]="..."
        
            return {current, prev, next, items}
        }
        

        
    }

}

export default Pagination;
