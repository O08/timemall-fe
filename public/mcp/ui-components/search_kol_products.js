/**
 * KOL 选品卡片矩阵
 * @param {Object} jsonResult - 下游微服务返回的全量原始 JSON 对象
 */
export default function render(jsonResult) {
    const website="https://bluvarri.com";
    // 1. 业务异常状态码拦截层
    const code = jsonResult?.code !== undefined ? jsonResult.code : 200;
    const message = jsonResult?.msg || jsonResult?.message || "未知错误";
    const SUCCESS_CODES = [200, 0, "200", "0"];
  
    if (!SUCCESS_CODES.includes(code)) {
      return `
        <div style="display: flex; align-items: center; gap: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin: 10px 0; font-family: sans-serif; max-width: 440px;">
          <span style="font-size: 16px;">🔒</span>
          <div><strong>接口响应异常 (Code: ${code})</strong>: ${message}</div>
        </div>
      `;
    }
  
    // 2. 稳健提取单品数组
    const items = jsonResult?.product?.records || [];
  
    if (items.length === 0) {
      return `<div style="color: #9ca3af; padding: 25px; font-size: 13px; text-align: center; font-family: sans-serif; border: 1px dashed #e5e7eb; border-radius: 12px;">📦 橱窗内暂无匹配的 KOL 选品</div>`;
    }
  
    // 3. 核心业务流：循环编排富媒体带跳转卡片
    const productsGridHtml = items.map(product => {
      const isAddedToChoice = String(product.inChoice) === "1";
  
      const price = product.planPrice ? `￥${product.planPrice}` : "暂无报价";
      const totalSales = product.sales ? `￥${product.sales}` : "￥0";
  

      const targetJumpUrl = `${website}/mall/cell-detail?cell_id=${product.cellId}&brand_id=${product.supplierBrandId}`;
  
      const actionButtonHtml = targetJumpUrl 
        ? `
          <a href="${targetJumpUrl}" 
             target="_blank" 
             rel="noopener noreferrer" 
             referrerpolicy="no-referrer"
             style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background 0.2s;">
             立即查看
          </a>`
        : `--`;
  
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; background: #ffffff; box-shadow: 0 4px 12px -1px rgba(0,0,0,0.02); min-width: 260px; display: flex; flex-direction: column; justify-content: space-between; font-family: -apple-system, sans-serif;">
          
          <!-- 头部看板 -->
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
              <h4 style="margin: 0; font-size: 14px; color: #1f2937; font-weight: 600; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${product.productName || '选品名'}">
                ${product.productName || '未命名爆款单品'}
              </h4>
              <span style="flex-shrink: 0; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; white-space: nowrap;
                background: ${isAddedToChoice ? '#f0fdf4' : '#eff6ff'}; 
                color: ${isAddedToChoice ? '#16a34a' : '#2563eb'};
                border: 1px solid ${isAddedToChoice ? '#bbf7d0' : '#bfdbfe'};">
                ${isAddedToChoice ? '✦ 橱窗中' : '+ 可带货'}
              </span>
            </div>
            <span style="font-size: 11px; color: #9ca3af; font-family: monospace; display: block;">商品ID: ${product.cellId || 'N/A'}</span>
          </div>
  
          <!--属性大背板 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f9fafb; padding: 10px; border-radius: 8px; margin-bottom: 14px; font-size: 12px;">
            <div style="color: #4b5563;">💰 单价: <strong style="color: #111827; font-family: monospace;">${price}</strong></div>
            <div style="color: #4b5563;">📈 销售额: <strong style="color: #111827; font-family: monospace;">${totalSales}</strong></div>
            <div style="color: #4b5563;">🔥 特约销量: <strong style="color: #111827;">${product.cellSaleVolume || '0'}</strong></div>
            <div style="color: #4b5563;">📊 单品销量: <strong style="color: #111827;">${product.planSaleVolume || '0'}</strong></div>
            <div style="color: #4b5563;">👀 浏览量: <strong style="color: #111827; font-family: monospace;">${product.views || '0'}</strong></div>
            <div style="color: #4b5563;">带货达人: <strong style="color: #111827;">${product.influencers || '0'} 人</strong></div>
          </div>
  
          <!-- 佣金 -->
          <div style="border-top: 1px dashed #f3f4f6; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 11px; color: #6b7280; display: block; margin-bottom: 2px;">佣金比例</span>
              <span style="font-size: 18px; color: #2563eb; font-weight: 700; font-family: monospace;">${product.revshare || '0'}%</span>
            </div>
            
            <!--  按钮级无损安全跳转插槽 -->
            <div>
              ${actionButtonHtml}
            </div>
          </div>
  
        </div>
      `;
    }).join("");
  
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; max-width: 540px; margin: 10px 0;">
        ${productsGridHtml}
      </div>
    `;
  }
  