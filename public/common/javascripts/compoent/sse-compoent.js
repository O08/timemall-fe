let source = null;

export default function Ssecompoent(config)  {
    const {
        sslSetting = {}
    } = config  
    return {
        data() {
            return {
                sseSource: source
            }
        },
        methods: {
            sseInitV(){
                sseInit(sslSetting);
            }
        },
        created(){
            this.sseInitV();
        }
    }
}

function sseInit(sslSetting){
    if (window.EventSource) {

        // 建立连接
        source = new EventSource('/api/v1/ms/sse/connect');
    
        /**
         * 连接一旦建立，就会触发open事件
         * 另一种写法：source.onopen = function (event) {}
         */
        source.onopen = function (event) {
            console.log("sse--->建立连接。。。");
        }
        // source.addEventListener('open', function (e) {
        //     console.log("sse--->建立连接。。。");
        // }, false);
    
        /**
         * 客户端收到服务器发来的数据
         * 另一种写法：source.onmessage = function (event) {}
         */
        source.addEventListener('message', function (e) {
            console.log("sse--->消息接受。。。");
            sslSetting.onMessage(e);
        });
    
    
        /**
         * 如果发生通信错误（比如连接中断），就会触发error事件
         * 或者：
         * 另一种写法：source.onerror = function (event) {}
         */
        source.addEventListener('error', function (e) {
            if (e.readyState === EventSource.CLOSED) {
                console.log("sse--->连接关闭");
            } else {
                console.log(e);
            }
        }, false);
    
    } else {
        console.log("你的浏览器不支持SSE");

    }
}



// 监听窗口关闭事件，主动去关闭sse连接，如果服务端设置永不过期，浏览器关闭后手动清理服务端数据
window.onbeforeunload = function () {
    closeSse();
};

// 关闭Sse连接
function closeSse() {
    source.close();
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '/api/v1/ms/sse/close' , true);
    httpRequest.send();
    console.log("close");
}
