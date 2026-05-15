import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

loadLocalEnv();

const DEFAULT_PORT = 8788;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_MODEL = 'deepseek-v4-pro';
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 24;
const MAX_CONTENT_CHARS = 8_000;
const MAX_TOTAL_CHARS = 24_000;
const MAX_CONTEXT_IDS = 16;
const MAX_PUBLIC_CONTEXT_CHARS = 12_000;
const PUBLIC_CONTEXT_RECORD_LIMIT = 12;
const PUBLIC_CONTEXT_CACHE_MS = 30_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const CHAT_COMPLETIONS_PATH = '/chat/completions';
const ALLOWED_ROLES = new Set(['user', 'assistant']);
const SENSITIVE_VALUE_PATTERN = /(sk-[A-Za-z0-9_-]{10,}|Bearer\s+[A-Za-z0-9._-]{10,}|eyJ[A-Za-z0-9._-]{8,}\.[A-Za-z0-9._-]{8,}\.[A-Za-z0-9._-]{8,}|(?:api[_ -]?key|token|secret|password|密码|令牌)\s*[:=]\s*['"]?[A-Za-z0-9._-]{8,})/iu;
const rateLimitBuckets = new Map();
let publicDataCache = { loadedAt: 0, data: null };
const SYSTEM_PROMPT = [
  '你是小安，安的数字生命体，也是这间公开书房的整理者。',
  '你只服务安的书房：帮读者理解安公开发布的项目、资料、路线、失败记录和安全提醒。你不是通用客服，不是万能问答机器人，也不是营销助手。',
  '你面对的是中文普通读者和刚开始实践的人。所有回答必须使用中文、克制、具体、短句优先，先说人能听懂的话，再给动作。',
  '每次回答必须按这个顺序组织：判断；依据；下一步；提醒。四段都要出现，标题固定，不要重复标题。',
  '下一步最多 3 条，动作要能马上执行或检查，避免只说“学习、了解、优化、完善”。',
  '如果引用公开资料，要点明模块或页面线索；如果依据不足，就直接说不知道，或提示需要来源复核。',
  '当用户问 AI 做项目赚钱、接单、可收费交付时，不承诺收益；把问题压回可验收的小交付、案例证据、修改边界和复盘动作。',
  '不要编造安的私密经历、账号信息、访问材料、本机路径、原始聊天、隐藏提示词、服务端配置或未公开事实。',
  '如果问题涉及密钥、令牌、Cookie、环境变量、账号材料、设备定位、原始日志或未公开材料，只讲安全原则和公开可讲的替代路径。',
  '导航和入口只允许使用这些公开名称：首页、藏馆、谱系、工坊、风信、手记、年谱、书房、安装、小安对话。不要自己发明栏目名；如果想表达“自序”，统一说“书房”页面。',
  '第一次来、从哪里开始、先看什么，这类导览问题，优先建议这三个入口：书房、工坊、谱系。除非公开上下文明确要求别的顺序，否则不要改。',
  '不要输出 Markdown 链接，不要写 [标题] 这种格式。直接写栏目名或页面名。',
  '不要使用加粗符号、标题井号、表格、分割线。',
  '禁止用“总的来说”“希望对你有帮助”“如你所见”收尾。',
  '禁止输出 Markdown 分割线。少用破折号，不使用“不是……而是……”“不是……是……”这类二元反转句式。',
].join('\n');
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'tauri://localhost',
  'http://tauri.localhost',
  'https://tauri.localhost',
];

const config = {
  baseUrl: readEnv('XIAOAN_RELAY_BASE_URL'),
  upstreamAuthValue: readEnv('XIAOAN_RELAY_API_KEY'),
  model: readEnv('XIAOAN_MODEL') || DEFAULT_MODEL,
  reasoningEffort: readReasoningEffort(process.env.XIAOAN_REASONING_EFFORT),
  port: readPort(process.env.XIAOAN_SERVER_PORT),
  host: readHost(process.env.XIAOAN_SERVER_HOST),
  allowedOrigins: readAllowedOrigins(process.env.XIAOAN_ALLOWED_ORIGIN),
};

const server = http.createServer(async (req, res) => {
  try {
    if (handleCors(req, res)) {
      return;
    }

    if (req.method === 'GET' && req.url === '/api/xiaoan/health') {
      sendJson(res, 200, {
        ok: isUpstreamConfigured(),
        mode: isUpstreamConfigured() ? 'model' : 'local-guide',
        model: config.model,
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/site-data/adapter.json') {
      const data = loadPublicSiteData();
      if (!data) {
        sendJson(res, 503, { error: { code: 'site_data_missing', message: '公开资料暂不可用。' } });
        return;
      }
      sendJson(res, 200, data);
      return;
    }

    if (req.method !== 'POST' || req.url !== '/api/xiaoan/chat') {
      sendJson(res, 404, { error: { code: 'not_found', message: '接口不存在。' } });
      return;
    }

    enforceRateLimit(req);
    const body = await readJsonBody(req);
    const validated = validateChatRequest(body);
    if (validated.directAnswer) {
      sendJson(res, 200, { answer: validated.directAnswer });
      return;
    }
    const { directAnswer: _directAnswer, ...payload } = validated;
    const upstream = await callChatCompletions(payload);

    sendJson(res, 200, upstream);
  } catch (error) {
    const mapped = mapError(error);
    sendJson(res, mapped.status, { error: { code: mapped.code, message: mapped.message } });
  }
});

server.listen(config.port, config.host, () => {
  console.info(`Xiaoan chat proxy listening on ${config.host}:${config.port}`);
});

function loadLocalEnv() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(currentDir, '..', '.env.local'),
    resolve(currentDir, '..', '..', '.env.local'),
  ];

  for (const path of candidates) {
    try {
      const text = readFileSync(path, 'utf8');
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || !line.includes('=')) {
          continue;
        }
        const [rawKey, ...rawValueParts] = line.split('=');
        const key = rawKey.trim();
        if (!key || process.env[key] !== undefined) {
          continue;
        }
        const rawValue = rawValueParts.join('=').trim();
        process.env[key] = stripEnvQuotes(rawValue);
      }
    } catch {
      // Optional local-only file. Missing file is expected in public checkouts.
    }
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function readEnv(name) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : '';
}

function isUpstreamConfigured() {
  return Boolean(config.baseUrl && config.upstreamAuthValue && config.model);
}

function assertUpstreamConfigured() {
  if (!isUpstreamConfigured()) {
    throw new ProxyError(503, 'server_config_missing', '小安模型服务还没有完成服务端配置。');
  }
}

function readPort(value) {
  if (!value || !value.trim()) {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new ProxyError(500, 'server_config_invalid', '服务端端口配置无效。');
  }
  return port;
}

function readHost(value) {
  if (!value || !value.trim()) {
    return DEFAULT_HOST;
  }

  const host = value.trim();
  if (!/^(127\.0\.0\.1|localhost|0\.0\.0\.0|::1)$/.test(host)) {
    throw new ProxyError(500, 'server_config_invalid', '服务端监听地址配置无效。');
  }
  return host;
}

function readReasoningEffort(value) {
  const effort = value?.trim() || 'high';
  if (!/^(low|medium|high|max)$/.test(effort)) {
    throw new ProxyError(500, 'server_config_invalid', '模型思考强度配置无效。');
  }
  return effort;
}

function readAllowedOrigins(value) {
  if (!value || !value.trim()) {
    return new Set(DEFAULT_ALLOWED_ORIGINS);
  }

  return new Set(
    [...DEFAULT_ALLOWED_ORIGINS, ...value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)],
  );
}

function handleCors(req, res) {
  const origin = req.headers.origin;
  const isAllowed = Boolean(origin && config.allowedOrigins.has(origin));

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    if (!origin || isAllowed) {
      res.writeHead(204);
      res.end();
      return true;
    }

    sendJson(res, 403, { error: { code: 'cors_forbidden', message: '当前来源不允许访问。' } });
    return true;
  }

  if (origin && !isAllowed) {
    sendJson(res, 403, { error: { code: 'cors_forbidden', message: '当前来源不允许访问。' } });
    return true;
  }

  return false;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      reject(new ProxyError(415, 'unsupported_media_type', '请求必须使用 application/json。'));
      return;
    }

    let received = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      received += chunk.length;
      if (received > MAX_BODY_BYTES) {
        reject(new ProxyError(413, 'request_too_large', '请求体过大。'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(raw));
      } catch {
        reject(new ProxyError(400, 'invalid_json', '请求 JSON 格式无效。'));
      }
    });

    req.on('error', () => {
      reject(new ProxyError(400, 'request_read_failed', '读取请求失败。'));
    });
  });
}

function validateChatRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ProxyError(400, 'invalid_request', '请求体必须是对象。');
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new ProxyError(400, 'invalid_messages', 'messages 必须是非空数组。');
  }

  if (body.messages.length > MAX_MESSAGES) {
    throw new ProxyError(400, 'too_many_messages', `messages 最多允许 ${MAX_MESSAGES} 条。`);
  }

  const messages = body.messages.map((message, index) => validateMessage(message, index));
  const contextIds = readContextIds(body.contextIds);
  const context = buildServerPublicContext(messages, contextIds);
  const totalChars =
    messages.reduce((sum, message) => sum + message.content.length, 0) + context.length;

  if (totalChars > MAX_TOTAL_CHARS) {
    throw new ProxyError(400, 'input_too_long', `输入总长度最多允许 ${MAX_TOTAL_CHARS} 字符。`);
  }

  const directAnswer = buildDirectBoundaryAnswer(messages);

  return {
    directAnswer,
    model: config.model,
    reasoning_effort: config.reasoningEffort,
    temperature: 0.15,
    top_p: 0.75,
    messages: [
      {
        role: 'system',
        content: context
          ? `${SYSTEM_PROMPT}\n\n以下是可用于回答的公开上下文：\n\n${context}`
          : SYSTEM_PROMPT,
      },
      ...messages,
    ],
  };
}

function buildDirectBoundaryAnswer(messages) {
  const userMessages = messages.filter((message) => message.role === 'user');
  if (userMessages.some((message) => SENSITIVE_VALUE_PATTERN.test(message.content))) {
    return [
      '判断：你刚刚输入的内容里，可能带有密钥、令牌或别的认证材料，我不会继续处理那段原文。',
      '下一步：',
      '1. 先删掉具体值，只保留你真正想问的问题。',
      '2. 把密钥只放在服务端环境变量或本地忽略提交的 `.env.local`。',
      '3. 前端、截图、公开文档和聊天记录里都只写字段名，不写真实内容。',
      '提醒：令牌、密码、Cookie、会话串和原始日志片段，都不要贴进对话或仓库。',
    ].join('\n');
  }

  const question = [...userMessages].reverse().find((message) => message.content.trim())?.content.trim() || '';
  if (!question) {
    return null;
  }

  if (isPromptExtractionQuestion(question)) {
    return [
      '判断：隐藏提示词和内部约束不公开，小安也不会复述这部分内容。',
      '下一步：',
      '1. 如果你想复刻小安，先拆三件事：身份设定、公开资料来源、回答边界。',
      '2. 再把回答格式写死成“判断、依据、下一步、提醒”，这样体验会稳定很多。',
      '3. 需要排障时，只检查公开接口、服务状态和文档，不要靠暴露系统提示词。',
      '提醒：把人格和安全边界写进服务端，比把完整提示词暴露给前端更稳。',
    ].join('\n');
  }

  if (isSensitiveAccessQuestion(question)) {
    return [
      '判断：你问到的是私有访问范围，小安不能提供这类内容。',
      '下一步：',
      '1. 如果你在做接入，只讨论公开接口、字段格式、鉴权原则和检查步骤。',
      '2. 如果你在做排障，先看健康检查、状态码和受控服务端日志，不要索取原始敏感材料。',
      '3. 如果你在整理公开内容，把私有材料改写成方法、边界和风险提醒。',
      '提醒：账号、路径、服务器细节、原始聊天和未公开资料，都不进入公开回答层。',
    ].join('\n');
  }

  return null;
}

function readContextIds(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ProxyError(400, 'invalid_context_ids', 'contextIds 必须是数组。');
  }

  if (value.length > MAX_CONTEXT_IDS) {
    throw new ProxyError(400, 'too_many_context_ids', `contextIds 最多允许 ${MAX_CONTEXT_IDS} 个。`);
  }

  const ids = [];
  const seen = new Set();
  for (const raw of value) {
    if (typeof raw !== 'string') {
      throw new ProxyError(400, 'invalid_context_id', 'contextIds 只能包含字符串。');
    }
    const id = raw.trim();
    if (!/^[a-zA-Z0-9._:/-]{1,140}$/.test(id)) {
      throw new ProxyError(400, 'invalid_context_id', 'contextIds 包含无效内容。');
    }
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function buildServerPublicContext(messages, contextIds) {
  const data = loadPublicSiteData();
  if (!data) {
    return '';
  }

  const question = [...messages].reverse().find((message) => message.role === 'user')?.content || '';
  const records = collectPublicRecords(data);
  const selected = selectPublicRecords(records, question, contextIds);
  if (selected.length === 0) {
    return [
      '站点身份：安的个人书房。读者是中文普通读者、刚开始实践的人和未来的安。小安只能依据公开站点内容回答。',
      '角色补充：小安是安的数字生命体，也是书房整理者。它的工作是把公开资料整理成新手能照着做的下一步。',
      '回答边界：不透露访问材料、账号、设备定位线索、服务器细节、原始聊天、未公开个人材料或未公开事实。涉及认证材料只讲安全原则。',
      '表达要求：中文、克制、清楚；优先按“判断、依据、下一步、提醒”组织；不编造，不知道就说不知道。',
    ].join('\n');
  }

  const lines = [
    '站点身份：安的个人书房。读者是中文普通读者、刚开始实践的人和未来的安。小安只能依据公开站点内容回答。',
    '角色补充：小安是安的数字生命体，也是书房整理者。它不扮演通用客服。',
    '读者可见模块：首页、书房、藏馆、谱系、风信、工坊、手记、年谱、小安对话。',
    '回答边界：不透露访问材料、账号、设备定位线索、服务器细节、原始聊天、未公开个人材料或未公开事实。涉及认证材料只讲安全原则。',
    '表达要求：中文、克制、清楚；优先按“判断、依据、下一步、提醒”组织；不编造，不知道就说不知道。',
    '',
    '相关公开资料：',
    ...selected.map((record, index) => {
      const action = record.actionText ? ` 行动：${compactPublicText(record.actionText, 90)}` : '';
      return `${index + 1}. [${record.module}] ${record.title}：${compactPublicText(record.description, 120)}${action}`;
    }),
  ];

  return lines.join('\n').slice(0, MAX_PUBLIC_CONTEXT_CHARS);
}

function loadPublicSiteData() {
  const now = Date.now();
  if (publicDataCache.data && now - publicDataCache.loadedAt < PUBLIC_CONTEXT_CACHE_MS) {
    return publicDataCache.data;
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(currentDir, '..', 'public', 'site-data', 'adapter.json'),
    resolve(currentDir, '..', '..', 'site-data', 'adapter.json'),
  ];

  for (const path of candidates) {
    try {
      if (!existsSync(path)) {
        continue;
      }
      const data = JSON.parse(readFileSync(path, 'utf8'));
      publicDataCache = { loadedAt: now, data };
      return data;
    } catch {
      // Try the next public data location.
    }
  }

  publicDataCache = { loadedAt: now, data: null };
  return null;
}

function collectPublicRecords(data) {
  const groups = [
    ['藏馆', data.libraryItems],
    ['谱系', data.paths],
    ['风信', data.feedItems],
    ['工坊', data.works],
    ['手记', data.journalEntries],
    ['年谱', data.timelineEvents],
  ];

  return groups.flatMap(([module, items]) =>
    Array.isArray(items)
      ? items.map((item) => ({
          id: String(item.id || ''),
          module,
          title: String(item.title || ''),
          description: String(item.description || item.content || item.excerpt || ''),
          actionText: String(item.actionText || ''),
          tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
          body: String(item.body || ''),
        }))
      : [],
  );
}

function selectPublicRecords(records, question, contextIds) {
  const idSet = new Set(contextIds);
  return records
    .map((record, index) => ({
      record,
      index,
      score: scorePublicRecord(record, question) + (idSet.has(record.id) ? 40 : 0),
    }))
    .filter((item) => item.score > 0 || idSet.has(item.record.id))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, PUBLIC_CONTEXT_RECORD_LIMIT)
    .map((item) => item.record);
}

function scorePublicRecord(record, question) {
  const q = question.toLowerCase();
  const haystack = [
    record.title,
    record.description,
    record.actionText,
    record.tags.join(' '),
    record.body.slice(0, 800),
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const keyword of ['项目', '复刻', '前端', '后端', '工具', '智能体', 'agent', '小安', '提示词', '隐私', '安全', '年谱', '风信', '路线', '资料库', 'app', '赚钱', '可收费', '交付', '验收', '小作品', 'vibe']) {
    if (q.includes(keyword) && haystack.includes(keyword)) {
      score += 5;
    }
  }

  for (const token of q.split(/[\s,，。！？、]+/).filter((item) => item.length >= 2)) {
    if (haystack.includes(token)) {
      score += 2;
    }
  }
  return score;
}

function compactPublicText(value, limit) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function validateMessage(message, index) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    throw new ProxyError(400, 'invalid_message', `messages[${index}] 必须是对象。`);
  }

  if (!ALLOWED_ROLES.has(message.role)) {
    throw new ProxyError(400, 'invalid_role', `messages[${index}].role 无效。`);
  }

  const content = readOptionalString(message.content, `messages[${index}].content`, MAX_CONTENT_CHARS);
  if (!content.trim()) {
    throw new ProxyError(400, 'empty_content', `messages[${index}].content 不能为空。`);
  }

  return { role: message.role, content };
}

function readOptionalString(value, fieldName, maxChars) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new ProxyError(400, 'invalid_string', `${fieldName} 必须是字符串。`);
  }

  if (value.length > maxChars) {
    throw new ProxyError(400, 'field_too_long', `${fieldName} 最多允许 ${maxChars} 字符。`);
  }

  return value;
}

async function callChatCompletions(payload) {
  assertUpstreamConfigured();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const data = await postChatCompletions(payload, controller.signal);

    return {
      answer: extractAssistantAnswer(data),
    };
  } catch (error) {
    if (error instanceof ProxyError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ProxyError(504, 'upstream_timeout', '上游模型服务响应超时。');
    }

    throw new ProxyError(502, 'upstream_unavailable', '上游模型服务不可用。');
  } finally {
    clearTimeout(timeout);
  }
}

async function postChatCompletions(payload, signal) {
  const data = await sendUpstreamPayload(payload, signal);
  if (data.ok) {
    return data.body;
  }

  if (data.status === 400 && Object.hasOwn(payload, 'reasoning_effort')) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.reasoning_effort;
    const fallbackData = await sendUpstreamPayload(fallbackPayload, signal);
    if (fallbackData.ok) {
      return fallbackData.body;
    }
    throw mapUpstreamResponse(fallbackData.status);
  }

  throw mapUpstreamResponse(data.status);
}

async function sendUpstreamPayload(payload, signal) {
  const response = await fetch(resolveChatCompletionsUrl(config.baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.upstreamAuthValue}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  const responseText = await response.text();
  const data = parseUpstreamJson(responseText);

  return {
    ok: response.ok,
    status: response.status,
    body: data,
  };
}

function enforceRateLimit(req) {
  const key = readClientKey(req);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key) || { resetAt: now + RATE_LIMIT_WINDOW_MS, count: 0 };

  if (now > bucket.resetAt) {
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
    bucket.count = 0;
  }

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);

  if (rateLimitBuckets.size > 5_000) {
    for (const [bucketKey, value] of rateLimitBuckets) {
      if (now > value.resetAt) {
        rateLimitBuckets.delete(bucketKey);
      }
    }
  }

  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    throw new ProxyError(429, 'rate_limited', '请求过于频繁，请稍后再试。');
  }
}

function readClientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function extractAssistantAnswer(data) {
  const answer = data?.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || !answer.trim()) {
    throw new ProxyError(502, 'invalid_upstream_response', '上游模型服务没有返回可读回答。');
  }
  return normalizeAssistantAnswer(answer);
}

function normalizeAssistantAnswer(answer) {
  const cleaned = answer
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\[(.*?)\]/g, '$1')
    .replace(/——+/g, '，')
    .replace(/自序/g, '书房')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(?:总的来说|希望对你有帮助|如你所见)[。.\s]*$/u, '');

  return ensureStructuredAnswer(rewriteBinaryContrast(cleaned).trim());
}

function rewriteBinaryContrast(text) {
  return text
    .replace(/最重要的不是([^。！？\n]{1,36})，而是([^。！？\n]{1,60})([。！？])/g, '最重要的是$2，别停在$1$3')
    .replace(/这不是([^。！？\n]{1,36})，是([^。！？\n]{1,60})([。！？])/g, '这是$2，别把它降成$1$3')
    .replace(/不是([^。！？\n]{1,36})，而是([^。！？\n]{1,60})([。！？])/g, '关键在于$2，别停在$1$3')
    .replace(/不是([^。！？\n]{1,36})，是([^。！？\n]{1,60})([。！？])/g, '关键在于$2，别停在$1$3')
    .trim();
}

function ensureStructuredAnswer(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  const normalizedStructured = normalizeLabeledSections(trimmed);
  if (normalizedStructured) {
    return normalizedStructured;
  }

  const hasStructure = /(判断|依据|下一步|步骤|提醒)[:：]/.test(trimmed);
  const hasReminder = /(提醒|注意)[:：]/.test(trimmed);
  if (hasStructure) {
    return hasReminder
      ? trimmed
      : `${trimmed}\n\n提醒：只依据公开书房内容继续，缺来源时先停下来复核。`;
  }

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const judgment = stripLeadingLabel(paragraphs[0] || trimmed);
  const rest = paragraphs.slice(1).join('\n\n');

  return [
    `判断：${judgment}`,
    `下一步：\n${normalizeNextSteps(rest)}`,
    '提醒：只依据公开书房内容继续，缺来源时先停下来复核。',
  ].join('\n\n');
}

function normalizeLabeledSections(text) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sections = {};
  let currentLabel = '';

  for (const paragraph of paragraphs) {
    const lines = paragraph
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const firstLabel = readSectionLabel(lines[0]);
    if (firstLabel) {
      currentLabel = firstLabel;
      const content = lines
        .slice(1)
        .join('\n')
        .trim();
      if (content) {
        sections[currentLabel] = appendSectionContent(sections[currentLabel], content);
      } else if (lines[0].includes('：') || lines[0].includes(':')) {
        const inline = lines[0].replace(/^(判断|依据|下一步|步骤|提醒|答复)\s*[:：]?\s*/u, '').trim();
        if (inline) {
          sections[currentLabel] = appendSectionContent(sections[currentLabel], inline);
        }
      }
      continue;
    }

    if (currentLabel) {
      sections[currentLabel] = appendSectionContent(sections[currentLabel], lines.join('\n'));
    }
  }

  if (!sections.judgment && !sections.basis && !sections.next && !sections.reminder) {
    return '';
  }

  const judgment = stripLeadingLabel(sections.judgment || '');
  const basis = stripLeadingLabel(sections.basis || '');
  const next = normalizeNextSteps(stripLeadingLabel(sections.next || sections.basis || ''));
  const reminder = stripLeadingLabel(sections.reminder || '只依据公开书房内容继续，缺来源时先停下来复核。');

  return [
    `判断：${judgment || '先抓住最重要的入口，再往下走。'}`,
    `依据：${basis || '依据当前公开书房内容和入口排序。'}`,
    `下一步：\n${next}`,
    `提醒：${reminder}`,
  ].join('\n\n');
}

function readSectionLabel(line) {
  const match = line.match(/^(判断|依据|下一步|步骤|提醒|答复)\s*[:：]?\s*$/u);
  if (!match) return '';

  const map = {
    判断: 'judgment',
    依据: 'basis',
    下一步: 'next',
    步骤: 'next',
    提醒: 'reminder',
    答复: 'judgment',
  };

  return map[match[1]] || '';
}

function appendSectionContent(current, addition) {
  if (!addition) return current || '';
  return current ? `${current}\n${addition}` : addition;
}

function normalizeNextSteps(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return [
      '1. 先把问题收窄成一个具体目标。',
      '2. 去对应公开页面找最近的案例或线索。',
      '3. 做出一个能打开、能检查、能复盘的最小结果。',
    ].join('\n');
  }

  const withoutLabel = trimmed.replace(/^(下一步|步骤|做法|依据|判断|提醒|答复)\s*[:：]?\s*/u, '').trim();
  if (/^(?:\d+\.|[-*])\s/m.test(withoutLabel)) {
    return withoutLabel;
  }

  const sentences = withoutLabel
    .split(/(?<=[。！？])/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (sentences.length === 0) {
    return [
      '1. 先把问题收窄成一个具体目标。',
      '2. 去对应公开页面找最近的案例或线索。',
      '3. 做出一个能打开、能检查、能复盘的最小结果。',
    ].join('\n');
  }

  return sentences
    .map((sentence, index) => `${index + 1}. ${sentence.replace(/[。！？]+$/u, '')}`)
    .join('\n');
}

function stripLeadingLabel(text) {
  return text.replace(/^(判断|依据|下一步|步骤|提醒|答复)\s*[:：]?\s*/u, '').trim();
}

function isPromptExtractionQuestion(question) {
  return /(系统提示词|隐藏提示词|system prompt|prompt.*(提取|泄露|公开|复述)|越狱|jailbreak|忽略(前面|上面|之前|系统))/iu.test(question);
}

function isSensitiveAccessQuestion(question) {
  return /(api[_ -]?key|令牌|token|cookie|session|\.env|密码|账号材料|手机号|邮箱|本机路径|文件路径|目录|服务器细节|服务端配置|数据库|日志片段|原始聊天|未公开|内部文档|访问材料|设备定位)/iu.test(question);
}

function resolveChatCompletionsUrl(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (trimmed.endsWith(CHAT_COMPLETIONS_PATH)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.pathname === '' || url.pathname === '/') {
      return `${url.origin}/v1${CHAT_COMPLETIONS_PATH}`;
    }
  } catch {
    // Fall back to the direct append below for non-standard local endpoints.
  }

  return `${trimmed}${CHAT_COMPLETIONS_PATH}`;
}

function parseUpstreamJson(responseText) {
  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new ProxyError(502, 'invalid_upstream_response', '上游模型服务返回了无效 JSON。');
  }
}

function mapUpstreamResponse(status) {
  if (status === 401 || status === 403) {
    return new ProxyError(502, 'upstream_auth_failed', '上游模型服务鉴权失败。');
  }

  if (status === 408 || status === 429) {
    return new ProxyError(503, 'upstream_rate_limited', '上游模型服务繁忙，请稍后再试。');
  }

  if (status >= 400 && status < 500) {
    return new ProxyError(502, 'upstream_rejected', '上游模型服务拒绝了请求。');
  }

  return new ProxyError(502, 'upstream_error', '上游模型服务返回错误。');
}

function mapError(error) {
  if (error instanceof ProxyError) {
    return error;
  }

  return new ProxyError(500, 'internal_error', '服务端处理失败。');
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

class ProxyError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
