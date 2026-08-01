# GloryStarPack 发布与备份流程

后续网站更新固定执行以下顺序：

1. 运行 `./scripts/create-local-backup.sh`，在仓库外生成完整 Git bundle；
2. 完成页面、SEO、GEO 与 AI 可发现性更新；
3. 运行站点静态校验、Quote API 回归、JavaScript 语法检查和 IndexNow dry run；
4. 直接提交并推送 GitHub `main`；
5. 等待 Vercel 自动部署，检查正式域名、站点地图和改动页面；
6. 向 IndexNow 提交新增或更新 URL；
7. 在 Google Search Console 重新提交站点地图，并为新增重点 URL 请求编入索引；
8. 发布成功后再次运行 `./scripts/create-local-backup.sh`，保留已上线提交的完整恢复包。

默认备份目录为相邻工作区的 `backups/glorystarpacking/`。需要更换目录时，可设置 `GLORYSTARPACK_BACKUP_DIR` 后再运行脚本。

Google 最终是否收录以及收录时间由 Google 决定；流程只负责确保页面可抓取、进入站点地图并提交抓取请求。
