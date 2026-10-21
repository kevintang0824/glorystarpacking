# GloryStarPack 发布与备份流程

后续网站更新固定执行以下顺序：

1. 运行 `./scripts/create-local-backup.sh`，在仓库外生成完整 Git bundle；
2. 完成页面、SEO、GEO 与 AI 可发现性更新；
3. 运行站点静态校验、Quote API 与服务健康回归、JavaScript 语法检查、IndexNow dry run 和 `node scripts/audit-ai-discovery.mjs`；
4. 直接提交并推送 GitHub `main`；
5. 等待 Vercel 自动部署，检查正式域名、站点地图和改动页面；
   - 运行 `node scripts/audit-production-services.mjs`，确认询盘邮件环境变量没有遗漏；
6. 向 IndexNow 提交新增或更新 URL；
7. 在 Google Search Console 重新提交站点地图，并为新增重点 URL 请求编入索引；
8. 发布成功后再次运行 `./scripts/create-local-backup.sh`，保留已上线提交的完整恢复包。

第四阶段额外记录：

- 真实合作方、外部引用 URL、引用上下文和检查日期写入 `assets/templates/phase-4-outreach-tracker.csv`；
- AI 搜索抽查必须保留入口、提示词、地区/语言、结果状态、引用 URL 和准确性，写入 `assets/templates/ai-search-visibility-log.csv`；
- 每周将 GSC、Bing、GA4、referral 和 AI 观察汇总到 `assets/templates/seo-weekly-review.csv`，只根据真实数据决定标题、内链和 CTA 的下一轮调整；
- 外部引用和 AI 提及均不得用未核验的客户、认证、结果数字或排名替代证据。

默认备份目录为相邻工作区的 `backups/glorystarpacking/`。需要更换目录时，可设置 `GLORYSTARPACK_BACKUP_DIR` 后再运行脚本。

Google 最终是否收录以及收录时间由 Google 决定；流程只负责确保页面可抓取、进入站点地图并提交抓取请求。

## 每日搜索数据的资源与加载校验

`glorystarpack.com` 与本站 `glorystarpacking.com` 是两个独立资源。每次读取平台报告前，先确认资源，再确认报告主体已加载完成；浏览器地址改变、旧页面残留和空白内容区都不能作为新读数。

- GSC：必须显示 `sc-domain:glorystarpacking.com`，并有对应资源的报告标题、日期区间及查询/网页/索引/站点地图内容。
- Bing Webmaster Tools：站点选择器须为 `glorystarpacking.com/`，记录具体日期区间及站点地图状态。出现空白页时先等加载完成，再刷新或从站点菜单重新进入；浏览器网络错误与平台接口失败应单独记录，不推断为站点故障或账号过期。
- GA4：媒体资源须为 **Glorystarpacking**（ID `548891831`），网站数据流测量 ID 为 `G-LYNMPWG9WK`，与本站页面代码一致。**Glorystarpack**（ID `548854103`）属于另一站，不能混算。GA4 页面浏览/事件不是已送达的合格询盘。
- 每条读数写明平台、资源、时间范围、报告更新时间和指标口径。资源切换后若出现旧内容、加载指示或空白，先做一次独立的页面内容核验；无法恢复时使用注明日期的上次可靠读数，并明确本次缺失。不要把不同日期区间的总数直接比较为增长。
