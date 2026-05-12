---
title: "omni-talos 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "4a0beda0547d"
summary: "Operational tooling for Talos Linux Kubernetes clusters via Sidero Omni with Proxmox."
---

# omni-talos 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🤝 omni-talos 技能

> Operational tooling for Talos Linux Kubernetes clusters via Sidero Omni with Proxmox.

---

## 🛠️ 核心管理命令

| 任务 | 命令 |
| :--- | :--- |
| **查看日志** | `provider-ctl.py --logs 50` |
| **重启 Provider** | `provider-ctl.py --restart` |
| **集群状态** | `omnictl cluster status <name>` |
| **应用配置** | `omnictl apply -f <file>.yaml` |

---

## 🏗️ 部署规范

- **Omni 控制面**: `omni.spaceships.work` (192.168.10.20)。
- **Proxmox Provider**: Foxtrot LXC (192.168.3.10)。
- **存储**: CEPH RBD (`vm_ssd` pool)。

---

## ⚠️ 约束红线

- **L2 邻近**: Provider 必须与 Talos VM 处于同一 L2 网络。
- **无状态迁移**: 禁止对节点执行 VM 迁移，会导致状态丢失。必须销毁并重建。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[基础设施运维底座]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
