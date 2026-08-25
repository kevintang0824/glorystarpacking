# GloryStarPack 收录启动清单

更新日期：2026-08-25

## 当前已确认

- 正式域名 `https://glorystarpacking.com` 可访问；
- sitemap 内 60 个 URL 均直接返回 HTTP 200；
- 60 个 URL 的 canonical 与页面 URL 一致；
- 页面允许 `index,follow`；
- `www`、`/index.html` 正确跳转到规范首页；
- `robots.txt` 允许 Google、Bing 和 OAI-SearchBot 抓取；
- 搜索结果仍显示约三个月前的旧首页和旧产品页摘要，因此需要优先请求重新抓取核心 URL；
- 5 个 `* 2.html` 和 1 个 `site 2.webmanifest` 是本地完全相同的冲突副本，已通过 `.vercelignore` 阻止进入正式部署。

## 负责人现在需要完成

### 1. Google Search Console

1. 打开 <https://search.google.com/search-console>；
2. 新建“网域”资源：`glorystarpacking.com`；
3. 按 Google 提示在域名 DNS 中添加 TXT 验证记录；
4. 验证成功后打开“站点地图”，提交：`sitemap.xml`；
5. 依次使用“网址检查”检查并请求编入索引：
   - `https://glorystarpacking.com/`
   - `https://glorystarpacking.com/products.html`
   - `https://glorystarpacking.com/custom-boxes.html`
   - `https://glorystarpacking.com/custom-rigid-boxes.html`
   - `https://glorystarpacking.com/custom-magnetic-boxes.html`
   - `https://glorystarpacking.com/custom-mailer-boxes.html`
   - `https://glorystarpacking.com/cosmetic-packaging-boxes.html`
   - `https://glorystarpacking.com/custom-wine-boxes.html`
   - `https://glorystarpacking.com/custom-perfume-boxes.html`
   - `https://glorystarpacking.com/about.html`
6. 不要一天重复提交同一个 URL；Google 是否收录及何时更新摘要由 Google 决定。

### 2. Bing Webmaster Tools

1. 打开 <https://www.bing.com/webmasters/>；
2. 直接从 Google Search Console 导入站点，或使用 DNS 验证；
3. 提交 `https://glorystarpacking.com/sitemap.xml`；
4. 检查 IndexNow 密钥文件是否识别成功；
5. 发布本次更新后运行：

```bash
node scripts/submit-indexnow.mjs / products.html custom-boxes.html custom-rigid-boxes.html custom-magnetic-boxes.html custom-mailer-boxes.html cosmetic-packaging-boxes.html custom-wine-boxes.html custom-perfume-boxes.html about.html
```

### 3. Google Analytics 4

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
```

## 7 天后记录

- GSC 中 sitemap 的“已发现网页”数量；
- 上述 10 个核心 URL 的索引状态；
- Google 搜索结果是否已经换成当前标题和摘要；
- 非品牌曝光、点击和平均排名；
- Bing 已编入索引页面数；
- 自然搜索与 AI referral 带来的询价数。

没有 GSC 的页面级索引数据前，不继续批量增加文章。优先处理“已抓取但未编入索引”、旧摘要和有曝光但排名 8–20 的商业页。
