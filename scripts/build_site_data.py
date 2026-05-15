#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import subprocess
import sys
import csv
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any

OUT_DIR = Path("site-data")
QUALITY_REVIEW_PATH = Path("manifests/site_data_quality_review.csv")
PUBLIC_MARKDOWN_ROOTS = [Path("wiki"), Path("README.md"), Path("index.md"), Path("log.md")]
FRONTEND_EXCLUDED_SOURCE_PATHS = {"README.md", "index.md", "log.md", "wiki/index.md"}
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*$", re.MULTILINE)
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
DATE_RE = re.compile(r"(?<!\d)((?:19|20)\d{2})[-_/年.]([01]\d)[-_/月.]([0-3]\d)(?:日)?(?!\d)")
LATIN_WORD_RE = re.compile(r"[A-Za-z0-9_+-]+")
HAN_CHAR_RE = re.compile(r"[\u4e00-\u9fff]")

PROMOTION_STATUSES = {"featured", "recommended", "verified"}
PROMOTION_TAGS = {"featured", "recommended", "verified", "showcase", "curated", "beginner-friendly"}
ARCHIVE_SOURCE = "[[wiki/sources/pre-rebuild-vault-archive]]"
PUBLIC_SAFETY_VALUES = {"public-safe", "needs-redaction", "local-only-source"}
TEXT_DEPTH_FIELDS = {
    "whyItMattered": ["whyItMattered", "whyItMatters", "why_it_mattered", "why_it_matters"],
    "psychologicalLayer": ["psychologicalLayer", "psychological_layer"],
    "sociologicalLayer": ["sociologicalLayer", "sociological_layer"],
    "philosophicalLayer": ["philosophicalLayer", "philosophical_layer"],
}
LIST_DEPTH_FIELDS = {
    "operationStory": ["operationStory", "operation_story", "operations"],
    "replicationSteps": ["replicationSteps", "replication_steps"],
    "failureModes": ["failureModes", "failure_modes", "pitfalls"],
    "lessons": ["lessons", "lesson"],
}
DISPLAY_TITLE_FIELDS = ["displayTitle", "display_title", "siteTitle", "site_title", "publicTitle", "public_title"]
DISPLAY_SUMMARY_FIELDS = [
    "displaySummary",
    "display_summary",
    "siteSummary",
    "site_summary",
    "publicSummary",
    "public_summary",
]
CURATED_SOURCE_PATHS = {
    "README.md",
    "index.md",
    "wiki/index.md",
    "wiki/sources-and-data-policy.md",
    "wiki/topics/llm-wiki-moc.md",
    "wiki/topics/ai-agent-systems-moc.md",
    "wiki/topics/skills-and-tools-moc.md",
    "wiki/topics/publication-maintenance-moc.md",
    "wiki/sources/karpathy-llm-wiki-pattern.md",
    "wiki/sources/github-reference-projects.md",
    "wiki/sources/obsidian-llm-wiki-local.md",
    "wiki/sources/llm-wikid.md",
    "wiki/sources/pre-rebuild-vault-archive.md",
}
LOW_QUALITY_PATH_PATTERNS = [
    "07-技能库-原子技能-",
    "99-模板-",
    "项目同步_",
    "每小时检查_",
    "PROGRESS_SNAPSHOT",
    "断链检测报告",
    "每日整理报告",
    "自动采集",
    "wiki-_templates",
]
LOW_QUALITY_TITLE_PATTERNS = [
    "{{date}}",
    "{{year}}",
    "模板",
    "同步报告",
    "每小时检查",
    "PROGRESS_SNAPSHOT",
]
CHINESE_TITLE_OVERRIDES = {
    "wiki/concepts/agent-skill-governance.md": "Agent 技能治理",
    "wiki/concepts/public-site-data-boundary.md": "公开站点数据边界",
    "wiki/concepts/tool-local-private-wiki-compiler.md": "非公开整理层工具",
    "wiki/concepts/tool-coze-workflow-platform-study.md": "Coze 工作流平台研究",
    "wiki/concepts/tool-obsidian-karpathy-wiki-compilation.md": "资料库编译方法",
    "wiki/sources-and-data-policy.md": "来源与数据发布边界",
    "wiki/sources/github-reference-projects.md": "开源参考项目整理说明与使用边界",
    "wiki/sources/karpathy-llm-wiki-pattern.md": "卡帕西知识库编译模式说明",
    "wiki/sources/llm-wikid.md": "本地知识库服务参考项目说明",
    "wiki/sources/local-private-compile-2026-05-13.md": "2026-05-13 本地非公开整理记录",
    "wiki/sources/obsidian-llm-wiki-local.md": "本地优先知识库模板参考项目说明",
    "wiki/sources/obsidian-properties.md": "资料页属性规范",
    "wiki/sources/pre-rebuild-vault-archive.md": "重建前 Vault 归档来源",
    "wiki/synthesis/personal-archive-public-roadmap.md": "个人资料库公开路线图",
    "wiki/topics/ai-agent-systems-moc.md": "智能体系统学习地图与实践入口",
    "wiki/topics/llm-wiki-moc.md": "公开知识库架构路线图与维护入口",
}
CHINESE_SUMMARY_OVERRIDES = {
    "wiki/concepts/agent-skill-governance.md": "说明如何把 Agent 的技能、规则、来源和验收沉淀为可维护体系，避免依赖临时提示词和聊天记忆。",
    "wiki/concepts/lifecycle-replication-package-template.md": "定义安的书房学习包模板：用教程、操作步骤、参考表和解释，把一次项目经历整理成新手可复刻资料。",
    "wiki/concepts/private-to-public-promotion-pipeline.md": "说明本地非公开资料如何经过筛选、改写、来源标注和验收，晋升为公开安全的中文资料页。",
    "wiki/concepts/public-api-contract.md": "定义安的书房未来后端的只读公开接口，让前端只读取精选资料，不直接触碰原始材料和非公开复核层。",
    "wiki/concepts/public-site-data-boundary.md": "解释公开网站数据边界：前端只消费经过检查的公开数据包，非公开整理层、原始资料和本地线索不得进入浏览器数据包。",
    "wiki/concepts/public-work-card-standard.md": "规定公开项目卡的最低标准：项目是什么、为什么重要、怎么复刻、有哪些风险、来源和下一步是什么。",
    "wiki/concepts/sensitive-context-rewrite-rules.md": "给本地敏感上下文的公开改写规则：保留方法、决策和教训，移除身份、环境、账号和原始对话细节。",
    "wiki/concepts/tool-agent-skill-stack-routing.md": "整理 Agent 技能路由方法：根据任务选择合适技能、工具和验收方式，让复杂工作不靠临场发挥。",
    "wiki/concepts/tool-browser-ui-testing-workflow.md": "说明前端浏览器验收流程：用页面实际表现检查数据、布局、交互和空状态，避免只看代码就认为可发布。",
    "wiki/concepts/tool-codex-validation-workflow.md": "记录 Codex 参与资料库维护时的验证流程：结构检查、隐私扫描、测试、站点构建和 Git 状态都要可解释。",
    "wiki/concepts/tool-coze-workflow-platform-study.md": "总结 Coze 风格工作流平台的学习价值，用于理解 Agent 搭建器、节点编排、调试和发布边界。",
    "wiki/concepts/tool-github-publication-workflow.md": "说明 GitHub 发布流程：只发布公开安全层，先跑验收，再提交和推送，避免把本地非公开资料带上去。",
    "wiki/concepts/tool-local-model-experiment-toolchain.md": "整理本地模型实验工具链：把模型、数据、评估和复盘分开管理，让小安相关实验可追踪、可改进。",
    "wiki/concepts/tool-local-private-wiki-compiler.md": "说明非公开整理层工具的职责：把本地文件、项目、Agent 和时间线先整理成非公开知识层，再选择性公开。",
    "wiki/concepts/tool-obsidian-karpathy-wiki-compilation.md": "说明如何把原始材料编译成公开资料页：原文留在安全边界内，前端只展示经过筛选、链接和复核的成果。",
    "wiki/concepts/tool-privacy-scan-publication-gate.md": "说明公开发布前的扫描闸门：发现高风险内容就停止发布，把问题改写或退回非公开层。",
    "wiki/concepts/tool-site-data-generation-backend.md": "说明公开数据生成后端：从公开资料页编译出网站可读 JSON，为安的书房前端和未来 App 提供稳定数据。",
    "wiki/concepts/upstream-reference-and-adaptation-policy.md": "规定引用上游项目和官方资料的方式：标明来源、区分借鉴和自建，不把别人的工作写成自己的成果。",
    "wiki/projects/lifecycle-agent-ide-learning-workflow.md": "把 Trae、Antigravity 等 Agent IDE 的使用经验整理成评估学习包，帮助新手比较工具并形成可复用流程。",
    "wiki/projects/lifecycle-agent-skill-governance.md": "把 Agent 技能治理整理成复刻包：从规则、技能、验收和复盘四个层面建立稳定协作系统。",
    "wiki/projects/lifecycle-coze-agent-builder.md": "把 Coze 风格 Agent 搭建器研究整理成学习包，帮助读者理解工作流节点、调试、发布和安全边界。",
    "wiki/projects/lifecycle-frontend-archive-site.md": "把安的书房前端建设过程整理成复刻包，覆盖信息架构、数据契约、页面展示和发布验收。",
    "wiki/projects/lifecycle-hanako-openhanako-creative-agent-desktop.md": "把 Hanako/OpenHanako 创作型桌面 Agent 的探索整理成学习包，关注创作流程、插件生态和安全边界。",
    "wiki/projects/lifecycle-personal-archive-platform.md": "把个人资料库平台整理成完整学习包，说明如何从本地材料、非公开整理、公开资料层到网站展示形成闭环。",
    "wiki/projects/lifecycle-xiaoan-local-model-loop.md": "把小安本地模型学习闭环整理成复刻包，覆盖资料准备、实验记录、评估复盘和公开安全表达。",
    "wiki/sources-and-data-policy.md": "说明安的书房来源与数据边界：哪些材料能公开，哪些只能非公开复核，前端数据从哪里生成。",
    "wiki/sources/diataxis-framework.md": "记录 Diataxis 文档框架如何帮助学习包分清教程、操作指南、参考资料和解释，提升新手可读性。",
    "wiki/sources/github-actions-scheduled-workflows.md": "记录 GitHub 定时工作流的官方参考，用于设计安的书房两小时学习、构建和验收自动化。",
    "wiki/sources/github-reference-projects.md": "汇总用于参考的 GitHub 项目，说明它们只提供实现启发，不替代 Karpathy LLM Wiki 的架构标准。",
    "wiki/sources/karpathy-llm-wiki-pattern.md": "记录 Karpathy LLM Wiki 的核心模式：原始材料、编译 wiki 和维护 schema 三层分离。",
    "wiki/sources/llm-wikid.md": "记录 llm-wikid 作为二级参考项目的价值，主要用于理解模板、缓存、仪表盘和本地 wiki 工作流。",
    "wiki/sources/local-private-compile-2026-05-13.md": "记录 2026-05-13 本地私有编译的公开安全摘要，为后续项目页、能力页和学习包提供来源说明。",
    "wiki/sources/obsidian-llm-wiki-local.md": "记录 obsidian-llm-wiki-local 的参考价值，重点是本地优先、增量编译和 watcher 思路。",
    "wiki/sources/obsidian-properties.md": "记录资料页属性规范，确保公开页面使用稳定 frontmatter、标签、日期、别名和来源字段。",
    "wiki/sources/pre-rebuild-vault-archive.md": "记录重建前 vault 归档作为私有来源，不公开原文，只为迁移、恢复和来源追踪提供证据。",
    "wiki/synthesis/archive-feed-public-data-update-2026-05-13.md": "记录 2026-05-13 公开数据更新，说明项目页、API 契约和作品卡标准如何进入安的书房展示层。",
    "wiki/synthesis/archive-information-architecture.md": "说明安的书房信息架构：用项目、能力、时间线、来源和复核队列组织可发布资料。",
    "wiki/synthesis/archive-rebuild-public-journal.md": "记录资料库重建的公开手记，把一次系统重建转化为信息架构和发布安全经验。",
    "wiki/synthesis/capability-evidence-matrix.md": "用公开安全矩阵连接能力、证据、项目和后续页面，帮助读者看懂安会什么、证据在哪里。",
    "wiki/synthesis/github-best-practice-learning-loop.md": "说明定期学习 GitHub 和官方文档的循环：围绕当前问题调研、提炼模式、写回 wiki 并验收。",
    "wiki/synthesis/information-review-queue.md": "记录信息复核队列，把暂时不能公开或还需要来源确认的内容留在可追踪状态。",
    "wiki/synthesis/lifecycle-automation-acceptance-2026-05-13.md": "记录两小时自动化工作流的验收结果，包括私有编译、公开数据、测试、前端构建和中文展示规则。",
    "wiki/synthesis/lifecycle-automation-output-map.md": "说明五个异步自动化各自写到哪里，让本地学习、GitHub 调研、学习包生成和验收都有可见产出。",
    "wiki/synthesis/lifecycle-automation-workflow.md": "说明安的书房生命周期自动化：本地 intake、GitHub 学习、学习包构建、验收和流程复盘错峰运行。",
    "wiki/synthesis/lifecycle-replication-package-workflow.md": "说明如何把一个项目或工具经历整理成生命周期学习包，让新手能按步骤复刻并完成验收。",
    "wiki/synthesis/personal-archive-public-roadmap.md": "规划安的书房公开路线：从资料整理、项目展示、能力证明到后端服务和长期自动化维护。",
    "wiki/synthesis/project-evidence-matrix.md": "用项目证据矩阵连接公开项目、来源、能力和展示页面，让项目叙述有证据支撑。",
    "wiki/synthesis/public-tool-and-agent-inventory.md": "整理公开可讲的工具和 Agent 清单，说明它们在资料库、学习、前端、自动化和验收中的角色。",
}


MODULES = [
    {
        "id": "library",
        "name": "藏馆",
        "key": "library",
        "description": "给新手看的资料、工具与入口页。",
        "href": "/library",
        "view": "card-grid",
        "visible": True,
        "order": 1,
    },
    {
        "id": "paths",
        "name": "谱系",
        "key": "paths",
        "description": "按步骤复刻的学习与构建路线。",
        "href": "/paths",
        "view": "route-map",
        "visible": True,
        "order": 2,
    },
    {
        "id": "feed",
        "name": "风信",
        "key": "feed",
        "description": "最近变化、认知转折与下一步行动。",
        "href": "/feed",
        "view": "info-feed",
        "visible": True,
        "order": 3,
    },
    {
        "id": "works",
        "name": "工坊",
        "key": "works",
        "description": "安做过的项目、实验与复刻课堂。",
        "href": "/works",
        "view": "card-grid",
        "visible": True,
        "order": 4,
    },
    {
        "id": "journal",
        "name": "手记",
        "key": "journal",
        "description": "经历、复盘与方法修正。",
        "href": "/journal",
        "view": "article-list",
        "visible": True,
        "order": 5,
    },
    {
        "id": "timeline",
        "name": "年谱",
        "key": "timeline",
        "description": "从 2026 年 3 月之后展开的公开成长线。",
        "href": "/timeline",
        "view": "timeline",
        "visible": True,
        "order": 6,
    },
    {
        "id": "about",
        "name": "书房",
        "key": "about",
        "description": "安是谁，这间书房怎样使用，哪些内容不会公开。",
        "href": "/about",
        "view": "markdown",
        "visible": True,
        "order": 7,
    },
]


def run_gate(root: Path, command: list[str]) -> None:
    result = subprocess.run(command, cwd=root, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        output = (result.stdout + "\n" + result.stderr).strip()
        raise SystemExit(f"site data gate failed: {' '.join(command)}\n{output}")


def run_public_gates(root: Path) -> None:
    run_gate(root, [sys.executable, "scripts/wiki_check.py", "."])
    run_gate(root, [sys.executable, "scripts/privacy_scan.py", "."])
    run_gate(root, [sys.executable, "scripts/check_public_content_quality.py", "."])


def markdown_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for source in PUBLIC_MARKDOWN_ROOTS:
        target = root / source
        if target.is_dir():
            files.extend(sorted(target.rglob("*.md")))
        elif target.exists() and target.suffix.lower() == ".md":
            files.append(target)
    return sorted(set(files), key=lambda p: p.relative_to(root).as_posix())


def parse_scalar(value: str) -> Any:
    value = value.strip()
    if not value:
        return []
    if value in {"[]", "{}"}:
        return [] if value == "[]" else {}
    if value.startswith("[") and value.endswith("]"):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            inner = value[1:-1].strip()
            return [clean_yaml_value(part) for part in inner.split(",") if part.strip()]
    return clean_yaml_value(value)


def clean_yaml_value(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    block = match.group(1)
    body = text[match.end() :]
    data: dict[str, Any] = {}
    current_key: str | None = None
    for raw_line in block.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            continue
        if line.startswith((" ", "\t")) and current_key and line.strip().startswith("- "):
            data.setdefault(current_key, [])
            if not isinstance(data[current_key], list):
                data[current_key] = [data[current_key]]
            data[current_key].append(clean_yaml_value(line.strip()[2:]))
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        current_key = key.strip()
        parsed = parse_scalar(value)
        data[current_key] = parsed
    return data, body


def as_list(value: Any) -> list[str]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [str(value).strip()]


def first_frontmatter_value(frontmatter: dict[str, Any], keys: list[str]) -> Any:
    for key in keys:
        if key in frontmatter and frontmatter[key] not in (None, "", []):
            return frontmatter[key]
    return None


def optional_frontmatter_text(frontmatter: dict[str, Any], keys: list[str]) -> str | None:
    value = first_frontmatter_value(frontmatter, keys)
    if value is None or isinstance(value, (list, dict)):
        return None
    text = str(value).strip()
    return text or None


def optional_frontmatter_list(frontmatter: dict[str, Any], keys: list[str]) -> list[str]:
    return as_list(first_frontmatter_value(frontmatter, keys))


def public_safety(frontmatter: dict[str, Any]) -> str:
    raw = optional_frontmatter_text(frontmatter, ["publicSafety", "public_safety", "publication_safety"])
    return raw if raw in PUBLIC_SAFETY_VALUES else "public-safe"


def source_labels(frontmatter: dict[str, Any], sources: list[str]) -> list[str]:
    labels = optional_frontmatter_list(frontmatter, ["sourceLabels", "source_labels"])
    if labels:
        return labels
    labels = ["public wiki"]
    if source_only_archive(sources):
        labels.append("archive-derived")
    elif sources:
        labels.append("source-backed")
    return labels


def has_han_text(value: str | None) -> bool:
    return bool(value and HAN_CHAR_RE.search(value))


def is_auto_generated_summary(value: str | None) -> bool:
    text = (value or "").strip()
    return text.startswith("本页整理「") or text.startswith("公开资料条目：")


def chinese_reader_ready(value: str | None) -> bool:
    if not value or not has_han_text(value):
        return False
    han_count = len(HAN_CHAR_RE.findall(value))
    latin_count = len(LATIN_WORD_RE.findall(value))
    return han_count >= 12 and latin_count <= max(18, han_count * 0.45)


def chinese_title_ready(value: str | None) -> bool:
    if not value or not has_han_text(value):
        return False
    han_count = len(HAN_CHAR_RE.findall(value))
    latin_count = len(LATIN_WORD_RE.findall(value))
    return han_count >= 2 and latin_count <= max(8, han_count * 1.8)


def list_is_chinese_ready(values: Any) -> bool:
    items = as_list(values)
    return bool(items) and all(chinese_reader_ready(item) for item in items)


def body_lines_are_chinese_ready(lines: Any) -> bool:
    body = "\n".join(as_list(lines))
    if not body.strip():
        return False
    han_count = len(HAN_CHAR_RE.findall(body))
    latin_count = len(LATIN_WORD_RE.findall(body))
    return han_count >= 80 and latin_count <= max(60, han_count * 0.55)


def generated_public_body(item: dict[str, Any]) -> list[str]:
    title = item.get("title", "公开资料")
    summary = item.get("summary", "这是一页经过公开安全处理的资料。")
    sources = as_list(item.get("sources"))
    source_lines = [f"- {source}" for source in sources[:4]] or ["- public wiki"]
    body = [
        f"# {title}",
        "",
        "## 概览",
        "",
        str(summary),
        "",
        "## 读者可以获得什么",
        "",
        f"- 理解「{title}」在安的书房里的位置。",
        "- 看清它解决的问题、适合的读者和后续复刻方向。",
        "- 知道公开页面保留的是方法、结构和经验，不包含原始私有材料。",
        "",
        "## 推荐阅读方式",
        "",
        "1. 先读概览，确认它和当前学习目标是否相关。",
        "2. 再看关联页面，理解来源、项目、工具或工作流之间的关系。",
        "3. 如果要复刻，先写下自己的目标、输入材料、边界和验收标准。",
        "4. 完成后回到资料库，把新的经验整理成可追踪页面。",
        "",
        "## 发布边界",
        "",
        "本页只展示公开安全的整理结果。原始材料、账号状态、本机细节、私人对话和未复核内容不会进入公开展示。",
        "",
        "## 来源",
        "",
        *source_lines,
    ]
    return body


def refresh_body_fields(item: dict[str, Any], lines: list[str]) -> None:
    body = "\n".join(lines)
    item["contentLines"] = lines
    item["toc"] = extract_toc(body)
    item["wordCount"] = estimate_word_count(body)
    item["readingMinutes"] = reading_minutes(item["wordCount"])
    item["metrics"] = {
        "lineCount": len(lines),
        "headingCount": len(item["toc"]),
        "linkCount": len(item.get("links", [])),
        "sourceCount": len(item.get("sources", [])),
    }


def apply_public_display_defaults(item: dict[str, Any]) -> None:
    title = item.get("title", "这页资料")
    if item.get("module") == "works":
        fallback_defaults = {
            "whyItMattered": f"「{title}」把一次真实项目整理成可学习、可展示、可复刻的公开资料，帮助读者理解目标、边界和结果。",
            "operationStory": [
                "先把原始材料、私有复核和公开展示分开，确认哪些信息可以安全讲给读者。",
                "再把项目目标、关键步骤、失败点和验收方式整理成中文页面。",
                "最后通过结构检查、隐私扫描和站点数据生成，确认资料可以进入前端展示。",
            ],
            "replicationSteps": [
                "先明确目标读者、最小成果和公开边界。",
                "整理公开安全的来源说明和替代示例。",
                "按教程、操作步骤、参考表和解释四块组织内容。",
                "运行发布前验收，确认页面可读、可追踪、可维护。",
            ],
            "failureModes": [
                "只展示结果，不说明来源和验收。",
                "把原始本地材料误当成公开资料。",
                "页面没有复刻步骤，读者只能看热闹。",
            ],
            "lessons": [
                "项目资料要从经历变成方法，才能真正被复用。",
                "公开页面要把价值、边界和下一步讲清楚。",
                "小批量高质量整理比一次性堆材料更稳。",
            ],
            "anReminders": [
                f"继续把「{title}」补成更具体的实操案例。",
                "每次新增本地证据，都先进入私有复核，再决定是否公开。",
            ],
        }
        is_learning_package = (
            "lifecycle" in item.get("tags", [])
            or "learning" in item.get("tags", [])
            or "学习包" in title
        )
        required_depth_missing = []
        for field in ["whyItMattered", "operationStory", "replicationSteps", "failureModes", "lessons", "anReminders"]:
            value = item.get(field)
            if isinstance(value, list):
                if not list_is_chinese_ready(value):
                    required_depth_missing.append(field)
            elif not chinese_reader_ready(str(value or "")):
                required_depth_missing.append(field)
        if is_learning_package and required_depth_missing:
            item.setdefault("hiddenReasons", []).append("requires-handwritten-depth")
            item["displayTier"] = "hidden"
        for field, value in fallback_defaults.items():
            current = item.get(field)
            if isinstance(value, list):
                if not is_learning_package and not list_is_chinese_ready(current):
                    item[field] = value
            elif not is_learning_package and not chinese_reader_ready(str(current or "")):
                item[field] = value
    if item.get("module") in {"works", "journal", "paths"} and not body_lines_are_chinese_ready(item.get("contentLines")):
        lines = generated_public_body(item)
        refresh_body_fields(item, lines)
        if item.get("module") == "journal":
            item["bodyLines"] = lines
    if "actionText" not in item:
        item["actionText"] = default_action_text(item)


def default_action_text(item: dict[str, Any]) -> str:
    module = item.get("module")
    title = item.get("title", "这页内容")
    if module == "works":
        return f"读完后先复刻「{title}」的最小版本，只做一个能验收的小闭环。"
    if module == "paths":
        return f"从「{title}」的第一个阶段开始，写下目标、交付物和验收方式。"
    if module == "feed":
        return f"把「{title}」对应的认知变化写成一条自己的下一步行动。"
    if module == "journal":
        return f"读完后写一段自己的复盘：发生了什么、判断变了什么、下一步做什么。"
    return f"读完「{title}」后，记录它解决的问题、适合的场景和一个可执行动作。"


def content_depth(frontmatter: dict[str, Any], sources: list[str]) -> dict[str, Any]:
    depth: dict[str, Any] = {
        "publicSafety": public_safety(frontmatter),
        "sourceLabels": source_labels(frontmatter, sources),
    }
    for field, keys in TEXT_DEPTH_FIELDS.items():
        value = optional_frontmatter_text(frontmatter, keys)
        if value and chinese_reader_ready(value):
            depth[field] = value
    for field, keys in LIST_DEPTH_FIELDS.items():
        values = optional_frontmatter_list(frontmatter, keys)
        if values and list_is_chinese_ready(values):
            depth[field] = values
    next_plan = optional_frontmatter_text(frontmatter, ["nextPlan", "next_plan"])
    if next_plan and chinese_reader_ready(next_plan):
        depth["nextPlan"] = next_plan
    an_reminders = optional_frontmatter_list(frontmatter, ["anReminders", "an_reminders", "reminders"])
    if an_reminders and list_is_chinese_ready(an_reminders):
        depth["anReminders"] = an_reminders
    action_text = optional_frontmatter_text(frontmatter, ["actionText", "action_text"])
    if action_text and chinese_reader_ready(action_text):
        depth["actionText"] = action_text
    return depth


def has_truthy_frontmatter(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"true", "yes", "1", "curated", "showcase", "public"}


def first_heading(body: str) -> str | None:
    match = HEADING_RE.search(body)
    if not match:
        return None
    return strip_markdown(match.group(2)).strip()


def strip_markdown(text: str) -> str:
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = WIKILINK_RE.sub(lambda m: m.group(2) or m.group(1), text)
    return text.replace("#", "").strip()


def summary_from_body(body: str) -> str:
    for paragraph in re.split(r"\n\s*\n", body):
        clean = strip_markdown(paragraph)
        clean = re.sub(r"\s+", " ", clean).strip(" -\n\t")
        if clean and not clean.startswith("|"):
            return clean[:240]
    return ""


def first_chinese_value(values: list[str]) -> str | None:
    for value in values:
        if has_han_text(value):
            return value
    return None


def first_chinese_summary(body: str) -> str | None:
    for paragraph in re.split(r"\n\s*\n", body):
        clean = strip_markdown(paragraph)
        clean = re.sub(r"\s+", " ", clean).strip(" -\n\t")
        if clean and not clean.startswith("|") and has_han_text(clean):
            return clean[:240]
    return None


def display_title(rel: str, frontmatter: dict[str, Any], body: str, source_title: str) -> str:
    override = CHINESE_TITLE_OVERRIDES.get(rel)
    if override:
        return override
    explicit = optional_frontmatter_text(frontmatter, DISPLAY_TITLE_FIELDS)
    if explicit:
        return explicit
    if has_han_text(source_title):
        return source_title
    alias = first_chinese_value(as_list(frontmatter.get("aliases")))
    if alias:
        return alias
    heading = first_heading(body)
    if heading and has_han_text(heading):
        return heading
    return source_title


def display_summary(rel: str, frontmatter: dict[str, Any], body: str, source_summary: str, fallback_title: str) -> str:
    override = CHINESE_SUMMARY_OVERRIDES.get(rel)
    if override:
        return override
    explicit = optional_frontmatter_text(frontmatter, DISPLAY_SUMMARY_FIELDS)
    if explicit:
        return explicit
    if has_han_text(source_summary):
        return source_summary
    chinese = first_chinese_summary(body)
    if chinese:
        return chinese
    return f"本页整理「{fallback_title}」的公开知识，说明它在资料库中的作用、使用边界、复刻步骤和维护验收。"


def slug_for(path: Path, root: Path) -> str:
    rel = path.relative_to(root).with_suffix("").as_posix()
    slug = rel.lower().replace("/", "--")
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"[^\w\-\u4e00-\u9fff]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug or sha256(rel.encode("utf-8")).hexdigest()[:12]


def stable_id(rel: str) -> str:
    return "c_" + sha256(rel.encode("utf-8")).hexdigest()[:16]


def anchor_for(title: str) -> str:
    anchor = title.strip().lower()
    anchor = re.sub(r"\s+", "-", anchor)
    anchor = re.sub(r"[^\w\-\u4e00-\u9fff]+", "", anchor)
    return anchor.strip("-") or sha256(title.encode("utf-8")).hexdigest()[:8]


def item_status(frontmatter: dict[str, Any]) -> list[str]:
    raw = as_list(frontmatter.get("status"))
    statuses = [status for status in raw if status in {"draft", "public", "featured", "recommended", "verified", "pending", "archived", "outdated"}]
    if frontmatter.get("status") == "active":
        statuses.append("public")
    if frontmatter.get("type") == "moc":
        statuses.append("featured")
    return sorted(set(statuses or ["public"]))


def source_only_archive(sources: list[str]) -> bool:
    return len(sources) == 1 and sources[0] == ARCHIVE_SOURCE


def quality_review(item: dict[str, Any], frontmatter: dict[str, Any]) -> dict[str, Any]:
    rel = item["sourcePath"]
    title = item["title"]
    statuses = set(item["status"])
    declared_statuses = set(as_list(frontmatter.get("status")))
    tags = set(item["tags"])
    sources = item["sources"]
    reasons: list[str] = []

    explicitly_curated = (
        rel in CURATED_SOURCE_PATHS
        or bool(declared_statuses & PROMOTION_STATUSES)
        or bool(tags & PROMOTION_TAGS)
        or has_truthy_frontmatter(frontmatter.get("publish"))
        or has_truthy_frontmatter(frontmatter.get("site"))
    )

    if "migrated-needs-source-review" in statuses or "migrated-needs-source-review" in declared_statuses:
        reasons.append("status:migrated-needs-source-review")
    if "migrated" in tags:
        reasons.append("tag:migrated")
    if source_only_archive(sources):
        reasons.append("source:archive-only")
    for pattern in LOW_QUALITY_PATH_PATTERNS:
        if pattern.lower() in rel.lower():
            reasons.append(f"path-pattern:{pattern}")
    for pattern in LOW_QUALITY_TITLE_PATTERNS:
        if pattern.lower() in title.lower():
            reasons.append(f"title-pattern:{pattern}")
    if item["wordCount"] < 80 and item["module"] not in {"paths"} and rel not in CURATED_SOURCE_PATHS:
        reasons.append("content:too-thin")
    if not item["summary"] or item["summary"] == title:
        reasons.append("summary:missing-or-title-only")
    if item.get("publicSafety") != "public-safe":
        reasons.append(f"publicSafety:{item.get('publicSafety', 'unknown')}")

    blocking_reasons = [
        reason
        for reason in reasons
        if reason.startswith(("status:", "tag:", "source:", "path-pattern:", "title-pattern:", "content:", "publicSafety:"))
    ]

    score = 50
    if item["quality"]["hasSources"]:
        score += 15
    if item["quality"]["hasToc"]:
        score += 10
    if item["wordCount"] >= 250:
        score += 10
    if item["wordCount"] >= 800:
        score += 5
    if item["module"] == "paths":
        score += 8
    if explicitly_curated:
        score += 25
    score -= min(55, len(blocking_reasons) * 14)
    score = max(0, min(100, score))

    if explicitly_curated and not rel.endswith("log.md"):
        display_tier = "showcase" if score >= 75 else "starter"
    elif blocking_reasons:
        display_tier = "hidden"
    elif score >= 75:
        display_tier = "candidate"
    else:
        display_tier = "hidden"

    if display_tier == "candidate":
        reasons.append("needs-explicit-curation")

    return {
        "displayTier": display_tier,
        "qualityScore": score,
        "hiddenReasons": sorted(set(reasons)),
        "explicitlyCurated": explicitly_curated,
    }


def classify_module(rel: str, frontmatter: dict[str, Any], title: str) -> str:
    haystack = f"{rel} {title} {' '.join(as_list(frontmatter.get('tags')))} {frontmatter.get('type', '')}".lower()
    explicit_module = str(frontmatter.get("module") or "").strip().lower()
    if explicit_module in {module["key"] for module in MODULES}:
        return explicit_module
    if rel.startswith("wiki/projects/") or frontmatter.get("type") == "project":
        return "works"
    if (
        frontmatter.get("type") in {"moc", "learning-path", "path", "route", "roadmap"}
        or "learning-path" in haystack
        or "路线" in haystack
        or "谱系" in haystack
        or "复刻" in haystack
    ):
        return "paths"
    if "情报日报" in haystack or "信息总汇" in haystack or "调研报告" in haystack or "feed" in haystack:
        return "feed"
    if "log" in haystack or "复盘" in haystack or "每日" in haystack or "维护" in haystack or "journal" in haystack:
        return "journal"
    return "library"


def content_type(rel: str, frontmatter: dict[str, Any], title: str) -> str:
    haystack = f"{rel} {title} {' '.join(as_list(frontmatter.get('tags')))}".lower()
    if rel.startswith("wiki/sources/") or frontmatter.get("category") == "source":
        return "source"
    if "github" in haystack:
        return "github"
    if "api" in haystack:
        return "api"
    if "工具" in haystack or "tool" in haystack:
        return "tool"
    if "模型" in haystack or "model" in haystack:
        return "model"
    if "教程" in haystack or "tutorial" in haystack:
        return "tutorial"
    if "视频" in haystack or "video" in haystack:
        return "video"
    if "案例" in haystack or "case" in haystack:
        return "case"
    return "article"


def extract_links(body: str) -> list[dict[str, str]]:
    links = []
    for match in WIKILINK_RE.finditer(body):
        target = match.group(1).strip()
        label = (match.group(2) or target).strip()
        links.append({"target": target, "label": label})
    return links


def extract_toc(body: str) -> list[dict[str, Any]]:
    toc = []
    for match in HEADING_RE.finditer(body):
        raw = strip_markdown(match.group(2)).strip()
        if not raw:
            continue
        toc.append(
            {
                "level": len(match.group(1)),
                "title": raw,
                "anchor": anchor_for(raw),
            }
        )
    return toc


def estimate_word_count(text: str) -> int:
    clean = strip_markdown(text)
    return len(HAN_CHAR_RE.findall(clean)) + len(LATIN_WORD_RE.findall(clean))


def reading_minutes(word_count: int) -> int:
    if word_count <= 0:
        return 1
    return max(1, math.ceil(word_count / 450))


def extract_dates(text: str) -> list[str]:
    dates = set()
    for match in DATE_RE.finditer(text):
        year, month, day = match.groups()
        try:
            dates.add(datetime(int(year), int(month), int(day)).strftime("%Y-%m-%d"))
        except ValueError:
            continue
    return sorted(dates)


def extract_steps(body: str) -> list[dict[str, Any]]:
    matches = list(HEADING_RE.finditer(body))
    steps = []
    stage_matches = [
        match
        for match in matches
        if match.group(1) != "#"
        and re.match(r"^(阶段[一二三四五六七八九十\d]+|第[一二三四五六七八九十\d]+步|步骤[一二三四五六七八九十\d]+)", strip_markdown(match.group(2)).strip())
    ]
    selected = stage_matches or [match for match in matches if match.group(1) != "#"][:7]

    for index, match in enumerate(selected[:7], start=1):
        heading = strip_markdown(match.group(2)).strip()
        if not heading:
            continue
        next_start = len(body)
        for next_match in matches:
            if next_match.start() > match.start():
                next_start = next_match.start()
                break
        section = body[match.end():next_start].strip()
        description = first_step_paragraph(section)
        completion = first_labeled_line(section, ["检查点", "验收", "完成标准"]) or "读完本节并完成对应交付物。"
        steps.append(
            {
                "id": f"step-{index}",
                "title": heading,
                "goal": heading,
                "description": description or "按本阶段说明完成一个可见小产出。",
                "resources": [],
                "completion": completion,
                "optional": False,
            }
        )
    return steps


def first_labeled_line(section: str, labels: list[str]) -> str:
    for raw_line in section.splitlines():
        line = strip_markdown(raw_line).strip().lstrip("-").strip()
        for label in labels:
            prefix = f"{label}："
            if line.startswith(prefix):
                return line[len(prefix):].strip()
    return ""


def first_step_paragraph(section: str) -> str:
    for block in re.split(r"\n\s*\n", section):
        text = strip_markdown(block).strip()
        if not text or text.startswith(("交付物：", "检查点：", "验收：", "完成标准：")):
            continue
        if text.startswith(("-", "|", "```")):
            continue
        if chinese_reader_ready(text):
            return re.sub(r"\s+", " ", text)
    return ""


def frontend_exclusion_reasons(item: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    if item.get("sourcePath") in FRONTEND_EXCLUDED_SOURCE_PATHS:
        reasons.append("sourcePath:entry-page-not-card")
    if item.get("displayTier") not in {"showcase", "starter"}:
        reasons.append(f"displayTier:{item.get('displayTier', 'unknown')}")
    if item.get("hiddenReasons"):
        reasons.append("hiddenReasons:not-empty")
    if int(item.get("qualityScore") or 0) < 85:
        reasons.append("qualityScore:too-low")
    if item.get("publicSafety") != "public-safe":
        reasons.append(f"publicSafety:{item.get('publicSafety', 'unknown')}")
    if not item.get("sources"):
        reasons.append("sources:missing")
    if not str(item.get("title", "")).strip():
        reasons.append("title:missing")
    elif not chinese_title_ready(item.get("title")):
        reasons.append("title:not-chinese-reader-ready")
    if not chinese_reader_ready(item.get("summary")):
        reasons.append("summary:not-chinese-reader-ready")
    if not chinese_reader_ready(item.get("actionText")):
        reasons.append("actionText:missing-or-not-chinese")
    if is_auto_generated_summary(item.get("summary")):
        reasons.append("summary:auto-generated")
    if item.get("module") == "works":
        for field in ["whyItMattered", "operationStory", "replicationSteps", "failureModes", "lessons", "anReminders"]:
            value = item.get(field)
            if field in {"operationStory", "replicationSteps", "failureModes", "lessons", "anReminders"}:
                if not list_is_chinese_ready(value):
                    reasons.append(f"{field}:missing-or-not-chinese")
            elif not chinese_reader_ready(str(value or "")):
                reasons.append(f"{field}:missing-or-not-chinese")
    if item.get("module") in {"works", "journal", "paths"} and not body_lines_are_chinese_ready(item.get("contentLines")):
        reasons.append("body:not-chinese-reader-ready")
    return reasons


def frontend_quality_warnings(item: dict[str, Any]) -> list[str]:
    warnings: list[str] = []
    if str(item.get("summary", "")).startswith("本页整理「"):
        warnings.append("summary:auto-generated")
    return warnings


def is_displayable(item: dict[str, Any]) -> bool:
    return not frontend_exclusion_reasons(item)


def is_timeline_event(item: dict[str, Any]) -> bool:
    return item.get("category") == "event" or item.get("type") == "event" or bool(item.get("eventDate"))


def write_quality_review(root: Path, all_items: list[dict[str, Any]]) -> None:
    path = root / QUALITY_REVIEW_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for item in sorted(all_items, key=lambda row: (row.get("displayTier", ""), row["sourcePath"])):
        frontend_reasons = frontend_exclusion_reasons(item)
        frontend_warnings = frontend_quality_warnings(item)
        rows.append(
            {
                "path": item["sourcePath"],
                "source_title": item.get("sourceTitle", item["title"]),
                "display_title": item["title"],
                "title": item["title"],
                "module": item["module"],
                "display_tier": item.get("displayTier", "hidden"),
                "frontend_eligible": "yes" if not frontend_reasons else "no",
                "quality_score": item.get("qualityScore", 0),
                "status": "|".join(item.get("status", [])),
                "tags": "|".join(item.get("tags", [])[:12]),
                "sources": "|".join(item.get("sources", [])[:4]),
                "hidden_reasons": "|".join(item.get("hiddenReasons", [])),
                "frontend_hidden_reasons": "|".join(frontend_reasons),
                "frontend_quality_warnings": "|".join(frontend_warnings),
            }
        )
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "path",
                "source_title",
                "display_title",
                "title",
                "module",
                "display_tier",
                "frontend_eligible",
                "quality_score",
                "status",
                "tags",
                "sources",
                "hidden_reasons",
                "frontend_hidden_reasons",
                "frontend_quality_warnings",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def build_item(root: Path, path: Path) -> dict[str, Any]:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8", errors="replace")
    frontmatter, body = parse_frontmatter(text)
    raw_statuses = as_list(frontmatter.get("status"))
    source_title = str(frontmatter.get("title") or first_heading(body) or path.stem).strip()
    source_summary = str(frontmatter.get("summary") or summary_from_body(body) or source_title).strip()
    title = display_title(rel, frontmatter, body, source_title).strip()
    summary = display_summary(rel, frontmatter, body, source_summary, title).strip()
    tags = as_list(frontmatter.get("tags"))
    event_date = optional_frontmatter_text(frontmatter, ["eventDate", "event_date"])
    detected_dates = extract_dates(rel + "\n" + body)
    created = str(frontmatter.get("created") or (detected_dates[0] if detected_dates else "2026-05-12"))
    updated = str(frontmatter.get("updated") or created)
    slug = slug_for(path, root)
    module = classify_module(rel, frontmatter, title)
    links = extract_links(body)
    toc = extract_toc(body)
    body_lines = body.strip().splitlines()
    sources = as_list(frontmatter.get("sources"))
    word_count = estimate_word_count(body)
    statuses = item_status(frontmatter)
    item = {
        "id": stable_id(rel),
        "title": title,
        "sourceTitle": source_title,
        "slug": slug,
        "summary": summary,
        "sourceSummary": source_summary,
        "tags": tags,
        "status": statuses,
        "createdAt": created,
        "updatedAt": updated,
        "eventDate": event_date,
        "sourcePath": rel,
        "module": module,
        "category": str(frontmatter.get("category") or path.parent.name),
        "type": str(frontmatter.get("type") or content_type(rel, frontmatter, title)),
        "phase": optional_frontmatter_text(frontmatter, ["phase", "eventPhase", "event_phase"]),
        "cover": optional_frontmatter_text(frontmatter, ["cover", "image", "heroImage", "hero_image"]),
        "contentType": content_type(rel, frontmatter, title),
        "href": f"/content/{slug}",
        "contentLines": body_lines,
        "links": links,
        "sources": sources,
        "toc": toc,
        "wordCount": word_count,
        "readingMinutes": reading_minutes(word_count),
        "metrics": {
            "lineCount": len(body_lines),
            "headingCount": len(toc),
            "linkCount": len(links),
            "sourceCount": len(sources),
        },
        "quality": {
            "hasSources": bool(sources),
            "hasToc": bool(toc),
            "summaryLength": len(summary),
            "sourceTitle": source_title,
            "sourceSummary": source_summary,
            "needsSourceReview": "migrated-needs-source-review" in statuses
            or "migrated-needs-source-review" in raw_statuses,
        },
    }
    item.update(content_depth(frontmatter, sources))
    review = quality_review(item, frontmatter)
    item["displayTier"] = review["displayTier"]
    item["qualityScore"] = review["qualityScore"]
    item["hiddenReasons"] = review["hiddenReasons"]
    item["quality"].update(
        {
            "displayTier": review["displayTier"],
            "qualityScore": review["qualityScore"],
            "hiddenReasons": review["hiddenReasons"],
            "explicitlyCurated": review["explicitlyCurated"],
        }
    )
    if module == "paths":
        item.update(
            {
                "goal": summary,
                "audience": optional_frontmatter_text(frontmatter, ["audience", "whoFor", "who_for"])
                or "希望沿着公开资料路线学习、复刻或维护知识库的读者。",
                "prerequisites": optional_frontmatter_list(frontmatter, ["prerequisites", "requires"]),
                "estimatedTime": optional_frontmatter_text(frontmatter, ["estimatedTime", "estimated_time"]) or "按主题自定",
                "difficulty": optional_frontmatter_text(frontmatter, ["difficulty"]) or "intermediate",
                "finalOutput": optional_frontmatter_text(frontmatter, ["finalOutput", "final_output"])
                or "形成一条可复用的公开学习或构建路径。",
                "steps": extract_steps(body),
            }
        )
    if module == "works":
        item.update(
            {
                "projectStatus": str(
                    frontmatter.get("projectStatus")
                    or ("maintaining" if "active" in str(frontmatter.get("status", "")) else "archived")
                ),
                "techStack": tags[:6],
                "nextPlan": item.get("nextPlan", ""),
            }
        )
    if module == "feed":
        item.update(
            {
                "source": "an-llm-wiki",
                "publishedAt": updated,
                "importance": "medium",
                "archivedToLibrary": True,
            }
        )
    if module == "journal":
        item.update({"date": updated, "visibility": "public", "bodyLines": body.strip().splitlines()})
    apply_public_display_defaults(item)
    return item


def build_payload(root: Path) -> dict[str, Any]:
    all_items = [build_item(root, path) for path in markdown_files(root)]
    write_quality_review(root, all_items)
    items = [item for item in all_items if is_displayable(item)]
    hidden_items = [item for item in all_items if not is_displayable(item)]
    showcase_candidates = [
        item
        for item in all_items
        if item.get("displayTier") in {"showcase", "starter"} and item.get("publicSafety") == "public-safe"
    ]
    buckets: dict[str, list[dict[str, Any]]] = {module["key"]: [] for module in MODULES}
    for item in items:
        buckets.setdefault(item["module"], []).append(item)

    timeline = []
    for item in items:
        if not is_timeline_event(item):
            continue
        date_value = item.get("eventDate") or item.get("createdAt")
        timeline.append(
            {
                "id": f"timeline-{item['id']}",
                "title": item["title"],
                "slug": item["slug"],
                "summary": item["summary"],
                "tags": item["tags"],
                "status": item["status"],
                "createdAt": item["createdAt"],
                "updatedAt": item["updatedAt"],
                "eventDate": item.get("eventDate"),
                "date": date_value,
                "phase": item.get("phase") or item["module"],
                "type": item["type"],
                "importance": "high" if "featured" in item["status"] else "medium",
                "relatedLibraryItems": [item["id"]],
                "href": item["href"],
                "contentLines": item.get("contentLines", []),
                "lessons": item.get("lessons", []),
                "philosophicalLayer": item.get("philosophicalLayer", ""),
                "actionText": item.get("actionText", ""),
                "publicSafety": item.get("publicSafety", "public-safe"),
                "sourceLabels": item.get("sourceLabels", []),
            }
        )
    timeline.sort(key=lambda row: row["date"], reverse=True)

    search = [
        {
            "id": item["id"],
            "title": item["title"],
            "summary": item["summary"],
            "tags": item["tags"],
            "module": item["module"],
            "type": item["contentType"],
            "href": item["href"],
            "sourcePath": item["sourcePath"],
        }
        for item in items
    ]
    tag_counts: dict[str, int] = {}
    type_counts: dict[str, int] = {}
    status_counts: dict[str, int] = {}
    module_counts: dict[str, int] = {}
    for item in items:
        module_counts[item["module"]] = module_counts.get(item["module"], 0) + 1
        type_counts[item["contentType"]] = type_counts.get(item["contentType"], 0) + 1
        for tag in item["tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        for status in item["status"]:
            status_counts[status] = status_counts.get(status, 0) + 1

    def top_counts(values: dict[str, int], limit: int = 40) -> list[dict[str, Any]]:
        return [
            {"key": key, "count": count}
            for key, count in sorted(values.items(), key=lambda pair: (-pair[1], pair[0]))[:limit]
        ]

    featured_paths = [item for item in buckets.get("paths", []) if "featured" in item["status"]][:3]
    featured_works = [
        item
        for item in buckets.get("works", [])
        if "featured" in item["status"] or "recommended" in item["status"]
    ][:3]
    recent_library = sorted(buckets.get("library", []), key=lambda item: item["updatedAt"], reverse=True)[:6]
    recent_timeline = timeline[:6]

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "an-llm-wiki public wiki",
        "schemaVersion": 1,
        "privacyBoundary": {
            "included": ["wiki/", "README.md", "index.md", "log.md"],
            "excluded": ["_raw/", "inbox/private/", "private-wiki/", ".obsidian/", ".claude/", ".claudian/", ".trash/"],
            "gate": "scripts/wiki_check.py and scripts/privacy_scan.py must pass before generation",
        },
        "modules": MODULES,
        "counts": {
            "content": len(items),
            "publicMarkdown": len(all_items),
            "reviewQueue": len(hidden_items),
            "showcaseCandidates": len(showcase_candidates),
            "frontendExcluded": len(showcase_candidates) - len(items),
            "library": len(buckets.get("library", [])),
            "paths": len(buckets.get("paths", [])),
            "feed": len(buckets.get("feed", [])),
            "works": len(buckets.get("works", [])),
            "journal": len(buckets.get("journal", [])),
            "timeline": len(timeline),
        },
        "curation": {
            "mode": "curated-public-showcase",
            "displayedContent": len(items),
            "reviewQueue": len(hidden_items),
            "allPublicMarkdown": len(all_items),
            "qualityManifest": QUALITY_REVIEW_PATH.as_posix(),
            "rules": [
                "Front-end payload includes only showcase/starter pages.",
                "Front-end payload uses Chinese display aliases and Chinese summaries when available; generic summaries are reported in the quality manifest for later rewriting.",
                "Timeline payload includes only public event pages or pages with explicit eventDate, never file update time.",
                "Archive-only migrated pages stay in the review manifest until manually promoted.",
                "Templates, sync snapshots, raw skill fragments, progress reports, and thin pages are hidden by default.",
                "Private layers and raw sources are never included in site-data.",
            ],
            "nextImportWorkflow": [
                "Collect useful local material into private-wiki or wiki draft pages.",
                "Use skills/archive-content-curator/SKILL.md to rewrite each item for beginner readers with concrete evidence, operation steps, literary care, psychological insight, sociological context, and philosophical restraint.",
                "Mark it with publish: curated or status: verified only after privacy and source review.",
                "Match the current frontend contract in site/src/types/index.ts; never hand-edit site/src/data/siteData.generated.ts.",
                "Regenerate site-data and verify the public frontend before publishing.",
            ],
        },
        "facets": {
            "tags": top_counts(tag_counts),
            "types": top_counts(type_counts),
            "statuses": top_counts(status_counts),
            "modules": top_counts(module_counts),
        },
        "homepage": {
            "headline": "给新手也能看懂的 AI 与知识库资料展柜",
            "summary": "前端只展示精选公开层；更多本地资料先进入复核队列，整理成可靠、有来源、能落地的条目后再上架。",
            "featuredPathSlugs": [item["slug"] for item in featured_paths],
            "featuredWorkSlugs": [item["slug"] for item in featured_works],
            "recentLibrarySlugs": [item["slug"] for item in recent_library],
            "recentTimelineSlugs": [item["slug"] for item in recent_timeline],
        },
        "content": items,
        "library": buckets.get("library", []),
        "paths": buckets.get("paths", []),
        "feed": sorted(buckets.get("feed", []), key=lambda item: item["updatedAt"], reverse=True),
        "works": buckets.get("works", []),
        "journal": sorted(buckets.get("journal", []), key=lambda item: item["updatedAt"], reverse=True),
        "timeline": timeline,
        "about": {
            "title": "关于这间书房",
            "summary": "这是安的个人书房：把项目、路径、手记与成长线整理成中文可读、可复刻的公开展示。",
            "body": "这里展示的是安与小安共同整理后的公开书页。你能看到资料、路线、作品、手记和年谱，也能沿着它们一步步复刻。非公开材料、访问线索、本机细节和原始记录不会进入前端数据包。",
        },
        "search": search,
    }


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_payload(root: Path, payload: dict[str, Any]) -> None:
    out = root / OUT_DIR
    out.mkdir(parents=True, exist_ok=True)
    write_json(out / "index.json", payload)
    for key in ["modules", "content", "library", "paths", "feed", "works", "journal", "timeline", "about", "search"]:
        write_json(out / f"{key}.json", payload[key])
    (out / "README.md").write_text(
        "# Site Data\n\n"
        "Generated curated public content data for the archive frontend. Regenerate with `python scripts/build_site_data.py .`.\n"
        "This directory must contain only public-safe showcase data compiled from `wiki/`, `README.md`, `index.md`, and `log.md`.\n"
        "Review excluded public-safe candidates in `manifests/site_data_quality_review.csv`.\n",
        encoding="utf-8",
    )


def build(root: Path, run_gates: bool = True) -> dict[str, Any]:
    out = root / OUT_DIR
    if run_gates:
        run_public_gates(root)
    payload = build_payload(root)
    write_payload(root, payload)
    if run_gates:
        run_gate(root, [sys.executable, "scripts/privacy_scan.py", "."])
    return payload


def main() -> int:
    args = [arg for arg in sys.argv[1:] if arg != "--skip-gates"]
    run_gates = "--skip-gates" not in sys.argv[1:]
    root = Path(args[0]).resolve() if args else Path.cwd().resolve()
    payload = build(root, run_gates=run_gates)
    print(f"site_data_content: {payload['counts']['content']}")
    print(f"site_data_dir: {root / OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
