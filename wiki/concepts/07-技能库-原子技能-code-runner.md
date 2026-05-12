---
title: "code-runner 技能"
aliases: ["code-runner"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d761068682b0"
summary: "Run code snippets in 30+ programming languages directly from the command line. Use for testing algorithms, verifying syntax, and running quick scripts."
---

# code-runner 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 💻 code-runner 技能

> Run code snippets in 30+ programming languages directly from the command line. Use for testing algorithms, verifying syntax, and running quick scripts.

---

## 🛠️ 支持语言

| 语言 | ID | 语言 | ID |
| :--- | :--- | :--- | :--- |
| **JavaScript** | `javascript` | **Python** | `python` |
| **TypeScript** | `typescript` | **Rust** | `rust` |
| **Go** | `go` | **C++** | `cpp` |
| **Java** | `java` | **Bash** | `bash` |

---

## 📖 使用方法

**⚠️ 推荐使用 Stdin 模式以避免引号转义错误：**

```bash
echo "print('Hello, World!')" | node scripts/run-code.cjs python
```

### 多行代码示例 (Bash)
```bash
CODE='import math
print(math.pi)'
echo "$CODE" | node scripts/run-code.cjs python
```

---

## 🛡️ 安全提示

执行任意代码具有风险。禁止在未复核的情况下运行访问文件系统、网络或修改环境变量的第三方代码。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
