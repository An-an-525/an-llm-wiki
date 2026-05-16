import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const vaultRoot = resolve(siteRoot, "..");
const source = resolve(vaultRoot, "site-data");
const target = resolve(siteRoot, "public", "site-data");
const indexPath = resolve(source, "index.json");
const adapterPath = resolve(source, "adapter.json");
const generatedPath = resolve(siteRoot, "src", "data", "siteData.generated.ts");

if (!existsSync(source)) {
  throw new Error(
    "Missing ../site-data. Run `python scripts/build_site_data.py .` from the vault root first.",
  );
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasHanText(value) {
  return /[\u4e00-\u9fff]/.test(String(value || ""));
}

function isChineseDisplayItem(item) {
  return hasHanText(item.summary || item.description || item.contentLines?.join("\n"));
}

function isChineseReaderReady(value) {
  const textValue = String(value || "");
  if (!hasHanText(textValue)) return false;
  const hanCount = (textValue.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinCount = (textValue.match(/[A-Za-z0-9_+-]+/g) || []).length;
  return hanCount >= 12 && latinCount <= Math.max(18, hanCount * 0.45);
}

function readerText(value, fallback = "") {
  const sanitized = publicFacingMarkdown(value).trim();
  return isChineseReaderReady(sanitized) ? sanitized : fallback;
}

function publicExternalLinks(links) {
  const results = [];
  const seen = new Set();
  for (const link of asArray(links)) {
    const target = String(link?.url || link?.target || "").trim();
    if (!target) continue;
    if (/^https?:\/\//.test(target)) {
      const url = text(target);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      results.push({
        label: publicFacingText(link.label) || `外部来源 ${results.length + 1}`,
        url,
      });
      continue;
    }
    const normalized = target.replace(/\.md$/i, "");
    const relatedId = sourcePathToIdMap.get(normalized) || sourcePathToIdMap.get(`${normalized}.md`);
    if (!relatedId) continue;
    const url = detailPath(relatedId);
    if (seen.has(url)) continue;
    seen.add(url);
    results.push({
      label: publicInternalLabel(target, link.label) || `相关页面 ${results.length + 1}`,
      url,
    });
  }
  return results.slice(0, 3);
}

function date(value) {
  return text(value, "2026-05-12").slice(0, 10);
}

function detailPath(id) {
  return `/content/${id}`;
}

let pathTitleMap = new Map();
let sourcePathToIdMap = new Map();

const libraryCategoryGuides = {
  frontend: {
    recommendedFor: "想做出能打开、能阅读的中文网页的人",
    whoFor: "第一次做个人网站、想把首页和详情页跑通的人",
    useCase: "把页面、卡片、详情和搜索跑通，再慢慢加内容。",
    nextAction: "做一个首页、三张卡和一个详情页的最小版本。",
    risk: "前端容易被框架名和视觉效果带偏，先守住可读性和可点击性。",
  },
  backend: {
    recommendedFor: "想把列表、详情和搜索接口跑通的人",
    whoFor: "想理解公开数据怎么稳定送到前端的人",
    useCase: "把公开列表、详情页和搜索接口做成只读出口。",
    nextAction: "设计三个只读接口：列表、详情、搜索。",
    risk: "后端容易一开始就做复杂权限，先守住稳定和边界。",
  },
  tools: {
    recommendedFor: "想比较软件、平台和工作台的人",
    whoFor: "想知道每个工具在什么场景里真正有用的人",
    useCase: "看工具能解决什么问题，再决定要不要学它。",
    nextAction: "选一个工具，写清它解决什么问题、用在哪一步、风险是什么。",
    risk: "工具名很多，但真正能用的只有少数，别被名词数量带跑。",
  },
  agents: {
    recommendedFor: "想把任务拆成多步工作流的人",
    whoFor: "想让 AI 按步骤协作、而不是只会聊天的人",
    useCase: "把输入、检索、确认和输出拆成清楚的节点。",
    nextAction: "画一个五节点流程：输入、检索、模型、确认、输出。",
    risk: "Agent 一旦没有确认节点，就会把混乱放大。",
  },
  xiaoan: {
    recommendedFor: "想和小安对话、校正判断并守住边界的人",
    whoFor: "想用中文和数字生命体做导览、提醒和复盘的人",
    useCase: "问入口、问复刻步骤、问边界。",
    nextAction: "问小安“我第一次来应该从哪里开始”。",
    risk: "小安只能服务公开资料和边界内的问题，不能替代人的判断。",
  },
  prompts: {
    recommendedFor: "想把模糊想法写成可执行任务的人",
    whoFor: "想学习提示词结构、角色边界和输出格式的人",
    useCase: "把目标、上下文、约束和验收写清楚。",
    nextAction: "写一条只包含目标、材料和输出格式的提示词。",
    risk: "提示词不能替代来源和验收，写得长也不等于写得对。",
  },
  archive: {
    recommendedFor: "想把零散材料整理成公开书页的人",
    whoFor: "想把项目、笔记和历史记录整理成能展示的读者友好页面的人",
    useCase: "先把资料分层，再决定哪些进入公开层。",
    nextAction: "给一批材料打上公开、非公开、待复核三类标签。",
    risk: "整理资料时最容易把原文直接搬进来，公开前一定要改写。",
  },
  security: {
    recommendedFor: "想在发布前先把风险挡住的人",
    whoFor: "要公开内容、但不想泄露边界的人",
    useCase: "先检查密钥、路径、会话、隐私和访问材料。",
    nextAction: "扫一遍是否有密钥、路径和原始聊天。",
    risk: "安全检查不能靠感觉，必须有明确规则和失败闸门。",
  },
  learning: {
    recommendedFor: "想按步骤复刻一个最小版本的人",
    whoFor: "想把知识变成操作、把操作变成经验的新手",
    useCase: "从一个可验收的小版本开始。",
    nextAction: "选一条路线，只做最小成果，不要一次做完整系统。",
    risk: "学习路径太长会吓退新手，先写清每一步的交付物。",
  },
  sources: {
    recommendedFor: "想看官方文档或可靠参考的人",
    whoFor: "想比较来源、理解边界和检查真实性的人",
    useCase: "看来源、看改写，再看可以做什么。",
    nextAction: "找两条独立来源，再决定要不要写进资料库。",
    risk: "来源页如果没有说明版本和边界，就不能直接当结论。",
  },
  other: {
    recommendedFor: "想看公开资料库主线的人",
    whoFor: "想先找到方向，再慢慢细看的人",
    useCase: "先从首页、工坊、谱系和风信开始。",
    nextAction: "点一个最像你当前问题的入口。",
    risk: "未知分类先别堆内容，等更清楚再归类。",
  },
};

const stageTitleTranslations = new Map([
  ["Beginner Explanation", "先看这条路线解决什么问题"],
  ["Weekly Flow", "按周推进这条路线"],
  ["Repository Review Checklist", "仓库复核清单"],
  ["What Gets Written Back", "写回资料库的内容"],
  ["Related", "继续阅读"],
  ["The Five Automations", "先看五个自动化环节"],
  ["How The Chain Works", "理解整条链路如何运转"],
  ["What Each Automation Must Not Do", "每个自动化不能做什么"],
  ["Acceptance Standard", "验收标准"],
  ["What Changes After This", "这之后改变了什么"],
]);

const genericContentTexts = new Set([
  "想理解公开资料库、AI 操作路径和复刻方法的新手",
  "新手、协作者和未来的自己",
  "想沿着公开资料复刻 AI 知识库工作流的读者",
  "形成一条可复用的公开学习或构建路径。",
  "先看这页的目标和边界，再按最小步骤做一个缩小版本，并记录一次验收结果。",
  "把一次真实项目整理成可学习、可展示、可复刻的公开资料，帮助读者理解目标、边界和结果。",
  "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。",
  "先读完这页的边界和做法，再用一个最小例子试一次，把结果和问题记录下来。",
]);

const genericContentPatterns = [
  /^读完后记录「.+」解决的问题、适合场景和一个可执行动作。$/,
  /^读完后先复刻「.+」的最小版本，只做一个能验收的小闭环。$/,
  /^从「.+」的第一个阶段开始，写下目标、交付物和验收方式。$/,
  /^把「.+」对应的认知变化写成一条自己的下一步行动。$/,
  /^「.+」把一次真实项目整理成可学习、可展示、可复刻的公开资料，帮助读者理解目标、边界和结果。$/,
];

const genericStagePatterns = [
  /^按本阶段说明完成一个可见小产出。$/,
  /^读完本节并完成对应交付物。$/,
  /^本阶段只做一个可验收小产出$/,
];

function firstMatchingPathId(paths, matcher) {
  return paths.find((path) => matcher.test(path.title))?.id || "";
}

function libraryGuide(category) {
  return libraryCategoryGuides[category] || libraryCategoryGuides.other;
}

function estimatedReadingMinutes(item, minimum = 2) {
  const explicitMinutes = Number(item.readingMinutes || 0);
  if (explicitMinutes >= minimum) {
    return explicitMinutes;
  }

  const wordCount = Number(item.wordCount || 0);
  const contentText = publicFacingMarkdown([
    text(item.summary),
    text(item.description),
    text(item.sourceSummary),
    asArray(item.contentLines).join("\n"),
    asArray(item.replicationSteps).join("\n"),
    asArray(item.operationStory).join("\n"),
    asArray(item.lessons).join("\n"),
  ].join("\n"));
  const contentLength = contentText.length;

  let estimated = 0;
  if (wordCount > 0) {
    estimated = Math.max(estimated, Math.round(wordCount / 320));
  }
  if (contentLength > 0) {
    estimated = Math.max(estimated, Math.round(contentLength / 420));
  }
  if (asArray(item.steps).length >= 4) {
    estimated = Math.max(estimated, 4);
  }
  if (asArray(item.links).length >= 3) {
    estimated = Math.max(estimated, 3);
  }

  return Math.max(minimum, Math.min(estimated || minimum, 12));
}

function libraryTimeToLearn(item, category, title) {
  const minimum = /边界|契约|验收|工作流|提示词|规范|框架|方法/.test(title) || ["agents", "prompts", "security", "sources"].includes(category)
    ? 3
    : 2;
  return `约 ${estimatedReadingMinutes(item, minimum)} 分钟`;
}

function libraryUseCaseFallback(title, category, summary, guide) {
  if (/自动化验收/.test(title)) {
    return "它把脚本检查、前端构建和真实页面验收连到一起，避免“看起来完成了”却还不能真正给别人看。";
  }
  if (/API 契约/.test(title)) {
    return "它先把前端会读什么、后端该吐什么写清楚，后面接服务器时就不会一边做页面一边改边界。";
  }
  if (/站点数据边界|来源与数据发布边界/.test(title)) {
    return "这类页面把公开展示层和非公开整理层分开，让读者看到的是书页，而不是后台材料。";
  }
  if (/作品卡标准/.test(title)) {
    return "它告诉你一张项目卡不能只负责好看，还要让人立刻判断：这是什么、值不值得点开、进去后能学到什么。";
  }
  if (/浏览器验收/.test(title)) {
    return "它提醒你：构建通过不等于体验合格，真正的检查要回到页面，看看字、按钮、图片和跳转是否真能被人顺着读完。";
  }
  if (/编译方法/.test(title)) {
    return "它解释怎样把原始材料改写成公开书页，让经验变成别人能读、能检验、能慢慢复刻的内容。";
  }
  if (/工作流|技能路由|智能体|Agent/.test(title)) {
    return "它把 AI 协作从一次对话拆成若干可检查节点，让人知道什么时候该让模型做，什么时候该让人停下来确认。";
  }
  if (/GitHub/.test(title)) {
    return "它把公开协作、记录和发布的节奏写清楚，让学习不是偶尔查一页文档，而是形成一套能反复使用的习惯。";
  }
  if (/隐私|安全|边界|敏感|路径|截图/.test(title)) {
    return "它守住这间书房最容易失手的地方：材料一多，人就会忘记哪些能公开、哪些只能留在工作台里。";
  }
  if (/年谱|成长/.test(title)) {
    return "它帮助读者把散乱节点连成一条成长线，不只看到几张截图，而能看见判断怎样一步步形成。";
  }
  return summary || guide.useCase;
}

function libraryRiskFallback(title, category, guide) {
  if (/API|契约/.test(title)) {
    return "接口边界一开始写散了，后面每加一个页面都得回头补兼容，最后最先崩的是维护节奏。";
  }
  if (/边界|隐私|敏感|路径|截图/.test(title)) {
    return "最常见的错误不是没有规则，而是图省事，把原始细节直接塞进公开页。";
  }
  if (/验收|浏览器/.test(title)) {
    return "只看脚本通过、不回到页面看真实阅读体验，是这类内容最容易漏掉的问题。";
  }
  if (/工作流|路由|自动化|Agent|智能体/.test(title)) {
    return "节点一多就会失控，所以必须保留人工确认、失败退出和回滚动作。";
  }
  if (/GitHub|来源|参考|规范/.test(title)) {
    return "引用越多，越要分清官方规则、项目经验和你自己的判断，不能混成一句结论。";
  }
  return guide.risk;
}

function libraryActionFallback(title, category, guide) {
  if (/自动化验收/.test(title)) {
    return "先挑一个真实页面，按“构建、打开、阅读、点击、回查”五步验一次，再把漏项写进清单。";
  }
  if (/API 契约/.test(title)) {
    return "先画三个只读出口：列表、详情、搜索；每个只写必要字段，再检查哪些字段绝不能进浏览器。";
  }
  if (/站点数据边界/.test(title)) {
    return "先列出前端真正要读的字段，再把非公开字段单独记进排除表，别等到上线前才回头删。";
  }
  if (/作品卡标准/.test(title)) {
    return "先拿一个真实项目，补齐标题、对象、为什么值得看和下一步动作，再决定它能不能进首页。";
  }
  if (/浏览器验收/.test(title)) {
    return "先用手机宽度打开一个详情页，检查文字、跳转、图片和底部导航，再决定这页算不算真的可读。";
  }
  if (/编译方法/.test(title)) {
    return "先选一段原始材料，只提取事实、步骤和边界，改写成一页公开说明，不要整段搬原文。";
  }
  if (/来源与数据发布边界/.test(title)) {
    return "先把一条资料标成“可公开、需改写、仅本地”三类，再决定它进藏馆、工坊还是只留工作台。";
  }
  if (/本地模型实验工具链/.test(title)) {
    return "先做一次小样本试跑，把目标、数据、指标和复盘写完整，再谈模型大小和参数。";
  }
  if (/工作流|Agent|智能体/.test(title)) {
    return "先画出输入、检索、确认、输出四个节点，只做一个能停下来的只读流程，再补工具调用。";
  }
  if (/GitHub/.test(title)) {
    return "先找一个官方页面、一份参考项目和一条自己的记录，写成一次“来源、判断、动作”的小卡片。";
  }
  if (/隐私|安全|边界|敏感|路径|截图/.test(title)) {
    return "先做一次脱敏检查：删路径、删令牌、删原始聊天，再把剩下内容改写成原则和动作。";
  }
  if (/年谱|成长/.test(title)) {
    return "先选一个真实日期，补上发生了什么、它改变了什么、你接下来该看哪一页。";
  }
  if (/提示词/.test(title)) {
    return "先把角色、材料、边界、输出和验收五块写齐，再跑一次真实任务看它有没有跑偏。";
  }
  return guide.nextAction;
}

function libraryHowToSteps(title, category) {
  if (/自动化验收/.test(title)) {
    return [
      "先定一页真实目标页，不要拿空页面演练。",
      "跑完结构检查和构建后，回到浏览器看卡片、详情和搜索是否能顺着读完。",
      "把发现的问题分成“必须挡住”和“可以后补”两类。",
      "把这次验收结果写回清单，下次只从最容易漏掉的地方继续。",
    ];
  }
  if (/API 契约/.test(title)) {
    return [
      "先列出前端真正需要哪些数据，不要先想后台想给什么。",
      "把接口压到列表、详情、搜索三类只读出口。",
      "为每个出口写一个最小返回示例，先让前端能稳定消费。",
      "最后再检查哪些字段属于非公开边界，确保它们不会出现在浏览器里。",
    ];
  }
  if (/工作流|Agent|智能体/.test(title)) {
    return [
      "先写清输入是什么，不要让流程从一团模糊需求开始。",
      "再拆出判断、检索、确认、输出四个动作。",
      "给每个动作写一个停下来的条件，防止流程越跑越散。",
      "最后只跑一条最小问题，确认它真能走完，而不是图上看起来很完整。",
    ];
  }
  if (/隐私|安全|边界|敏感|路径|截图/.test(title)) {
    return [
      "先标出会暴露身份或访问能力的内容。",
      "再决定哪些保留为原则，哪些必须完全删掉。",
      "公开页只写方法、边界和检查动作，不贴原始细节。",
      "发布前再从读者视角看一遍，确认页面里没有能反推出本地环境的线索。",
    ];
  }
  if (/年谱|成长/.test(title)) {
    return [
      "先确定真实日期，再写事件，而不是反过来找时间凑节点。",
      "补上这件事留下的结果和后续影响。",
      "给它挂一条相关页面，让读者能继续往下走。",
      "最后删掉空话，只保留能说明变化的细节。",
    ];
  }
  return [
    "先读标题和概览，判断它是否对应你当前要解决的问题。",
    "再找一条最接近的项目、路线或工具，把阅读落到具体场景里。",
    "只复刻一个最小动作，不要一次搬完整套系统。",
    "做完后写下失败点和下一步，让这页资料真正变成可用经验。",
  ];
}

function libraryStrengthLabel(category) {
  const labels = {
    frontend: "页面主线清楚",
    backend: "接口边界清楚",
    tools: "使用场景明确",
    agents: "流程拆解清楚",
    xiaoan: "对话边界明确",
    prompts: "任务结构清楚",
    archive: "整理方法明确",
    security: "风险提醒明确",
    learning: "步骤顺序清楚",
    sources: "来源入口清楚",
    other: "入口判断明确",
  };
  return labels[category] || labels.other;
}

function normalizeStageTitle(value, index) {
  const raw = publicFacingText(value);
  if (!raw) return `第 ${index + 1} 步`;
  if (hasHanText(raw)) return raw;
  return stageTitleTranslations.get(raw) || `第 ${index + 1} 步`;
}

function normalizeStageText(value, fallback) {
  const textValue = publicFacingText(value);
  if (!textValue) return fallback;
  if (!hasHanText(textValue)) return fallback;
  if (isGenericContentText(textValue) || genericStagePatterns.some((pattern) => pattern.test(textValue))) {
    return fallback;
  }
  return textValue;
}

function isGenericContentText(value) {
  return genericContentTexts.has(value) || genericContentPatterns.some((pattern) => pattern.test(value));
}

function curatedText(value, fallback) {
  const textValue = publicFacingText(value);
  if (!textValue || !isChineseReaderReady(textValue) || isGenericContentText(textValue)) {
    return fallback;
  }
  return textValue;
}

function inferRelatedPathIds(item, paths) {
  const explicit = [
    ...asArray(item.relatedPath ? [item.relatedPath] : []),
    ...asArray(item.relatedPaths),
  ]
    .map((value) => String(value || "").replace(/\.md$/i, "").trim())
    .filter(Boolean);

  const resolvedExplicit = explicit
    .map((value) => paths.find((path) => path.id === value || path.title === value || path.title.includes(value)))
    .filter(Boolean)
    .map((path) => path.id);

  if (resolvedExplicit.length > 0) {
    return Array.from(new Set(resolvedExplicit)).slice(0, 2);
  }

  const haystack = [
    item.title,
    item.summary,
    item.description,
    item.type,
    item.contentType,
    item.category,
    ...(item.tags || []),
    ...(item.sourceLabels || []),
    ...(item.links || []).map((link) => `${link.label || ""} ${link.target || link.url || ""}`),
  ]
    .join(" ")
    .toLowerCase();

  const candidateIds = [];
  const push = (id) => {
    if (id && !candidateIds.includes(id)) candidateIds.push(id);
  };

  if (/github/.test(haystack)) push(firstMatchingPathId(paths, /GitHub/));
  if (/自动化|验收|发布|维护|site-data|数据更新|公开数据/.test(haystack)) {
    push(firstMatchingPathId(paths, /知识库生命周期自动化/));
    push(firstMatchingPathId(paths, /发布维护地图/));
  }
  if (/前端|网页|app|展示|站点|资料库|archive/.test(haystack)) {
    push(firstMatchingPathId(paths, /个人资料库公开路线图/));
    push(firstMatchingPathId(paths, /个人资料库地图/));
  }
  if (/agent|智能体|coze|xiaoan|小安|技能|workflow|工作流|学习包|复刻包|ide|hanako|trae/.test(haystack)) {
    push(firstMatchingPathId(paths, /生命周期复刻学习包流程/));
  }
  if (/prompt|提示词/.test(haystack)) push(firstMatchingPathId(paths, /生命周期复刻学习包流程/));
  if (/收费|交付|赚钱|vibe/.test(haystack)) push(firstMatchingPathId(paths, /AI 辅助开发到可收费交付路线/));
  if (/路线|学习/.test(haystack)) {
    push(firstMatchingPathId(paths, /GitHub 最佳实践定期学习/));
    push(firstMatchingPathId(paths, /生命周期复刻学习包流程/));
  }
  if (/发布|维护/.test(haystack)) push(firstMatchingPathId(paths, /发布维护地图/));

  return candidateIds.filter(Boolean).slice(0, 2);
}

function stripMarkdownSyntax(value) {
  return String(value || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function looksLikeInternalPathLabel(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
  if (!normalized) return false;
  return /^(?:wiki|private-wiki|_raw|_archives|inbox|site-data|manifests|scripts|docs)\//i.test(normalized)
    || /^\/?content\/[A-Za-z0-9_-]+$/i.test(normalized);
}

const internalSlugWordMap = new Map([
  ["agent", "Agent"],
  ["agents", "Agent"],
  ["ai", "AI"],
  ["and", ""],
  ["an", "安"],
  ["api", "API"],
  ["archive", "资料库"],
  ["automation", "自动化"],
  ["beginner", "入门"],
  ["boundary", "边界"],
  ["browser", "浏览器"],
  ["builder", "搭建器"],
  ["capability", "能力"],
  ["card", "卡片"],
  ["chat", "对话"],
  ["codex", "Codex"],
  ["compile", "编译"],
  ["concepts", "概念"],
  ["content", "内容"],
  ["contract", "契约"],
  ["critique", "挑刺"],
  ["data", "数据"],
  ["decision", "决策"],
  ["design", "设计"],
  ["dialogue", "对话"],
  ["docs", "文档"],
  ["evidence", "证据"],
  ["feed", "风信"],
  ["frontend", "前端"],
  ["github", "GitHub"],
  ["governance", "治理"],
  ["growth", "成长"],
  ["guide", "指南"],
  ["hanako", "Hanako"],
  ["home", "首页"],
  ["information", "信息"],
  ["inventory", "清单"],
  ["journal", "手记"],
  ["karpathy", "卡帕西"],
  ["labels", "标签"],
  ["learning", "学习"],
  ["library", "藏馆"],
  ["lifecycle", "生命周期"],
  ["link", "链接"],
  ["links", "链接"],
  ["llm", "LLM"],
  ["local", "本地"],
  ["loop", "闭环"],
  ["maintenance", "维护"],
  ["map", "地图"],
  ["matrix", "矩阵"],
  ["moc", "总览"],
  ["model", "模型"],
  ["modules", "模块"],
  ["note", "笔记"],
  ["output", "输出"],
  ["path", "路径"],
  ["pattern", "方法"],
  ["persona", "人格"],
  ["personal", "个人"],
  ["platform", "平台"],
  ["policy", "规则"],
  ["privacy", "隐私"],
  ["private", "非公开"],
  ["project", "项目"],
  ["projects", "项目"],
  ["promotion", "晋升"],
  ["prompt", "提示词"],
  ["prompts", "提示词"],
  ["publication", "发布"],
  ["public", "公开"],
  ["queue", "队列"],
  ["reference", "参考"],
  ["references", "参考"],
  ["replication", "复刻"],
  ["review", "复核"],
  ["rewrite", "改写"],
  ["routing", "路由"],
  ["rules", "规则"],
  ["safety", "安全"],
  ["scan", "扫描"],
  ["screenshot", "截图"],
  ["search", "搜索"],
  ["sensitive", "敏感"],
  ["site", "站点"],
  ["skill", "技能"],
  ["skills", "技能"],
  ["source", "来源"],
  ["sources", "来源"],
  ["stack", "栈"],
  ["standard", "标准"],
  ["study", "书房"],
  ["synthesis", "综合"],
  ["timeline", "年谱"],
  ["todo", "待办"],
  ["token", "令牌"],
  ["tool", "工具"],
  ["tools", "工具"],
  ["topics", "主题"],
  ["trace", "轨迹"],
  ["update", "更新"],
  ["upstream", "上游"],
  ["validation", "验收"],
  ["workflow", "工作流"],
  ["work", "作品"],
  ["works", "工坊"],
  ["write", "写作"],
  ["writer", "写作"],
  ["xiaoan", "小安"],
]);

function humanizeInternalTarget(target) {
  const raw = String(target || "")
    .replace(/\.md$/i, "")
    .replace(/\\/g, "/")
    .split("/")
    .pop() || "相关页面";
  const words = raw
    .replace(/^lifecycle-/, "")
    .replace(/^tool-/, "")
    .split("-")
    .map((word) => internalSlugWordMap.get(word.toLowerCase()) ?? word)
    .filter(Boolean);
  const candidate = words.join(" ").replace(/\s+/g, " ").trim();
  if (!candidate) return "相关页面";
  if (!hasHanText(candidate) && !/(?:AI|API|GitHub|LLM|Codex|Hanako|Agent|MCP)/.test(candidate)) {
    return "相关页面";
  }
  return candidate;
}

function publicInternalLabel(target, label) {
  const explicit = stripMarkdownSyntax(label);
  if (explicit && !looksLikeInternalPathLabel(explicit)) return explicit;
  const normalized = String(target || "").replace(/\.md$/i, "").replace(/\\/g, "/");
  return pathTitleMap.get(normalized) || pathTitleMap.get(`${normalized}.md`) || humanizeInternalTarget(normalized);
}

function publicFacingMarkdown(value) {
  return String(value || "")
    .replace(/^- Archive ID:.*$/gm, "")
    .replace(/\[([^\]]+)\]\((?:docs|manifests|scripts)\/[^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\((?:wiki|private-wiki|_raw|_archives|inbox|site-data)\/[^)]+\)/g, "$1")
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_match, target, label) => `《${publicInternalLabel(target, label)}》`)
    .replace(/\bD:\\[^\s)）\]】"'`]+/g, "本地路径")
    .replace(/\bC:\\[^\s)）\]】"'`]+/g, "本地路径")
    .replace(/\b[A-Z]:\/[^\s)）\]】"'`]+/g, "本地路径")
    .replace(/`?(?:wiki|private-wiki|_raw|_archives|inbox\/private)\/[^`\s)）\]】"'，。；、]+`?/g, "站内资料页")
    .replace(/`?(?:wiki|private-wiki|_raw|_archives|inbox\/private)\/`?/g, "站内资料页")
    .replace(/\bprivate[- ]wiki\b/gi, "非公开整理层")
    .replace(/\bprivate\b/gi, "非公开")
    .replace(/私有 wiki/g, "非公开整理层")
    .replace(/私有编译层/g, "非公开整理层")
    .replace(/私有整理层/g, "非公开整理层")
    .replace(/私有复核/g, "非公开复核")
    .replace(/私有工作台/g, "非公开工作台")
    .replace(/私有层/g, "非公开层")
    .replace(/私有资料/g, "非公开资料")
    .replace(/私有来源层/g, "非公开来源层")
    .replace(/私有材料/g, "非公开材料")
    .replace(/私有记录/g, "非公开记录")
    .replace(/私有记忆/g, "非公开记忆")
    .replace(/本地黑曜石|本地 Obsidian|本地资料库仓库/g, "本地资料库")
    .replace(/黑曜石仓库|Obsidian vault/gi, "资料库")
    .replace(/\bObsidian\b/g, "Markdown 资料库")
    .replace(/Obsidian LLM Wiki/g, "可编译知识库")
    .replace(/给小白看的/g, "清楚可读的")
    .replace(/小白复刻路径/g, "复刻路径")
    .replace(/AI 小白复刻工作流/g, "AI 复刻工作流")
    .replace(/小白看得懂/g, "清楚可读")
    .replace(/小白/g, "初学者")
    .replace(/很多初学者/g, "很多人")
    .replace(/初学者理解/g, "理解")
    .replace(/初学者需要/g, "需要")
    .replace(/初学者最容易/g, "刚开始时最容易")
    .replace(/对初学者/g, "对刚开始的人")
    .replace(/让初学者/g, "让人")
    .replace(/码神/g, "深水")
    .replace(/极客/g, "进阶")
    .replace(/入门读者理解/g, "理解")
    .replace(/入门读者需要/g, "读者需要")
    .replace(/入门读者最容易/g, "刚开始时最容易")
    .replace(/面向入门读者的/g, "清楚可读的")
    .replace(/对入门读者/g, "对读者")
    .replace(/让入门读者/g, "让读者")
    .replace(/帮助入门读者/g, "帮助读者")
    .replace(/入门读者读者/g, "读者")
    .replace(/入门读者/g, "读者")
    .replace(/新手常/g, "刚开始时常")
    .replace(/新手最/g, "刚开始时最")
    .replace(/让新手/g, "让人")
    .replace(/对新手/g, "对刚开始的人")
    .replace(/新手/g, "初学者")
    .replace(/Karpathy LLM Wiki/g, "卡帕西知识库方法")
    .replace(/\bLLM Wiki\b/g, "大模型知识库")
    .replace(/公共 wiki/g, "公开资料层")
    .replace(/公开 wiki/g, "公开资料层")
    .replace(/公共 wiki/g, "公开资料层")
    .replace(/wiki 页面/g, "公开页面")
    .replace(/wiki 层/g, "公开资料层")
    .replace(/公开资料层\s*层/g, "公开资料层")
    .replace(/Wiki 工作台/g, "书房工作台")
    .replace(/\bllm wiki moc\b/gi, "公开知识库架构地图")
    .replace(/\bpublic wiki\b/gi, "公开资料层")
    .replace(/site-data/g, "网站数据层")
    .replace(/公开数据包/g, "网站数据层")
    .replace(/网站数据层\/+/g, "网站数据层")
    .replace(/公开资料层\s+生成/g, "公开资料层生成")
    .replace(/公开资料层\s+编译/g, "公开资料层编译")
    .replace(/公开资料层\s+通过/g, "公开资料层通过")
    .replace(/How-to Reference Explanation/g, "教程、操作指南、参考与解释")
    .replace(/^## Related$/gm, "## 相关内容")
    .replace(/^## Sources$/gm, "## 公开来源")
    .replace(/^## Source$/gm, "## 公开来源");
}

function publicFacingText(value) {
  return publicReaderCopy(stripMarkdownSyntax(publicFacingMarkdown(value)).replace(/\s+/g, " ").trim());
}

function publicReaderCopy(value) {
  return String(value || "")
    .replace(/初学者读者/g, "刚开始阅读的人")
    .replace(/初学者理解/g, "理解")
    .replace(/初学者需要/g, "需要")
    .replace(/很多初学者/g, "很多人")
    .replace(/让初学者/g, "让人")
    .replace(/对初学者/g, "对刚开始的人")
    .replace(/初学者最容易/g, "刚开始时最容易")
    .replace(/初学者能不能/g, "读者能不能")
    .replace(/初学者能/g, "读者能")
    .replace(/初学者怎样/g, "怎样")
    .replace(/初学者复刻/g, "复刻")
    .replace(/中文初学者/g, "中文读者")
    .replace(/面向初学者的/g, "清楚可读的")
    .replace(/初学者/g, "刚开始的人")
    .replace(/新手终于/g, "让人")
    .replace(/让新手/g, "让人")
    .replace(/新手/g, "刚开始的人")
    .replace(/适合谁/g, "读这页的人")
    .replace(/建议行动/g, "可以做什么")
    .replace(/行动建议/g, "可以做什么")
    .replace(/推荐优先/g, "书房顺序")
    .replace(/萦思藏馆/g, "安的书房")
    .replace(/藏馆 · 个人资料库/g, "安的书房")
    .replace(/藏馆 · 个人藏馆/g, "安的书房");
}

function publicFacingTitle(value, fallback = "这页资料") {
  const title = publicFacingText(value);
  if (!title) return fallback;
  if (!hasHanText(title)) return fallback;
  return title.replace(/^教程\s+教程、/, "教程、").trim();
}

function publicFallbackBody(item) {
  const title = publicFacingTitle(item.title, "这页资料");
  const summary = publicFacingText(item.summary || item.description || item.sourceSummary) || "这是一页经过公开安全处理的资料。";
  const sourceLabels = publicSourceLabels(item.sourceLabels || item.sources);
  const boundary = publicSafetyLabel(item.publicSafety) || "已按公开展示标准处理";
  const category = readerCategory(item);
  const guide = libraryGuide(category);
  const useCase = libraryUseCaseFallback(title, category, summary, guide);
  const whoFor = curatedText(item.whoFor || item.audience, guide.whoFor);
  const risk = libraryRiskFallback(title, category, guide);
  const action = readerText(item.actionText, libraryActionFallback(title, category, guide));
  const howToSteps = libraryHowToSteps(title, category);
  const sourceLine = sourceLabels.length ? sourceLabels.join(" / ") : "公开资料层";
  if (item.module === "works") {
    return [
      `# ${title}`,
      "",
      "## 这是什么",
      "",
      summary,
      "",
      "## 做了什么",
      "",
      "这页项目已经进入公开展示层。即使原始材料没有直接展示出来，前端也应该把问题、关键动作、复刻入口和失败边界讲清楚。",
      "",
      "## 怎样开始复刻",
      "",
      "1. 先判断这个项目解决的核心问题。",
      "2. 只保留一条最小主流程，不要一开始追完整系统。",
      "3. 做完后补一条失败记录和一条下一步动作。",
      "",
      "## 公开边界",
      "",
      `来源类型：${sourceLine}。展示状态：${boundary}。原始记录、账号状态、本机细节和敏感访问材料不会进入浏览器数据。`,
      "",
      "## 安的提醒",
      "",
      action,
    ].join("\n");
  }
  if (item.module === "paths") {
    return [
      `# ${title}`,
      "",
      "## 这条路线解决什么问题",
      "",
      summary,
      "",
      "## 读这条路的人",
      "",
      readerText(item.audience, "想按顺序复刻一个最小成果，而不是一次吞下完整系统的读者。"),
      "",
      "## 怎么走",
      "",
      "1. 先完成第一步的最小交付物。",
      "2. 每一步都写下验收标准和失败处理。",
      "3. 做不动时，回到上一阶段，而不是继续堆功能。",
      "",
      "## 公开边界",
      "",
      `来源类型：${sourceLine}。展示状态：${boundary}。路线页只展示公开安全步骤，不展示本地工作台和未复核材料。`,
      "",
      "## 下一步",
      "",
      action,
    ].join("\n");
  }
  if (item.module === "feed" || item.type === "feed") {
    return [
      `# ${title}`,
      "",
      "## 发生了什么",
      "",
      summary,
      "",
      "## 为什么现在值得看",
      "",
      "风信不是流水账。它要把外部变化、安的判断变化和读者的下一步行动绑在一起，让人知道这条信息为什么值得停下来。",
      "",
      "## 读者现在可以做什么",
      "",
      action,
      "",
      "## 公开边界",
      "",
      `来源类型：${sourceLine}。展示状态：${boundary}。未复核的本地材料不会直接进入风信。`,
    ].join("\n");
  }
  if (item.module === "timeline" || item.type === "event") {
    return [
      `# ${title}`,
      "",
      "## 这个节点发生了什么",
      "",
      summary,
      "",
      "## 它改变了什么",
      "",
      "年谱记录的是安在 2026 年 3 月之后逐步形成的方法和判断，不是文件修改时间，也不是事后硬凑的成就表。",
      "",
      "## 下一步阅读",
      "",
      action,
      "",
      "## 公开边界",
      "",
      `来源类型：${sourceLine}。展示状态：${boundary}。时间线只保留公开安全的阶段线索。`,
    ].join("\n");
  }
  return [
    `# ${title}`,
    "",
    "## 这是什么",
    "",
    summary,
    "",
    "## 为什么值得看",
    "",
    useCase,
    "",
    "## 读这页的人",
    "",
    whoFor,
    "",
    "## 可以怎么用",
    "",
    `1. ${howToSteps[0]}`,
    `2. ${howToSteps[1]}`,
    `3. ${howToSteps[2]}`,
    `4. ${howToSteps[3]}`,
    "",
    "## 先避开什么",
    "",
    risk,
    "",
    "## 公开边界",
    "",
    `来源类型：${sourceLine}。展示状态：${boundary}。原始记录、账号状态、本机细节和敏感访问材料不会进入浏览器数据。`,
    "",
    "## 安的提醒",
    "",
    action,
  ].join("\n");
}

function publicFacingBody(item) {
  const body = publicReaderCopy(publicFacingMarkdown(asArray(item.contentLines).join("\n")));
  return isChineseReaderReady(body) ? body : publicFallbackBody(item);
}

function publicSourceLabel(label) {
  const raw = String(label || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "public wiki") return "公开资料层";
  if (raw === "public-safe") return "已公开复核";
  if (raw.includes("public project")) return "公开项目";
  if (raw.includes("agent workflow")) return "智能体工作流";
  if (raw.includes("tutorial standard")) return "教程标准";
  if (raw === "source-backed") return "有公开来源";
  if (raw === "archive-derived") return "来自脱敏整理";
  if (raw === "site-data" || raw === "generated data") return "网站数据层";
  if (raw.includes("local") || raw.includes("private")) return "本地脱敏摘要";
  if (raw.includes("github")) return "GitHub 公开参考";
  if (raw.includes("official")) return "官方文档";
  if (raw.includes("review")) return "已审查";
  if (raw.includes("frontend")) return "前端项目";
  if (raw.includes("backend")) return "后端边界";
  if (raw.includes("xiaoan")) return "小安";
  if (raw.includes("public")) return "公开资料";
  return hasHanText(label) ? String(label).trim() : "";
}

function publicSafetyLabel(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "public-safe") return "已公开复核";
  if (raw === "needs-source-review") return "仍需来源复核";
  if (raw === "needs-redaction") return "需要继续脱敏";
  if (raw.includes("safe")) return "已公开复核";
  if (raw.includes("review")) return "仍需复核";
  return hasHanText(value) ? String(value).trim() : "";
}

function publicSourceLabels(labels) {
  const seen = new Set();
  const values = [];
  for (const label of asArray(labels)) {
    const next = publicSourceLabel(label);
    if (!next || seen.has(next)) continue;
    seen.add(next);
    values.push(next);
  }
  return values;
}

function toPlainTags(tags) {
  return asArray(tags).filter((tag) => typeof tag === "string" && tag.trim());
}

const tagLabels = new Map([
  ["agent", "智能体"],
  ["agents", "智能体"],
  ["ai", "人工智能"],
  ["api", "接口"],
  ["archive", "资料库"],
  ["backend", "后端"],
  ["browser", "浏览器"],
  ["browser-use", "浏览器验收"],
  ["build", "构建"],
  ["codex", "Codex"],
  ["cognition", "认知变化"],
  ["coze", "Coze"],
  ["curated", "精选"],
  ["data", "数据"],
  ["frontend", "前端"],
  ["github", "GitHub"],
  ["governance", "治理"],
  ["hanako", "Hanako"],
  ["knowledge-base", "知识库"],
  ["llm", "大模型"],
  ["llm-wiki", "大模型知识库"],
  ["local-first", "本地优先"],
  ["model", "模型"],
  ["obsidian", "资料库工具"],
  ["personal-archive", "个人资料库"],
  ["prompt", "提示词"],
  ["prompts", "提示词"],
  ["publication", "公开发布"],
  ["pwa", "可安装网页"],
  ["react", "前端"],
  ["security", "安全边界"],
  ["skills", "技能"],
  ["source", "来源"],
  ["sources", "来源"],
  ["tool", "工具"],
  ["tools", "工具"],
  ["validation", "验收"],
  ["wiki", "知识库"],
  ["xiaoan", "小安"],
]);

function displayTag(tag) {
  const raw = String(tag || "").trim();
  if (!raw) return "";
  if (hasHanText(raw)) return raw;
  const normalized = raw.toLowerCase();
  if (tagLabels.has(normalized)) return tagLabels.get(normalized);
  if (normalized.includes("frontend") || normalized.includes("react") || normalized.includes("vite")) return "前端";
  if (normalized.includes("backend") || normalized.includes("server") || normalized.includes("api")) return "后端";
  if (normalized.includes("agent")) return "智能体";
  if (normalized.includes("prompt")) return "提示词";
  if (normalized.includes("tool")) return "工具";
  if (normalized.includes("wiki") || normalized.includes("archive") || normalized.includes("obsidian")) return "资料库";
  if (normalized.includes("security") || normalized.includes("privacy")) return "安全边界";
  return "";
}

function displayTags(tags) {
  const seen = new Set();
  const values = [];
  for (const tag of toPlainTags(tags)) {
    const label = displayTag(tag);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    values.push(label);
  }
  return values;
}

const readerCategoryLabels = {
  frontend: "前端",
  backend: "后端",
  tools: "工具",
  agents: "智能体",
  xiaoan: "小安",
  prompts: "提示词",
  archive: "整理资料",
  security: "保护隐私",
  learning: "学习路线",
  sources: "参考资料",
  other: "其他",
};

const readerCategoryOrder = new Map([
  ["frontend", 0],
  ["backend", 1],
  ["tools", 2],
  ["agents", 3],
  ["xiaoan", 4],
  ["prompts", 5],
  ["archive", 6],
  ["learning", 7],
  ["security", 8],
  ["sources", 9],
  ["other", 10],
]);

const libraryCoverByCategory = {
  frontend: "/covers/cover-frontend.svg",
  backend: "/covers/cover-backend.svg",
  tools: "/covers/cover-tools.svg",
  agents: "/covers/cover-agents.svg",
  xiaoan: "/covers/cover-xiaoan.svg",
  prompts: "/covers/cover-prompts.svg",
  archive: "/covers/cover-archive.svg",
  security: "/covers/cover-security.svg",
  learning: "/covers/cover-learning.svg",
  sources: "/covers/cover-sources.svg",
  other: "/covers/cover-other.svg",
};

function workCover(item, index) {
  const category = readerCategory(item);
  if (category === "frontend") return "/covers/work-frontend-archive.svg";
  if (category === "backend") return "/covers/work-data-backend.svg";
  if (category === "agents") return "/covers/work-agent-workflow.svg";
  if (category === "xiaoan") return "/covers/work-xiaoan-loop.svg";
  if (category === "archive") return "/covers/work-study-room.svg";
  return ["/covers/work-study-room.svg", "/covers/work-agent-workflow.svg", "/covers/work-data-backend.svg"][index % 3];
}

function readerCategory(item) {
  const explicitCategory = String(item.category || "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(readerCategoryLabels, explicitCategory)) {
    return explicitCategory;
  }

  const haystack = [
    item.sourcePath,
    item.title,
    item.summary,
    item.type,
    item.contentType,
    item.category,
    ...toPlainTags(item.tags),
  ].join(" ").toLowerCase();

  if (haystack.includes("小安") || haystack.includes("xiaoan") || haystack.includes("数字生命")) return "xiaoan";
  if (haystack.includes("安全") || haystack.includes("隐私") || haystack.includes("privacy") || haystack.includes("security") || haystack.includes("redaction")) return "security";
  if (haystack.includes("提示词") || haystack.includes("prompt")) return "prompts";
  if (haystack.includes("frontend") || haystack.includes("前端") || haystack.includes("react") || haystack.includes("vite") || haystack.includes("pwa") || haystack.includes("网页") || haystack.includes("界面")) return "frontend";
  if (haystack.includes("backend") || haystack.includes("后端") || haystack.includes("server") || haystack.includes("api") || haystack.includes("接口") || haystack.includes("site-data") || haystack.includes("数据生成")) return "backend";
  if (haystack.includes("agent") || haystack.includes("智能体") || haystack.includes("coze") || haystack.includes("workflow") || haystack.includes("工作流")) return "agents";
  if (haystack.includes("tool") || haystack.includes("工具") || haystack.includes("codex") || haystack.includes("github") || haystack.includes("browser")) return "tools";
  if (haystack.includes("路线") || haystack.includes("复刻") || haystack.includes("learning") || haystack.includes("教程")) return "learning";
  if (item.module === "paths") return "learning";
  if (item.module === "works") return "learning";
  if (haystack.includes("source") || haystack.includes("来源") || haystack.includes("参考")) return "sources";
  if (haystack.includes("wiki") || haystack.includes("资料库") || haystack.includes("archive") || haystack.includes("obsidian") || haystack.includes("karpathy")) return "archive";
  return "other";
}

function statusHas(item, values) {
  const statuses = asArray(item.status);
  return values.some((value) => statuses.includes(value));
}

function libraryType(item) {
  const raw = text(item.contentType || item.type).toLowerCase();
  if (raw === "video") return "video";
  if (raw === "tutorial") return "course";
  if (raw === "tool" || raw === "api" || raw === "software" || raw === "github") return "tool";
  if (raw === "book") return "book";
  if (raw === "source" || raw === "doc") return "doc";
  return "article";
}

function publicStatus(item) {
  if (statusHas(item, ["draft", "pending"])) return "doing";
  if (statusHas(item, ["archived", "outdated"])) return "todo";
  return "done";
}

function projectStatus(item) {
  const raw = text(item.projectStatus).toLowerCase();
  if (raw === "online" || raw === "maintaining") return "completed";
  if (raw === "building" || raw === "idea") return "in_progress";
  return raw === "paused" || raw === "archived" ? "archived" : "in_progress";
}

function pathStatus(item) {
  if (statusHas(item, ["archived", "outdated"])) return "planned";
  if (statusHas(item, ["verified", "featured", "recommended"])) return "completed";
  return "in_progress";
}

function difficulty(item) {
  const declared = String(item.difficulty || "").toLowerCase();
  if (["beginner", "intermediate", "advanced"].includes(declared)) return declared;
  const count = Number(item.wordCount || 0);
  if (count > 2000) return "advanced";
  if (count > 800) return "intermediate";
  return "beginner";
}

function resourceFromItem(item) {
  const title = publicFacingTitle(item.title, "资料");
  return {
    id: item.id,
    title,
    url: detailPath(item.id),
    type: libraryType(item),
    description: publicFacingText(item.summary),
  };
}

function toLibrary(item) {
  const score = Number(item.qualityScore || item.quality?.qualityScore || 0);
  const category = readerCategory(item);
  const guide = libraryGuide(category);
  const summary = publicFacingText(item.summary);
  const title = publicFacingTitle(item.title, "资料");
  const useCase = curatedText(item.whyItMattered, libraryUseCaseFallback(title, category, summary, guide));
  const thought = curatedText(item.philosophicalLayer, useCase);
  const myThoughts = thought && thought !== summary && thought !== useCase ? thought : "";
  const sourceLabels = publicSourceLabels(item.sourceLabels);
  return {
    id: item.id,
    title,
    description: summary,
    type: libraryType(item),
    readerCategory: category,
    readerCategoryLabel: readerCategoryLabels[category],
    tags: displayTags(item.tags),
    links: publicExternalLinks(item.links),
    rating: score >= 90 ? 5 : score >= 75 ? 4 : score >= 55 ? 3 : undefined,
    status: publicStatus(item),
    cover: libraryCoverByCategory[category] || libraryCoverByCategory.other,
    useCase,
    difficulty: difficulty(item) === "advanced" ? "hard" : difficulty(item) === "intermediate" ? "medium" : "easy",
    timeToLearn: libraryTimeToLearn(item, category, title),
    myThoughts,
    isRecommended: statusHas(item, ["featured", "recommended", "verified"]),
    recommendedFor: curatedText(item.whoFor, guide.recommendedFor),
    pros: [
      item.sources?.length || sourceLabels.length ? "标注来源" : "已完成公开改写",
      item.toc?.length ? libraryStrengthLabel(category) : "适合作为入口卡片",
    ],
    cons: item.quality?.needsSourceReview ? ["仍需来源复核"] : [libraryRiskFallback(title, category, guide)],
    whoFor: curatedText(item.whoFor, guide.whoFor),
    actionText: curatedText(item.actionText, libraryActionFallback(title, category, guide)),
    body: publicFacingBody(item),
    sourceLabels,
    publicSafety: publicSafetyLabel(item.publicSafety),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function pathStageStatus(step, index, totalStages, currentPathStatus) {
  const explicitStatus = String(step.status || "").toLowerCase();
  if (["locked", "available", "in_progress", "completed"].includes(explicitStatus)) {
    return explicitStatus;
  }
  if (currentPathStatus === "completed") {
    return "completed";
  }
  if (currentPathStatus === "planned") {
    return index === 0 ? "available" : "locked";
  }
  if (totalStages <= 1) {
    return "in_progress";
  }
  if (index === 0) {
    return "completed";
  }
  if (index === 1) {
    return "in_progress";
  }
  return "locked";
}

function pathStageDescriptionFallback(pathTitle, stageTitle, index) {
  if (/解决什么问题/.test(stageTitle)) {
    return `先用一句人话说明「${pathTitle}」解决什么问题，再确认它对应的读者和场景。`;
  }
  if (/按周推进/.test(stageTitle)) {
    return "把这一条路线拆成每周可完成的小动作：调研、动手、写回和验收。";
  }
  if (/复核清单|检查清单/.test(stageTitle)) {
    return "按清单逐项检查来源、结构、跳转和公开边界，不靠感觉判断这条路线是否可靠。";
  }
  if (/写回资料库|写回/.test(stageTitle)) {
    return "把这次学到的方法、失败点和下一步，整理成一页能继续复用的公开资料。";
  }
  if (/继续阅读|下一步/.test(stageTitle)) {
    return "根据当前结果，接到下一条相关路线、工坊或资料页，别让这次学习停在半路。";
  }
  return `完成「${stageTitle}」对应的最小动作，并把结果写成一句能复述的话。`;
}

function pathStageDeliverableFallback(pathTitle, stageTitle) {
  if (/解决什么问题/.test(stageTitle)) {
    return `写出「${pathTitle}」的目标、读者和边界一句话说明。`;
  }
  if (/按周推进/.test(stageTitle)) {
    return "形成一张可执行的周节奏表，至少写出本周的一个最小交付物。";
  }
  if (/复核清单|检查清单/.test(stageTitle)) {
    return "完成一次逐项检查，并留下明确的通过项和待修项。";
  }
  if (/写回资料库|写回/.test(stageTitle)) {
    return "整理出一页可公开复用的说明、清单或复盘。";
  }
  if (/继续阅读|下一步/.test(stageTitle)) {
    return "确定一条后续路线，并写下下一次继续时要打开的页面。";
  }
  return `形成「${stageTitle}」的可复核小产出。`;
}

function pathStageTip(stageTitle, currentPathStatus) {
  if (currentPathStatus === "completed") {
    return "这条路线已经完成，可以把重点放在复盘、挑刺和扩展阅读上。";
  }
  if (/复核清单|检查清单/.test(stageTitle)) {
    return "不要为了推进速度跳过复核，这一步决定后面的内容能不能被人放心照着做。";
  }
  if (/写回资料库|写回/.test(stageTitle)) {
    return "写回时只保留能公开复用的结构、方法和失败点，不要把后台痕迹直接搬出来。";
  }
  return "按当前网页提供的公开资料逐步复刻，不要跳过来源和隐私边界。";
}

function toPathStage(step, index, item, fallbackResources, totalStages, currentPathStatus) {
  const title = normalizeStageTitle(step.title, index);
  const pathTitle = publicFacingTitle(item.title, "这条路线");
  const fallbackDescription = pathStageDescriptionFallback(pathTitle, title, index);
  const fallbackCompletion = `完成「${title}」，并能说清这一阶段的目标、产出和检查点。`;
  const fallbackDeliverable = pathStageDeliverableFallback(pathTitle, title);
  return {
    id: text(step.id, `stage-${index + 1}`),
    title,
    description: normalizeStageText(step.description, normalizeStageText(step.goal, fallbackDescription)),
    order: index + 1,
    resources: stageResources(step, item, index, totalStages, fallbackResources),
    status: pathStageStatus(step, index, totalStages, currentPathStatus),
    checklist: [normalizeStageText(step.completion, fallbackCompletion)],
    deliverable: normalizeStageText(step.completion, fallbackDeliverable),
    tips: pathStageTip(title, currentPathStatus),
  };
}

function toPath(item, index) {
  const steps = asArray(item.steps);
  const fallbackResources = buildPathResources(item);
  const summary = publicFacingText(item.summary);
  const title = publicFacingTitle(item.title, "路线");
  const currentPathStatus = pathStatus(item);
  const readingTimeText =
    Number(item.readingMinutes || 0) >= 10 ? `约 ${item.readingMinutes} 分钟` : "";
  const defaultWhoFor = /收费|交付/.test(title)
    ? "想从 AI 辅助开发走到可演示、可交付、可收费小项目的人"
    : /GitHub/.test(title)
      ? "想把官方文档、开源项目和协作流程学成稳定习惯的人"
      : /资料库/.test(title)
        ? "想把资料、项目和公开展示整理成一条完整主线的人"
        : "想沿着公开资料复刻一个最小成果的读者";
  const defaultEstimatedTime = /GitHub/.test(title)
    ? "每周 2 小时，持续滚动学习"
    : /自动化/.test(title)
      ? "约 1 到 2 周"
      : /公开路线图|资料库地图/.test(title)
        ? "约 2 到 5 天"
        : /发布维护/.test(title)
          ? "持续维护"
          : /收费|交付/.test(title)
            ? "约 4 到 8 周"
            : "按主题分阶段推进";
  const defaultOutcome = /GitHub/.test(title)
    ? "形成一套每周都能复用的 GitHub 学习、记录和写回节奏。"
    : /自动化/.test(title)
      ? "串起一条会自动构建、检查和回写的资料库工作流。"
      : /公开路线图|资料库地图/.test(title)
        ? "看清个人书房从资料整理到公开展示的完整主线。"
        : /发布维护/.test(title)
          ? "形成一套长期发布、复核和维护公开内容的节奏。"
          : /收费|交付/.test(title)
            ? "做出一个可演示、可交付、可复盘的小型 AI 项目。"
            : "形成一条可复用的公开学习或构建路径。";
  return {
    id: item.id,
    title,
    description: summary,
    cover: text(item.cover) || ["/covers/path-ai-action.svg", "/covers/path-replication.svg", "/covers/path-publishing.svg"][index % 3],
    difficulty: difficulty(item),
    estimatedTime: curatedText(item.estimatedTime, readingTimeText || defaultEstimatedTime),
    status: currentPathStatus,
    stages: steps.length
      ? steps.map((step, stepIndex) => toPathStage(step, stepIndex, item, fallbackResources, steps.length, currentPathStatus))
      : [
          toPathStage(
            { title: "阅读公开页面", description: summary, completion: "读完页面并能说明它解决什么问题。" },
            0,
            item,
            fallbackResources,
            1,
            currentPathStatus,
          ),
        ],
    tags: displayTags(item.tags),
    whoFor: curatedText(item.audience, defaultWhoFor),
    prerequisites: asArray(item.prerequisites).map(publicFacingText).filter(Boolean),
    outcomes: [curatedText(item.finalOutput, defaultOutcome)],
    actionText: curatedText(item.actionText, `从「${title}」的第一个阶段开始，写下目标、交付物和验收方式。`),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function toPathDetail(item, path) {
  const summary = publicFacingText(item.summary);
  const fallbackResources = buildPathResources(item);
  return {
    ...path,
    prerequisites: path.prerequisites.map((value, index) => ({
      title: `前置条件 ${index + 1}`,
      description: value,
    })),
    outcomes: path.outcomes,
    longDescription: publicFacingBody(item) || summary,
    pitfalls: asArray(item.failureModes).map((value) => {
      const title = publicFacingText(value);
      return {
        title,
        description: pitfallDescription(title),
      };
    }),
    advancedDirections: fallbackResources.map((resource) => ({
      title: resource.title,
      link: text(resource.url, "#"),
    })),
    relatedResourceIds: [],
  };
}

function pitfallDescription(title) {
  const textValue = publicFacingText(title);
  if (!textValue) {
    return "先暂停扩展，把问题写进检查清单，再回到当前阶段的验收标准。";
  }

  if (/赚钱|收费|接单|收益/.test(textValue)) {
    return "先写清用户、交付物和验收标准，再谈收费；没有可演示成果时不要急着包装服务。";
  }
  if (/完整|平台|App|系统|后端/.test(textValue)) {
    return "把范围压回一个可打开、可检查的小版本，先完成一条主流程，再考虑扩展功能。";
  }
  if (/模板|照搬|假|占位/.test(textValue)) {
    return "替换成自己的真实场景、真实步骤和失败记录，让读者知道它为什么发生。";
  }
  if (/维护|安全|账号|支付|权限/.test(textValue)) {
    return "把高风险承诺写进边界清单，先说明不包含什么，再决定是否继续做。";
  }
  if (/界面|酷炫|动画|好看|展示/.test(textValue)) {
    return "先补背景、复刻步骤、验收方式和失败处理；视觉效果只能服务理解，不能替代内容。";
  }
  if (/来源|证据|事实|复核/.test(textValue)) {
    return "为这条内容补来源标签和复核状态，不确定的信息先留在复核队列。";
  }
  if (/小白|术语|英文|看不懂/.test(textValue)) {
    return "把专业词翻译成中文动作语言，并补一个能照着做的最小例子。";
  }

  return "把这个风险写成具体检查项：会在哪里发生、怎样提前发现、失败后先回到哪一步。";
}

function isGenericWorkLesson(value) {
  return /项目资料要从经历变成方法|公开页面要把价值、边界和下一步讲清楚|小批量高质量整理比一次性堆材料更稳/.test(
    String(value || ""),
  );
}

function isGenericWorkReminder(value) {
  return /继续把「.+」补成更具体的实操案例|补成更具体的实操案例|持续补充公开安全证据/.test(
    String(value || ""),
  );
}

function workLessonFallback(title) {
  if (/前端/.test(title)) {
    return [
      "前端先服务阅读路径，再追求视觉完成度。",
      "卡片负责判断，详情页负责教学，两者不能混成一团。",
      "页面越像书房，入口越要克制，不能把读者困在设定里。",
    ];
  }
  if (/平台/.test(title)) {
    return [
      "公开平台先把边界、数据契约和只读出口定稳，再扩展功能。",
      "整理层和展示层必须分开，材料多不等于页面有价值。",
      "先写清一条主线，比同时维护十条半成品路线更可靠。",
    ];
  }
  if (/小安|模型/.test(title)) {
    return [
      "模型实验真正能复用的部分，是目标、数据、检查和复盘。",
      "先把一次试验讲清楚，再谈更大的训练或人格能力。",
      "对话能力要受资料边界约束，不能靠模型自由发挥代替治理。",
    ];
  }
  if (/技能治理/.test(title)) {
    return [
      "技能不是越多越好，真正重要的是什么时候调用、怎样验收、失败后如何回退。",
      "规则页如果不写进流程，就只是墙上的标语。",
      "多角色协作要先确定责任归属，再追求自动化速度。",
    ];
  }
  if (/Coze|Agent/.test(title)) {
    return [
      "Agent 价值不在画布有多像平台，而在节点输入、输出和停点是否清楚。",
      "只读原型先跑通，再增加写入和外部动作，系统会稳很多。",
      "清楚可读的流程图，比宏大的平台口号更有教学价值。",
    ];
  }
  if (/Hanako/.test(title)) {
    return [
      "创作型 Agent 的关键不是会不会说话，而是人格、资料和插件职责是否分明。",
      "先做一个小回路，让读者看到输入、加工和输出的关系。",
      "风格表达要服务理解，不能遮住方法和边界。",
    ];
  }
  if (/Trae|IDE/.test(title)) {
    return [
      "比较 Agent IDE 时，先看任务拆解、改码反馈和验收体验，不先比噱头。",
      "真实小任务最能暴露工具差异，抽象评价最容易失真。",
      "学工具的目的不是收藏平台，而是形成可复用的交付习惯。",
    ];
  }
  return [
    "先把项目缩成一个最小闭环，读者才有机会真正复刻。",
    "公开页要优先解释为什么做、怎么做、哪里会失败。",
    "把经历写成方法，比把结果摆出来更有长期价值。",
  ];
}

function workReminderFallback(title) {
  if (/小安|模型/.test(title)) {
    return "小安相关页面要先讲清资料边界、回答范围和失败处理。读者需要知道它能帮什么，也要知道它不能替人判断。";
  }
  if (/技能治理/.test(title)) {
    return "技能治理的重点不是把工具堆满，而是让每一次调用都有理由、证据和验收口。速度必须服从可检查。";
  }
  if (/Coze|Agent/.test(title)) {
    return "Agent 教程要让读者看见节点之间的责任：输入从哪里来，模型做什么，人在哪一步确认，失败后回到哪里。";
  }
  if (/Hanako/.test(title)) {
    return "创作型 Agent 的魅力来自人格，但可靠性来自边界。先把人格、资料和插件分清，再谈风格。";
  }
  if (/Trae|IDE/.test(title)) {
    return "评估 AI 编程工具时，别只看它能写多少代码。真正要看的是问题拆解、改动可见、验收是否顺手。";
  }
  if (/前端|网站|App/.test(title)) {
    return "前端先承担阅读秩序：读者知道你是谁、做过什么、怎样复刻，再谈视觉层面的惊艳。";
  }
  if (/资料库|平台/.test(title)) {
    return "资料库最怕堆料。每张卡都要回答一个问题：它解决什么、怎么开始、哪里会失败。";
  }
  return "把项目写成别人能走的小路：先讲问题，再讲动作，最后讲失败点和检查方式。";
}

function workWhyFallback(title, summary) {
  if (/小安本地模型学习闭环复刻包/.test(title)) {
    return "它把本地模型实验从“跑一次看看”改成“目标、样本、指标、复盘”四件事能闭环的学习包，让每一步为什么存在都能被看见。";
  }
  if (/Agent 技能治理复刻学习包/.test(title)) {
    return "它把多工具协作里最容易被忽略的部分讲清楚了：真正决定质量的不是会不会调工具，而是规则、验收和失败之后怎样收口。";
  }
  if (/Hanako 复刻学习包/.test(title)) {
    return "它把人格、资料边界和创作工作流放到同一张图里，让读者第一次能看清一个创作型 Agent 为什么会跑偏、又该怎样把它拉回来。";
  }
  if (/Trae Antigravity Agent IDE 学习包/.test(title)) {
    return "它把会写代码的 AI IDE 拆成提问、改动、验收三段，让人知道效率来自哪里，也知道风险通常藏在什么地方。";
  }
  return summary;
}

function workActionFallback(title) {
  if (/资料库前端复刻学习包/.test(title)) {
    return "先做一个只含首页、列表和详情页的最小前端，再把公开数据接进去，不要一开始追全站。";
  }
  if (/展示前端/.test(title)) {
    return "先搭一个首页、一组卡片和一个详情页，再检查移动端是否真的好读。";
  }
  if (/个人资料库平台复刻学习包/.test(title)) {
    return "先挑一个真实项目，写清公开边界、来源说明和三步复刻动作，再生成一张公开卡片。";
  }
  if (/个人资料库平台/.test(title)) {
    return "先把列表、详情和搜索三个只读出口跑通，再考虑服务器和 App。";
  }
  if (/小安本地模型学习闭环复刻包/.test(title)) {
    return "先写训练目标、样本边界和一次小样本试跑记录，再决定是否扩大实验。";
  }
  if (/小安本地模型学习闭环/.test(title)) {
    return "先做一次小样本实验，把目标、指标和复盘写完整，再谈更大的模型计划。";
  }
  if (/技能治理/.test(title)) {
    return "先写一页规则、一个验收表和一次失败复盘，再让 Agent 接更复杂的任务。";
  }
  if (/Coze Agent Builder 复刻学习包/.test(title)) {
    return "先画一个只读问答流：输入、检索、草稿、人工确认、最终输出。";
  }
  if (/Coze 风格 Agent 搭建器研究/.test(title)) {
    return "先画四个节点：输入、检索、确认、输出，再做一个能停下来的只读原型。";
  }
  if (/Hanako/.test(title)) {
    return "先写人格、资料边界和插件职责，再做一个最小创作回路。";
  }
  if (/Trae|IDE/.test(title)) {
    return "先拿一个真实小任务，同时试一遍提问、改码和验收，再记录差异。";
  }
  return `先看「${title}」解决什么问题，再做一个能验收的小版本，并立刻补一条失败记录。`;
}

function normalizeSourceTarget(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const wikiMatch = raw.match(/^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]$/);
  if (wikiMatch) return wikiMatch[1].replace(/\.md$/i, "");
  const markdownLinkMatch = raw.match(/^\[[^\]]+\]\(([^)]+)\)$/);
  if (markdownLinkMatch) return markdownLinkMatch[1].replace(/\.md$/i, "");
  return raw.replace(/\.md$/i, "");
}

function resourceTypeFromUrl(url, label) {
  const haystack = `${url} ${label || ""}`.toLowerCase();
  if (haystack.includes("github")) return "tool";
  if (haystack.includes("video") || haystack.includes("bilibili") || haystack.includes("youtube")) return "video";
  if (haystack.includes("course") || haystack.includes("教程")) return "course";
  if (haystack.includes("book") || haystack.includes("书")) return "book";
  if (haystack.includes("/content/")) return "doc";
  return "article";
}

function pathResourceDescription(item, label) {
  const pathTitle = publicFacingTitle(item.title, "这条路线");
  const linkTitle = publicFacingText(label, "相关资料");
  return `配合「${pathTitle}」阅读的公开资料：${linkTitle}。`;
}

function buildPathResources(item) {
  const stagedLinks = [...asArray(item.links)];
  for (const source of asArray(item.sources)) {
    const target = normalizeSourceTarget(source);
    if (!target) continue;
    stagedLinks.push({
      target,
      label: publicInternalLabel(target, ""),
    });
  }

  return publicExternalLinks(stagedLinks)
    .slice(0, 6)
    .map((link, index) => ({
      id: `${item.id}-resource-${index + 1}`,
      title: publicFacingText(link.label, `参考资料 ${index + 1}`),
      url: link.url,
      type: resourceTypeFromUrl(link.url, link.label),
      description: pathResourceDescription(item, link.label),
    }));
}

function stageResources(step, item, index, totalStages, fallbackResources) {
  const explicitResources = asArray(step.resources);
  if (explicitResources.length > 0) return explicitResources;
  if (fallbackResources.length === 0) return [];
  if (index === 0) return fallbackResources.slice(0, Math.min(2, fallbackResources.length));
  if (index === totalStages - 1) return [fallbackResources[fallbackResources.length - 1]];
  const resourceIndex = Math.min(index, fallbackResources.length - 1);
  return [fallbackResources[resourceIndex]];
}

function feedSourceLabel(sourceLabels, item) {
  const specific = sourceLabels.find(
    (label) => !["公开资料层", "公开资料", "已公开复核", "有公开来源"].includes(label),
  );
  if (specific) return specific;

  const title = publicFacingTitle(item.title, "风信");
  if (/前端|Kimi/.test(title)) return "前端对照";
  if (/Agent/.test(title)) return "智能体工作流";
  if (/三月|认知觉醒|年谱/.test(title)) return "年谱节点";
  if (/小安/.test(title)) return "小安边界";
  if (/数据|更新|API/.test(title)) return "网站数据层";
  return sourceLabels[0] || "书房更新";
}

function toWork(item, index, paths) {
  const failureModes = asArray(item.failureModes).map(publicFacingText).filter(Boolean);
  const rawLessons = asArray(item.lessons).map(publicFacingText).filter(Boolean);
  const rawReminders = asArray(item.anReminders).map(publicFacingText).filter(Boolean);
  const summary = publicFacingText(item.summary);
  const title = publicFacingTitle(item.title, "项目");
  const lessons =
    rawLessons.length > 0 && rawLessons.some((value) => !isGenericWorkLesson(value))
      ? rawLessons
      : workLessonFallback(title);
  const anReminders =
    rawReminders.length > 0 && rawReminders.some((value) => isChineseReaderReady(value) && !isGenericWorkReminder(value))
      ? rawReminders.filter((value) => isChineseReaderReady(value) && !isGenericWorkReminder(value))
      : [workReminderFallback(title)];
  return {
    id: item.id,
    title,
    description: summary,
    cover: workCover(item, index),
    techStack: displayTags(item.techStack || item.tags),
    status: projectStatus(item),
    link: /^https?:\/\//.test(String(item.demoUrl || "")) ? text(item.demoUrl) : "",
    github: text(item.githubUrl),
    duration: "持续迭代",
    teamSize: "个人主导",
    challenges: failureModes.join("；") || "需要持续补充公开安全证据。",
    learnings: lessons.join("；") || readerText(item.whyItMattered, summary),
    whyItMattered: curatedText(item.whyItMattered, workWhyFallback(title, summary)),
    operationStory: asArray(item.operationStory).map(publicFacingText).filter(Boolean),
    replicationSteps: asArray(item.replicationSteps).map(publicFacingText).filter(Boolean),
    failureModes,
    lessons,
    nextPlan: curatedText(item.nextPlan, ""),
    psychologicalLayer: curatedText(item.psychologicalLayer, ""),
    sociologicalLayer: curatedText(item.sociologicalLayer, ""),
    philosophicalLayer: curatedText(item.philosophicalLayer, ""),
    anReminders,
    actionText: curatedText(item.actionText, workActionFallback(title)),
    sourceLabels: publicSourceLabels(item.sourceLabels),
    publicSafety: publicSafetyLabel(item.publicSafety),
    body: publicFacingBody(item),
    relatedPathIds: inferRelatedPathIds(item, paths),
    relatedJournalIds: asArray(item.relatedJournal),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function toFeed(item) {
  const rawTags = toPlainTags(item.tags);
  const tags = displayTags(item.tags);
  const sourceLabels = publicSourceLabels(item.sourceLabels);
  const feedType = rawTags.includes("cognition") || rawTags.includes("timeline")
    ? "milestone"
    : rawTags.includes("frontend") || rawTags.includes("backend")
      ? "path_update"
      : item.module === "works"
        ? "work"
        : item.module === "paths"
          ? "path_update"
          : "resource";
  const summary = publicFacingText(item.summary);
  return {
    id: item.id,
    type: feedType,
    title: publicFacingTitle(item.title, "风信"),
    content: summary,
    body: publicFacingBody(item),
    link: detailPath(item.id),
    source: feedSourceLabel(sourceLabels, item),
    importanceLevel: item.importance === "high" || rawTags.includes("cognition") || rawTags.includes("publication") ? "important" : "normal",
    actionText: readerText(item.actionText, "打开详情，按页面里的复刻步骤做一个最小版本。"),
    tags,
    createdAt: date(item.publishedAt || item.updatedAt),
  };
}

function toJournal(item) {
  const summary = publicFacingText(item.summary);
  return {
    id: item.id,
    title: publicFacingTitle(item.title, "手记"),
    date: date(item.date || item.updatedAt),
    tags: displayTags(item.tags),
    excerpt: summary,
    body: publicFacingBody(item) || summary,
    cover: "/covers/cover-journal.svg",
    readingTime: Number(item.readingMinutes || 1),
    keyTakeaways: asArray(item.lessons).map(publicFacingText).filter(Boolean),
    difficulty: "easy",
    relatedPathIds: [],
    actionText: readerText(item.actionText, `读完后写一段自己的复盘：发生了什么、判断变了什么、下一步做什么。`),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function timelineStageLabel(item) {
  const raw = text(item.phase || item.module || item.type, "公开资料");
  const normalized = raw.trim().toLowerCase();
  const labels = {
    feed: "风信转入年谱",
    works: "项目实践",
    work: "项目实践",
    paths: "学习路线",
    path: "学习路线",
    library: "资料整理",
    resource: "资料整理",
    journal: "手记复盘",
    learning: "学习阶段",
    project: "项目阶段",
  };
  return labels[normalized] || publicFacingText(raw) || "公开资料";
}

function toTimeline(item, paths) {
  const summary = publicFacingText(item.summary);
  const title = publicFacingTitle(item.title, "年谱");
  const relatedPathIds = inferRelatedPathIds(item, paths);
  const relatedLinks = publicExternalLinks(item.links).map((link) => text(link.url)).filter(Boolean);
  return {
    id: item.id,
    date: date(item.eventDate || item.date || item.updatedAt),
    title,
    description: summary,
    body: publicFacingBody(item),
    category: item.type === "project" ? "work" : item.type === "learning" ? "learning" : "milestone",
    importance: item.importance === "high" ? "major" : "normal",
    cover: "/covers/cover-timeline.svg",
    relatedLinks: Array.from(new Set([...relatedLinks, ...relatedPathIds.map((pathId) => `/paths/${pathId}`)])),
    achievements: asArray(item.lessons).map(publicFacingText).filter(Boolean),
    reflection: curatedText(item.philosophicalLayer, summary),
    stage: timelineStageLabel(item),
    relatedPathIds,
    actionText: curatedText(item.actionText, `把「${title}」对应的认知变化写成一条自己的下一步行动。`),
  };
}

const payload = JSON.parse(await readFile(indexPath, "utf8"));
pathTitleMap = new Map();
sourcePathToIdMap = new Map();
for (const item of asArray(payload.content)) {
  const sourcePath = String(item.sourcePath || "").replace(/\.md$/i, "");
  if (!sourcePath || !item.title) continue;
  const title = publicFacingTitle(item.title, "相关页面");
  pathTitleMap.set(sourcePath, title);
  pathTitleMap.set(`${sourcePath}.md`, title);
  if (item.id) {
    sourcePathToIdMap.set(sourcePath, item.id);
    sourcePathToIdMap.set(`${sourcePath}.md`, item.id);
  }
}

const librarySource = asArray(payload.library).filter(isChineseDisplayItem);
const pathSource = asArray(payload.paths).filter(isChineseDisplayItem);
const workSource = asArray(payload.works).filter(isChineseDisplayItem);
const feedSource = asArray(payload.feed).filter(isChineseDisplayItem);
const journalSource = asArray(payload.journal).filter(isChineseDisplayItem);
const timelineSource = asArray(payload.timeline).filter(isChineseDisplayItem);

function libraryPriority(item) {
  const value = `${item.title} ${item.description} ${(item.tags || []).join(" ")}`;
  if (/AI 前端搭建入门/.test(value)) return -20;
  if (/个人书房后端入门/.test(value)) return -19;
  if (/Agent 工作流入门/.test(value)) return -18;
  if (/小安对话设计与边界/.test(value)) return -17;
  if (/AI 小白复刻工作流/.test(value)) return -16;
  if (/前端|网页|App|浏览器验收/.test(value)) return 0;
  if (/后端|接口|API|网站数据/.test(value)) return 1;
  if (/小安|数字生命/.test(value)) return 2;
  if (/提示词|prompt/i.test(value)) return 3;
  if (/Agent|智能体|Coze|工作流/i.test(value)) return 4;
  if (/GitHub|发布|验收|Codex/.test(value)) return 5;
  if (/资料库|整理资料|编译/.test(value)) return 6;
  if (/路线|复刻|学习/.test(value)) return 7;
  if (/隐私|安全|访问材料|本机路径/.test(value)) return 8;
  return 9;
}

const libraryItems = librarySource.map(toLibrary).sort((a, b) => {
  const priorityDiff = libraryPriority(a) - libraryPriority(b);
  if (priorityDiff !== 0) return priorityDiff;
  const categoryDiff =
    (readerCategoryOrder.get(a.readerCategory || "other") ?? 99) -
    (readerCategoryOrder.get(b.readerCategory || "other") ?? 99);
  if (categoryDiff !== 0) return categoryDiff;
  if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
  return a.title.localeCompare(b.title, "zh-CN");
});
function workPriority(work) {
  const text = `${work.title} ${work.description}`.toLowerCase();
  if (text.includes("个人资料库展示前端")) return 0;
  if (text.includes("个人资料库平台")) return 1;
  if (text.includes("小安")) return 2;
  if (text.includes("提示词")) return 3;
  if (text.includes("agent") || text.includes("智能体")) return 4;
  if (text.includes("coze")) return 5;
  return 9;
}

function pathPriority(path) {
  const text = `${path.title} ${path.description}`.toLowerCase();
  if (text.includes("可收费") || text.includes("赚钱") || text.includes("氛围编程") || text.includes("vibe")) return -10;
  if (text.includes("复刻学习包")) return 0;
  if (text.includes("前端")) return 1;
  if (text.includes("提示词")) return 2;
  if (text.includes("github")) return 3;
  if (text.includes("公开路线")) return 4;
  return 9;
}

const pathPairs = pathSource
  .map((item, index) => ({ item, path: toPath(item, index) }))
  .sort((a, b) => pathPriority(a.path) - pathPriority(b.path) || a.path.title.localeCompare(b.path.title, "zh-CN"));
const paths = pathPairs.map(({ path }) => path);
const pathDetails = Object.fromEntries(pathPairs.map(({ item, path }) => [item.id, toPathDetail(item, path)]));
const works = workSource
  .map((item, index) => toWork(item, index, paths))
  .sort((a, b) => workPriority(a) - workPriority(b) || a.title.localeCompare(b.title, "zh-CN"));
const feedItems = feedSource.map(toFeed);
const journalEntries = journalSource.map(toJournal);
const timelineEventMap = new Map();
for (const event of timelineSource.map((item) => toTimeline(item, paths))) {
  const key = `${event.date}::${event.title}`;
  const existing = timelineEventMap.get(key);
  if (!existing || String(event.body || "").length > String(existing.body || "").length) {
    timelineEventMap.set(key, event);
  }
}
const timelineEvents = Array.from(timelineEventMap.values());

const adapterPayload = {
  generatedAt: new Date().toISOString(),
  sourceGeneratedAt: payload.generatedAt || payload.updatedAt || null,
  counts: {
    library: libraryItems.length,
    paths: paths.length,
    works: works.length,
    feed: feedItems.length,
    journal: journalEntries.length,
    timeline: timelineEvents.length,
  },
  libraryItems,
  paths,
  pathDetails,
  works,
  feedItems,
  journalEntries,
  timelineEvents,
};

const generated = `// Generated by site/scripts/sync-site-data.mjs. Do not edit by hand.
import type { FeedItem, JournalEntry, LibraryItem, Path, TimelineEvent, Work } from "@/types";
import { resolveSiteDataUrl } from "@/lib/runtime";
import type { PathDetail } from "./mockPaths";

export type RuntimeSiteDataAdapter = {
  generatedAt?: string;
  sourceGeneratedAt?: string | null;
  counts?: Record<string, number>;
  libraryItems?: LibraryItem[];
  paths?: Path[];
  pathDetails?: Record<string, PathDetail>;
  works?: Work[];
  feedItems?: FeedItem[];
  journalEntries?: JournalEntry[];
  timelineEvents?: TimelineEvent[];
};

export const libraryItems: LibraryItem[] = ${JSON.stringify(libraryItems, null, 2)};

export const paths: Path[] = ${JSON.stringify(paths, null, 2)};

export const pathDetails: Record<string, PathDetail> = ${JSON.stringify(pathDetails, null, 2)};

export const works: Work[] = ${JSON.stringify(works, null, 2)};

export const feedItems: FeedItem[] = ${JSON.stringify(feedItems, null, 2)};

export const journalEntries: JournalEntry[] = ${JSON.stringify(journalEntries, null, 2)};

export const timelineEvents: TimelineEvent[] = ${JSON.stringify(timelineEvents, null, 2)};

function replaceArray<T>(target: T[], next: T[] | undefined) {
  if (!Array.isArray(next)) return;
  target.splice(0, target.length, ...next);
}

function replaceRecord<T>(target: Record<string, T>, next: Record<string, T> | undefined) {
  if (!next || typeof next !== 'object') return;
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, next);
}

export function applyRuntimeSiteData(data: RuntimeSiteDataAdapter) {
  replaceArray(libraryItems, data.libraryItems);
  replaceArray(paths, data.paths);
  replaceRecord(pathDetails, data.pathDetails);
  replaceArray(works, data.works);
  replaceArray(feedItems, data.feedItems);
  replaceArray(journalEntries, data.journalEntries);
  replaceArray(timelineEvents, data.timelineEvents);
}

export async function refreshSiteData() {
  const response = await fetch(resolveSiteDataUrl(), {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(\`Failed to load site data adapter: \${response.status}\`);
  }
  const data = (await response.json()) as RuntimeSiteDataAdapter;
  applyRuntimeSiteData(data);
  return data;
}
`;

await writeFile(adapterPath, `${JSON.stringify(adapterPayload, null, 2)}\n`, "utf8");
await writeFile(generatedPath, generated, "utf8");
await mkdir(resolve(siteRoot, "public"), { recursive: true });
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await writeFile(resolve(target, "adapter.json"), `${JSON.stringify(adapterPayload, null, 2)}\n`, "utf8");

console.log(`synced public site-data adapter: ${resolve(target, "adapter.json")}`);
console.log(`generated runtime data adapter: ${adapterPath}`);
console.log(`generated Kimi data adapter: ${generatedPath}`);
