# GloryStarPack 网站基线（2026-07-28）

> 本文记录压缩包导入时的原始线上状态。网站已在同日完成本地优化；当前实现与验证结果见 `OPTIMIZATION_REPORT.md`。

## 1. 版本身份

- 线上域名：`https://glorystarpacking.com/`
- GitHub 仓库：`PattyKremer/glorystarpacking`
- 默认分支：`main`
- 线上/压缩包对应提交：`47dc27f9e4cc593bb98304c49d848bbba9d26367`
- 原压缩包 SHA-256：`1d98062f9568f77fd571223e808c1ec04e945ece9960c6145c6761b38a32c7c8`
- 原压缩包：30,258 bytes；源码解压后：131,931 bytes
- 已确认：压缩包与 GitHub `main` 最新提交、当前线上首页一致

## 2. 源码结构

这是一个无构建步骤的纯静态英文网站，没有 `package.json`、框架、后端、数据库或环境变量。

| 文件 | 大小 | 用途 |
| --- | ---: | --- |
| `index.html` | 49,325 bytes | 首页、产品概览、FAQ、询价表单 |
| `custom-boxes.html` | 32,998 bytes | 定制包装盒产品页、询价表单 |
| `box-labels.html` | 33,000 bytes | 标签产品页、询价表单 |
| `blog.html` | 16,588 bytes | 品牌故事和文章列表 |
| `CNAME` | 20 bytes | GitHub Pages 自定义域名：`glorystarpacking.com` |

页面的 CSS 和 JavaScript 都内嵌在 HTML 中。字体从 Google Fonts 加载；图片全部使用 CSS 背景图，依赖阿里 CDN `sc02.alicdn.com`。

## 3. 内容与外部依赖

- 页面语言：英文
- 站点定位：B2B 高端定制包装盒和标签
- 公开联系方式：
  - Email：`kevin@GloryStarPack.com`
  - WhatsApp：`+86 18020755949`
- 独立阿里 CDN 图片：39 张
  - 首页引用 12 次
  - 包装盒页引用 14 次
  - 标签页引用 11 次
  - 博客页引用 6 次
  - 不同页面有少量重复图片
- Google Fonts：Montserrat 300–800

## 4. 当前线上基础设施

当前不是目标图中的 Vercel + Cloudflare 架构。

```text
Namecheap（注册商 + 权威 DNS）
  └─ GitHub Pages / Fastly（网站托管与分发）
       └─ PattyKremer/glorystarpacking@main
```

验证依据：

- HTTP 响应头：`server: GitHub.com`
- Apex 域名 A 记录：
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www` CNAME：`pattykremer.github.io.`
- 权威 NS：
  - `dns1.registrar-servers.com.`
  - `dns2.registrar-servers.com.`

当前 Namecheap 邮件转发记录必须在迁移 DNS 时完整保留：

- MX：
  - 优先级 10：`eforward1.registrar-servers.com.`
  - 优先级 10：`eforward2.registrar-servers.com.`
  - 优先级 10：`eforward3.registrar-servers.com.`
  - 优先级 15：`eforward4.registrar-servers.com.`
  - 优先级 20：`eforward5.registrar-servers.com.`
- SPF TXT：`v=spf1 include:spf.efwd.registrar-servers.com ~all`
- 未发现 `_dmarc` TXT 记录

## 5. 目标部署架构

按用户提供的图片，目标应为：

```text
Namecheap（仅保留域名注册）
  └─ Cloudflare（权威 DNS；按需要提供安全与加速）
       ├─ Vercel（网站生产托管）
       │    └─ GitHub main（源码与自动部署）
       └─ assets.glorystarpacking.com
            └─ Cloudflare R2（39 张站点图片及以后媒体）
```

说明：

- GitHub 是源码中心，不再作为正式生产托管。
- Vercel 连接 GitHub，`main` 分支自动发布生产版本，其他分支/PR生成预览。
- Cloudflare 接管权威 DNS 前，必须先复制现有 A/CNAME/MX/TXT 记录，尤其不能漏掉 Namecheap 邮件转发记录。
- Vercel 域名首次验证和签发证书时，网站记录先使用 DNS Only（灰云）最稳妥；确认 Vercel 域名、HTTPS 和跳转正常后，再决定是否开启 Cloudflare 代理。
- R2 正式图片建议走自定义域名 `assets.glorystarpacking.com`，不使用仅供开发的 `r2.dev` 地址。
- 切换至 Vercel 后，仓库中的 GitHub Pages `CNAME` 文件应移除，并在 GitHub 仓库设置中关闭 Pages，避免两套生产发布链路并存。

## 6. 推荐的无停机部署顺序

1. 在 GitHub 确认仓库控制权、分支保护和可回滚提交。
2. 将仓库导入 Vercel；先用 `*.vercel.app` 预览域名验收全部页面。
3. 补齐表单、移动端、SEO 和资源迁移问题，再进行生产构建验收。
4. 在 Vercel 添加 `glorystarpacking.com` 与 `www.glorystarpacking.com`，但暂不切换公网 DNS。
5. 在 Cloudflare 添加域名并审查自动扫描到的 DNS；手动补齐 5 条 MX 和 SPF TXT。
6. 在 Namecheap 把权威 NS 改为 Cloudflare 分配的 NS。
7. Cloudflare 激活后，把网站 A/CNAME 改为 Vercel 项目要求的当前值，先设为 DNS Only。
8. 验证 Apex、`www` 跳转、HTTPS、所有页面、询价链路与邮件转发。
9. 创建 R2 bucket，绑定 `assets.glorystarpacking.com`，迁移 39 张图片并替换 HTML URL。
10. 验证缓存与图片后，关闭 GitHub Pages、移除 `CNAME`，保留 GitHub 作为源码中心。

Vercel 域名界面给出的记录值是最终依据，不应在执行时照抄过期示例值。

## 7. 发布前必须处理的问题

### P0：询价表单目前不会发送数据

三个产品/首页表单都没有 `action`、提交接口或 JavaScript 提交逻辑；字段也没有 `name`。用户点击 “Send Request” 时，询盘不会发送到邮箱或后台，上传文件同样不会被接收。

需要选定接收方案，例如 Vercel Function + 邮件服务/CRM，并加入成功、失败、防垃圾和隐私提示。

### P1：移动端导航不完整

- 首页在窄屏直接隐藏导航，没有汉堡菜单替代。
- 三个子页面缺少等效的移动端导航处理，可能出现拥挤或横向溢出。

### P1：SEO 基础不完整

已有每页独立 `<title>` 和 meta description，但缺少：

- canonical
- Open Graph / Twitter Card
- favicon / web app 图标
- `robots.txt`
- `sitemap.xml`
- 结构化数据
- 搜索统计/分析配置

首页轮播包含 3 个 `<h1>`，建议调整为单一主标题结构。

### P1：图片资产受第三方 URL 控制

39 张图片目前均由 `sc02.alicdn.com` 提供，仓库内没有原始图片。第三方 URL 失效、限速或防盗链都会直接造成页面缺图。迁移至 R2 前应下载原图、校验格式与尺寸、统一语义化文件名，并保留源文件备份。

### P2：博客入口多为占位链接

多处 “Read More / Read Full Entry” 指向 `#`，没有独立文章页。

### P2：维护成本偏高

四个 HTML 文件分别复制了导航、页脚、样式和表单。后续改联系方式或全局样式时容易漏改。可以继续保持静态站，但建议拆分公共 CSS/JS；若内容增长明显，再考虑静态站生成器。

## 8. 后续更新的验收清单

- 桌面与手机端：首页、包装盒、标签、博客 4 页
- 所有内部链接、WhatsApp、邮件链接
- 3 个询价表单的真实提交、附件、成功/失败状态
- Apex 与 `www` 的唯一主域跳转
- HTTPS 与证书
- Namecheap 邮件转发
- 39 张图片无 404，R2 自定义域名和缓存正常
- PageSpeed/Core Web Vitals
- canonical、sitemap、robots、结构化数据
- GitHub → Vercel 自动预览与生产发布

## 9. 官方参考

- Vercel 自定义域名：https://vercel.com/docs/domains/set-up-custom-domain
- Vercel 从 Cloudflare 迁移/配合 DNS：https://vercel.com/kb/guide/migrate-to-vercel-from-cloudflare
- Cloudflare Full DNS setup：https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
- Cloudflare R2 公共 bucket 与自定义域名：https://developers.cloudflare.com/r2/buckets/public-buckets/
- GitHub Pages 自定义域名：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
