# 第二阶段：高商业价值页面与证据优化

执行日期：2026-09-09
站点：`https://glorystarpacking.com`

## 本轮目标

在不编造企业规模、认证、客户、MOQ、交期或效果数据的前提下，让重点商业页清楚回答三个采购问题：供应主体是谁、产品页面能证明什么、下单前应取得什么记录。

## 已优化的 15 个页面

1. `/products.html`
2. `/custom-boxes.html`
3. `/custom-rigid-boxes.html`
4. `/custom-magnetic-boxes.html`
5. `/custom-drawer-boxes.html`
6. `/custom-mailer-boxes.html`
7. `/cosmetic-packaging-boxes.html`
8. `/custom-perfume-boxes.html`
9. `/custom-wine-boxes.html`
10. `/custom-jewelry-boxes.html`
11. `/custom-paper-bags.html`
12. `/folding-carton-boxes.html`
13. `/custom-corrugated-shipping-boxes.html`
14. `/custom-packaging-inserts.html`
15. `/box-labels.html`

这些页面覆盖包装盒总入口、主要盒型、重点行业、运输包装、内托、纸袋和标签，均具有明确的 B2B 询价意图。

## 页面新增的证据链

- 公司主体：`Xiamen GloryStar Packaging Co., Ltd.`；所在地：Xiamen, Fujian, China；
- 公开核验入口：本站 Factory 页面、关联玻璃瓶与容器包装站、Alibaba 公司主页；
- 批准样记录：照片、尺寸、工艺位置和版本备注；
- 材料记录：明确的基材、纸板、胶黏剂、覆膜或项目要求的证书副本；
- 生产记录：按约定节点提供印刷、表面加工、组装和检查照片或视频；
- 出货记录：外箱数量、箱唛、装箱照片、毛尺寸和交付条款；
- 内部验证路径：样品批准清单和质量检查记录工具。

## AI 与搜索可读性

`llms.txt` 已补充公司实体、公开交叉核验入口、产品参考的证明边界和四类证据记录。商业页继续使用对应的 Service 或 CollectionPage 结构化数据，并通过统一 Organization `@id` 关联首页公司实体。

## 真实性边界

- 页面图片和目录参考只用于显示可见结构和工艺方向；
- 最终尺寸、材料、颜色、性能、装箱、MOQ、时间和交付范围仍按项目报价与批准；
- 认证只有在持证主体、范围、生产站点、材料、有效期和订单声明均可核验时才可使用；
- 未发布未经授权的客户 Logo、评价、案例结果或工厂规模数字。

## 发布前校验

```text
node scripts/validate-site.mjs
python3 scripts/validate-languages.py
node scripts/validate-build-output.mjs
node scripts/test-quote-api.mjs
node --check assets/site.js
node --check assets/analytics.js
git diff --check
```

发布后对这 15 个 URL 运行生产索引审计，并只向 IndexNow 提交这些实质更新页面。Google 是否重新抓取、采用新版摘要或提高排名，需要通过后续 GSC 数据确认。
