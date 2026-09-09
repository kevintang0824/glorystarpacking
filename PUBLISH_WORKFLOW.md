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
