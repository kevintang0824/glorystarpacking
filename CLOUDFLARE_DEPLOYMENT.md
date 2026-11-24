# Cloudflare Pages 部署

迁移状态（2026-11-24）：Pages 已上线并通过页面、健康接口、询盘校验和 AI 发现性检查。已登录 Namecheap 核对完整 DNS 记录；域名没有设置邮件转发别名，DNSSEC 关闭。已保存 Cloudflare nameserver，Cloudflare 区域已激活，裸域及 www 均已显示 Active / SSL enabled。通过 Cloudflare 新入口验证原主机名的 TLS：裸域健康接口 HTTP 200 且邮件配置齐全，www 保留原路径与查询参数 308 跳转到裸域，证书验证路径不被跳转。部分递归 DNS 缓存仍可能返回原 Vercel 地址，需等待缓存更新。当前发布提交以 `/api/health` 的 `release.commit` 为准。

自动同步状态：GitHub Actions 首次构建已通过。专用 Cloudflare API token 的创建和保存尚待用户确认，`CLOUDFLARE_PAGES_ENABLED` 仍未开启；当前 CI 只构建校验，不自动部署。原 Vercel GitHub 连接保留，但账号暂停导致部署检查失败。

生产项目：`glorystarpacking`，账号：`788c4780c84ff8837372a4dd08a5ec9f`。
Pages 地址：`https://glorystarpacking.pages.dev/`。
正式域名：`https://glorystarpacking.com/`。

Vercel 项目、域名绑定、环境变量及 GitHub 连接保留。`api/quote.js` 和 `api/health.js` 同时支持 Vercel 与 Cloudflare；默认环境参数仍为 Vercel 的 `process.env`。

## 发布

以后统一从本地修改、提交并推送 GitHub `main`。GitHub `main` 是发布版本，Vercel 由原 GitHub 集成部署，Cloudflare 由 `.github/workflows/cloudflare-pages.yml` 部署同一提交。直接在 GitHub 修改文件后，应先在本地拉取，再继续修改。

Cloudflare 自动部署配置：

- GitHub 仓库变量 `CLOUDFLARE_ACCOUNT_ID`：`788c4780c84ff8837372a4dd08a5ec9f`。
- GitHub 仓库加密 Secret `CLOUDFLARE_API_TOKEN`：专用 API token，只授予该账号的 Cloudflare Pages 编辑权限，不使用本地 OAuth 凭据。
- 仓库变量 `CLOUDFLARE_PAGES_ENABLED=true`：只在 API Secret 配置完成后开启。未开启时，工作流只构建校验，明确注明未部署。

工作流串行部署生产版本，并核对线上 `/api/health` 返回的 commit 与 GitHub commit 完全一致。Vercel 的部署结果独立显示，账号暂停时会失败，不影响 Cloudflare 部署。

发布后在本地核对：

```sh
node scripts/check-sync.mjs
```

紧急手动发布：

```sh
node scripts/deploy-cloudflare.mjs
node scripts/audit-production-services.mjs https://glorystarpacking.com
```

发布脚本在忽略的 `tmp/cloudflare-tools` 下安装固定版本 Wrangler，验证源站与邮件逻辑，生成只含公开文件的 `dist/cloudflare`，编译 Worker 并测试兼容层，最后上传至 Pages。`--build-only` 只做校验和构建，不上传。直接上传项目通过 GitHub Actions 实现自动发布，不依赖 Pages 原生 Git 集成。

首次在其他电脑发布时，使用 Wrangler 的正常登录流程登录同一账号。不要把 OAuth 凭据放入仓库、命令参数或 GitHub Actions。

## 文件和运行方式

- `scripts/build-cloudflare.mjs` 使用公开文件白名单，校验每份复制文件的 SHA-256；不发布 `.env`、API 源文件、文档、报告、原始产品图片或 Git 元数据。
- `scripts/compile-cloudflare-worker.mjs` 只在构建时适配 CommonJS 的 Node 内置模块导入，Vercel 源文件的格式保留。
- `cloudflare/worker.mjs` 复用现有询盘与健康接口，读取 `vercel.json` 中的重定向和安全响应头。
- HTML 页面保留原 `.html` 路径；语言首页保留 `/fr`、`/es`、`/pt`、`/ru` 和 `/zh-CN`。
- `/assets/*` 绕过 Functions，直接从 Pages 静态资源服务读取。其余请求由 Worker 处理，计入账号的 Workers/Pages Functions 额度；并非所有请求都属于免费不限量的静态资源请求。
- `/.well-known/acme-challenge/*` 也绕过 Functions 和 www 跳转，供 Cloudflare 签发及续期 HTTPS 证书；不要给此路径添加跳转、访问验证或拦截规则。
- 静态资源使用一天浏览器缓存；每次更新资源仍须按本站原规则更新内容版本参数。字体保留跨域响应头。
- `.pages.dev` 页面返回 `noindex, nofollow`，正式域名保留原页面收录规则。

## 邮件配置

Pages 的生产和预览环境均已配置以下三个加密 Secret：

```text
RESEND_API_KEY
QUOTE_FROM_EMAIL
QUOTE_TO_EMAIL
```

它们来自原 Vercel 生产环境，不复制 Vercel OIDC Token。`/api/health` 返回邮件配置是否齐全，不返回凭据。配置变更后重新部署才会作用于新版本。

## 域名和回退

使用裸域 `glorystarpacking.com` 接入 Pages，需要把权威 DNS 托管至 Cloudflare。切换 nameserver 前，必须核对全部 DNS 记录，特别是现有邮件转发 MX、SPF、域名验证和子域名记录。域名注册仍保留在原注册商。

Cloudflare 分配的 nameserver 为 `vera.ns.cloudflare.com` 和 `yadiel.ns.cloudflare.com`。2026-11-24 扫描得到 2 条网站 A 记录、5 条 Namecheap 邮件转发 MX、1 条 SPF TXT 和 1 条 Google 验证 TXT；网站记录在 Cloudflare 待激活区域已改为指向 `glorystarpacking.pages.dev` 的两条代理 CNAME。

注意：Namecheap 免费邮件转发要求使用其 DNS，单纯复制 MX 不能保证切换后转发继续工作。如果有实际使用的 `@glorystarpacking.com` 别名，应先记录别名和收件目标，并迁移至可用的邮件转发服务，再切换 nameserver。网站询盘本身的收件地址属于另一个域名 `glorystarpack.com`。

`www.glorystarpacking.com` 与裸域均需绑定同一 Pages 项目，网页访问从 `www` 308 跳转到裸域。原 Vercel 域名绑定保持，便于将来回退；回退前必须确认 Vercel 已解除暂停并且生产部署、询盘环境变量正常。
