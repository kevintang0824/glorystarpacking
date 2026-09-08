# GloryStarPack 收录启动清单

更新日期：2026-09-09

## 本次发布候选的索引边界

- 74 个英语业务与内容页面继续允许 `index,follow` 并保留在主 Sitemap；
- 5 种语言共 370 个非英语内容页仍可供访客阅读和切换语言，但在母语人工整页校对前统一使用 `noindex,follow`；另有 5 个本地化 404 页面同样不可收录；
- `sitemap-languages.xml` 当前为空是有意的质量保护，不要在 Search Console 单独提交它；
- 只有加入 `translations/indexing.json` 审核白名单的页面，才会自动获得双向 `hreflang` 并进入语言 Sitemap。

## 当前已确认

- 正式域名 `https://glorystarpacking.com` 可访问；
- 主 Sitemap 内 74 个英文 URL 均可抓取并允许收录；
- 74 个 URL 的 canonical 与页面 URL 一致；
- 页面允许 `index,follow`；
- `www`、`/index.html` 正确跳转到规范首页；
- `robots.txt` 允许 Google、Bing 和 OAI-SearchBot 抓取；
- GSC 的主 Sitemap 状态为成功，已发现 74 个网页；首页及 4 个已检查核心页已收录，另外 3 个核心页已请求编入索引；
- Bing 的主 Sitemap 状态为 `Success`，发现 74 个 URL，错误 0、警告 0；
- GA4 Realtime 已收到页面和互动事件，`generate_lead` 已标记为关键事件；
- 5 个 `* 2.html` 和 1 个 `site 2.webmanifest` 是本地完全相同的冲突副本，已通过 `.vercelignore` 阻止进入正式部署。

## 账号侧执行状态

### 1. Google Search Console

当前状态：已完成基础配置与本轮核心页检查。使用正确资源 `sc-domain:glorystarpacking.com`，不要与同账号的 `sc-domain:glorystarpack.com` 混用。

- 主 Sitemap 已提交并显示成功，发现 74 个网页；
- 首页、`/products.html`、`/wine-bottle-gift-box-specification.html`、`/custom-mailer-boxes.html`、`/about.html` 已确认收录；
- `/cosmetic-packaging-boxes.html`、`/custom-boxes.html`、`/perfume-carton-gs-1294765.html` 已请求编入索引，等待 Google 抓取与处理；
- 不要一天重复提交同一个 URL，也不要为尚未进入 `translations/indexing.json` 的翻译页请求编入索引。

### 2. Bing Webmaster Tools

当前状态：已完成。准确域名 `https://glorystarpacking.com/` 已从 GSC 导入并授权；`https://glorystarpacking.com/sitemap.xml` 已提交，Bing 显示 `Success`，发现 74 个 URL，错误 0、警告 0。

1. 打开 <https://www.bing.com/webmasters/>；
2. 直接从 Google Search Console 导入站点，或使用 DNS 验证；
3. 提交 `https://glorystarpacking.com/sitemap.xml`；
4. 检查 IndexNow 密钥文件是否识别成功；
5. 发布本次更新后运行：

```bash
node scripts/submit-indexnow.mjs / products.html custom-boxes.html custom-rigid-boxes.html custom-magnetic-boxes.html custom-mailer-boxes.html cosmetic-packaging-boxes.html custom-wine-boxes.html custom-perfume-boxes.html about.html
```

### 3. Google Analytics 4

当前状态：已完成基础确认。`Glorystarpacking` 属性 Realtime 已收到页面和互动事件；`generate_lead` 已标记为关键事件。由于生产邮件环境变量尚未配置，当前不提交测试报价来制造该事件。

1. 登录与 `G-LYNMPWG9WK` 对应的 GA4 属性；
2. 在实时报告中允许网站 Analytics 后访问一次网站；
3. 验证 `page_view`；
4. 点击 Email、WhatsApp、询价按钮并测试表单；
5. 验证 `contact_click`、`quote_cta_click`、`quote_form_start` 和 `generate_lead`；
6. 将 `generate_lead` 标记为关键事件。

## 发布后由代码侧执行

```bash
node scripts/validate-site.mjs
node --check assets/site.js
node --check assets/analytics.js
node --check api/quote.js
node scripts/test-quote-api.mjs
node scripts/test-service-health.mjs
node scripts/validate-build-output.mjs
node scripts/audit-production-indexing.mjs https://glorystarpacking.com
node scripts/audit-production-shell.mjs https://glorystarpacking.com
node scripts/audit-production-image-sitemap.mjs https://glorystarpacking.com
node scripts/audit-production-contact.mjs https://glorystarpacking.com
node scripts/audit-production-services.mjs https://glorystarpacking.com
```

## 7 天后记录

- GSC 中 sitemap 的“已发现网页”数量；
- 上述 10 个核心 URL 的索引状态；
- Google 搜索结果是否已经换成当前标题和摘要；
- 非品牌曝光、点击和平均排名；
- Bing 已编入索引页面数；
- 自然搜索与 AI referral 带来的询价数。

没有 GSC 的页面级索引数据前，不继续批量增加文章。优先处理“已抓取但未编入索引”、旧摘要和有曝光但排名 8–20 的商业页。
