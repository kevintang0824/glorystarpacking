# 第一阶段：技术 SEO、收录与分析审计

执行日期：2026-09-08
站点：`https://glorystarpacking.com`

## 当前结果

本地和生产环境的技术校验已完成。当前站点具备提交 Google/Bing 收录所需的基础，但搜索引擎是否实际收录、排名和带来流量，仍需在已验证的站长平台中观察，不能由 sitemap、结构化数据或 IndexNow 保证。

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 本地站点校验 | 通过 | 74 个可收录 HTML 页面；元数据、H1、JSON-LD、FAQ、内链、表单、资源和 sitemap 一致 |
| 生产索引审计 | 通过 | Sitemap 中 74 个英文 URL 可抓取，HTTP 200、canonical 匹配并允许索引 |
| 多语言收录闸门 | 正常 | 370 个翻译页面可访问但保持 `noindex,follow`；当前没有语言页进入审核白名单 |
| 图片 Sitemap | 通过 | 37 张不重复主图与对应页面匹配，图片在线且无可移除 JPEG 元数据 |
| 生产页面外壳 | 通过 | 75 个公开页面的外壳、资源版本和联系方式一致 |
| 询盘接口测试 | 通过 | 请求类型、附件签名、大小、来源归因、错误回退和安全响应通过回归测试 |
| GA4 埋点 | 已部署 | 使用 `G-LYNMPWG9WK`；默认拒绝分析存储，用户同意后加载并记录页面、联系、询价和下载事件 |
| 生产询价邮件 | 待配置 | `/api/health` 返回 HTTP 503，缺少 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL` |
| 生产部署 | 已完成 | Vercel Production deployment `dpl_67r7SAgwXnrW7kvupFJNXnG1KTU4` 已 READY，并已绑定 `https://glorystarpacking.com` |

## GSC 实时核对结果

已在 Google Search Console 中切换到正确的域名资源 `sc-domain:glorystarpacking.com`。此前页面默认打开的是同账号下的另一个资源 `sc-domain:glorystarpack.com`，不能混用其数据或提交记录。

正确资源中的 Sitemap `https://glorystarpacking.com/sitemap.xml` 已经提交并显示“成功”，Google 最近一次读取时间为 2026-09-06，已发现 74 个网页；本轮不需要重复提交。

网页索引报告（上次更新：2026-09-04）显示：51 个网页已编入索引，27 个网页未编入索引。其中 23 个为“已发现 - 尚未编入索引”，4 个为“网页会自动重定向”，重复网页且用户未选定规范网页为 0。首页 `https://glorystarpacking.com/` 已确认收录。

正确资源最近 28 天（2026-08-10 至 2026-09-06）的效果快照：36 次点击、5,359 次展示、平均 CTR 0.7%、平均排名 22.1。页面明细仍主要是旧站 URL，说明域名资源正在经历 URL/站点版本迁移，当前数据不能直接当作新页面的排名基线。

已确认的高价值旧 URL 中，以下路径当前返回 404：

- `/cosmetic-packaging-supplier-china/`：4 次点击、556 次展示
- `/insights/glass-bottle-neck-finish-closure-guide/`：3 次点击、363 次展示
- `/insights/cosmetic-packaging-compatibility-testing-guide/`：3 次点击、337 次展示
- `/insights/cosmetic-pump-not-working-troubleshooting/`：2 次点击、125 次展示
- `/insights/accessible-cosmetic-packaging-design-guide/`：2 次点击、122 次展示

本轮先为语义匹配明确的商业/指南 URL 增加永久重定向：

- `/cosmetic-packaging-supplier-china` → `/cosmetic-packaging-boxes.html`
- `/cosmetic-packaging-moq` → `/custom-packaging-cost-moq-guide.html`

其余旧文章暂不强行重定向到不相关页面；下一步应决定恢复原主题内容，或新建等价内容页后再做 301。

## 已执行的校验

```text
node scripts/validate-site.mjs
node scripts/audit-production-indexing.mjs https://glorystarpacking.com
node scripts/audit-production-services.mjs https://glorystarpacking.com
node scripts/audit-production-shell.mjs https://glorystarpacking.com
node scripts/audit-production-image-sitemap.mjs https://glorystarpacking.com
python3 scripts/validate-languages.py
node scripts/test-quote-api.mjs
node scripts/validate-build-output.mjs
node scripts/audit-production-contact.mjs https://glorystarpacking.com
```

## 账号侧待完成

### Google Search Console

1. 确认当前账号对正确的域名资源 `glorystarpacking.com` 具有所有者/完全权限；不要使用同账号下的 `glorystarpack.com` 资源。
2. Sitemap 已完成：`https://glorystarpacking.com/sitemap.xml` 当前状态为“成功”。
3. 已完成首页 Live Inspection；首页已收录。`/cosmetic-packaging-boxes.html`、`/custom-boxes.html`、`/perfume-carton-gs-1294765.html` 已显示“已请求编入索引”，等待 Google 后续抓取与处理。
4. 已检查其余核心页：`/products.html`、`/wine-bottle-gift-box-specification.html`、`/custom-mailer-boxes.html`、`/about.html` 均已收录，因此跳过重复提交。
5. 7 天和 28 天后记录已发现、已抓取、已编入索引、查询、曝光、点击、CTR 和平均排名。

不要单独提交当前为空的 `sitemap-languages.xml`，也不要为尚未母语审核的翻译页请求收录。

### Bing Webmaster Tools

1. 从已验证的 Google Search Console 导入站点，或使用 DNS 验证。
2. 提交主 Sitemap。
3. 发布真实页面更新后，通过现有 IndexNow 工作流提交变更 URL。

### GA4

1. 在 GA4 属性中确认数据流对应 `G-LYNMPWG9WK`。
2. 在浏览器中选择允许分析，访问网站并检查 Realtime 的 `page_view`。
3. 验证 `contact_click`、`quote_cta_click`、`quote_form_start`、`generate_lead` 和 `resource_download`。
4. 将 `generate_lead` 标记为关键事件。

## 第一阶段的剩余阻塞

- GSC 的核心页 Request Indexing 需要在正确的 `glorystarpacking.com` 资源下操作；错误资源会提示“此网址不在该资源中”。当前 `/cosmetic-packaging-boxes.html`、`/custom-boxes.html`、`/perfume-carton-gs-1294765.html` 均已提交请求，等待 Google 后续抓取与处理。
- Bing 和 GA4 的实际数据必须在对应账号内确认；代码中存在 Measurement ID 不等于已经收到数据。
- Vercel 需要补齐 Resend 环境变量并完成一次真实收件测试，否则询价自动邮件仍不可用；Email、WhatsApp、电话和复制简报兜底仍可用。
- 已完成生产部署后的冒烟检查：旧 URL 返回 308 并指向新页面，`/sitemap.xml`、`/robots.txt`、首页及核心页面均返回 200；部署后收录审计通过。GSC 仍需等待新增页面处理，暂不批量新增文章或根据假设宣称排名增长。

## 生产部署记录

部署时间：2026-09-08；Production URL：`https://glorystarpacking.com`；构建状态：`READY`；最新 deployment：`dpl_67r7SAgwXnrW7kvupFJNXnG1KTU4`。

部署后检查结果：

- `/cosmetic-packaging-supplier-china` → `/cosmetic-packaging-boxes.html`，HTTP 308
- `/cosmetic-packaging-moq` → `/custom-packaging-cost-moq-guide.html`，HTTP 308
- `/sitemap.xml`、`/robots.txt`、`/`、`/cosmetic-packaging-boxes.html`、`/custom-boxes.html`、`/perfume-carton-gs-1294765.html`，均 HTTP 200
- `node scripts/audit-production-indexing.mjs https://glorystarpacking.com`：通过

说明：站点全局保持 `trailingSlash: false`；带末尾斜杠的历史路径会先统一为无斜杠，再执行对应的永久重定向，这是 Vercel 的规范化顺序，不影响最终目标页收录。

## 下一次复测入口

先取得 GSC 最近 28 天数据，再按“已抓取未收录”“有曝光但排名 8–20”“有点击但询盘弱”三类选择页面，进入第二阶段的内容、内链和转化优化。
