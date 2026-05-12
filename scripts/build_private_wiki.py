#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import shutil
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

ARCHIVE_ID = "pre-karpathy-rebuild-20260512-143127"
PRIVATE_MANIFEST_DIR = Path("inbox/private/local-recovery-2026-05-12/manifests")
PRIVATE_CAPTURES_DIR = Path("inbox/private/local-recovery-2026-05-12/captures")
LOCAL_DISCOVERY_DIR = Path("inbox/private/local-recovery-2026-05-12/local-discovery")
OUT_DIR = Path("private-wiki")
TODAY = date.today().isoformat()

SECRET_RULES = {
    "openai_token",
    "github_token",
    "anthropic_token",
    "google_api_key",
    "aws_access_key",
    "azure_connection_string",
    "jwt",
    "ssh_private_key",
    "secret_assignment",
    "credential_term",
}
HIGH_SECRET_RULES = {
    "openai_token",
    "github_token",
    "anthropic_token",
    "google_api_key",
    "aws_access_key",
    "azure_connection_string",
    "jwt",
    "ssh_private_key",
    "secret_assignment",
}
PERSONAL_RULES = {
    "email",
    "phone_cn",
    "china_id",
    "bank_card_like",
    "wechat_marker",
    "personal_memory_marker",
}
LOCAL_CONTEXT_RULES = {"local_path"}


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def yaml_list(items: list[str]) -> str:
    if not items:
        return "[]"
    quoted = [json.dumps(item, ensure_ascii=False) for item in items]
    return "[" + ", ".join(quoted) + "]"


def frontmatter(title: str, aliases: list[str], tags: list[str], category: str, page_type: str, summary: str, risk: str = "internal") -> str:
    return (
        "---\n"
        f"title: {title}\n"
        f"aliases: {yaml_list(aliases)}\n"
        f"tags: {yaml_list(tags + ['visibility/internal'])}\n"
        f"category: {category}\n"
        f"type: {page_type}\n"
        "status: active\n"
        f"created: {TODAY}\n"
        f"updated: {TODAY}\n"
        f"sources: {yaml_list([ARCHIVE_ID])}\n"
        f"risk_level: {risk}\n"
        "publication_status: private-only\n"
        f"summary: {json.dumps(summary, ensure_ascii=False)}\n"
        "---\n\n"
    )


def write_page(path: Path, title: str, aliases: list[str], tags: list[str], category: str, page_type: str, summary: str, body: str, risk: str = "internal") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = frontmatter(title, aliases, tags, category, page_type, summary, risk) + f"# {title}\n\n" + body.rstrip() + "\n"
    path.write_text(text, encoding="utf-8")


def md_link(label: str, vault_path: str, current_depth: int = 1) -> str:
    safe = label.replace("|", "-").strip() or "source"
    prefix = "../" * current_depth
    return f"[{safe}]({prefix}{vault_path})"


def private_report_link(label: str, manifest_name: str, current_depth: int = 1) -> str:
    prefix = "../" * current_depth
    return f"[{label}]({prefix}{PRIVATE_MANIFEST_DIR.as_posix()}/{manifest_name})"


def local_report_link(label: str, manifest_name: str, current_depth: int = 1) -> str:
    prefix = "../" * current_depth
    return f"[{label}]({prefix}{LOCAL_DISCOVERY_DIR.as_posix()}/{manifest_name})"


def md_cell(text: str, limit: int = 160) -> str:
    clean = (text or "").replace("|", "-").replace("\n", " ").strip()
    if len(clean) > limit:
        return clean[: limit - 3] + "..."
    return clean


def row_label(row: dict[str, str]) -> str:
    return (row.get("title") or Path(row.get("relative_path", "source")).stem)[:90].replace("|", "-")


def group_sensitive(rows: list[dict[str, str]], rules: set[str]) -> list[dict[str, str]]:
    return [r for r in rows if r.get("rule") in rules]


def aggregate_by_file(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    grouped: dict[str, dict[str, str | Counter]] = {}
    for row in rows:
        key = row.get("relative_path", "")
        if key not in grouped:
            grouped[key] = {
                "relative_path": key,
                "vault_copy_path": row.get("vault_copy_path", ""),
                "title": row_label(row),
                "severity": row.get("severity", ""),
                "rules": Counter(),
                "lines": [],
                "hashes": [],
            }
        grouped[key]["rules"][row.get("rule", "")] += 1  # type: ignore[index]
        grouped[key]["lines"].append(row.get("line", ""))  # type: ignore[index]
        grouped[key]["hashes"].append(row.get("excerpt_hash", ""))  # type: ignore[index]
    results = []
    for item in grouped.values():
        rules_counter: Counter = item["rules"]  # type: ignore[assignment]
        lines: list[str] = item["lines"]  # type: ignore[assignment]
        hashes: list[str] = item["hashes"]  # type: ignore[assignment]
        results.append(
            {
                "relative_path": str(item["relative_path"]),
                "vault_copy_path": str(item["vault_copy_path"]),
                "title": str(item["title"]),
                "severity": str(item["severity"]),
                "rules": ";".join(f"{rule}:{count}" for rule, count in rules_counter.most_common()),
                "line_samples": ";".join(lines[:8]),
                "hash_samples": ";".join(h for h in hashes[:6] if h),
                "finding_count": str(sum(rules_counter.values())),
            }
        )
    return sorted(results, key=lambda r: (-int(r["finding_count"]), r["relative_path"].lower()))


def table_for_findings(rows: list[dict[str, str]], limit: int = 120, current_depth: int = 1) -> str:
    lines = ["| Findings | Rules | Lines | Source | Hash samples |", "|---:|---|---|---|---|"]
    for row in rows[:limit]:
        link = md_link(row["title"], row["vault_copy_path"], current_depth)
        lines.append(f"| {row['finding_count']} | `{row['rules']}` | `{row['line_samples']}` | {link} | `{row['hash_samples']}` |")
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | {len(rows) - limit} more source files in the CSV report | ... |")
    if len(lines) == 2:
        lines.append("| 0 | - | - | No matching findings | - |")
    return "\n".join(lines)


def status_for_review(row: dict[str, str]) -> str:
    category = row.get("category", "")
    risks = row.get("risk_flags", "")
    if category == "private-memory-and-sessions":
        return "private-only"
    if risks:
        return "needs-redaction"
    if category == "public-knowledge-candidates":
        return "public-safe-candidate"
    return "needs-redaction"


def review_table(rows: list[dict[str, str]], limit: int = 180, current_depth: int = 1) -> str:
    lines = ["| Status | Score | Category | Risk flags | Source |", "|---|---:|---|---|---|"]
    for row in rows[:limit]:
        link = md_link(row_label(row), row.get("vault_copy_path", ""), current_depth)
        lines.append(f"| `{status_for_review(row)}` | {row.get('review_score', '')} | `{row.get('category', '')}` | `{row.get('risk_flags', '') or '-'}` | {link} |")
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | {len(rows) - limit} more rows in review_queue.csv |")
    return "\n".join(lines)


def manual_capture_lines(root: Path, current_depth: int = 2) -> list[str]:
    captures = root / PRIVATE_CAPTURES_DIR
    if not captures.exists():
        return ["- No manual private captures found."]
    lines = []
    for path in sorted(captures.glob("*.md")):
        rel = path.relative_to(root).as_posix()
        lines.append(f"- {md_link(path.stem, rel, current_depth)}")
    return lines or ["- No manual private captures found."]


def context_page(rows: list[dict[str, str]], category: str, title: str, summary: str, output: Path, extra_body: str = "") -> None:
    filtered = [r for r in rows if r.get("category") == category]
    body = (
        f"Source category: `{category}`\n\n"
        f"- Candidate rows: `{len(filtered)}`\n"
        f"- Full queue: {private_report_link('review_queue.csv', 'review_queue.csv', 2)}\n\n"
        "## Priority Sources\n\n"
        + review_table(filtered, 160, 2)
        + "\n\n## Handling\n\n"
        "- Keep raw source material in `_raw/recovered/`.\n"
        "- Rewrite any public candidate before moving it to `wiki/`.\n"
        "- Do not copy local paths, private memory, chat logs, or credential values into public pages.\n"
        + extra_body
    )
    write_page(output, title, [title], ["local-recovery", "private-wiki"], "private-context", "moc", summary, body)


def local_root_table(rows: list[dict[str, str]], limit: int = 80) -> str:
    lines = ["| Root | Files | Findings | Latest modified | Categories |", "|---|---:|---:|---|---|"]
    for row in rows[:limit]:
        categories = row.get("category_counts", "{}")
        lines.append(
            f"| `{md_cell(row.get('root_id', ''), 80)}`<br>`{md_cell(row.get('path', ''), 140)}` | "
            f"{row.get('files', '0')} | {row.get('findings', '0')} | `{row.get('latest_modified_at', '')}` | `{md_cell(categories, 220)}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | {len(rows) - limit} more roots in local_roots.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | 0 | - | - |")
    return "\n".join(lines)


def local_finding_table(rows: list[dict[str, str]], limit: int = 220) -> str:
    lines = ["| Severity | Group | Rule | Line | Source | Hash |", "|---|---|---|---:|---|---|"]
    for row in rows[:limit]:
        source = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        lines.append(
            f"| `{row.get('severity', '')}` | `{row.get('group', '')}` | `{row.get('rule', '')}` | "
            f"{row.get('line', '')} | `{md_cell(source, 190)}` | `{row.get('excerpt_hash', '')}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | {len(rows) - limit} more rows in local_sensitive_findings.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | - | 0 | No matching findings | - |")
    return "\n".join(lines)


def local_inventory_table(rows: list[dict[str, str]], limit: int = 180) -> str:
    lines = ["| Category | Kind | Size | Source | Risk flags |", "|---|---|---:|---|---|"]
    for row in rows[:limit]:
        source = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        lines.append(
            f"| `{row.get('category', '')}` | `{row.get('kind', '')}` | {row.get('size_bytes', '0')} | "
            f"`{md_cell(source, 190)}` | `{md_cell(row.get('risk_flags', '') or '-', 180)}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | {len(rows) - limit} more rows in local_source_inventory.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | 0 | No matching sources | - |")
    return "\n".join(lines)


def contains_any(text: str, terms: list[str]) -> bool:
    haystack = text.casefold()
    return any(term.casefold() in haystack for term in terms)


def row_text(row: dict[str, str], fields: list[str] | None = None) -> str:
    fields = fields or ["relative_path", "vault_copy_path", "title", "tags", "summary", "root_id", "name", "category", "risk_flags"]
    return " ".join(row.get(field, "") for field in fields)


def score_terms(row: dict[str, str], terms: list[str]) -> int:
    text = row_text(row).casefold()
    score = 0
    for term in terms:
        if term.casefold() in text:
            score += 1
    if row.get("summary"):
        score += 1
    if row.get("title"):
        score += 1
    return score


def select_recovered_rows(rows: list[dict[str, str]], terms: list[str], categories: set[str] | None = None, limit: int = 180) -> list[dict[str, str]]:
    selected = []
    for row in rows:
        if categories and row.get("category") not in categories:
            continue
        score = score_terms(row, terms)
        if score:
            selected.append((score, int(row.get("size_bytes") or 0), row))
    selected.sort(key=lambda item: (-item[0], -item[1], row_label(item[2]).casefold()))
    return [row for _, _, row in selected[:limit]]


def select_local_rows(rows: list[dict[str, str]], terms: list[str], categories: set[str] | None = None, limit: int = 180) -> list[dict[str, str]]:
    selected = []
    for row in rows:
        if categories and row.get("category") not in categories:
            continue
        score = score_terms(row, terms)
        if score:
            selected.append((score, int(row.get("size_bytes") or 0), row))
    selected.sort(key=lambda item: (-item[0], -item[1], row_text(item[2], ["root_id", "relative_path"]).casefold()))
    return [row for _, _, row in selected[:limit]]


def recovered_source_table(rows: list[dict[str, str]], limit: int = 120, current_depth: int = 2) -> str:
    lines = ["| Category | Risk | Source | Summary |", "|---|---|---|---|"]
    for row in rows[:limit]:
        link = md_link(row_label(row), row.get("vault_copy_path", ""), current_depth)
        lines.append(
            f"| `{row.get('category', '')}` | `{row.get('risk_flags', '') or '-'}` | {link} | {md_cell(row.get('summary', '') or row.get('tags', ''), 180)} |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | {len(rows) - limit} more rows in recovered_file_inventory.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | No matching recovered sources | - |")
    return "\n".join(lines)


def root_summary_table(rows: list[dict[str, str]], terms: list[str] | None = None, limit: int = 80) -> str:
    filtered = rows
    if terms:
        filtered = [row for row in rows if contains_any(row_text(row, ["root_id", "path", "category_counts"]), terms)]
    filtered = sorted(filtered, key=lambda row: -int(row.get("files") or 0))
    lines = ["| Root | Files | Findings | Timeline rows | Categories |", "|---|---:|---:|---:|---|"]
    for row in filtered[:limit]:
        lines.append(
            f"| `{md_cell(row.get('root_id', ''), 100)}`<br>`{md_cell(row.get('path', ''), 160)}` | "
            f"{row.get('files', '0')} | {row.get('findings', '0')} | {row.get('timeline_rows', '0')} | `{md_cell(row.get('category_counts', '{}'), 220)}` |"
        )
    if len(filtered) > limit:
        lines.append(f"| ... | ... | ... | ... | {len(filtered) - limit} more roots in local_roots.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | 0 | 0 | - |")
    return "\n".join(lines)


def finding_summary_table(rows: list[dict[str, str]], limit: int = 80) -> str:
    grouped: dict[tuple[str, str, str], Counter] = defaultdict(Counter)
    for row in rows:
        key = (row.get("root_id", ""), row.get("group", ""), row.get("rule", ""))
        grouped[key]["findings"] += 1
        if row.get("severity") == "high":
            grouped[key]["high"] += 1
    ranked = sorted(grouped.items(), key=lambda item: (-item[1]["high"], -item[1]["findings"], item[0]))
    lines = ["| Root | Group | Rule | Findings | High |", "|---|---|---|---:|---:|"]
    for (root_id, group, rule), counts in ranked[:limit]:
        lines.append(f"| `{md_cell(root_id, 80)}` | `{group}` | `{rule}` | {counts['findings']} | {counts['high']} |")
    if len(ranked) > limit:
        lines.append(f"| ... | ... | ... | {len(ranked) - limit} more grouped rows in local_sensitive_findings.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | - | 0 | 0 |")
    return "\n".join(lines)


def timeline_month_table(rows: list[dict[str, str]], terms: list[str], limit: int = 120) -> str:
    by_month: Counter = Counter()
    samples: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        if not contains_any(row_text(row, ["root_id", "relative_path"]), terms):
            continue
        date_value = row.get("date", "")
        if len(date_value) < 7:
            continue
        month = date_value[:7]
        source = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        by_month[month] += 1
        if len(samples[month]) < 3:
            samples[month].append(md_cell(source, 120))
    lines = ["| Month | Evidence rows | Sample sources |", "|---|---:|---|"]
    for month, count in sorted(by_month.items(), reverse=True)[:limit]:
        lines.append(f"| `{month}` | {count} | " + "<br>".join(f"`{sample}`" for sample in samples[month]) + " |")
    if len(by_month) > limit:
        lines.append(f"| ... | ... | {len(by_month) - limit} more months in local_timeline_index.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | No matching timeline evidence |")
    return "\n".join(lines)


def cluster_counts(rows: list[dict[str, str]], clusters: list[tuple[str, list[str]]]) -> Counter:
    counts: Counter = Counter()
    for row in rows:
        text = row_text(row)
        matched = False
        for label, terms in clusters:
            if contains_any(text, terms):
                counts[label] += 1
                matched = True
        if not matched:
            counts["未归类"] += 1
    return counts


def cluster_table(title: str, counts: Counter, descriptions: dict[str, str], limit: int = 12) -> str:
    lines = [f"## {title}", "", "| 主题 | 证据数 | 含义 |", "|---|---:|---|"]
    for label, count in counts.most_common(limit):
        lines.append(f"| {label} | {count} | {descriptions.get(label, '需要后续人工归并和命名。')} |")
    if not counts:
        lines.append("| - | 0 | 暂无匹配证据。 |")
    return "\n".join(lines)


def clean_source_name(row: dict[str, str]) -> str:
    value = row.get("title") or row.get("name") or Path(row.get("relative_path", "")).stem or "source"
    value = value.replace("|", "-").strip()
    if len(value) > 80:
        value = value[:77] + "..."
    return value


def source_bullets(rows: list[dict[str, str]], limit: int = 24) -> str:
    lines = []
    seen: set[str] = set()
    for row in rows:
        name = clean_source_name(row)
        if name in seen:
            continue
        seen.add(name)
        risk = row.get("risk_flags") or "-"
        category = row.get("category") or "source"
        lines.append(f"- {name} — `{category}`, risk `{risk}`")
        if len(lines) >= limit:
            break
    return "\n".join(lines) if lines else "- 暂无候选。"


def source_status_table(rows: list[dict[str, str]], limit: int = 24) -> str:
    lines = ["| 候选 | 分类 | 风险 | 建议状态 |", "|---|---|---|---|"]
    seen: set[str] = set()
    for row in rows:
        name = clean_source_name(row)
        if name in seen:
            continue
        seen.add(name)
        risk = row.get("risk_flags") or "-"
        status = "先留私有"
        if risk == "-":
            status = "可人工改写为公开候选"
        elif "credential" in risk or "private" in risk:
            status = "仅作私有证据"
        elif "local-path" in risk:
            status = "脱敏后再评估"
        lines.append(f"| {name} | `{row.get('category', '')}` | `{risk}` | {status} |")
        if len(lines) - 2 >= limit:
            break
    if len(lines) == 2:
        lines.append("| - | - | - | 暂无候选 |")
    return "\n".join(lines)


def write_readable_knowledge_pages(
    out: Path,
    recovered_rows: list[dict[str, str]],
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
    recovered_growth: list[dict[str, str]],
    recovered_projects: list[dict[str, str]],
    recovered_skills: list[dict[str, str]],
    recovered_agents: list[dict[str, str]],
    local_growth: list[dict[str, str]],
    local_projects: list[dict[str, str]],
    local_skills: list[dict[str, str]],
    local_agents: list[dict[str, str]],
) -> int:
    project_clusters = [
        ("AI Agent 与多智能体系统", ["agent", "mcp", "codex", "claude", "openclaw", "mcc", "gitnexus", "mempalace", "小安"]),
        ("个人资料库与知识库展示", ["资料库", "知识库", "archive", "wiki", "obsidian", "site-data", "展示", "前端"]),
        ("前端与全栈应用", ["frontend", "react", "vite", "next", "backend", "api", "server", "web", "网页"]),
        ("微信与校园项目", ["微信", "小程序", "校园", "学校", "竞赛", "问答助手"]),
        ("模型与本地 AI", ["ollama", "qwen", "finetune", "微调", "模型", "llm", "airi"]),
        ("自动化与工作流", ["n8n", "dify", "workflow", "自动化", "采集", "pipeline"]),
    ]
    skill_clusters = [
        ("知识管理与资料编译", ["obsidian", "wiki", "知识库", "资料库", "lint", "privacy", "ingest"]),
        ("Agent 工程", ["agent", "mcp", "prompt", "skill", "hook", "codex", "claude"]),
        ("前端产品实现", ["frontend", "react", "vite", "ui", "site", "web", "组件"]),
        ("后端与接口", ["backend", "api", "server", "database", "postgres", "supabase"]),
        ("自动化与数据处理", ["python", "powershell", "csv", "json", "script", "workflow", "自动化"]),
        ("测试与验收", ["test", "unittest", "playwright", "验收", "lint", "scan"]),
    ]
    agent_clusters = [
        ("Codex 工作流", ["codex"]),
        ("Claude/Claude Code", ["claude"]),
        ("Cursor", ["cursor"]),
        ("Gemini/Qwen", ["gemini", "qwen"]),
        ("OpenClaw/ClawX", ["openclaw", "clawx"]),
        ("MCP 与技能系统", ["mcp", "skill", "plugin", "hook"]),
        ("记忆与上下文", ["memory", "mempalace", "context", "记忆"]),
    ]
    descriptions = {
        "AI Agent 与多智能体系统": "Agent 编排、上下文、工具调用、规则与技能配置，是当前资料库的主轴。",
        "个人资料库与知识库展示": "面向未来网站展示的资料编译层，必须从私有证据改写成公开叙事。",
        "前端与全栈应用": "可沉淀为作品集条目的 Web、API、前后端项目。",
        "微信与校园项目": "包含校园、竞赛、小程序等更贴近真实场景的项目线。",
        "模型与本地 AI": "本地模型、微调、Ollama/Qwen/AIRI 等 AI 实验线。",
        "自动化与工作流": "资料采集、发布、脚本、n8n/Dify 等流程资产。",
        "知识管理与资料编译": "把散乱本地材料转为可维护 wiki 的核心能力。",
        "Agent 工程": "提示词、技能、工具、MCP、规则、上下文管理。",
        "前端产品实现": "个人资料馆、展示站、组件和交互实现。",
        "后端与接口": "为前端提供安全 JSON 数据边界和服务端能力。",
        "自动化与数据处理": "扫描、清洗、索引、报表和批处理脚本。",
        "测试与验收": "结构检查、隐私扫描、单测、发布门禁。",
        "Codex 工作流": "Codex 的本地会话、规则、技能与工程化使用。",
        "Claude/Claude Code": "Claude/Claude Code 相关项目状态、会话、配置与规则。",
        "Cursor": "Cursor 本地状态、规则和开发上下文。",
        "Gemini/Qwen": "其他模型客户端与本地模型使用痕迹。",
        "OpenClaw/ClawX": "自建 Agent/控制台相关项目和历史规则。",
        "MCP 与技能系统": "插件、技能、MCP 服务与工具协议。",
        "记忆与上下文": "长期记忆、上下文提取、跨会话连续性。",
    }

    all_project_rows = recovered_projects + local_projects
    all_skill_rows = recovered_skills + local_skills
    all_agent_rows = recovered_agents + local_agents
    credential_rows = [row for row in local_finding_rows if row.get("group") == "credential"]
    personal_rows = [row for row in local_finding_rows if row.get("group") == "personal"]
    high_credential_rows = [row for row in credential_rows if row.get("severity") == "high"]

    start_body = (
        "这是本地 Karpathy-style 知识库的阅读入口。原始材料保持不动，`private-wiki/` 是私有编译层，`wiki/` 和 `site-data/` 才是公开候选层。\n\n"
        "## 先读这 7 页\n\n"
        "- [[private-wiki/profile/personal-brief]] - 个人成长与定位摘要\n"
        "- [[private-wiki/projects/showcase-draft]] - 项目展示草稿池\n"
        "- [[private-wiki/skills/capability-brief]] - 能力画像与证据\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - Agent 生态与配置地图\n"
        "- [[private-wiki/security/review-priority]] - 密钥与隐私复核优先级\n"
        "- [[private-wiki/profile/source-coverage]] - 本地资料覆盖面\n"
        "- [[private-wiki/synthesis/local-karpathy-wiki-operating-model]] - 本地知识库运行模型\n\n"
        "## 日常流程\n\n"
        "1. 新资料先进入原始层或本地来源索引。\n"
        "2. 私有编译层只做提炼、链接、计数和证据定位，不复制密钥明文。\n"
        "3. 公开展示必须从私有页人工改写，脱敏后再进入 `wiki/`。\n"
        "4. 前端只读 `site-data/*.json`，不读 Obsidian 原文和私有目录。\n\n"
        "## 判断标准\n\n"
        "- 能回答“我做过什么、会什么、有哪些 Agent 配置、哪些内容不能公开”。\n"
        "- 每个结论能回到来源索引或原始材料。\n"
        "- 不确定内容留在私有层，不直接发布。\n"
    )
    write_page(out / "guide" / "start-here.md", "本地 Karpathy 知识库入口", ["本地知识库入口", "Start Here"], ["personal-archive", "karpathy-wiki", "guide"], "private-guide", "moc", "本地 Karpathy-style 私有知识库的阅读入口和维护流程。", start_body, "internal")

    personal_body = (
        "这页是从本地证据编译出来的个人成长与定位摘要，不是公开简历。它的作用是帮助后续写公开自序、项目页和能力页。\n\n"
        "## 当前定位\n\n"
        "- 主线是把 AI Agent、知识库、自动化、前后端产品和个人资料展示系统汇合成一个可持续维护的本地知识库。^[inferred]\n"
        "- 资料形态从会话、项目、规则、脚本、前端规格、Agent 配置逐步转成可审计的 Obsidian 页面。^[inferred]\n"
        "- 公开展示不应直接复用私有证据，而应抽取项目成果、能力证明和公开安全叙事。^[inferred]\n\n"
        "## 证据覆盖\n\n"
        f"- 成长/个人候选来源：`{len(recovered_growth) + len(local_growth)}`\n"
        f"- 项目候选来源：`{len(all_project_rows)}`\n"
        f"- 能力候选来源：`{len(all_skill_rows)}`\n"
        f"- Agent 候选来源：`{len(all_agent_rows)}`\n"
        f"- 个人/隐私线索：`{len(personal_rows)}`\n\n"
        "## 成长材料候选\n\n"
        + source_bullets(recovered_growth + local_growth, 24)
        + "\n\n## 下一步\n\n"
        "- 把真实成长节点拆成按年月的事件页。\n"
        "- 把文件修改时间和真实人生/项目事件分开。\n"
        "- 写一版公开自序草稿，只保留愿意公开的身份、方向和作品。\n"
    )
    write_page(out / "profile" / "personal-brief.md", "个人成长与定位摘要", ["个人画像草稿", "成长摘要"], ["personal-archive", "growth", "summary"], "private-profile", "brief", "从本地证据编译出的个人成长、方向和展示素材摘要。", personal_body, "sensitive")

    project_body = (
        "这页把项目证据整理成展示草稿池。它不是最终作品集，目标是筛出值得公开改写的项目线。\n\n"
        + cluster_table("项目主题分布", cluster_counts(all_project_rows, project_clusters), descriptions)
        + "\n\n## 展示候选清单\n\n"
        + source_status_table(all_project_rows, 36)
        + "\n\n## 公开改写规则\n\n"
        "- 一个公开项目页只讲目标、角色、技术栈、成果、截图/演示和可公开链接。\n"
        "- 删除本地路径、账号、密钥、部署细节、未公开学校/个人信息。\n"
        "- 每个项目页至少链接一个来源说明页和一个能力页。\n"
    )
    write_page(out / "projects" / "showcase-draft.md", "项目展示草稿池", ["作品集草稿", "项目展示候选"], ["personal-archive", "projects", "showcase"], "private-projects", "draft", "用于从私有项目证据筛选公开作品集条目的草稿池。", project_body, "internal")

    skill_body = (
        "这页把技能和能力从散乱来源中聚类，方便后续写公开能力页或简历式技能说明。\n\n"
        + cluster_table("能力主题分布", cluster_counts(all_skill_rows, skill_clusters), descriptions)
        + "\n\n## 能力证据候选\n\n"
        + source_status_table(all_skill_rows, 36)
        + "\n\n## 对外表达方式\n\n"
        "- 不写“会很多工具”，要写“能完成什么交付”。\n"
        "- 每个能力最好绑定一个项目证据和一个可复用流程。\n"
        "- 私有 Agent 规则和提示词只能作为证据，不能原文公开。\n"
    )
    write_page(out / "skills" / "capability-brief.md", "能力画像与证据", ["能力画像", "技能摘要"], ["personal-archive", "skills", "summary"], "private-skills", "brief", "把本地技能、工具和流程证据聚类成可展示能力画像。", skill_body, "internal")

    agent_body = (
        "这页整理配置过的 Agent、规则、技能、提示词、上下文和历史控制面。旧规则默认是历史材料，不自动变成当前规范。\n\n"
        + cluster_table("Agent 生态分布", cluster_counts(all_agent_rows, agent_clusters), descriptions)
        + "\n\n## Agent 资料候选\n\n"
        + source_status_table(all_agent_rows, 36)
        + "\n\n## 维护规则\n\n"
        "- 当前规范只看活动规则面；旧控制器、旧编排和旧强制流程只作历史参考。\n"
        "- Agent 配置页默认私有，公开时只讲架构思想和可复用模式。\n"
        "- 涉及 prompt、memory、hook、token、local path 的内容不直接发布。\n"
    )
    write_page(out / "agents" / "agent-ecosystem-brief.md", "Agent 生态与配置地图", ["Agent生态", "配置过的智能体"], ["personal-archive", "agents", "summary"], "private-agents", "brief", "配置过的 Agent、规则、技能、提示词、记忆和上下文系统摘要。", agent_body, "sensitive")

    security_body = (
        "这页把密钥和隐私审计变成行动队列。它不显示任何密钥值，只显示类别和优先级。\n\n"
        "## 优先级\n\n"
        f"- P0：高置信凭据线索 `{len(high_credential_rows)}`，优先人工打开原始来源确认并轮换。\n"
        f"- P1：全部凭据/会话/密钥上下文 `{len(credential_rows)}`，用于清理旧配置和误报归类。\n"
        f"- P2：个人/隐私上下文 `{len(personal_rows)}`，用于公开前脱敏。\n\n"
        "## 凭据规则分布\n\n"
        + finding_summary_table(credential_rows, 60)
        + "\n\n## 处理规则\n\n"
        "- 不在 Obsidian 编译页写明文密钥。\n"
        "- 不把本地路径、账号、cookie、session、token 作为公开展示内容。\n"
        "- 轮换动作需要单独确认；本页只负责定位和排序。\n"
    )
    write_page(out / "security" / "review-priority.md", "密钥与隐私复核优先级", ["密钥复核队列", "隐私复核优先级"], ["personal-archive", "security", "review"], "private-security", "queue", "把密钥、凭据和个人隐私线索整理成不含明文的复核优先级。", security_body, "sensitive")

    model_body = (
        "这页定义本地知识库的运行模型，避免未来继续把原文、扫描表和展示页混在一起。\n\n"
        "## 三层结构\n\n"
        "- 原始层：本地文件、恢复档案、会话、截图、项目目录。只读保存，不直接发布。\n"
        "- 私有编译层：`private-wiki/`，负责成长、项目、能力、Agent、密钥、时间线和来源覆盖。\n"
        "- 公开编译层：`wiki/` 与 `site-data/`，只接收人工改写、脱敏、可展示的内容。\n\n"
        "## 为什么这样做\n\n"
        "- Karpathy-style wiki 的价值在于把知识编译成可复用页面，而不是每次重新翻原始材料。^[inferred]\n"
        "- 个人资料库需要比普通 wiki 更严格的边界，因为项目、Agent 配置和成长记录天然混有隐私。^[inferred]\n"
        "- 前端展示层应该只消费精选 JSON，不应该接触原始 Obsidian 私有目录。^[inferred]\n\n"
        "## 晋升流程\n\n"
        "1. 从 [[private-wiki/projects/showcase-draft]] 或 [[private-wiki/skills/capability-brief]] 选候选。\n"
        "2. 写公开安全草稿，删除本地路径、密钥、账号和未确认身份信息。\n"
        "3. 跑结构检查、隐私扫描和站点数据构建。\n"
        "4. 只把通过检查的内容放进 `site-data/` 给前端。\n"
    )
    write_page(out / "synthesis" / "local-karpathy-wiki-operating-model.md", "本地 Karpathy 知识库运行模型", ["本地知识库运行模型", "Karpathy Wiki 本地模型"], ["personal-archive", "karpathy-wiki", "synthesis"], "private-synthesis", "model", "定义 raw、private-wiki、wiki/site-data 三层之间的职责和晋升流程。", model_body, "internal")

    return 7


def write_personal_archive_pages(
    root: Path,
    out: Path,
    recovered_rows: list[dict[str, str]],
    sensitive_rows: list[dict[str, str]],
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
    local_timeline_rows: list[dict[str, str]],
) -> dict[str, int]:
    growth_terms = [
        "成长",
        "目标",
        "待办",
        "复盘",
        "周期",
        "每日",
        "手记",
        "简历",
        "个人",
        "档案",
        "学习",
        "学校",
        "大学",
        "竞赛",
        "规划",
        "路线",
        "经历",
        "diary",
        "journal",
        "profile",
        "resume",
        "goal",
        "plan",
        "todo",
        "review",
        "timeline",
    ]
    project_terms = [
        "项目",
        "project",
        "repo",
        "github",
        "workspace",
        "app",
        "平台",
        "系统",
        "小程序",
        "frontend",
        "backend",
        "openhanako",
        "hanako",
        "airi",
        "mcc",
        "gitnexus",
        "zongmen",
        "coze",
        "dify",
        "n8n",
        "one-hub",
        "安心跃动",
        "竞赛",
        "校园",
    ]
    skill_terms = [
        "技能",
        "skill",
        "skills",
        "能力",
        "工具",
        "workflow",
        "playwright",
        "browser",
        "mcp",
        "agent",
        "prompt",
        "提示词",
        "最佳实践",
        "frontend",
        "react",
        "python",
        "powershell",
        "docker",
        "obsidian",
        "测试",
        "部署",
    ]
    agent_terms = ["agent", "agents", "codex", "claude", "cursor", "gemini", "qwen", "openclaw", "mcp", "skill", "prompt", "hook", "rules", "serena", "mempalace", "config", "settings", "小安"]
    security_terms = ["credential", "secret", "token", "key", "password", "session", "cookie", "密钥", "凭据", "安全"]

    recovered_growth = select_recovered_rows(
        recovered_rows,
        growth_terms,
        {"private-memory-and-sessions", "projects-and-action-items", "agent-governance-and-skills", "public-knowledge-candidates"},
        180,
    )
    recovered_projects = select_recovered_rows(recovered_rows, project_terms, {"projects-and-action-items", "agent-governance-and-skills", "public-knowledge-candidates"}, 220)
    recovered_skills = select_recovered_rows(recovered_rows, skill_terms, {"agent-governance-and-skills", "public-knowledge-candidates"}, 220)
    recovered_agents = select_recovered_rows(recovered_rows, agent_terms, {"agent-governance-and-skills"}, 220)

    local_growth = select_local_rows(local_rows, growth_terms, {"personal-and-chat-context", "project-roots", "agent-context"}, 180)
    local_projects = select_local_rows(local_rows, project_terms, {"project-roots", "local-assets", "agent-context"}, 220)
    local_skills = select_local_rows(local_rows, skill_terms, {"agent-context", "project-roots", "local-assets"}, 220)
    local_agents = select_local_rows(local_rows, agent_terms, {"agent-context", "security-and-credentials"}, 220)
    local_security = select_local_rows(local_rows, security_terms, {"security-and-credentials", "agent-context"}, 180)
    local_personal_findings = [row for row in local_finding_rows if row.get("group") == "personal"]
    local_credential_findings = [row for row in local_finding_rows if row.get("group") == "credential"]

    profile_body = (
        "This is the private personal archive layer for identity, growth evidence, project history, skills, configured agents, and sensitive material triage.\n\n"
        "## Core Maps\n\n"
        "- [[private-wiki/guide/start-here]] - 本地 Karpathy 知识库阅读入口\n"
        "- [[private-wiki/profile/personal-brief]] - 个人成长与定位摘要\n"
        "- [[private-wiki/profile/growth-timeline]] - growth, learning, goals, reviews, personal records, and timeline evidence\n"
        "- [[private-wiki/projects/portfolio-map]] - projects, prototypes, repos, product ideas, and action-item history\n"
        "- [[private-wiki/projects/showcase-draft]] - 项目展示草稿池\n"
        "- [[private-wiki/skills/index]] - skills, reusable workflows, tools, and proof sources\n"
        "- [[private-wiki/skills/capability-brief]] - 能力画像与证据\n"
        "- [[private-wiki/agents/configuration-map]] - configured agents, rules, prompts, memories, and local assistant state\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - Agent 生态与配置地图\n"
        "- [[private-wiki/security/secret-material-map]] - credential and privacy evidence without secret values\n"
        "- [[private-wiki/security/review-priority]] - 密钥与隐私复核优先级\n"
        "- [[private-wiki/profile/source-coverage]] - what local roots and source reports currently cover\n\n"
        "## Coverage Snapshot\n\n"
        f"- Recovered archive rows: `{len(recovered_rows)}`\n"
        f"- Local source inventory rows: `{len(local_rows)}`\n"
        f"- Local timeline rows: `{len(local_timeline_rows)}`\n"
        f"- Local personal/privacy findings: `{len(local_personal_findings)}`\n"
        f"- Local credential/security findings: `{len(local_credential_findings)}`\n\n"
        "## Rule\n\n"
        "This layer is the searchable private biography and work archive. It may point to raw sources, but it must not be copied into the public `wiki/` until each item is rewritten and reviewed.\n"
    )
    write_page(out / "profile" / "index.md", "Private Personal Archive", ["个人资料馆", "成长项目能力总览"], ["personal-archive", "profile"], "private-profile", "moc", "Private index for growth, projects, skills, configured agents, and sensitive local context.", profile_body, "sensitive")

    growth_body = (
        "This page turns scattered local notes into a private growth map. It keeps evidence links and counts instead of trying to publish a finished biography.\n\n"
        "## Evidence Sources\n\n"
        f"- Recovered growth/profile candidates: `{len(recovered_growth)}`\n"
        f"- Local growth/profile candidates: `{len(local_growth)}`\n"
        f"- Full recovered inventory: {private_report_link('recovered_file_inventory.csv', 'recovered_file_inventory.csv', 2)}\n"
        f"- Full local inventory: {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n"
        f"- Full local timeline: {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n\n"
        "## Recovered Personal/Growth Sources\n\n"
        + recovered_source_table(recovered_growth, 140, 2)
        + "\n\n## Local Personal/Growth Sources\n\n"
        + local_inventory_table(local_growth, 140)
        + "\n\n## Timeline Evidence By Month\n\n"
        + timeline_month_table(local_timeline_rows, growth_terms, 140)
        + "\n\n## Next Compilation Pass\n\n"
        "- Promote recurring milestones into dated private biography entries.\n"
        "- Separate true life events from file modification dates and quoted dates.\n"
        "- Keep private names, contact details, and raw chats out of public pages.\n"
    )
    write_page(out / "profile" / "growth-timeline.md", "Growth Timeline And Profile Evidence", ["成长时间线", "个人成长证据"], ["personal-archive", "growth", "timeline"], "private-profile", "timeline-index", "Growth, learning, goals, reviews, and personal profile evidence gathered from local sources.", growth_body, "sensitive")

    coverage_body = (
        "This page records what the local archive currently covers. It is the control panel for adding more roots later.\n\n"
        "## Indexed Roots\n\n"
        + root_summary_table(local_root_rows, None, 120)
        + "\n\n## Complete Reports\n\n"
        f"- {local_report_link('local_roots.csv', 'local_roots.csv', 2)}\n"
        f"- {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n"
        f"- {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n"
        f"- {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n"
        f"- {private_report_link('recovered_file_inventory.csv', 'recovered_file_inventory.csv', 2)}\n\n"
        "## Source Gap Rule\n\n"
        "If a folder contains personal growth, projects, skills, or agent configuration but is not listed here, add it to `local-discovery/roots.csv` and rerun the local inventory before compiling pages.\n"
    )
    write_page(out / "profile" / "source-coverage.md", "Private Source Coverage", ["资料覆盖面"], ["personal-archive", "source-coverage"], "private-profile", "index", "Local roots and reports covered by the private personal archive pipeline.", coverage_body, "internal")

    project_body = (
        "This page is the private portfolio map: project roots, project notes, prototypes, product ideas, and action history.\n\n"
        "## Project Roots\n\n"
        + root_summary_table(local_root_rows, project_terms, 80)
        + "\n\n## Recovered Project Sources\n\n"
        + recovered_source_table(recovered_projects, 180, 2)
        + "\n\n## Local Project Sources\n\n"
        + local_inventory_table(local_projects, 180)
        + "\n\n## Timeline Evidence By Month\n\n"
        + timeline_month_table(local_timeline_rows, project_terms, 120)
        + "\n\n## Compilation Rule\n\n"
        "Create one project page per durable project only after review. Keep throwaway logs and raw handoff notes as linked evidence rather than copying them into the portfolio narrative.\n"
    )
    write_page(out / "projects" / "portfolio-map.md", "Private Project Portfolio Map", ["项目作品地图", "项目资料馆"], ["personal-archive", "projects"], "private-projects", "portfolio", "Private map of projects, prototypes, repositories, product ideas, and action history.", project_body, "internal")

    skills_body = (
        "This page gathers evidence for skills and reusable workflows from notes, configs, project files, and skill libraries.\n\n"
        "## Recovered Skill Sources\n\n"
        + recovered_source_table(recovered_skills, 180, 2)
        + "\n\n## Local Skill Sources\n\n"
        + local_inventory_table(local_skills, 180)
        + "\n\n## Skill Evidence By Month\n\n"
        + timeline_month_table(local_timeline_rows, skill_terms, 120)
        + "\n\n## Use\n\n"
        "- Use this as the private evidence base for a public skills page.\n"
        "- Public claims should cite sanitized project pages or rewritten source notes, not raw local logs.\n"
    )
    write_page(out / "skills" / "index.md", "Private Skills And Capabilities Index", ["能力清单", "技能资料馆"], ["personal-archive", "skills"], "private-skills", "index", "Private inventory of skills, tools, workflows, and evidence sources.", skills_body, "internal")

    agent_body = (
        "This page gathers configured agents, assistant rules, prompts, memories, skills, hooks, and local agent state. Old rule files are historical unless promoted into active rule surfaces.\n\n"
        "## Agent Roots\n\n"
        + root_summary_table(local_root_rows, agent_terms, 80)
        + "\n\n## Recovered Agent Sources\n\n"
        + recovered_source_table(recovered_agents, 180, 2)
        + "\n\n## Local Agent Sources\n\n"
        + local_inventory_table(local_agents, 180)
        + "\n\n## Agent Timeline Evidence\n\n"
        + timeline_month_table(local_timeline_rows, agent_terms, 120)
        + "\n\n## Handling\n\n"
        "- Keep configured agent state private by default.\n"
        "- Review old controller and orchestration files before treating them as current behavior.\n"
        "- Never publish prompts, memory, hooks, or configs that expose local paths or credentials.\n"
    )
    write_page(out / "agents" / "configuration-map.md", "Configured Agents And Rules Map", ["Agent配置地图", "智能体配置"], ["personal-archive", "agents"], "private-agents", "index", "Private map of configured agents, rules, prompts, memories, hooks, and local assistant state.", agent_body, "sensitive")

    secret_body = (
        "This page is the private sensitive-material map. It intentionally does not reproduce credential values or personal identifiers.\n\n"
        "## Local Credential Findings By Rule\n\n"
        + finding_summary_table(local_credential_findings, 100)
        + "\n\n## Local Security-Related Sources\n\n"
        + local_inventory_table(local_security, 140)
        + "\n\n## Recovered Vault Credential Findings\n\n"
        + table_for_findings(aggregate_by_file(group_sensitive(sensitive_rows, SECRET_RULES)), 120, 2)
        + "\n\n## Review Policy\n\n"
        "- Treat high-confidence tokens, private keys, JWTs, cloud keys, and secret assignments as rotation candidates.\n"
        "- Store only rule names, line numbers, source locations, and excerpt hashes in compiled pages.\n"
        "- If a value must be inspected, open the raw local source directly and do not paste it into public notes or chat.\n"
    )
    write_page(out / "security" / "secret-material-map.md", "Secret Material And Credential Map", ["密钥资料地图", "敏感材料地图"], ["personal-archive", "security", "credentials"], "private-security", "review", "Private credential and sensitive-material map without secret values.", secret_body, "sensitive")

    readable_pages = write_readable_knowledge_pages(
        out,
        recovered_rows,
        local_rows,
        local_root_rows,
        local_finding_rows,
        recovered_growth,
        recovered_projects,
        recovered_skills,
        recovered_agents,
        local_growth,
        local_projects,
        local_skills,
        local_agents,
    )

    return {
        "personal_archive_pages": 7 + readable_pages,
        "personal_archive_recovered_growth": len(recovered_growth),
        "personal_archive_recovered_projects": len(recovered_projects),
        "personal_archive_recovered_skills": len(recovered_skills),
        "personal_archive_recovered_agents": len(recovered_agents),
        "personal_archive_local_growth": len(local_growth),
        "personal_archive_local_projects": len(local_projects),
        "personal_archive_local_skills": len(local_skills),
        "personal_archive_local_agents": len(local_agents),
    }


def append_sample(bucket: list[dict[str, str]], row: dict[str, str], limit: int) -> None:
    if len(bucket) < limit:
        bucket.append(row)


def iter_csv(path: Path):
    if not path.exists():
        return
    with path.open("r", encoding="utf-8", newline="") as f:
        yield from csv.DictReader(f)


def write_local_source_pages(root: Path, out: Path) -> dict[str, int]:
    local_dir = root / LOCAL_DISCOVERY_DIR
    summary = read_json(local_dir / "local_discovery_summary.json")
    if not summary:
        return {}

    root_rows = read_csv(local_dir / "local_roots.csv")
    finding_samples: dict[str, list[dict[str, str]]] = defaultdict(list)
    inventory_by_category: dict[str, list[dict[str, str]]] = defaultdict(list)
    codex_inventory: list[dict[str, str]] = []
    wechat_inventory: list[dict[str, str]] = []
    legacy_rule_candidates: list[dict[str, str]] = []
    timeline_by_month: Counter = Counter()

    for row in iter_csv(local_dir / "local_sensitive_findings.csv") or []:
        append_sample(finding_samples[row.get("group", "")], row, 320)

    for row in iter_csv(local_dir / "local_source_inventory.csv") or []:
        category = row.get("category", "")
        append_sample(inventory_by_category[category], row, 520)
        source_text = (row.get("root_id", "") + row.get("absolute_path", "") + row.get("relative_path", "")).lower()
        if "codex" in source_text:
            append_sample(codex_inventory, row, 520)
        if any(term in source_text for term in ["wechat", "weixin", "tencent", "wxwork"]) or any(term in row.get("absolute_path", "") for term in ["微信", "企业微信"]):
            append_sample(wechat_inventory, row, 520)
        if (
            row.get("kind") == "text"
            and any(term in (row.get("relative_path", "") + row.get("name", "")).lower() for term in ["agent", "rule", "rules", "claude", "codex", "startup", "governance", "controller", "skill", "prompt"])
        ):
            append_sample(legacy_rule_candidates, row, 520)

    for row in iter_csv(local_dir / "local_timeline_index.csv") or []:
        date_value = row.get("date", "")
        if date_value:
            timeline_by_month[date_value[:7]] += 1

    finding_group_counts = summary.get("finding_group_counts", {})

    local_index_body = (
        "This section indexes local sources outside the recovered Obsidian archive. It is private-only and designed for search, security review, and later public-safe rewriting.\n\n"
        "## Workbench\n\n"
        "- [[security-and-credentials]] - local credential and secret-candidate findings\n"
        "- [[personal-info-review]] - personal information and private-chat markers\n"
        "- [[local-path-map]] - local path and environment references\n"
        "- [[timeline]] - file/content dates and modification timeline\n"
        "- [[codex-context]] - Codex sessions, logs, memories, and config metadata\n"
        "- [[agent-context]] - agent rules, skills, prompts, and local assistant state\n"
        "- [[legacy-rule-review]] - old rule-like files quarantined as historical references\n"
        "- [[project-roots]] - local repositories, projects, and runtime roots\n"
        "- [[wechat-sources]] - WeChat and Tencent source metadata\n\n"
        "## Counts\n\n"
        f"- Roots scanned: `{summary.get('roots', 0)}`\n"
        f"- Files indexed: `{summary.get('files', 0)}`\n"
        f"- Sensitive/privacy findings: `{summary.get('findings', 0)}`\n"
        f"- High-risk findings: `{summary.get('high_findings', 0)}`\n"
        f"- Timeline rows: `{summary.get('timeline_rows', 0)}`\n"
        f"- Category counts: `{summary.get('category_counts', {})}`\n"
        f"- Finding groups: `{summary.get('finding_group_counts', {})}`\n\n"
        "## Reports\n\n"
        f"- {local_report_link('local_roots.csv', 'local_roots.csv', 2)}\n"
        f"- {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n"
        f"- {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n"
        f"- {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n"
        f"- {local_report_link('local_discovery_summary.json', 'local_discovery_summary.json', 2)}\n\n"
        "## Roots\n\n"
        + local_root_table(root_rows, 80)
        + "\n\n## Safety Boundary\n\n"
        "- These pages do not contain secret values.\n"
        "- High-risk rows are review and rotation candidates, not public wiki material.\n"
        "- Use root IDs and report rows for lookup; promote only rewritten summaries to `wiki/`.\n"
    )
    write_page(out / "local-sources" / "index.md", "Local Sources Index", ["本地信息总索引"], ["local-discovery", "private-wiki"], "private-wiki", "moc", "Private local-source index for additional local context outside the recovered vault.", local_index_body, "sensitive")

    credential_rows = finding_samples.get("credential", [])
    credential_body = (
        "This page is the local credential workbench. It stores only rule names, file locations, line numbers, and excerpt hashes.\n\n"
        f"- Credential findings: `{finding_group_counts.get('credential', len(credential_rows))}`\n"
        f"- Full report: {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n\n"
        "## Findings\n\n"
        + local_finding_table(credential_rows, 260)
        + "\n\n## Handling\n\n"
        "- Rotate or revoke confirmed live secrets outside Obsidian.\n"
        "- Do not paste secret values into notes, chats, commits, or issue trackers.\n"
        "- After rotation, mark disposition in a local private follow-up note rather than editing the raw source.\n"
    )
    write_page(out / "local-sources" / "security-and-credentials.md", "Local Security And Credentials", ["本地密钥索引"], ["local-discovery", "security", "credentials"], "private-security", "review", "Local credential and secret-candidate findings without secret values.", credential_body, "sensitive")

    personal_rows = finding_samples.get("personal", [])
    personal_body = (
        "This page tracks local personal information and private-chat markers. It does not reproduce the matched values.\n\n"
        f"- Personal/private findings: `{finding_group_counts.get('personal', len(personal_rows))}`\n"
        f"- Full report: {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n\n"
        "## Findings\n\n"
        + local_finding_table(personal_rows, 260)
    )
    write_page(out / "local-sources" / "personal-info-review.md", "Local Personal Information Review", ["本地个人信息复核"], ["local-discovery", "personal-info"], "private-security", "review", "Local personal information and private context review without raw values.", personal_body, "sensitive")

    local_path_rows = finding_samples.get("local-path", [])
    path_body = (
        "This page tracks local path references discovered in local source text. Paths are private-only and should not be promoted to public pages.\n\n"
        f"- Local path findings: `{finding_group_counts.get('local-path', len(local_path_rows))}`\n"
        f"- Full report: {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n\n"
        "## Findings\n\n"
        + local_finding_table(local_path_rows, 220)
    )
    write_page(out / "local-sources" / "local-path-map.md", "Local Source Path Map", ["本地来源路径地图"], ["local-discovery", "local-paths"], "private-security", "review", "Local path references from additional local source discovery.", path_body, "sensitive")

    timeline_lines = ["| Month | Rows |", "|---|---:|"]
    for month, count in sorted(timeline_by_month.items()):
        timeline_lines.append(f"| `{month}` | {count} |")
    timeline_body = (
        "This page summarizes local timeline rows. Rows can come from file modification times or detected dates inside text samples.\n\n"
        f"- Timeline rows: `{summary.get('timeline_rows', 0)}`\n"
        f"- Full report: {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n\n"
        "## Months\n\n"
        + "\n".join(timeline_lines)
    )
    write_page(out / "local-sources" / "timeline.md", "Local Source Timeline", ["本地来源时间线"], ["local-discovery", "timeline"], "private-timeline", "timeline-index", "Local-source date and modification timeline summary.", timeline_body, "internal")

    codex_roots = [r for r in root_rows if "codex" in (r.get("root_id", "") + r.get("path", "")).lower()]
    codex_body = (
        "This page indexes Codex local state, sessions, history, memories, config, and logs at metadata level. SQLite databases remain metadata-only unless explicitly extracted later.\n\n"
        "## Roots\n\n"
        + local_root_table(codex_roots, 80)
        + "\n\n## Priority Inventory\n\n"
        + local_inventory_table(sorted(codex_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 180)
    )
    write_page(out / "local-sources" / "codex-context.md", "Local Codex Context", ["本地 Codex 上下文"], ["local-discovery", "codex"], "private-context", "index", "Local Codex session, memory, config, and log metadata index.", codex_body, "sensitive")

    agent_roots = [
        r for r in root_rows
        if any(term in (r.get("root_id", "") + r.get("path", "")).lower() for term in ["agent", "claude", "cursor", "gemini", "qwen", "openclaw", "commander"])
    ]
    agent_inventory = inventory_by_category.get("agent-context", [])
    agent_body = (
        "This page indexes local assistant and agent operating context: rules, skills, prompts, memories, and tool state.\n\n"
        "Recovered or discovered rule files are historical references by default. They are not current operating policy unless they are copied into the active rule surfaces after review.\n\n"
        "## Roots\n\n"
        + local_root_table(agent_roots, 80)
        + "\n\n## Priority Inventory\n\n"
        + local_inventory_table(sorted(agent_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 180)
    )
    write_page(out / "local-sources" / "agent-context.md", "Local Agent Context", ["本地 Agent 上下文"], ["local-discovery", "agents"], "private-context", "index", "Local agent rules, skills, prompts, and state metadata index.", agent_body, "sensitive")

    legacy_body = (
        "This page quarantines discovered rule-like files as historical references. They are useful for continuity search, but they do not automatically govern current work.\n\n"
        "## Current Authority Rule\n\n"
        "- Current user instructions override recovered historical process text.\n"
        "- Current `AGENTS.md` and `CLAUDE.md` define the live wiki schema.\n"
        "- Recovered controller, startup, delegation, or agent-rule documents are `historical-reference` until explicitly promoted.\n"
        "- Privacy and credential safety rules remain active even when an old workflow says otherwise.\n\n"
        "## Candidates\n\n"
        + local_inventory_table(sorted(legacy_rule_candidates, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 240)
    )
    write_page(out / "local-sources" / "legacy-rule-review.md", "Legacy Rule Review", ["旧规则复核"], ["local-discovery", "agents", "deprecated-rules"], "private-context", "review", "Historical rule-like files discovered locally, quarantined from current policy until reviewed.", legacy_body, "sensitive")

    project_inventory = inventory_by_category.get("project-roots", [])
    project_body = (
        "This page indexes local project and repository roots at metadata level. It is a map for later targeted distillation, not a raw code dump.\n\n"
        f"- Project-root files: `{summary.get('category_counts', {}).get('project-roots', len(project_inventory))}`\n"
        f"- Full inventory: {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n\n"
        "## Priority Inventory\n\n"
        + local_inventory_table(sorted(project_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 220)
    )
    write_page(out / "local-sources" / "project-roots.md", "Local Project Roots", ["本地项目根索引"], ["local-discovery", "projects"], "private-context", "index", "Local repository and project root metadata index.", project_body, "internal")

    wechat_roots = [
        r for r in root_rows
        if any(term in (r.get("root_id", "") + r.get("path", "")).lower() for term in ["wechat", "weixin", "tencent", "wxwork"])
        or any(term in r.get("path", "") for term in ["微信", "企业微信"])
    ]
    wechat_body = (
        "This page indexes WeChat/Tencent local sources as metadata only. Message databases and media archives require a separate extraction plan before content distillation.\n\n"
        "## Roots\n\n"
        + local_root_table(wechat_roots, 80)
        + "\n\n## Priority Inventory\n\n"
        + local_inventory_table(sorted(wechat_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 180)
    )
    write_page(out / "local-sources" / "wechat-sources.md", "Local WeChat Sources", ["本地微信来源"], ["local-discovery", "wechat"], "private-context", "index", "Local WeChat and Tencent source metadata index.", wechat_body, "sensitive")

    return {
        "local_roots": len(root_rows),
        "local_files": int(summary.get("files", 0)),
        "local_findings": int(summary.get("findings", 0)),
        "local_high_findings": int(summary.get("high_findings", 0)),
        "local_timeline_rows": int(summary.get("timeline_rows", 0)),
    }


def write_timeline_pages(timeline_rows: list[dict[str, str]]) -> None:
    by_month: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in timeline_rows:
        month = row.get("date", "")[:7]
        if month:
            by_month[month].append(row)
    index_lines = [
        "This is the private timeline workbench. Dates are extracted from filenames and note text; they can be real events, plans, references, or false positives.",
        "",
        "## Months",
        "",
        "| Month | Entries | Page |",
        "|---|---:|---|",
    ]
    for month in sorted(by_month):
        page_name = f"{month}.md"
        index_lines.append(f"| {month} | {len(by_month[month])} | [[{month}]] |")
        by_date: dict[str, list[dict[str, str]]] = defaultdict(list)
        for row in by_month[month]:
            by_date[row["date"]].append(row)
        month_lines = [
            f"- Entries: `{len(by_month[month])}`",
            f"- Full timeline CSV: {private_report_link('timeline_index.csv', 'timeline_index.csv', 2)}",
            "",
            "## Daily Entries",
            "",
        ]
        for day in sorted(by_date):
            entries = by_date[day]
            month_lines.append(f"### {day}")
            month_lines.append("")
            month_lines.append(f"- Entries: `{len(entries)}`")
            month_lines.append("")
            month_lines.append("| Source | Top folder |")
            month_lines.append("|---|---|")
            for row in entries[:50]:
                month_lines.append(f"| {md_link(row_label(row), row.get('vault_copy_path', ''), 2)} | `{row.get('top_folder', '')}` |")
            if len(entries) > 50:
                month_lines.append(f"| {len(entries) - 50} more entries in timeline_index.csv | - |")
            month_lines.append("")
        write_page(OUT_DIR / "timeline" / page_name, f"Timeline {month}", [f"时间线 {month}"], ["local-recovery", "timeline"], "private-timeline", "timeline-month", f"Private recovered timeline entries for {month}.", "\n".join(month_lines))
    index_lines.extend(
        [
            "",
            "## Reports",
            "",
            f"- {private_report_link('timeline_index.csv', 'timeline_index.csv', 2)}",
            f"- {private_report_link('sensitive_timeline_summary.json', 'sensitive_timeline_summary.json', 2)}",
        ]
    )
    write_page(OUT_DIR / "timeline" / "index.md", "Private Timeline Index", ["本地时间线索引"], ["local-recovery", "timeline"], "private-timeline", "moc", "Private recovered timeline index grouped by month.", "\n".join(index_lines))


def build(root: Path) -> int:
    manifest_dir = root / PRIVATE_MANIFEST_DIR
    out = root / OUT_DIR
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    sensitive_rows = read_csv(manifest_dir / "sensitive_local_scan.csv")
    timeline_rows = read_csv(manifest_dir / "timeline_index.csv")
    review_rows = read_csv(manifest_dir / "review_queue.csv")
    recovered_rows = read_csv(manifest_dir / "recovered_file_inventory.csv")
    recovery_summary = read_json(manifest_dir / "recovery_summary.json")
    sensitive_summary = read_json(manifest_dir / "sensitive_timeline_summary.json")
    local_dir = root / LOCAL_DISCOVERY_DIR
    local_discovery_summary = read_json(local_dir / "local_discovery_summary.json")
    local_rows = read_csv(local_dir / "local_source_inventory.csv")
    local_root_rows = read_csv(local_dir / "local_roots.csv")
    local_finding_rows = read_csv(local_dir / "local_sensitive_findings.csv")
    local_timeline_rows = read_csv(local_dir / "local_timeline_index.csv")

    secret_rows = group_sensitive(sensitive_rows, SECRET_RULES)
    high_secret_rows = group_sensitive(sensitive_rows, HIGH_SECRET_RULES)
    personal_rows = group_sensitive(sensitive_rows, PERSONAL_RULES)
    local_path_rows = group_sensitive(sensitive_rows, LOCAL_CONTEXT_RULES)
    status_counts = Counter(status_for_review(row) for row in review_rows)

    index_body = (
        "This is the local-only compiled wiki layer for recovered private context. It follows the raw -> private compiled wiki -> public wiki split.\n\n"
        "## Start Here\n\n"
        "- [[private-wiki/guide/start-here]] - 本地 Karpathy 知识库阅读入口\n"
        "- [[private-wiki/profile/index]] - private personal archive for growth, projects, skills, agents, and sensitive context\n"
        "- [[private-wiki/profile/personal-brief]] - 个人成长与定位摘要\n"
        "- [[private-wiki/security/index]] - credential, personal information, and local path triage\n"
        "- [[private-wiki/security/review-priority]] - 密钥与隐私复核优先级\n"
        "- [[private-wiki/timeline/index]] - recovered timeline by month\n"
        "- [[private-wiki/projects/index]] - project and action-item context\n"
        "- [[private-wiki/projects/portfolio-map]] - private project portfolio and root map\n"
        "- [[private-wiki/projects/showcase-draft]] - 项目展示草稿池\n"
        "- [[private-wiki/agents/index]] - agent memory, rules, prompts, and skills context\n"
        "- [[private-wiki/agents/configuration-map]] - configured agents and rule surfaces\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - Agent 生态与配置地图\n"
        "- [[private-wiki/skills/index]] - private skills and capabilities evidence\n"
        "- [[private-wiki/skills/capability-brief]] - 能力画像与证据\n"
        "- [[private-wiki/personal/index]] - private memory and session context\n"
        "- [[private-wiki/assets/index]] - local asset and environment context\n"
        "- [[private-wiki/local-sources/index]] - additional local source discovery outside the recovered vault\n"
        "- [[private-wiki/synthesis/index]] - recovery synthesis and next passes\n"
        "- [[private-wiki/synthesis/local-karpathy-wiki-operating-model]] - 本地 Karpathy 知识库运行模型\n"
        "- [[private-wiki/publication-candidates]] - candidates for future public-safe rewrite\n\n"
        "## Current Counts\n\n"
        f"- Recovered files: `{recovery_summary.get('total_files', 'unknown')}`\n"
        f"- Recovered Markdown files: `{recovery_summary.get('markdown_files', 'unknown')}`\n"
        f"- Sensitive/context rows: `{sensitive_summary.get('sensitive_rows', 'unknown')}`\n"
        f"- Timeline rows: `{sensitive_summary.get('timeline_rows', 'unknown')}`\n"
        f"- Additional local-source files indexed: `{local_discovery_summary.get('files', 'not scanned')}`\n"
        f"- Additional local-source findings: `{local_discovery_summary.get('findings', 'not scanned')}`\n"
        f"- Publication candidate status counts: `{dict(status_counts)}`\n\n"
        "## Boundary\n\n"
        "- Do not publish this directory.\n"
        "- Do not copy raw private text, credentials, local paths, or chat logs into `wiki/`.\n"
        "- Public pages must be rewritten summaries with provenance and a clean privacy scan.\n"
    )
    write_page(out / "index.md", "Private Wiki Index", ["本地私有 Wiki", "Private Wiki"], ["local-recovery", "private-wiki"], "private-wiki", "moc", "Local-only compiled wiki index for recovered private context.", index_body)

    security_body = (
        "Security pages contain only rule names, paths, line numbers, counts, and hashes. They do not contain secret values.\n\n"
        "## Security Workbench\n\n"
        "- [[credential-review]] - exact and candidate credential findings\n"
        "- [[secret-material-map]] - local and recovered credential material map without secret values\n"
        "- [[personal-info-review]] - personal information and private-memory markers\n"
        "- [[local-path-map]] - local filesystem and environment path markers\n\n"
        "## Counts\n\n"
        f"- High/candidate credential rows: `{len(secret_rows)}`\n"
        f"- High-confidence secret rows: `{len(high_secret_rows)}`\n"
        f"- Personal/private rows: `{len(personal_rows)}`\n"
        f"- Local path rows: `{len(local_path_rows)}`\n\n"
        "## Reports\n\n"
        f"- {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n"
        f"- {private_report_link('sensitive_timeline_summary.json', 'sensitive_timeline_summary.json', 2)}\n"
    )
    write_page(out / "security" / "index.md", "Private Security Index", ["本地安全复核索引"], ["local-recovery", "security"], "private-security", "moc", "Local-only security review index for recovered context.", security_body, "sensitive")

    credential_body = (
        "Review these entries first. Exact token patterns and candidate assignments require manual confirmation and possible rotation.\n\n"
        f"- High-confidence secret rows: `{len(high_secret_rows)}`\n"
        f"- Credential/context rows: `{len(secret_rows)}`\n"
        f"- Full report: {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n\n"
        "## File-Level Findings\n\n"
        + table_for_findings(aggregate_by_file(secret_rows), 180, 2)
    )
    write_page(out / "security" / "credential-review.md", "Credential Review", ["密钥复核"], ["local-recovery", "security", "credentials"], "private-security", "review", "Credential and secret-candidate review without secret values.", credential_body, "sensitive")

    personal_body = (
        "This page tracks personal information, private-memory markers, and chat-context markers. Values are not reproduced here.\n\n"
        f"- Personal/private rows: `{len(personal_rows)}`\n"
        f"- Full report: {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n\n"
        "## File-Level Findings\n\n"
        + table_for_findings(aggregate_by_file(personal_rows), 180, 2)
    )
    write_page(out / "security" / "personal-info-review.md", "Personal Information Review", ["个人信息复核"], ["local-recovery", "security", "personal-info"], "private-security", "review", "Personal information and private-memory review without raw values.", personal_body, "sensitive")

    local_path_body = (
        "This page tracks local path and environment references. Treat all rows as private-only until rewritten.\n\n"
        f"- Local path rows: `{len(local_path_rows)}`\n"
        f"- Full report: {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n\n"
        "## File-Level Findings\n\n"
        + table_for_findings(aggregate_by_file(local_path_rows), 180, 2)
    )
    write_page(out / "security" / "local-path-map.md", "Local Path Map", ["本地路径地图"], ["local-recovery", "security", "local-paths"], "private-security", "review", "Local path and environment reference map for private-only triage.", local_path_body, "sensitive")

    write_timeline_pages(timeline_rows)
    capture_body = "\n\n## Manual Private Captures\n\n" + "\n".join(manual_capture_lines(root, 2)) + "\n"
    context_page(review_rows, "projects-and-action-items", "Private Projects Index", "Recovered private project and action-item index.", out / "projects" / "index.md", capture_body)
    context_page(review_rows, "agent-governance-and-skills", "Private Agent Context Index", "Recovered private agent rules, skills, prompts, and memory index.", out / "agents" / "index.md")
    context_page(review_rows, "private-memory-and-sessions", "Private Personal Context Index", "Recovered private memory, session, and personal context index.", out / "personal" / "index.md")
    context_page(review_rows, "local-assets-and-environment", "Private Assets Index", "Recovered local assets, environment, and path-map context index.", out / "assets" / "index.md")
    context_page(review_rows, "public-knowledge-candidates", "Private Public-Knowledge Candidate Index", "Recovered public-knowledge candidates that still require review.", out / "synthesis" / "index.md")
    local_stats = write_local_source_pages(root, out)
    personal_archive_stats = write_personal_archive_pages(
        root,
        out,
        recovered_rows,
        sensitive_rows,
        local_rows,
        local_root_rows,
        local_finding_rows,
        local_timeline_rows,
    )

    publication_body = (
        "Candidates here are not public pages. They are triage rows for future rewritten public-safe notes.\n\n"
        "## Status Counts\n\n"
        + "\n".join(f"- `{status}`: `{count}`" for status, count in status_counts.most_common())
        + "\n\n## Candidate Queue\n\n"
        + review_table(review_rows, 260, 1)
        + "\n\n## Promotion Rule\n\n"
        "- `private-only`: never promote without explicit review.\n"
        "- `needs-redaction`: rewrite and remove local/private material first.\n"
        "- `public-safe-candidate`: still run privacy and structure checks before moving to `wiki/`.\n"
        "- `published`: only after a public page exists and passes gates.\n"
    )
    write_page(out / "publication-candidates.md", "Publication Candidates", ["公开提升队列"], ["local-recovery", "publication"], "private-publication", "review", "Local-only queue for future public-safe wiki rewrites.", publication_body)

    manifest = {
        "archive_id": ARCHIVE_ID,
        "generated": TODAY,
        "pages": len(list(out.rglob("*.md"))),
        "sensitive_rows": len(sensitive_rows),
        "timeline_rows": len(timeline_rows),
        "review_rows": len(review_rows),
        "publication_status_counts": dict(status_counts),
        **local_stats,
        **personal_archive_stats,
    }
    (out / ".private_wiki_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"private_wiki_pages: {manifest['pages']}")
    print(f"private_wiki: {out}")
    return 0


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    return build(root)


if __name__ == "__main__":
    raise SystemExit(main())
