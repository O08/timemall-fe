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
        doPaging({current, pages, max}) {
            if (!current || !pages || !max) return null
            max = pages < max ? pages: max;
            let prev = current === 1 ? null : current - 1,
                    next = current === max ? null : current + 1,
                    items = [1]
        
            if (current === 1 && max === 1) return {current, prev, next, items}
            if (current > 4) items.push('…')
        
            let r = 2, r1 = current - r, r2 = current + r
        
            for (let i = r1 > 2 ? r1 : 2; i <= Math.min(max, r2); i++) items.push(i)
        
            if (r2 + 1 < max) items.push('…')
            if (r2 < max) items.push(max)
        
            return {current, prev, next, items}
        }
        

        
    }

}

export default Pagination;
