/**
 * 
 * @param {Object} jsonResult - 下游微服务返回的原始完好 JSON 树
 */
export default function render(jsonResult) {

    const code = jsonResult?.code !== undefined ? jsonResult.code : 200;
    const message = jsonResult?.msg || jsonResult?.message || "未知错误";
  
    // 拦截微服务业务异常（如 403, 401, 500, 400 等）
    if (code !== 200) {
      const isAuthError = code === 403 || code === 401;
      const bgColor = isAuthError ? "#fff7ed" : "#fef2f2";
      const borderColor = isAuthError ? "#fed7aa" : "#fecaca";
      const textColor = isAuthError ? "#c2410c" : "#dc2626";
      const statusIcon = isAuthError ? "🔒" : "⚠️";
  
      // 组件自己掌控大局，为异常状态定制一套紧凑、高水准的警告提示框（不渲染滑稽的空大卡片）
      return `
        <div style="display: flex; align-items: center; gap: 10px; background: ${bgColor}; border: 1px solid ${borderColor}; color: ${textColor}; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin: 10px 0; font-family: sans-serif; max-width: 440px;">
          <span style="font-size: 16px;">${statusIcon}</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 2px;">接口响应异常 (Code: ${code})</div>
            <div style="font-size: 12px; opacity: 0.9;">${message}</div>
          </div>
        </div>
      `;
    }

    // 组件自己最清楚自己的接口结构叫 friend.records
    const records = jsonResult?.friend?.records || [];
  
    // 如果没有数据，组件自己决定画一个精美的“暂无好友”空状态
    if (records.length === 0) {
      return `<div style="color: #9ca3af; padding: 20px; font-size: 13px; text-align: center;">📭 暂无私信好友记录</div>`;
    }
  
    // 将所有好友卡片包裹在一个现代化的双列 Grid 弹性网格中！
    const cardListHtml = records.map(item => {
      const isOnline = item.brandMark === "3";
      const defalutAvatar="https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/panda-kawaii.png";
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${item.avatar || defalutAvatar}" 
     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" 
     onerror="this.onerror=null; this.src='${defalutAvatar}'"/>
            <div style="flex: 1; min-width: 0;">
              <h4 style="margin: 0 0 2px 0; font-size: 14px; color: #1f2937; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title || '用户'}</h4>
              <span style="font-size: 10px; color: ${isOnline ? '#16a34a' : '#9ca3af'}; font-weight: 500;">${isOnline ? '● 在线' : '○ 离线'}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  
    // 返回带有全局网格父容器的精美完整页面流
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; max-width: 480px; font-family: sans-serif; margin: 10px 0;">
        ${cardListHtml}
      </div>
    `;
}
  