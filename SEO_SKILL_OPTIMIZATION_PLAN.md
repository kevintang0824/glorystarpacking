# GloryStarPack SEO 技能包优化计划

版本：V1 · 2026-09-19  
适用站点：https://glorystarpacking.com/

## 1. 计划目标

沿用 SEO 技能包中的「Pillar → Product → Buyer Guide → Comparison/Technical → Industry → RFQ」模型，把现有 78 个英文页面组织成能承接采购搜索的主题集群：

```text
核心商业页
  → 盒型 / 标签 / 内托产品页
    → 成本、MOQ、打样、质检、交期与运输指南
      → 对比与技术问题页
        → 行业方案页
          → RFQ / Email / WhatsApp
```

本计划以真实能力为边界：GloryStarPack 当前公开站点聚焦定制纸包装、盒型、内托、纸袋、纸管、标签和配套采购流程。技能包中的 Perfume Bottle 案例将被映射为「香水瓶二次包装」集群；在没有确认玻璃瓶、瓶盖、泵头制造能力前，不创建 primary-container 制造商页面，也不发布虚构 MOQ、价格、产能、认证或交期。

## 2. 集群总览

| 集群 | Pillar / 入口 | 主要商业页 | Buyer Guide / 工具 | 目标动作 |
| --- | --- | --- | --- | --- |
| 定制包装盒 | `custom-boxes.html` | `custom-rigid-boxes.html`、`custom-magnetic-boxes.html`、`custom-drawer-boxes.html`、`folding-carton-boxes.html`、`custom-mailer-boxes.html` | 成本/MOQ、RFQ、打样确认、质检清单 | 提交结构、尺寸、数量和目的地 |
| 美妆与香水二次包装 | `cosmetic-packaging-boxes.html` | `custom-perfume-boxes.html`、`custom-packaging-inserts.html`、`box-labels.html` | `beauty-packaging-industry-guide.html`、`perfume-box-insert-checklist.html`、颜色与测试指南 | 提交瓶身尺寸、重量、泵头/瓶盖间隙、数量 |
| 标签与表面 | `box-labels.html` | `custom-clear-labels.html`、`custom-waterproof-labels.html`、`custom-wine-labels.html`、`embossed-foil-labels.html` | 白墨稿件、防水测试、Pantone、酒标冷凝测试 | 提交基材、表面、环境和工艺要求 |
| 电商与运输 | `custom-mailer-boxes.html` | `custom-corrugated-shipping-boxes.html`、`custom-packaging-inserts.html` | Mailer 尺寸/运输测试、瓦楞箱规格、物流指南 | 提交装箱、重量、运输路线和托盘要求 |
| 供应商与采购控制 | `about.html` / `products.html` | 所有核心产品页 | 供应商审核、RFQ、成本/MOQ、China vs local、交期规划 | 发出可比询价并锁定审批节点 |

## 3. 关键词与页面矩阵

### P0：已有页面先争取商业排名

| 页面 | Primary Keyword | Search Intent | 必须强化的 Secondary / Long-tail |
| --- | --- | --- | --- |
| `custom-boxes.html` | custom packaging boxes with logo | Commercial | custom packaging manufacturer, custom boxes supplier, packaging boxes for brands |
| `custom-rigid-boxes.html` | custom rigid boxes manufacturer | Transactional | rigid gift boxes, luxury rigid packaging, custom rigid box with insert |
| `custom-perfume-boxes.html` | custom perfume boxes | Transactional | perfume box for glass bottle, fragrance packaging box, perfume box insert |
| `cosmetic-packaging-boxes.html` | custom cosmetic packaging boxes | Commercial | skincare packaging boxes, cosmetic boxes with insert, beauty packaging supplier |
| `box-labels.html` | custom product labels manufacturer | Commercial | custom labels for packaging, product label supplier, printed labels with finish |
| `custom-mailer-boxes.html` | custom mailer boxes manufacturer | Transactional | ecommerce mailer boxes, printed shipping mailers, custom corrugated mailer |
| `custom-packaging-cost-moq-guide.html` | custom packaging cost and MOQ | Commercial Investigation | packaging price factors, custom packaging minimum order, landed packaging cost |
| `custom-packaging-rfq-template.html` | custom packaging RFQ template | Commercial Investigation | comparable supplier quotes, packaging quote checklist, packaging quotation fields |

### P1：围绕案例结构补齐采购决策页

优先复用现有页面，不批量新建薄内容：

- Product：30/50/100ml 香水瓶尺寸应先落在 `custom-perfume-boxes.html` 和 `perfume-box-insert-checklist.html` 的二次包装规格中；只有存在真实产品资料后，才考虑独立 SKU 页。
- Buyer Guide：`packaging-sample-approval-checklist.html`、`custom-packaging-quality-inspection-checklist.html`、`custom-packaging-lead-time-planner.html`、`packaging-supplier-qualification-checklist.html`。
- Comparison：`rigid-box-vs-folding-carton.html`、`magnetic-box-vs-drawer-box.html`、`collapsible-rigid-box-vs-setup-box.html`、`foil-vs-spot-uv.html`。
- Technical：`perfume-box-insert-checklist.html`、`clear-label-white-ink-artwork-guide.html`、`waterproof-label-testing-guide.html`、`pantone-color-matching-packaging.html`。
- Industry：`beauty-packaging-industry-guide.html`、`custom-jewelry-boxes.html`、`custom-wine-boxes.html`、`custom-mailer-boxes.html`。

## 4. 内链规则

每个商业页和新指南至少建立 3–8 个有语义的内部链接：

```text
custom-boxes.html
  → custom-rigid-boxes.html
  → custom-perfume-boxes.html
  → custom-packaging-cost-moq-guide.html
  → packaging-sample-approval-checklist.html
  → custom-packaging-rfq-template.html

custom-perfume-boxes.html
  → cosmetic-packaging-boxes.html
  → custom-packaging-inserts.html
  → perfume-box-insert-checklist.html
  → rigid-box-vs-folding-carton.html
  → custom-packaging-quality-inspection-checklist.html
  → #quote
```

Anchor text 使用具体采购词并做自然变化，例如 `custom perfume boxes`、`perfume bottle insert checklist`、`custom packaging RFQ template`、`packaging sample approval checklist`，避免全站重复使用 “Read more” 或 “Click here”。

## 5. 单页优化标准

每个 P0/P1 页面发布前必须满足：

1. 一个核心搜索意图、一个 H1、一个清晰的 SEO Title 和 140–160 字符左右的 Meta Description。
2. 首屏前 100 字直接回答买家问题：能否定制、需要什么输入、报价受什么影响、下一步怎么做。
3. 页面正文覆盖适用场景、规格输入、材料/工艺、样品、MOQ 口径、交期确认方式、QC、包装和运输边界。
4. 至少 4 个基于真实能力的 FAQ，并同步 FAQPage JSON-LD。
5. 至少一个产品链接、一个 Buyer Guide 链接和一个 RFQ / Email / WhatsApp CTA。
6. 图片文件名和 ALT 描述对象与用途，不堆砌关键词；首图有尺寸声明，非首屏图懒加载。
7. 有真实证据才写认证、产能、结果数字、固定价格、固定 MOQ 或固定交期；否则使用“项目确认”表述。

## 6. 90 天执行顺序

### P0 · 第 1 周：发布和测量

- 提交当前代码并确认生产站点的 sitemap、canonical、robots、重定向和联系方式。
- 在 GSC/Bing 记录 28 天基线：展示、点击、CTR、平均排名、收录数、查询和页面。
- 验证首页、Products、盒型页、标签页、行业页和指南页都能进入 RFQ、Email 或 WhatsApp。
- 建立页面—关键词—询盘事件表，重点跟踪 `quote_cta_click`、`quote_form_start`、`generate_lead`、`resource_download`。

### P1 · 第 2–4 周：优化已有集群

- 先处理 GSC 中「展示高、排名 8–20、CTR 低」的页面，只改 Title、Meta、首屏答案和内链锚文本。
- 为 `custom-boxes.html`、`custom-perfume-boxes.html`、`cosmetic-packaging-boxes.html`、`box-labels.html`、`custom-mailer-boxes.html` 建立明确的 Pillar → Product → Guide → RFQ 闭环。
- 为每篇 Buyer Guide 补一个对应商业页、一个相关指南页和一个询价入口。
- 用真实产品尺寸、样品照片、QC 记录或工艺资料更新页面；没有证据的内容保持采购边界说明。

### P2 · 第 2–3 个月：扩展已验证主题

- 每月发布 1–2 篇真实采购指南或测试记录，不批量生成相似页面。
- 只有当现有集群出现稳定展示或有效询盘后，才扩展新行业或新规格页面。
- 进行 5–10 个相关外部引用/合作方尝试，记录公开 URL、上下文、落地页和结果；不购买批量链接。
- 每 28 天根据 GSC、GA4、Bing、Referral 和 AI 搜索观察复盘标题、内链和 CTA。

## 7. GSC 决策规则

| 信号 | 下一步 |
| --- | --- |
| 展示高、排名 8–20、CTR 低 | 优先改 Title、Meta、首屏答案和页面摘要 |
| 排名 1–10、CTR 低 | 检查搜索意图、品牌词位置和 SERP 摘要 |
| 展示上涨、排名 20–50 | 增加第一手内容、FAQ、表格和相关内链 |
| 无展示 | 检查收录、canonical、关键词分工、页面质量和搜索意图 |
| 有点击、无 RFQ | 优化证据、CTA、报价字段和产品页到表单路径 |

## 8. 完成标准

- 5 个核心商业入口各有清晰的产品、指南和询价闭环。
- 每个 P0/P1 页面有可复核的关键词分工，不出现同一意图的大量页面互相竞争。
- 所有公开页面继续通过 canonical、JSON-LD、FAQ、内链、图片、语言审核闸门和 Sitemap 校验。
- 优化决策基于至少 28 天真实搜索和询盘数据，不以一次 AI 回答或未经验证的排名截图作为成果。

