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
    
    // 将输出 Schema 从参数中强行剥离或置空
    // 这样 MCP 内部校验器就会认为该工具“没有定义输出结构”，从而彻底忽略对返回数据的校验！
    if (sdkToolParams[1] && typeof sdkToolParams[1] === 'object') {
      // 依具体的 toSdkTool 返回结构而定，通常是将 outputSchema 或 responseSchema 字段删掉
      delete sdkToolParams[1].outputSchema;
      delete sdkToolParams[1].responseSchema;
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
              text: JSON.stringify(jsonResult, null, 2) // 美化返回
            }] 
          };

        } catch (jsonError) {
          // 如果下游返回的本来就是非 JSON 纯文本，原样包装输出
          console.warn("[网关提示] 下游返回数据非标准 JSON，将以纯文本形式交付大模型。");
          return { 
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

export default router;
