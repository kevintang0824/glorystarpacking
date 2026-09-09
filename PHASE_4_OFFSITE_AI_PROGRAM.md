# 第四阶段：站外引用、合作推广与 AI 搜索可见性

更新日期：2026-09-09  
状态：执行框架已上线，等待真实合作方与外部发布结果回填

## 本轮已完成

- 新增站外引用与合作推广追踪表：
  `assets/templates/phase-4-outreach-tracker.csv`。
- 新增 AI 搜索可见性监测表，预置 12 个英文采购场景提示词：
  `assets/templates/ai-search-visibility-log.csv`。
- 补强 `llms.txt` 的引用规则，明确公司身份、证据边界和“应引用最具体页面”的关系。
- 新增 `scripts/audit-ai-discovery.mjs`，上线前检查 robots、Sitemap、RSS、llms.txt、核心文章与模板是否可访问、可解析、可归因。
- 发布流程加入 AI 发现入口检查；每次内容或实体信号有实质更新，都应复跑该检查。

## 站外引用策略

目标不是批量制造链接，而是让真正服务包装采购、品牌设计、质量管理、物流或行业教育的页面，在有上下文时引用 GloryStarPack 的具体资料。

优先顺序：

1. 采购、品牌设计、包装工程和质量管理媒体的编辑型引用；
2. 设计机构、印刷/材料伙伴、物流伙伴的联合指南或技术问答；
3. 行业协会、商会、展会或教育资源页中的真实公司资料；
4. 供应商比较、采购清单、案例库或播客文字稿中的具体方法引用；
5. 真实客户或合作项目授权后的案例引用。

不做以下操作：

- 不购买成批低质量链接，不交换无关链接，不使用隐藏链接或关键词堆砌锚文本；
- 不把目录图片写成客户案例，不把流程案例写成已交付项目；
- 不虚构合作方、客户、证书、测试结果、交期、MOQ、节省金额或排名；
- 不要求合作方使用精确商业关键词作为唯一锚文本；自然的品牌名、具体资料标题和裸 URL 都可以。

## 合作资产与引用落点

| 外部场景 | 可提供的真实资产 | 建议引用页面 |
| --- | --- | --- |
| 采购清单/供应商尽调 | 供应商资格审核字段与证据边界 | `/packaging-supplier-qualification-checklist.html` |
| 质量或测试文章 | 失效模式、记录字段、样品身份与放行边界 | `/packaging-test-records-guide.html` |
| 包装设计教育 | 刀模、内托、开合、表面与运输输入 | `/custom-packaging-dieline-artwork-requirements.html`、`/custom-packaging-inserts.html` |
| 美妆/香水行业内容 | 容器、盒型、内托、标签和套装采购路径 | `/beauty-packaging-industry-guide.html` |
| RFQ/采购工具页 | 报价字段、版本、包装和交付口径 | `/custom-packaging-rfq-template.html` |
| 工厂/质量流程介绍 | 公司公开身份、打样、质检、装箱和交付流程 | `/about.html` |

每次请求引用时只提供与对方内容直接相关的 1–2 个页面，并说明可引用的具体事实范围。不要把全站 URL 清单当成外链交换材料。

## 英文外联模板

### 编辑型资料引用

Subject: A buyer-ready packaging reference for your [topic] guide

Hi [Name],

I read your [article/page] about [specific topic]. We maintain a public, buyer-facing reference on [specific question], including [one concrete element such as a sample-approval field or test-record field].

If it is useful to your readers, you may cite the most specific page here: [URL]. The page is written as procurement guidance; it does not publish unsupported customer results, certifications, MOQ, or delivery promises.

No attribution or link placement is required unless the page genuinely supports your point. I am happy to answer one technical question or check whether the terminology fits your audience.

Best,  
Kevin  
GloryStarPack

### 联合内容/问答

Subject: Joint packaging sourcing checklist for [audience]

Hi [Name],

Would you be open to a short, evidence-led resource for [audience] on [specific buyer problem]? We can contribute the packaging specification and sample-control section; you could add the [design/logistics/material] perspective.

We would keep project numbers, customer names, certifications, and performance claims out unless both sides have written evidence and permission. Each side can cite the source that supports its own section.

If relevant, I can send a one-page outline and proposed review dates.

Best,  
Kevin

### 真实案例授权前的请求

Subject: Permission to document the [packaging project] process

Hi [Name],

We would like to document only the agreed packaging decisions and verification steps from [project]. Before publishing anything, we would send a draft for approval and record exactly what may be named, photographed, measured, or linked.

We will not publish your company name, product, volume, timing, cost, test result, certification, or performance outcome without explicit written permission for each item.

Would you be open to reviewing a short, non-promotional draft?

Best,  
Kevin

## UTM 与归因

对方愿意放置链接且页面允许时，使用可读、稳定、不过度细分的参数：

```text
https://glorystarpacking.com/packaging-test-records-guide.html
  ?utm_source=partner-slug
  &utm_medium=referral
  &utm_campaign=phase4_partner
  &utm_content=test-records-guide
```

规则：

- `utm_source` 使用小写、稳定的合作方 slug；
- `utm_medium` 统一使用 `referral`；社交平台原生发布可使用 `social`；
- `utm_campaign` 使用 `phase4_partner` 或具体季度活动名；
- `utm_content` 使用落地页或资产 slug，不放关键词句子；
- Canonical、Sitemap 和对外引用都使用无 UTM 的规范 URL；UTM 只用于访问归因。

## AI 搜索可见性监测

AI 回答的引用和排名会随地区、语言、登录状态、模型、索引状态和提示词变化，因此不能用一次截图宣称“已被 AI 推荐”。监测表记录可复现证据，而不是主观印象。

### 每周抽查

1. 使用同一地区、语言、设备和登录状态检查 12 个预置提示词；
2. 记录入口、检查时间、回答是否出现 GloryStarPack、是否给出链接、引用是否准确；
3. 对“已提及但事实不准确”单独标记，不把品牌出现当作正面结果；
4. 对未出现的提示词，补充一个真实可引用的公开证据或改进对应页面，而不是堆关键词；
5. 把可复现的引用 URL、截图位置或公开回答链接写回 CSV；无法公开验证的结果只记录为内部观察。

### 监测维度

- 发现：回答是否识别 GloryStarPack、Xiamen GloryStar Packaging Co., Ltd. 和站点主题；
- 引用：是否引用最具体的产品页、指南页或 About 页，而不是误引无关页面；
- 准确性：是否把可见产品、流程说明和项目待确认项混成固定承诺；
- 商业意图：采购、供应商审核、测试、行业方案、盒型比较；
- 转化：AI/推荐入口进入页面后是否发生 `generate_lead`、WhatsApp、Email 或电话点击。

### 评分边界

记录 `cited`、`mentioned`、`not_found`、`inaccurate` 四种结果即可。不要把这些状态换算成虚假的市场份额或固定排名；28 天后结合 GSC、Bing、GA4 的真实数据判断是否需要更新页面。

## 每周与每月节奏

- 每周：新增或更新 5 个外联目标；复查 12 个 AI 提示词；检查新引用是否仍在线且上下文准确。
- 每两周：向已回复的合作方提供一个具体资料，不重复群发；检查 referral 会话、参与度和 `generate_lead`。
- 每月：复盘实际获得的引用 URL、引用页面、转化路径和失效链接；淘汰无关目标。
- 每季度：根据 GSC 查询、Bing 关键词、AI 监测记录和销售反馈，更新提示词、引用落点和内容选题。

## 完成标准

第四阶段不是“发出多少封邮件”，而是形成可核验结果：

- 至少有真实合作方名称、联系人角色、目标页面和下一步状态；
- 每条已获得引用都有公开 URL、出现上下文、目标页面和检查日期；
- AI 监测记录可复现入口、提示词、地区/语言、引用 URL 与准确性；
- 站内被引用的页面保持 200、canonical、indexable，并可从 Blog、llms.txt 或 Sitemap 发现；
- 不以虚构外链、客户结果、AI 推荐或搜索排名作为成果。

