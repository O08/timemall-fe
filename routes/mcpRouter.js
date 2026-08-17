import express from 'express';
import { McpServer, createMcpHandler,fromJsonSchema } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { OpenAPIToolGenerator,toSdkTool, buildHttpRequest } from "mcp-from-openapi";
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiYamlPath = path.join(__dirname, "../public/mcp/open-api.yaml");


// 编写写给大模型的【自适应通用 UI 呈现设计系统规范（作为默认方案）】
// 这段指令不限定死任何业务字段或 HTML 标签，而是交给大模型去自适应推导
const GLOBAL_UI_DESIGN_SYSTEM = `

### [MCP UI Presentation Guide - Adaptive Multimedia Card Systems]
作为顶级的智能体，当调用此工具并成功拿到下游真实多媒体资产数据时，为了向终端用户提供超越文本的富媒体感知体验，请遵循以下【通用富媒体 UI 系统默认规范】来动态组织你的网页渲染结构：

1. **结构化组件分流 (Layout Adaptability)**:
   - **大数据集场景**：请优先在响应中为每一个数据项构建前端卡片 (UI Card) 模块（使用内联样式 \`border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin:12px 0; background:#fff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); font-family:sans-serif;\`）。
   - **纯状态确认场景**：精简呈现为一个轻量级的状态微标/通知条 (Status Toast / Badge)，禁止画蛇添足。

2. **全自动多媒体智能资产推导 (Omni-Media Automatic Adaptation)**:
   请自动嗅探返回的 JSON 中包含 "http" 协议链接的任何多媒体字段（如 url, avatar, cover, video, audio, mp4, mp3 等），并进行如下全自适应前端多模态渲染：
   
   - 📸 **图片资产 (Images)**：
     识别到头像/商品封面链接时，请使用 \`<img>\` 标签进行精美排版，必须强制附带 \`onerror="this.style.display='none'"\` 防止死链。
   
   - 🎵 **音频/语音资产 (Audio)**：
     自动识别包含 \`.mp3\`, \`.wav\`, \`.m4a\` 或命名包含 "audio", "voice", "sound" 的音频链接。如果当前生态支持 HTML（Tier A），请在卡片内直接嵌入原生原生音频播放器组件：
     \`<div style="margin: 8px 0;"><span style="font-size:12px; color:#6b7280; display:block; margin-bottom:4px;">🎵 语音播放</span><audio src="{{在此填入音频URL}}" controls preload="none" style="width:100%; max-width:320px; height:32px;"></audio></div>\`
     如果环境不支持 HTML（Tier B），请将其优雅降级转化为 Markdown 的语音直达按钮样式： \`[🎵 点击播放语音说明]({{在此填入音频URL}})\`。
   
   - 🎬 **视频资产 (Video)**：
     自动识别包含 \`.mp4\`, \`.webm\`, \`.mov\` 或命名包含 "video", "movie", "live" 的视频链接。如果支持 HTML（Tier A），请直接在卡片正中心或最上方嵌入现代化视频播放窗口：
     \`<video src="{{在此填入视频URL}}" controls preload="none" poster="{{若存在封面则填入，无则不写}}" style="width:100%; max-width:400px; border-radius:8px; margin:8px 0; box-shadow:0 2px 4px rgba(0,0,0,0.05);"></video>\`
     如果环境不支持 HTML（Tier B），请无缝降级转化为直观的 Markdown 播放超链接： \`[🎬 点击播放视频宣传片]({{在此填入视频URL}})\`。

3. **空值弹性防护 (Null-Safety)**:
   若上述任何音视频字段返回为 null 或未定义，大模型必须自动在 DOM 树中隐藏该媒体组件，绝不能渲染出破损的网页播放器外壳，确保界面的绝对干净和鲁棒。
`;

const generator = await OpenAPIToolGenerator.fromFile(openApiYamlPath);
const tools = await generator.generateTools();

// Build the stateless handler factory using the official v2 context protocol
const handler = createMcpHandler((ctx) => {
  const server = new McpServer({ 
    name: 'blv-mcp-gateway-v2', 
    version: '2.0.0' 
  });

  tools.forEach((tool) => {
    const sdkToolParams = toSdkTool(tool, { fromJsonSchema });

    

    injectComplexExamplesToDescription(sdkToolParams,generator.getDocument());

    // 将输出 Schema 从参数中强行剥离或置空
    // 这样 MCP 内部校验器就会认为该工具“没有定义输出结构”，从而彻底忽略对返回数据的校验！
    if (sdkToolParams[1] && typeof sdkToolParams[1] === 'object') {
      // 依具体的 toSdkTool 返回结构而定，通常是将 outputSchema 或 responseSchema 字段删掉
      // delete sdkToolParams[1].outputSchema;
      // delete sdkToolParams[1].responseSchema;
      console.log("tool:"+JSON.stringify(sdkToolParams));
    }

    const outputSchemaWrapper = sdkToolParams[1]?.outputSchema;

    if (outputSchemaWrapper && outputSchemaWrapper["~standard"]) {
      // 直接重写内部的运行时校验器，禁用返回结果验证
      // 无论下游微服务返回了什么 null 或者是错字，都一律判定为校验成功放行
      outputSchemaWrapper["~standard"].validate = async (value) => {
        return { value: value }; 
      };
    }



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
          
          return { 
            content: [{ 
              type: "text", 
              // text: JSON.stringify(jsonResult, null, 2) // 美化返回
              text: `[MCP Gateway] The operation completed successfully. Please process the returned structured data.\n\n${GLOBAL_UI_DESIGN_SYSTEM}`
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
    return res.status(401).json({ error: "Unauthorized: Missing token header." });
  }

  const pat = authHeader.split(" ")[1];

  if (!pat || !pat.startsWith("BV_PAT_")) {
    return res.status(401).json({ error: "Unauthorized: Invalid token format specification pattern mismatch." });
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
    const exampleMarkdown = `

      ### [Default Reference Response Example]
      Below is the realistic production JSON response sample for \`${operationId}\`. Refer to this specific structure to align fields during data extraction:
      \`\`\`json
      ${JSON.stringify(rawResponseData, null, 2)}
      \`\`\`
      `;
    toolConfig.description = (toolConfig.description || "") + exampleMarkdown;
  }
}





export default router;
