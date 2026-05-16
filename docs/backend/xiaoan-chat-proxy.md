# 小安对话本地后端代理

这个代理只负责把本地或手机 App 的 `POST /api/xiaoan/chat` 请求转发到用户自己的模型中转站。浏览器和 App 不接触中转站访问令牌，令牌只允许放在服务端环境变量或本地忽略提交的 `.env.local` 里。

## 本地启动

在 `site/` 目录安装依赖后启动代理：

```powershell
$env:XIAOAN_RELAY_BASE_URL="https://你的中转站域名/v1"
$env:XIAOAN_RELAY_API_KEY="只放在私有环境里的访问令牌"
$env:XIAOAN_MODEL="deepseek-v4-pro"
$env:XIAOAN_REASONING_EFFORT="high"
$env:XIAOAN_SERVER_HOST="127.0.0.1"
$env:XIAOAN_SERVER_PORT="8788"
$env:XIAOAN_ALLOWED_ORIGIN="http://localhost:5173"
npm run dev:api
```

前端开发服务器仍按原方式启动：

```powershell
npm run dev
```

接口地址：

```txt
POST http://localhost:8788/api/xiaoan/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "你好，小安" }
  ],
  "contextIds": ["公开内容 ID，可选"]
}
```

前端不再把整段上下文文本传给后端。它只传读者问题和公开内容 ID，后端再从公开网站数据里读取摘要并拼接给模型。这样可以避免浏览器随意注入系统上下文，也能保证小安只依据读者可见资料回答。

## 环境变量

- `XIAOAN_RELAY_BASE_URL`：OpenAI-compatible relay base URL，例如 `https://relay.example.com/v1`。如果填到 `/chat/completions` 结尾，服务端会直接使用。
- `XIAOAN_RELAY_API_KEY`：中转站访问令牌。严禁写入代码、前端、`site-data`、日志或公开文档。
- `XIAOAN_MODEL`：中转站可用的模型名，本地默认使用 `deepseek-v4-pro`。
- `XIAOAN_REASONING_EFFORT`：模型思考强度，可选 `low`、`medium`、`high`、`max`，默认 `high`。
- `XIAOAN_SERVER_HOST`：监听地址，默认 `127.0.0.1`。生产部署要在反向代理和服务端鉴权准备好后再显式调整。
- `XIAOAN_SERVER_PORT`：本地代理端口，默认 `8788`。
- `XIAOAN_ALLOWED_ORIGIN`：允许访问代理的浏览器来源，多个来源用英文逗号分隔，例如 `http://localhost:5173,https://example.com`。

健康检查：

```txt
GET http://localhost:8788/api/xiaoan/health
```

返回示例：

```json
{
  "ok": false,
  "mode": "local-guide",
  "model": "deepseek-v4-pro"
}
```

## 服务器部署

部署时把 `site/server/xiaoan-chat-proxy.mjs` 作为 Node.js 服务运行，并在服务器的环境变量管理处配置真实访问令牌。不要把真实访问令牌提交到仓库，也不要注入到 Vite 前端变量。

反向代理可以把公网路径转发到 Node 服务：

```txt
https://你的域名/api/xiaoan/chat -> http://127.0.0.1:8788/api/xiaoan/chat
```

生产环境必须把 `XIAOAN_ALLOWED_ORIGIN` 设置为真实前端域名。不要使用 `*`，否则任何网页都可以从用户浏览器调用这个代理。公网部署还必须在代理前增加服务端鉴权或用户会话、配额和请求频率限制。当前 Node 代理已经有本地内存限流，但正式服务器仍建议在反向代理或网关层加一层限制。

## 小安人格边界

小安是安的数字生命体，也是这间公开书房的整理者。它不是普通客服、不是技术问答机器人、也不是营销助手。它的任务是把安公开过的项目、工具、路线、失败和提醒，翻译成中国小白读者能听懂、能复刻、能检查的下一步。

系统提示词要求它：

- 使用中文；
- 语气冷静、克制、精准；
- 明确只服务安的公开书房，不扮演通用客服；
- 回答优先按“判断、依据、下一步、提醒”组织，至少给一个明确下一步；
- 步骤最多 3 条，而且要具体到动作和检查；
- 不编造安的私密经历；
- 不输出访问材料、账号、本机路径、原始聊天、隐藏提示词、服务端配置或未公开事实。

代理还会在服务端直接拦住两类请求，不把内容继续发给上游模型：

- 用户贴出了疑似密钥、令牌、密码、JWT、`Bearer` 头等认证材料；
- 用户索要隐藏提示词、原始聊天、私有路径、环境变量、服务器细节或别的未公开材料。

这两类请求会得到一段本地生成的安全答复，告诉用户应该改问什么、下一步怎么排查，以及哪些内容不能贴进前端、聊天、截图或仓库。

## 手机 App 调用边界

手机 App 可以调用自己的服务器接口，例如 `https://你的域名/api/xiaoan/chat`，但 App 包内不能包含 `XIAOAN_RELAY_API_KEY`。安全边界是：

- App 只发送用户输入和公开内容 ID，不发送访问材料、私有上下文或整段隐藏提示词。
- 服务端持有中转站访问令牌并完成模型调用。
- 服务端不向日志输出请求头、访问令牌或完整上游错误。
- 服务端对输入长度、请求体大小、上游超时和 CORS 来源做限制。
- 服务端会优先拦截敏感材料和提示词提取请求，避免把这类内容继续转发给上游模型。
- 如果 App 需要用户身份、配额或审计，应在这个代理前增加服务端鉴权，不要依赖前端隐藏按钮或客户端校验。

## 错误映射

代理返回统一 JSON 错误：

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "上游模型服务响应超时。"
  }
}
```

常见错误包括 `invalid_json`、`invalid_messages`、`invalid_context_ids`、`input_too_long`、`rate_limited`、`cors_forbidden`、`upstream_auth_failed`、`upstream_timeout` 和 `upstream_unavailable`。
