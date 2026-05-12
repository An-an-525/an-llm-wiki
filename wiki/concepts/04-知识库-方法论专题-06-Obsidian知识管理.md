---
title: "📚 Obsidian 知识管理"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "7e508d50feae"
summary: "Obsidian Vault 组织、批量导入、知识沉淀的方法论"
---

# 📚 Obsidian 知识管理

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📚 Obsidian 知识管理

> Obsidian Vault 组织、批量导入、知识沉淀的方法论

#方法论 #Obsidian #知识管理

## 1. Vault 组织架构

### 推荐目录结构
```
[local path redacted]
├── 00 - 每日笔记\          # 每日日记 (YYYY-MM-DD.md)
├── 01 - 项目中枢\          # 项目管理
├── 02 - 领域\              # 知识领域
├── 03 - 代码片段\          # 代码收藏
├── 04 - 知识库\            # 核心知识
│   ├── 方法论专题\         # ← 本次新增
│   ├── 领域研究\           # 各领域深度研究
│   ├── 协议\              # 交互协议规范
│   ├── 提示词库\          # 提示词仓库
│   └── 架构\              # 系统架构设计
├── 05 - 外部信息\          # 抓取的外部内容
├── 06 - 周期回顾\          # 周/月/年回顾
├── 07 - 技能库\            # Agent 技能
├── 08 - 智能实体库\        # Agent/模型信息
├── 09 - 本地导入\          # 批量导入的内容
└── 99 - 模板\              # 模板文件
```

### MOC (Map of Content) 模式
```markdown
# 主题名称 MOC

## 子主题
- [[主题1 - 链接]]
- [[主题2 - 链接]]

## 相关资源
- [[外部参考]]

#标签1 #标签2
```

## 2. 批量导入方法

### PowerShell 批量导入脚本
```powershell
$sourceDirs = @("[local path redacted]", "[local path redacted]", "[local path redacted]")
$targetDir = "[local path redacted] - 本地导入"

foreach ($src in $sourceDirs) {
    Get-ChildItem -Path $src -Filter "*.md" -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Substring($src.Length + 1)
        $category = $relativePath.Split("\")[0]
        $targetPath = Join-Path $targetDir $category $_.Name
        
        # 创建目标目录
        $targetDirPath = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDirPath)) {
            New-Item -ItemType Directory -Path $targetDirPath -Force | Out-Null
        }
        
        # 添加 front matter
        $content = Get-Content $_.FullName -Raw
        $frontMatter = @"
---
source: $($_.FullName)
imported: $(Get-Date -Format "yyyy-MM-dd")
category: $category
tags: [本地导入]
---

"@
        
        Set-Content -Path $targetPath -Value ($frontMatter + $content) -Encoding UTF8
        Write-Host "Imported: $($_.Name) → $category"
    }
}
```

### Front Matter 模板
```yaml
---
title: 文件名
source: 原始路径
imported: 2026-04-30
category: 分类
tags: [标签1, 标签2]
status: draft|reviewed|final
aliases: [别名1, 别名2]
---
```

## 3. 知识沉淀方法

### 沉淀流程
```
1. 收集（RAW）    → 09 - 本地导入/
2. 初步整理      → 按项目/主题分类
3. 提取关键信息  → 写入 04 - 知识库/
4. 建立关联      → [[双向链接]]
5. 标签化        → #标签
6. 周期回顾      → 06 - 周期回顾/
```

### 知识分类维度
```markdown
# 按知识类型
- 概念：什么是 X
- 方法：如何做 X
- 工具：X 的使用方法
- 经验：X 的踩坑记录
- 决策：为什么选择 X

# 按项目
- 项目 A 的所有内容
- 项目 B 的所有内容

# 按时间
- 2026-04 的所有内容
- 本周新增
```

## 4. 链接与关联

### 双向链接语法
```markdown
# 直接链接
[[页面名称]]

# 带别名的链接
[[页面名称|显示文本]]

# 嵌入内容
![[页面名称#章节标题]]

# 块引用
![[页面名称#^block-id]]
```

### 标签系统
```markdown
# 一级标签（大分类）
#知识 #项目 #工具 #方法论

# 二级标签（细分）
#知识/AI #知识/数据库 #工具/CLI

# 状态标签
#status/草稿 #status/已审核 #status/已归档
```

## 5. 搜索与查找

### Obsidian 搜索技巧
```markdown
# 基础搜索
关键词1 关键词2

# 精确搜索
"完整短语"

# 正则表达式
/正则表达式/

# 搜索特定属性
tag:#标签名
path:目录名
file:文件名

# 组合搜索
关键词1 AND 关键词2
关键词1 OR 关键词2
关键词1 NOT 关键词2
```

## 6. 与 Agent 协作

### Agent 写入规范
```markdown
# Agent 写文件原则
1. 永不覆盖已有内容（只追加或创建新文件）
2. 文件名含日期：主题_YYYYMMDD.md
3. 必须包含 front matter
4. 引用来源路径
5. 中文内容用 UTF-8 编码
```

### 知识库健康检查
```markdown
# 定期检查项目
- [ ] 是否有孤立页面（无入链）
- [ ] 是否有断链（链接指向不存在的页面）
- [ ] 标签是否一致
- [ ] Front matter 是否完整
- [ ] 重复内容是否需要合并
```

## 7. 同步策略

### 本地 → 云端同步
```markdown
1. Obsidian Sync（官方，付费）
2. iCloud/OneDrive 文件夹同步
3. Git 同步（git init → git push）
4. 通过 API 同步到 LobeHub/其他平台
```

### 批量同步脚本
```powershell
# Obsidian → LobeHub 知识库
$vaultPath = "[local path redacted] - 知识库"
Get-ChildItem $vaultPath -Filter "*.md" -Recurse | ForEach-Object {
    Write-Host "Syncing: $($_.Name)"
    node lobe-cli.js doc add $kbId $_.FullName
}
```
