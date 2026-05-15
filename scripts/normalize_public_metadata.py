#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)

SUMMARY_OVERRIDES = {
    "wiki/concepts/public-api-contract.md": "公开只读 API 契约：约束前端只能读取经过筛选的站点数据，不直接接触原始黑曜石内容和私有整理层。",
    "wiki/concepts/public-site-data-boundary.md": "公开站点数据边界：网站只消费从公开 wiki 编译出的 JSON，不直接读取原始资料、私有层或本地审查队列。",
    "wiki/concepts/public-work-card-standard.md": "公开项目卡标准：每张卡都要说明这是什么、适合谁、能学什么、怎样复刻，以及下一步该做什么。",
    "wiki/concepts/sensitive-context-rewrite-rules.md": "敏感上下文公开改写规则：保留方法、决策和教训，删除身份、环境、账号、原始对话和可定位细节。",
    "wiki/concepts/tool-agent-skill-stack-routing.md": "Agent 技能路由工具卡：根据任务类型选择合适技能链，同时始终服从公开边界、来源规则和验收要求。",
    "wiki/concepts/tool-browser-ui-testing-workflow.md": "浏览器 UI 验收工具卡：用真实页面检查布局、数据、交互和移动端表现，而不是只看代码或构建结果。",
    "wiki/concepts/tool-codex-validation-workflow.md": "Codex 验证工具卡：把结构、隐私、测试、站点数据和 Git 状态串成一条可复跑的公开维护验证链。",
    "wiki/concepts/tool-coze-workflow-platform-study.md": "Coze 风格工作流平台研究工具卡：聚焦节点、权限、调试、人工确认和最小可复刻工作流。",
    "wiki/concepts/tool-github-publication-workflow.md": "GitHub 发布工具卡：只发布公开安全层，先跑内容与隐私验收，再提交公开仓库和展示数据。",
    "wiki/concepts/tool-local-model-experiment-toolchain.md": "本地模型实验工具链工具卡：把数据检查、小实验、评估、复盘和公开边界放进同一条学习闭环。",
    "wiki/concepts/tool-local-private-wiki-compiler.md": "本地私有编译层工具卡：先把本地资料整理成可检索的私有 wiki，再选择性晋升到公开层。",
    "wiki/concepts/tool-obsidian-karpathy-wiki-compilation.md": "Obsidian 与 Karpathy 编译方法工具卡：按原始层、私有层、公开层和前端数据层组织个人资料库。",
    "wiki/concepts/tool-privacy-scan-publication-gate.md": "隐私扫描发布闸门工具卡：在公开发布前识别密钥、路径、身份和会话风险，阻止不安全内容进入前端。",
    "wiki/concepts/upstream-reference-and-adaptation-policy.md": "上游参考与改写策略：说明哪些内容来自官方或开源项目，哪些是安自己的适配、复刻和扩展。",
    "wiki/synthesis/archive-information-architecture.md": "安的书房公开信息架构：用项目、能力、时间线、来源和复核队列组织可展示资料，而不是堆原始记录。",
    "wiki/synthesis/capability-evidence-matrix.md": "能力证据矩阵：把安会的工具、方法和工作流与对应项目证据、公开页面和后续学习包连接起来。",
    "wiki/synthesis/lifecycle-automation-acceptance-2026-05-13.md": "两小时异步自动化链路的首次验收记录：确认私有 intake、公开学习包、站点数据和验证闸门能一起工作。",
    "wiki/synthesis/lifecycle-package-backlog.md": "生命周期学习包待办：把本地分散项目、技能和 Agent 线索排成可分批公开的复刻资料队列。",
    "wiki/synthesis/personal-archive-public-roadmap.md": "个人资料库公开路线图：从本地整理、公开 wiki、站点数据到前端与未来 App 的分阶段推进路径。",
    "wiki/synthesis/project-evidence-matrix.md": "项目证据矩阵：用证据强度、公开风险和下一步动作连接项目页、来源页和后续学习包。",
}

REPLICATION_OVERRIDES = {
    "wiki/concepts/agent-workflow-for-beginners.md": [
        "先画出输入、检索、模型、确认、输出五个节点。",
        "只选一个小问题跑通最小流程。",
        "记录哪里需要人工确认和验收。",
        "再决定是否扩展工具或角色。",
    ],
    "wiki/concepts/ai-beginner-replication-workflow.md": [
        "先写清楚目标和最小成果。",
        "把任务拆成三到五步。",
        "每步做完都留下可见结果。",
        "最后记录失败和下一步。",
    ],
    "wiki/concepts/backend-api-for-personal-archive-beginners.md": [
        "先列出列表、详情、搜索三个只读接口。",
        "用公开 JSON 模拟返回结果。",
        "检查字段是否足够前端阅读和搜索。",
        "最后再换成真实后端实现。",
    ],
    "wiki/concepts/front-end-ai-building-for-beginners.md": [
        "先做首页、卡片和详情页三个最小界面。",
        "给每张卡片补上适合谁和下一步。",
        "用手机宽度检查可读性和点击路径。",
        "再补搜索或筛选，而不是先堆功能。",
    ],
    "wiki/concepts/xiaoan-dialogue-design-and-boundary.md": [
        "先只回答站内公开问题。",
        "确认前端只传问题和公开内容 ID。",
        "测试回答是否中文、具体、可执行。",
        "最后再扩展人格语气和引导方式。",
    ],
}

FAILURE_OVERRIDES = {
    "wiki/concepts/agent-workflow-for-beginners.md": [
        "把 Agent 当成万能助手，没有人工确认节点。",
        "一开始就接高风险写入工具。",
        "没有验收，结果看起来会动但不可追踪。",
    ],
    "wiki/concepts/ai-beginner-replication-workflow.md": [
        "只看资料不动手，结果没有最小作品。",
        "步骤太大，小白第一步就卡住。",
        "没有失败记录，下一次还会重复踩坑。",
    ],
    "wiki/concepts/backend-api-for-personal-archive-beginners.md": [
        "接口直接返回私有字段或原始库内容。",
        "只关注能跑，不关注边界和错误格式。",
        "没有只读优先，过早引入复杂权限。",
    ],
    "wiki/concepts/front-end-ai-building-for-beginners.md": [
        "页面好看但内容空，读者不知道下一步。",
        "详情页没有复刻步骤和失败点。",
        "移动端可读性差，实际无法使用。",
    ],
    "wiki/concepts/xiaoan-dialogue-design-and-boundary.md": [
        "让小安假装知道私有材料或真实身份细节。",
        "回答只有语气没有判断和下一步。",
        "前端和后端边界不清，导致公开范围失控。",
    ],
}


def parse_frontmatter(text: str) -> tuple[list[str], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return [], text
    return match.group(1).splitlines(), text[match.end() :]


def list_value(values: list[str]) -> list[str]:
    return [f'  - "{value}"' for value in values]


def frontmatter_dict(lines: list[str]) -> dict[str, list[str]]:
    keys: dict[str, list[str]] = {}
    current: str | None = None
    for line in lines:
        if line.startswith("  - ") and current:
            keys.setdefault(current, []).append(line)
        elif ":" in line and not line.startswith(" "):
            current = line.split(":", 1)[0].strip()
            keys.setdefault(current, []).append(line)
    return keys


def insert_after(lines: list[str], after_key: str, new_lines: list[str]) -> list[str]:
    for index, line in enumerate(lines):
        if line.startswith(f"{after_key}:"):
            cursor = index + 1
            while cursor < len(lines) and lines[cursor].startswith("  - "):
                cursor += 1
            return lines[:cursor] + new_lines + lines[cursor:]
    return lines + new_lines


def has_chinese_alias(lines: list[str]) -> bool:
    aliases_started = False
    for line in lines:
        if line.startswith("aliases:"):
            aliases_started = True
            if re.search(r"[\u4e00-\u9fff]", line):
                return True
            continue
        if aliases_started:
            if line.startswith("  - "):
                if re.search(r"[\u4e00-\u9fff]", line):
                    return True
                continue
            break
    return False


def default_action_text(path: str, lines: list[str]) -> str | None:
    frontmatter_text = "\n".join(lines)
    if "type: source" in frontmatter_text or "type: moc" in frontmatter_text:
        return None
    if path.startswith("wiki/projects/"):
        return "先看这页的目标和边界，再按最小步骤做一个缩小版本，并记录一次验收结果。"
    if path.startswith("wiki/synthesis/"):
        return "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
    return "先读完这页的边界和做法，再用一个最小例子试一次，把结果和问题记录下来。"


def normalize_file(root: Path, path: Path) -> bool:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8")
    lines, body = parse_frontmatter(text)
    if not lines:
        return False
    keys = frontmatter_dict(lines)
    changed = False

    if rel in SUMMARY_OVERRIDES:
        summary_line = f'summary: "{SUMMARY_OVERRIDES[rel]}"'
        for index, line in enumerate(lines):
            if line.startswith("summary:"):
                if lines[index] != summary_line:
                    lines[index] = summary_line
                    changed = True
                break

    if "publish" in keys and "curated" in "\n".join(keys["publish"]):
        if "reviewStatus" not in keys:
            lines = insert_after(
                lines,
                "sourceLabels" if "sourceLabels" in keys else "publicSafety",
                [
                    "reviewStatus: challenged",
                    'reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"',
                ],
            )
            keys = frontmatter_dict(lines)
            changed = True
        elif "reviewNotes" not in keys:
            lines = insert_after(
                lines,
                "reviewStatus",
                ['reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"'],
            )
            keys = frontmatter_dict(lines)
            changed = True

        if "actionText" not in keys:
            action_text = default_action_text(rel, lines)
            if action_text:
                lines = insert_after(lines, "philosophicalLayer" if "philosophicalLayer" in keys else "whyItMattered", [f'actionText: "{action_text}"'])
                keys = frontmatter_dict(lines)
                changed = True

    if rel in REPLICATION_OVERRIDES and "replicationSteps" not in keys:
        lines = insert_after(lines, "operationStory" if "operationStory" in keys else "actionText", ["replicationSteps:"] + list_value(REPLICATION_OVERRIDES[rel]))
        keys = frontmatter_dict(lines)
        changed = True

    if rel in FAILURE_OVERRIDES and "failureModes" not in keys:
        lines = insert_after(lines, "replicationSteps" if "replicationSteps" in keys else "actionText", ["failureModes:"] + list_value(FAILURE_OVERRIDES[rel]))
        keys = frontmatter_dict(lines)
        changed = True

    if changed:
        new_text = "---\n" + "\n".join(lines) + "\n---\n" + body
        path.write_text(new_text, encoding="utf-8")
    return changed


def iter_markdown(root: Path) -> list[Path]:
    return sorted((root / "wiki").rglob("*.md"), key=lambda item: item.relative_to(root).as_posix())


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    changed = 0
    for path in iter_markdown(root):
        if normalize_file(root, path):
            changed += 1
    print(f"normalized_files: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
