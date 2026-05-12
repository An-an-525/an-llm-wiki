---
title: "data-pipeline-engineer 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "1dbfdd34dc7a"
summary: "💾 data-pipeline-engineer 技能"
---

# data-pipeline-engineer 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 💾 data-pipeline-engineer 技能

> Expert data engineer for ETL/ELT pipelines, streaming, and data warehousing. Focuses on Medallion architecture and data quality gates.

---

## 🏗️ 核心架构：Medallion Architecture

- **BRONZE (Raw)**: 原始数据精确副本，分区存储。
- **SILVER (Cleansed)**: 已清洗、去重且应用了业务逻辑。
- **GOLD (Business)**: 聚合维度模型，面向 BI/ML。

---

## 🛠️ 关键技术栈

- **处理引擎**: Spark, dbt, Databricks。
- **流式传输**: Kafka, Flink。
- **任务编排**: Airflow (DAG), sensors, retries。
- **质量保障**: Great Expectations, dbt tests。

---

## ⚠️ 高压线与红线

- **严禁全量刷新**: 必须使用增量模型 (`is_incremental`)。
- **质量先行**: 禁止在没有质量门控 (Quality Gates) 的情况下发布到生产环境。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
