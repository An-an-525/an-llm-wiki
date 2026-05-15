# 2026-05-16 su-ai-cli model-repair 技能与工作台说明

## 项目目标

在本地工作区 `C:\Users\fkl26\Documents\Codex\2026-05-15\su-ai-cli` 准备一套可上传到远程 Windows 用户 `C:\Users\a1570` 的 Codex 模型修复技能和工作台说明；本次不连接远程。

## 产出

- `skill-model-repair\SKILL.md`：技能名 `model-repair`，触发描述覆盖 STL/OBJ/PLY/3MF/SKP 导出模型、3D 打印修复、破面、孔洞、非流形、二维平面加厚等场景。
- `skill-model-repair\agents\openai.yaml`：Codex UI 元数据，默认提示使用 `$model-repair`，并声明首选 `mesh_repair` MCP 工具。
- `README-模型修复工作台.txt`：面向上传和远程使用的中文说明，包含远程目标路径、默认输入/输出/报告目录、工具优先级、SKP 导出注意事项和不覆盖原文件规则。

## 关键决策

- 技能优先指导 Codex 使用 `mesh_repair` MCP 工具。
- 当 MCP 不可用或不足时，回退调用 `C:\Users\a1570\Desktop\codex-workbench\tools\repair_all.py`。
- 默认目录固定为 `input-models\output-fixed\reports`，并明确禁止覆盖原始模型。
- `.skp` 不直接假定可修复，要求先从 SketchUp 导出 STL/OBJ/PLY/3MF 或使用导出插件。

## 验证

- 已运行 skill-creator 的 `quick_validate.py`，结果为 `Skill is valid!`。
- 已人工核对三个目标文件内容。

## 已知风险与后续

- 本次未连接远程主机，也未验证远程 `mesh_repair` MCP 和 `repair_all.py` 的实际可用性。
- 上传到 `C:\Users\a1570` 后，应在远程 Codex 环境确认技能发现、MCP 注册和 fallback 脚本执行权限。
