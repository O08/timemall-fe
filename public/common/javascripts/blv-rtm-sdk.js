import ReconnectingWebSocket from 'reconnecting-websocket';


const wsOptions = {
    minReconnectionDelay: 1000,     // 最小重连延迟 1秒
    maxReconnectionDelay: 10000,    // 最大重连延迟 10秒
    reconnectionDelayGrowFactor: 1.3, // 每次失败后延迟增长倍数
    minUptime: 5000,
    connectionTimeout: 4000,
    maxRetries: Infinity
};


class RtmChannel {
    constructor(channelId, rtmManager) {
        this.channelId = channelId;
        this.rtmManager = rtmManager;
        this.callbacks = {};
    }

    async join() {
        this.rtmManager.activeChannelId = this.channelId;
        this.rtmManager.send({
            event: 'JOIN_GROUP',
            groupId: this.channelId // Match  Java 'groupId' field
        });
    }
    /**
     * 发送数据到服务器
     * @param {Object} messageObj - 比如 { text: "ok", type: "image", url: "..." }
     */
    async sendMessage(messageObj) {
        return new Promise((resolve, reject) => {
            if (this.rtmManager.rws.readyState === 1) {
                // 构造发往 T-io 的标准包
                const payload = {
                    event: 'NOTIFY_PULL', // 触发后端广播逻辑
                    groupId: this.channelId,
                    ...messageObj // 💡 将你传入的对象展开合并到 payload 中
                };

                this.rtmManager.send(payload);
                resolve();
            } else {
                reject(new Error("WebSocket 未连接"));
            }
        });
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    _handleMessage(data) {
        const eventName = data.event; 
        if (this.callbacks[eventName]) {
            this.callbacks[eventName](data);
        } 
        
        if (this.callbacks['ChannelMessage']) {
            this.callbacks['ChannelMessage'](data);
        }
    }
}

export class RtmManager {
    constructor(url) {
        this.url = url;
        
        this.rws = new ReconnectingWebSocket(url,[],wsOptions);
        this.channels = {};
        this.events = {}; // 💡 FIXED: Must initialize this object

        this.rws.onmessage = (event) => {
            if (event.data === 'pong') return;
            console.log("listener:"+ event.data);
            try {
                const data = JSON.parse(event.data);
                const channelId = data.groupId; 
                if (channelId && this.channels[channelId]) {
                    this.channels[channelId]._handleMessage(data);
                }
            } catch (e) { /* handle heartbeat */ }
        };

        this.rws.onopen = () => {
            this._trigger('open');
            // 💡 增加 0-2秒的随机抖动，彻底打散 10 万人的 JOIN_GROUP 请求
            const jitter = Math.random() * 2000; 
            // 💡 只恢复当前正在聊天的群，防止后端解绑逻辑导致焦点错乱
            setTimeout(() => {
                if (this.activeChannelId && this.channels[this.activeChannelId]) {
                    console.log(`[RTM] Re-syncing active channel: ${this.activeChannelId}`);
                    this.channels[this.activeChannelId].join();
                }
            }, jitter);
        };
        this.rws.onclose = () => this._trigger('close');
        this.rws.onerror = (err) => this._trigger('error', err);

        // 浏览器唤醒重连
        this._visibilityHandler = () => {
            if (document.visibilityState === 'visible') {
                console.log('[RTM] 页面唤醒，检查连接...');
                if (this.rws.readyState !== 1 && this.rws.readyState !== 0) {
                    this.rws.reconnect();
                }
                // 唤醒后立即触发业务层拉取数据，防止休眠期间漏掉信号
                if (this.activeChannelId) {
                    this._trigger('open'); 
                }
            }
        };

         // 监听网络切换重连
        this._onlineHandler = () => {
            if (this.rws.readyState !== 1 && this.rws.readyState !== 0) {
                this.rws.reconnect();
            }
        };

        document.addEventListener('visibilitychange', this._visibilityHandler);
        window.addEventListener('online', this._onlineHandler);

    }

    destroy() {
        this.rws.close();
        // 移除全局监听器，防止内存泄漏
        document.removeEventListener('visibilitychange', this._visibilityHandler);
        window.removeEventListener('online', this._onlineHandler);
        this.channels = {};
        this.events = {};
    }

    renewToken(newToken) {
        console.log("[RTM] Renewing token...");
        
        //  Rebuild the URL with the new token
        // This logic assumes your URL format is: ws://domain/rtm?token=oldToken
        const urlObj = new URL(this.url);
        urlObj.searchParams.set('token', newToken);
        const newUrl = urlObj.toString();

        // Update the stored URL
        this.url = newUrl;

        // Update the underlying ReconnectingWebSocket URL
        // In the 'reconnecting-websocket' library, you can update the url property
        this.rws.url = newUrl;
        
        console.log("[RTM] Token updated for future reconnects.");
    }

    on(eventName, callback) {
        this.events[eventName] = callback;
    }

    _trigger(eventName, data) {
        if (this.events && this.events[eventName]) {
            this.events[eventName](data);
        }
    }

    createChannel(channelId) {
        const inst = new RtmChannel(channelId, this);
        this.channels[channelId] = inst;
        return inst;
    }

    send(data) {
        if (this.rws.readyState === 1) {
            this.rws.send(JSON.stringify(data));
        }
    }
}
