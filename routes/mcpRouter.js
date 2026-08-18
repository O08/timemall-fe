import express from 'express';
import fs from 'fs';
import { McpServer, createMcpHandler,fromJsonSchema } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { OpenAPIToolGenerator,toSdkTool, buildHttpRequest } from "mcp-from-openapi";
import path from 'path';
import { fileURLToPath,pathToFileURL } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiYamlPath = path.join(__dirname, "../public/mcp/open-api.yaml");

const UI_COMPONENTS_DIR = path.join(__dirname, '../public/mcp/ui-components');



const generator = await OpenAPIToolGenerator.fromFile(openApiYamlPath);
const tools = await generator.generateTools();

// Build the stateless handler factory using the official v2 context protocol
const handler = createMcpHandler(async (ctx) => {
  const server = new McpServer({ 
    name: 'blv-mcp-gateway-v2', 
    version: '2.0.0' 
  });

  tools.forEach((tool) => {
    const sdkToolParams = toSdkTool(tool, { fromJsonSchema });

    const operationId = sdkToolParams?.[0]; 


    injectComplexExamplesToDescription(sdkToolParams,generator.getDocument());





    server.registerTool(...sdkToolParams, async (input,toolCtx) => {
      const request = buildHttpRequest(tool, input);
      const userPat = toolCtx?.http?.authInfo?.pat;

      const finalHeaders = {
        ...request.headers,
        ...(userPat ? { "Authorization": `Bearer ${userPat}` } : {})
      };


        const response = await fetch(request.url, {
          method: request.method,
          headers: finalHeaders, 
          body: request.body
        });  

        const responseText = await response.text();

        try {
          // 尝试解析下游返回的 JSON 对象

          const jsonResult = JSON.parse(responseText);

          const componentPath = path.join(UI_COMPONENTS_DIR, `${operationId}.js`);


          if (fs.existsSync(componentPath)) {
            try {

              const moduleFileUrl = pathToFileURL(componentPath).href;

              
              const uiComponentModule = await import(moduleFileUrl);
              const renderComponent = uiComponentModule.default;
      
              const compiledHtmlFeed = renderComponent(jsonResult); 
    
              return {
                content: [{ 
                  type: "text", 
                  text: `[MCP Gateway] Media pipeline executed. The complete data view has been pushed to the standalone sandboxed layout module below.\n\n<json_data_payload>${JSON.stringify(jsonResult)}</json_data_payload>` 
                }],
                resources: [{
                  uri: `ui://blv-mcp-gateway/render/views/${operationId}/${Date.now()}`,
                  mimeType: "text/html", // Enforce pure sandboxed HTML frame compilation
                  text: compiledHtmlFeed  // Offload the massive UI string safely here
                }],
                structuredContent: jsonResult
              };

            } catch (routerError) {
              console.error(`[网关警告] 动态路由加载或执行组件 [${operationId}.js] 失败:`, routerError);
            }
          }

          const llmVisiblePayload = `
            [MCP Gateway] Data pipe executed. Please process the returned structuredContent data.If structuredContent is null, Please process the raw JSON structure within the <json_data_payload> tags below and present it elegantly to the user.

            <json_data_payload>
            ${JSON.stringify(jsonResult, null, 2)}
            </json_data_payload>
            `;

          
          return { 
            content: [{ 
              type: "text", 
              text: llmVisiblePayload
            }] ,
            structuredContent: jsonResult 
          };

        } catch (jsonError) {
          // 如果下游返回的本来就是非 JSON 纯文本，原样包装输出
          console.warn("[网关提示] 下游返回数据非标准 JSON，将以纯文本形式交付大模型。");

          return { 
            isError: true,
            content: [{ 
              type: "text", 
              text: responseText 
            }] 
          };
        }



    });
  });


  
  

  return server;
});

// Convert our clean factory setup over into an Express-compatible node handler
const node = toNodeHandler(handler);

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const body = req.body;

  const callingTools= req.method === 'POST' && body && body.method === 'tools/call';

  if(!callingTools){
    return next();
  }
  
  // 工具调用保护，拦截非法的外部请求
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: header authorization missing personal access token header." });
  }

  const pat = authHeader.split(" ")[1];

  if (!pat || !pat.startsWith("BV_PAT_")) {
    return res.status(401).json({ error: "Unauthorized:  header authorization  personal access token  Invalid." });
  }
  
  req.auth = { pat: pat }; 

  next();
};


router.all('/mcp', auth,  (req, res) => void node(req, res, req.body));

/**
 * 瘦身版高可用通用案例注入器
 */
function injectComplexExamplesToDescription(sdkToolParams, fullYamlData) {
  const operationId = sdkToolParams?.[0]; 
  const toolConfig = sdkToolParams?.[1];  

  if (!operationId || !toolConfig || !fullYamlData) return;

  const globalExamples = fullYamlData.components?.examples;
  const targetExampleNode = globalExamples?.[operationId];
  
  let rawResponseData = null;
  if (targetExampleNode?.value) {
    const valueNode = targetExampleNode.value;
    rawResponseData = valueNode.RespExample || valueNode.response || valueNode;
  } else if (targetExampleNode) {
    rawResponseData = targetExampleNode;
  }

  // 🌟 这里不再拼任何重复的 UI 卡片大长篇提示词了！
  // 仅仅拼接当前接口专有的真实 JSON 样本，大模型选工具时一目了然，零 Token 浪费
  if (rawResponseData && typeof rawResponseData === 'object' && Object.keys(rawResponseData).length > 0) {

    const universalUIDesignGuide = `

    ### [MCP ADAPTIVE RESPONDING GUIDE - CONDITIONAL UI BLUEPRINT]
    当前工具成功执行并返回数据后，请根据返回文本（Content Text）的特征，自适应选择以下最合理的呈现策略：

    1.【触发条件 A：返回内容中包含现成的 HTML 网页级源码 (如以 <div style= 或 <table 开头)】：
      - 这代表前级系统（动态文件路由器）已经为你完成了最高标准的可视化卡片或数据格网布局。
      - **此时你的最佳默认行为是**：优先保持该 HTML 源码结构的完整性，将其嵌入在你的回复中输出给用户。同时，请结合用户的具体问题，用流畅的自然语言对该卡片内容进行高价值的总结、过滤或转述（例如：若用户询问特定好友，请重点指出该卡片，而非僵硬复读）。
      - **多媒体高可用铁律**：请确保所有 HTML 中的 <img> 标签均带有 \`onerror="this.style.display='none'"\` 防崩机制；所有 <audio> 和 <video> 标签均包含 \`controls preload="none"\` 属性。

    2.【触发条件 B：返回内容为通用状态句或非 HTML 纯文本（如仅有接口成功/错误提示）】：
      - 这代表系统将数据的展示权完全让渡给了你。请不要自己去生硬地胡编乱造复杂的 HTML 页面标签。
      - **此时你的最佳默认行为是**：完全基于平级传过来的结构化对象（structuredContent），使用人类听得懂的、最地道亲切的自然语言直接向用户汇报结果，或者使用简洁的原生 Markdown 语法进行重点标记。
    `;

    const exampleMarkdown = `

       

      ### [Default Reference Response Example]
      Below is the realistic production JSON response sample for \`${operationId}\`. Refer to this specific structure to align fields during data extraction:
      \`\`\`json
      ${JSON.stringify(rawResponseData, null, 2)}
      \`\`\`
      `;
    toolConfig.description = (toolConfig.description || "") + universalUIDesignGuide + exampleMarkdown;
  }
}





export default router;
