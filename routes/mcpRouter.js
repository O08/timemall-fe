import express from 'express';
import fs from 'fs';
import { McpServer, createMcpHandler,fromJsonSchema } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { OpenAPIToolGenerator,toSdkTool, buildHttpRequest } from "mcp-from-openapi";
import path from 'path';
import { fileURLToPath,pathToFileURL } from 'url';

import { mcpAuthMiddleware } from '../public/mcp/auth/dispatcher.js';

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


    server.registerTool(...sdkToolParams, async (input,toolCtx) => {
      const request = buildHttpRequest(tool, input);

      const accessToken = toolCtx?.http?.authInfo?.token || toolCtx?.http?.authInfo?.pat;

      const finalHeaders = {
        ...request.headers,
        ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
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
                content: [
                  { 
                  type: "text", 
                  text: `[MCP Gateway] Media pipeline executed. The complete data view has been pushed to the standalone sandboxed layout module below.` 
                 },
                 {
                  type: "resource",
                  resource: {
                    uri: `ui://blv-mcp-gateway/render/views/${operationId}/${Date.now()}`,
                    mimeType: "text/html",
                    text: compiledHtmlFeed 
                  }
                }
              ],
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


router.all('/mcp', mcpAuthMiddleware, (req, res) => void node(req, res, req.body));






export default router;
