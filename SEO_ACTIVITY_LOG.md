# GloryStarPack SEO 运营日志

## 2026-10-28 · GSC 复核、Reddit 需求对照与平台会话检查

- GSC 正确资源 `sc-domain:glorystarpacking.com`，Web 搜索近 28 天（2026-09-28 至 2026-10-25，界面上次更新约 4 小时前）：1,839 展示、9 点击、CTR 0.5%、平均排名 16.2。高展示页面包括纸管尺寸指南 140/1、纸厚度换算 163/0、瓦楞运输箱规格指南 102/2、折叠纸盒产品页 108/0、透明标签白墨指南 65/1、首页 64/1。正确资源索引报告上次更新 10-23：83 已索引、385 未索引（其中 380 主动 noindex、4 自动重定向、1 已抓取未索引）；Sitemap 10-27 成功，84 网页/0 视频。
- 本轮 Chrome 当前配置访问 GSC 正常，但 Bing 首页要求 Sign In，GA4 进入“欢迎使用 Google Analytics / 开始衡量”配置页，Semrush 跳到 `dash.3ue.com/zh-Hans/#/login` 登录页。后三者今日没有有效站点/属性数据；只保留历史报告日期，不据此报告零流量/零询盘。需要在具备这些服务登录会话的 Chrome 配置中重新打开。GA4 必须先确认 `Glorystarpacking` 属性 548891831 与测量 ID `G-LYNMPWG9WK`。
- Reddit 讨论提到外箱尺寸/DIM 运费、过度包装与储存、对小批次在 stock structure 上定制图稿、定稿前确认 dieline，以及按目标市场评估整包可回收性。已检查 dimensional-weight 指南、成本/MOQ 指南及 RFQ 模板，均有相应测量、完整到岸成本、MOQ、样品、规格和供应商报价覆盖；站内主题无实质缺口，不发布重复页面或为了日更调整文案。未发帖/私信。
- 外链候选 Packaging Strategies、Global Packaging Network、PackWow 沿用 10-27 核验状态；未联系、未投稿或获得新链接。生产 AI discovery audit 通过，含 `llms.txt`、RSS、Sitemap 等发现端点正常；不能据此声称 AI 推荐/引用增长。
- 工作区初始干净，HEAD 与 `origin/main` 同为 `fd1b8f7f`。正式首页及纸卡尺页 HTTP 200，询价 `/api/health` HTTP 200 且邮件服务已配置；生产索引、图片 Sitemap、服务和 AI discovery audits 全通过。无内容变更，本轮不部署、不重复提交 Sitemap/IndexNow；GSC 上次提交仍成功（10-27），不把提交当作收录结果。
- 下一步先恢复 Bing、GA4、Semrush 登录后补取站点报告；GSC 优先追查纸厚度页与折叠纸盒页的查询明细、市场和 CTR，再决定是否改标题或页面。详情见 `SEO_RESEARCH_20261028.md`。

## 2026-09-19 · GSC/GA4 实际事件复核与跨域实体回链

### 数据源与基线

- 使用用户指定的 Search Console Domain property `sc-domain:glorystarpacking.com`，Web 搜索最近完整 28 天（2026-08-20 至 2026-09-16）：1,120 次展示、7 次点击、CTR 0.6%、平均排名 13.9。查询样本包括 `gsm to mm`（40 展示、0 点击）、`mm to gsm converter`（10 展示、2 点击）、`packaging approval workflow`（7 展示、0 点击）和 `flat-pack rigid box packaging`（8 展示、0 点击）；样本量不足以据此承诺增长，也不对未核实的查询—页面映射做推断。
- 使用 GA4 `Glorystarpacking` 属性 ID `548891831`，最近 28 天共 470 个事件、10 位活跃用户；事件列表显示 `contact_click` 1 次、GA 自动表单事件 `form_start` 5 次/3 位用户、`form_submit` 13 次/3 位用户。未见 `quote_form_start` 或 `generate_lead` 事件，关键事件报表为 0。
- `generate_lead` 已在 GA4 标记为关键事件，但过去 28 天未检测到该事件的活跃数据流。代码只在询价 API 成功响应后派发 `generate_lead`；`contact_click` 带 `contact_method` 参数。两类事件均遵守现有分析同意机制：默认拒绝，访客选择允许后才加载分析脚本并发送事件。`form_submit` 属于 GA 自动测量，不能单独证明 RFQ 已被邮件系统接受；本轮没有提交虚假询价或制造 lead 数据。
- 报告概况仅有 1 位 Google organic 活跃用户；考虑到分析需访客主动同意及当前流量规模，不能把 GA4 报告直接当作完整站点访问量或市场需求。

### 已完成与待补证据

- 在玻璃瓶站英文首页 Company 页脚加入指向 `https://glorystarpacking.com/` 的明确纸包装入口，锚文本覆盖 custom paper packaging、boxes、bags、inserts 和 labels；法、西、葡、俄、简体中文首页同步本地化链接。提交 `9b1a9504` 已部署到 Vercel Production 并显示 Ready；`node scripts/check-live-site.mjs` 通过，站点核验 844 个 Sitemap URL 和关键页面；英文及 5 个本地化首页均返回 HTTP 200 且包含目标回链，纸包装目标域名返回 HTTP 200。
- 检查本地 `factory-printing-floor.jpg`：图像本身无法证明拍摄来源、所属工厂或真实生产批次，因此不将它用作工厂证据，也未新增未核验的生产、打样或 QC 记录。
- 下一步：仅使用用户提供且获授权公开的真实车间/打样照片、脱敏样品批准或 QC 记录、以及可公开核验的证书链接；为 GA4 报表注册事件级 `contact_method` 自定义维度（如尚未存在），然后在访客已同意且出现真实联系动作后核对 Email/WhatsApp 分布。成功询价继续以服务器接受的 `generate_lead` 为准，不使用自动表单 `form_submit` 代替。

## 2026-09-19 · SEO 技能包页面标题与采购意图复核

### 本轮完成

- 按 SEO 技能包的“核心词 + 买家意图 + 品牌”结构，更新行业页、包装测试记录指南、RFQ 模板、质量检查清单和食品包装可行性参考页的英文 SEO Title、Open Graph/Twitter 标题及对应 JSON-LD 名称/标题。
- 对行业页和食品包装可行性参考页同步 `dateModified`；文章页保留原有可见发布日期与更新时间一致，重新生成 `sitemap.xml` 与 `feed.xml`，保持搜索与 RSS 发现信号一致。
- 保留现有能力边界：没有新增未经确认的玻璃瓶/泵头产品能力、MOQ、认证、产能、价格或交期声明；多语言页面继续遵守母语人工审核后才开放收录的闸门。

### 校验

- 78 个英文可收录页面的核心 SEO 标签、canonical、H1、JSON-LD、FAQ、内链和资源校验继续通过；除隐私页外，Title 均落在约 45–65 字符范围内。
- RSS feed 37 条内容与文章结构化数据一致，sitemap 保持 78 个可收录 canonical URL。

### 本轮 GSC 证据与低 CTR 摘要试验

- Search Console（Web，2026-08-20 至 2026-09-16）显示 `paper-thickness-gsm-pt-mm-conversion-guide.html` 获得 764 次展示、3 次点击、CTR 0.39%、平均排名 8.68；`gsm to mm` 有 40 次展示/平均排名 3.83，`gsm to mm converter` 有 15 次展示/平均排名 6.53，均为 0 点击。
- 仅调整该英文可收录页的 Title、Meta Description、Open Graph、Twitter 与 BlogPosting headline/description，使摘要直接回应 “GSM to mm” 意图并明确 GSM 不可直接换算；工具仍只做 pt/mm/µm/inch 厚度单位换算，没有增加不实换算承诺。正文、可见发布日期、`dateModified` 与 Sitemap 未改；RSS 条目标题/摘要已同步。
- 预期影响：提高上述高排名查询的结果相关性与点击率，同时保留采购规格边界；不承诺排名或流量增长。GA4/询盘来源数据本轮未通过已连接的数据源取得，故不推断转化变化。
- 本地站点/语言审计、RFQ API、安全/语言运行时/移动导航测试、JavaScript 语法、Sitemap/RSS/Image Sitemap 检查均通过；Vercel production build 与输出校验通过（4,624 个公开文件、474 个 HTML、2 个 API handler）。生产索引 78/78、联系入口 78/78、AI 发现审计均通过；生产图片 Sitemap 首次遇到临时抓取失败，重试后 37/37 主图通过。
- RFQ API 单元测试通过；生产 `/api/health` 仍为 HTTP 503，因为 quote email 未配置，且 `Cache-Control: no-store` 正常。本轮不改外部邮件凭据；Email/WhatsApp/电话直达仍可用。
- Vercel production deployment `dpl_EUwp5avidSZBwo78TbnGBszQ7696` 已 READY 并绑定正式域名；目标页线上 HTTP 200，Title、Description 与 canonical 匹配。部署后复审：索引 78/78、联系入口 78/78、图片 Sitemap 37/37、AI discovery 均通过。
- 下一步：在 GSC 可用下一轮完整 14/28 天窗口比较目标查询点击与 CTR，并结合合格询盘数据决定保留或回滚；邮件询价自动投递仍需用户提供并配置 Resend/收件邮箱凭据后再处理。

## 2026-09-17 · 历史搜索入口迁移与发布门禁修复

### 今日唯一主任务

恢复仍有历史搜索流量的失效文章入口，同时避免把玻璃瓶、泵头和容器兼容性意图错误导向当前纸包装站的无关页面。

### 已完成

- 强化 `llms.txt` 的报价与直接联系段落，明确机器可读的询价入口、`kevin@GloryStarPack.com`、WhatsApp 和表单失败后的复制回退，并明确不承诺自动邮件投递、固定回复时效、价格、MOQ 或交期；
- 为 4 个历史 URL 的带与不带尾部斜杠版本配置永久 308 重定向，逐一转到关联容器包装站上主题完全一致且在线的新版文章：瓶口/闭合件、化妆品包装兼容性测试、化妆品泵故障排查、无障碍化妆品包装设计；
- 将这 4 条迁移规则纳入本地静态校验和生产索引审计，后续删除或改错目标会在发布前或发布后被发现；
- 修正 Build Output 校验对 macOS `.DS_Store` 系统元数据的误报，保留对业务资源、HTML、函数和静态文件的完整性哈希校验；
- 通过 `vercel build --yes`、站点静态校验、Build Output 校验、AI 发现审计、JavaScript 语法和差异检查；生产发布后索引、联系方式和图片 Sitemap 审计同样通过。
- 只读复核正式站 78 个 Sitemap 页面：每页均保留 `mailto:kevin@GloryStarPack.com`、当前 WhatsApp 与电话入口；同时确认没有旧手机号、错误域名或失效内部 HTML 链接。

### 发布与转化边界

- 已部署到正式域名 `https://glorystarpacking.com/`；生产审计确认 78 个 Sitemap 页面可收录、390 个翻译页继续处于 `noindex` 审核门槛，4 个历史文章入口均按预期永久迁移；
- 按当前阶段要求暂不配置邮件转发或 Resend。全站页面已有普通 `mailto:kevin@GloryStarPack.com` 直接联系入口，询价表单无法自动投递时也会保留 Email、WhatsApp 和复制需求书渠道；
- 已核实 Vercel Production 环境没有任何环境变量，`/api/health` 因而返回 503。该状态属于暂缓的自动邮件能力，不影响客户直接点击邮箱联系。

## 2026-09-09 · 第一轮流量入口与内容集群优化

### 今日唯一主任务

在不盲目改写已有商业页面标题的前提下，增加首页、产品目录和行业页到高意向内容的内部发现路径，并把每周数据复盘固定下来。

### 已完成

- 首页新增 4 篇第三阶段内容的采购入口，分别连接供应商资格审核、开发证据链、测试记录和美妆包装指南；
- 产品目录新增供应商资格审核与测试记录的上下文链接，把产品浏览连接到报价前的证据准备；
- 行业页新增美妆行业采购指南与供应商审核入口；
- Buyer Guides 页 Title、Meta Description、Open Graph 和 Twitter 摘要改为明确覆盖 RFQ、testing、supplier qualification、sampling、quality 和 delivery 等采购意图；
- 新增 `assets/templates/seo-weekly-review.csv`，统一记录 GSC、Bing、GA4、referral 和 AI 观察，避免在没有真实查询数据时臆测标题或排名收益。

### 验证边界

- 本轮没有伪造 GSC 查询、排名、流量或转化数字；
- 新增链接继续使用现有可收录页面和真实指南，不新增薄内容页面；
- 下一轮标题、摘要和 CTA 调整必须基于至少 28 天的曝光、点击、CTR、平均排名和有效询盘数据。

## 2026-09-09 · 第四阶段站外引用、合作推广与 AI 搜索可见性

### 今日唯一主任务

建立真实外部引用、合作内容和 AI 搜索观察的可追踪执行闭环，不虚构合作方、反向链接、AI 推荐或搜索排名。

### 已完成

- 新增 `PHASE_4_OFFSITE_AI_PROGRAM.md`，明确外链质量边界、合作资产、英文外联模板、UTM 规则、AI 提示词抽查和月度复盘标准；
- 新增站外合作追踪模板 `assets/templates/phase-4-outreach-tracker.csv`，记录目标、联系人角色、拟提供资产、外部放置 URL、链接属性、归因和引用复核日期；
- 新增 AI 可见性记录模板 `assets/templates/ai-search-visibility-log.csv`，预置 12 个采购、供应商审核、测试、行业和盒型比较提示词；
- `llms.txt` 增加引用规则，要求外部内容引用最具体的页面，并区分公开身份、供应商陈述、买家输入、样品证据和项目结果；
- 新增 `scripts/audit-ai-discovery.mjs`，检查 robots、Sitemap、图片 Sitemap、RSS、llms.txt 和四篇第三阶段文章的机器可发现性。

### 真实性边界与下一步

- 本轮没有伪造任何站外链接或合作结果；真实合作方和公开引用必须在获得许可后回填追踪表；
- AI 可见性审计只能证明公开源文件可抓取、可解析和可归因，不能替代不同入口、地区和登录状态下的人工回答抽查；
- 下一步按每周 5 个外联目标、每周 12 个提示词抽查、每月一次引用与询盘复盘执行；
- 外部引用带来的访问和 `generate_lead` 事件，以 GA4、GSC、Bing 和追踪 URL 的真实数据为准。

## 2026-09-09 · 15 个高商业价值页面的企业与产品证据

### 今日唯一主任务

让重点商业页直接说明供应主体、公开核验入口和买家可要求的订单证据，增强搜索结果、AI 摘要和采购决策中的可信度，同时避免虚构数字。

### 已完成

- 优化 15 个重点页：首页产品目录、包装盒总页、硬盒、磁吸盒、抽屉盒、邮寄盒、化妆品盒、香水盒、酒盒、珠宝盒、纸袋、折叠纸盒、瓦楞运输箱、内托和产品标签；
- 每页新增买家证据包，明确 Xiamen GloryStar Packaging Co., Ltd.、厦门所在地、关联包装站和 Alibaba 公司主页；
- 明确四类可在项目中约定的记录：批准样、材料或证书、生产照片或视频、装箱与出货记录；
- 把证据模块连接到样品批准清单和质量检查记录工具，形成商业页到验证流程的内部链接；
- `llms.txt` 新增公司实体、公开交叉核验入口、产品参考边界和证据类型，方便搜索与 AI 系统读取；
- 5 种语言同步生成对应内容，但继续保持 `noindex,follow`，未经母语整页审核不开放收录；
- 主 Sitemap 与图片 Sitemap 仅更新本轮实质变更页面的 `lastmod`。

### 真实性边界

- 没有新增固定 MOQ、报价时效、量产周期、产能、认证、客户名称、节省比例或效果保证；
- 页面图片和目录参考只证明可见结构与工艺方向，不替代最终尺寸、材料、颜色、性能、装箱或合规确认；
- 公司主体与所在地使用站内公开信息，并链接到关联官网和 Alibaba 主页供买家交叉核对。

## 2026-09-09 · 第一阶段账号侧收录与分析闭环

### 今日唯一主任务

完成技术 SEO 第一阶段的 GSC、Bing、GA4 账号侧确认，并把结果回写到审计记录。

### 已完成

- 生产技术审计复跑通过：74 个英文页面允许收录，370 个未审核翻译页保持 `noindex,follow`，canonical、robots、JSON-LD、sitemap、图片 sitemap、资源版本和公开构建完整性一致。
- Bing Webmaster Tools 已通过 GSC 只读导入准确域名 `https://glorystarpacking.com/`。
- `https://glorystarpacking.com/sitemap.xml` 已提交并显示 `Success`，发现 74 个 URL，错误 0、警告 0。
- GA4 属性 `Glorystarpacking` 的 Realtime 已显示活跃用户和 `page_view`、`user_engagement`、`first_visit`、`session_start`；`generate_lead` 关键事件开关已确认开启。
- 未提交测试报价，也未伪造 `generate_lead`；生产自动邮件仍等待 Vercel 配置 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL`。

### 下一步

- 等待 Bing/Google 后续抓取窗口，再记录 Sitemap discovered、索引数量、非品牌查询、曝光、点击、CTR 和平均排名。
- 配置真实邮件环境变量后，使用真实测试收件地址完成一次询价投递验收；在此之前保留 Email、WhatsApp、电话和复制需求书兜底。

## 2026-09-08 · 高意向产品页的地域与制造商语义

### 今日唯一主任务

让硬盒和邮寄盒两个核心商业页更直接匹配 “manufacturer in China” 型采购搜索，同时只使用已公开可核验的厦门公司所在地。

### 已完成

- 实时搜索结果抽查显示，当前相关结果页普遍在标题和首屏同时说明具体产品、制造商角色和中国所在地；
- `custom-rigid-boxes.html` 与 `custom-mailer-boxes.html` 的标题补充 `Manufacturer in China`，长度仍控制在常见结果标题范围内；
- 两页首屏说明补充位于中国厦门的包装团队，并继续把结构、产品适配、打样、工艺与交付作为可执行采购信息；
- 同步更新 Open Graph、Twitter 标题、主 Sitemap 与图片 Sitemap 的真实修改日期；
- 五个语言版本同步了新首屏文案，但继续保持 `noindex,follow`，不会因本次英文 SEO 调整自动开放收录；
- 生产索引审计扩展为同时核对所有未审核翻译页：必须直接返回 HTTP 200、自 canonical、`noindex,follow` 且不发布 head `hreflang`。

### 边界

- 没有添加竞争页常见但本站尚无可核验证据的 MOQ、报价时限、成立年限、厂房面积、设备数量、认证或客户数字；
- 标题调整需要上线后结合 Search Console 的页面曝光、查询、平均排名与 CTR 观察至少 28 天，不能从一次结果页抽查宣称排名提升。

### 生产验收

- 正式部署 `dpl_6XptJLQ6zR6woJRdrB6AcfHnQCn4` 已完成并绑定 `https://glorystarpacking.com`；
- 74 个 Sitemap URL 可收录，370 个未审核翻译内容页在正式站保持 `noindex,follow`，语言 Sitemap 与审核白名单一致；
- 75 个公开英文页面外壳、37 张主图、联系方式与本地已验证版本一致；
- 首页、About、包装盒、硬盒和邮寄盒共 5 个实质更新 URL 已由 IndexNow 接受；
- 自动邮件服务仍因正式环境缺少 Resend 配置返回 503；页面的 Email、WhatsApp、电话和复制需求书兜底保持可用。

## 2026-09-07 · 多语言收录质量闸门

### 今日唯一主任务

阻止未经母语人工校对的批量翻译页面被搜索引擎当作正式落地页收录，同时保留访客切换语言和后续逐页放行的能力。

### 发现

- 对首页、产品目录和硬盒页的五种译文抽查发现多处商品术语误译与英语残留；例如抽屉盒、瓦楞邮寄盒、特种纸等核心采购词在部分语言中失真；
- 该问题会削弱买家理解和站点内容质量，不能仅凭页面结构完整或翻译文件存在就批量声明为可收录版本；
- 现阶段没有对应语言的母语整页审校记录，因此不把任何翻译页标记为已审核。

### 已完成

- 新增 `translations/indexing.json` 作为唯一人工审核白名单，默认不放行任何非英语页面；
- 5 种语言共 370 个非英语内容页继续可访问、可切换语言并保留自身 canonical，但统一改为 `noindex,follow`；另有 5 个本地化 404 页面同样不可收录；
- 未审核翻译页不再输出搜索用途的 `hreflang`，英文页只保留英语与 `x-default`；
- `sitemap-languages.xml` 只生成白名单内页面，当前为空；以后逐页审核后会同步生成 robots、双向 `hreflang` 和 Sitemap；
- 多语言校验器新增 robots、审核白名单、`hreflang` 和语言 Sitemap 一致性检查，避免后续构建绕过质量闸门；
- 450 个页面的结构、媒体、链接、表单、资源版本和索引规则，以及 4,595 个公开构建文件和两个 API handler 均通过本地回归。

### 边界与下一步

- 该闸门不会修复译文；下一步应优先选择真实有需求的市场，每次只审校首页、产品目录和 3–5 个对应商业页；
- 每个页面必须完成标题、正文、行业术语、表单、图片替代文字、FAQ 与结构化数据的母语审核，才能写入白名单；
- 正式站已完成 `noindex` 发布与生产索引审计；后续需在 Search Console 确认这些翻译 URL 逐步进入“已排除”而非“已编入索引”状态。

## 2026-09-07 · 公司实体统一与跨域品牌关系

### 今日唯一主任务

减少 `glorystarpacking.com` 与 `glorystarpack.com` 共用品牌、销售邮箱和电话却缺少明确实体关系造成的买家疑问与搜索实体割裂。

### 已完成

- 首页 Organization 结构化数据补充公司注册英文名、厦门/福建/中国所在地、服务范围和中英文联系能力；
- 使用 `sameAs` 明确关联同公司运营的玻璃瓶与容器包装站，以及阿里巴巴公司主页；
- About 页公开展示公司主体、所在地、当前站点业务边界和两个可核验的关联入口；
- About 页的公司作者实体嵌入同一母公司标识，避免指南作者与实际经营主体脱节；
- WebSite 实体名称调整为 `GloryStarPack Custom Packaging`，与同品牌玻璃瓶站区分；
- 公司身份说明同步到法语、西班牙语、葡萄牙语、俄语和简体中文版本。

### 边界与下一步

- 本轮只发布已在现有官方站点公开的公司主体、所在地和联系方式，不新增无法核验的认证、年限、产能、客户或交付承诺；
- 仍需在 `glorystarpack.com` 增加对 `glorystarpacking.com` 的反向关联，形成双向实体确认；
- 仍需补充有使用权的工厂实拍、脱敏 QC/样品批准记录及可公开证书核验链接；
- Vercel 生产环境的 Resend 邮件配置仍是 P0，代码兜底不能替代真实自动投递。

## 2026-08-21 · 询盘恢复路径与首屏资源优先级

### 今日唯一主任务

减少高意向询盘在附件或投递失败时的流失，并释放移动端首屏关键带宽。

### 已完成

- 26 个询盘表单在附件超过 3 MB、格式不支持或本地读取失败时，直接展示 Email、WhatsApp 和复制需求书的恢复路径；
- 恢复面板把焦点移到首个可操作渠道，明确提醒买家手动重新添加图稿；剪贴板不可用时提供已选中的只读需求书文本；
- 所有附件字段在提交前提示：较大文件与 AI 等源文件可在发送需求书后通过 Email 或 WhatsApp 补充；
- 26 个原生无 JavaScript 表单增加受控来源路径；失败页返回原产品表单，预填直接联系渠道，并提供经过 HTML 转义的完整只读需求书；
- Email 与 WhatsApp 的直达 URL 限制为 1,900 个编码字符，长需求书明确标记精简，复制功能始终保留全部字段与归因；
- 7 篇产品意图明确的指南共 14 个询盘 CTA 改为对应产品页表单，避免落入产品未选择的通用首页表单；
- Resend 的 2xx 响应增加 JSON 与邮件 ID 校验，避免供应商异常响应在邮件可能已接受后触发未处理错误；
- `QUOTE_TO_EMAIL` 改为必填，不再静默回退到硬编码收件人；API 拒绝非 JSON/URL-encoded 媒体类型，并移除邮件主题字段中的 CR/LF；
- 首页移动端不再抢先下载首屏下方的 54,574 B 展示图：桌面仍预加载，移动端使用原生延迟加载和低优先级；
- 首页 36,064 B 次级工艺图同样改为原生延迟加载，避免移动端首屏无条件下载；
- 61 页保留 Bodoni Moda 标题字体预加载，移除 Manrope 正文字体预加载，让正文按 CSS 实际需要加载；
- 10 张高复用首图增加 AVIF 与 WebP 后备，覆盖 32 页，按页面复用次数预计累计减少 1,090,887 B 图片传输；
- 33 张卡片源图生成 512px 与 768px WebP，共 66 个派生文件；97 张产品卡和 30 张文章卡通过 `srcset/sizes` 按实际显示宽度选择资源；
- 9 张高复用卡片图再增加 512px/768px AVIF，共 18 个派生文件并覆盖 53 张卡片；浅色包装测试出现体积倒退，因此继续使用 WebP；
- 80 张同构 split 正文图复用现有 512px/768px/1024px 资源；79 张按密度选择 AVIF，浅色包装只在 DPR≥2.5 时使用更小的 1024px AVIF；
- 另有 63 张正文图直接复用现有 512px/768px/1024px WebP：覆盖 33 个 split、21 个 material card、7 个 finish card、1 个 article feature 与 1 个 proof frame；
- `site.css`、`site.js` 与 `analytics.js` 继续使用一年 immutable 缓存，但查询版本改由文件 SHA-256 内容摘要生成；静态与构建门禁会阻止资源字节已变化、页面版本仍陈旧的发布；
- 桌面切换到移动导航时，若焦点将落入 `inert` 抽屉，会安全返回菜单按钮；反向切回桌面不强制移动焦点；
- 249 个新标签页链接在保留可见文案的同时，为读屏补充 “opens in a new tab” 提示；
- Resend 拒绝请求时只记录 HTTP 状态，不再把可能包含买家邮箱的供应商错误正文写入日志；
- 询盘原生校验会持续标记全部无效字段并报告剩余数量；失败兜底操作的最小触控高度由 40px 提升到 44px；
- 19 个产品表单中必填的尺寸字段不再被移动到默认关闭且标为 Optional 的区域；26 个表单在提交前显示必填说明与不会被读屏重复朗读的星号；
- API 在解析正文和调用邮件服务前拒绝明确的跨站浏览器请求，同时保留同源预览和缺少 Fetch Metadata 的旧浏览器/no-JavaScript 兼容；
- 生产环境进一步只接受规范 HTTPS Origin，Vercel preview 才允许同 HTTPS Host；20 个普通 JSON 文本字段拒绝对象、数组等结构化值，避免生成 `[object Object]` 垃圾询盘；
- 新增 Vercel Build Output 完整性门禁：`--prebuilt` 发布前逐文件校验 61 个 HTML、SEO 文件、IndexNow key、全部静态资源及两个 API 函数，并以内容哈希阻止残缺构建进入生产；
- `.vercelignore` 排除 macOS/iCloud 产生的编号冲突副本；本地副本保留不删，但不会形成意外重复 URL。

### 测量与验收

- 390×844、Fast 4G 1.6 Mbps、4× CPU 的冷缓存对照中，移动首图延后与移除 Manrope 预加载叠加后，LCP 中位数由 1,740 ms 降至 1,352 ms，改善约 22.3%；LCP 仍为 H1，CLS 为 0.000588；
- `custom-boxes.html` 的 1440px/DPR1 受控测试中，初始卡片图片由 595,622 B 降至 206,236 B，减少 65.4%；最后一张近端图片完成时间约由 4.015 秒提前至 2.161 秒，LCP 与 CLS 无显著回退；
- 390px/DPR3 继续选择 1024px 源图；66 个响应式派生文件全部可解码、尺寸正确且小于源图，蓝图文字、条码、压纹暗部、浅色包装与精细酒标完成并排视觉抽查；
- 53 张 AVIF 卡片按实际复用加权后，512px 相对 WebP 减少 301,885 B（18.94%），768px 减少 495,876 B（16.93%），移动 DPR3 的 1024px 候选减少 1,947,868 B（32.95%）；
- 80 张 split 正文图按实际复用加权后，桌面 1440/DPR1 由 10,149,386 B 降至 4,151,977 B，减少 59.09%；移动 390/DPR3 降至 6,770,945 B，减少 33.29%；
- 新增的 63 张响应式 WebP 按实际复用加权后，桌面 1440/DPR1 由 5,353,058 B 降至 2,004,520 B，减少 3,348,538 B（62.55%）；390px/DPR3 继续选择 1024px 原图；
- 10 张 AVIF 均与 1024×1024 WebP 源图尺寸一致且可重新解码；蓝图细线、条码、文字与品牌色完成并排视觉抽查；
- 生产抽查 66 个响应式 WebP 与 28 个 AVIF 全部返回 HTTP 200 和正确 MIME；桌面 DPR1 选择 512px 卡片图，移动 DPR3 保留 1024px 源图；
- 生产索引审计确认 sitemap 中 60 个 URL 全部直接返回 200，canonical 与 robots 指令一致；发布包门禁确认 256 个公开文件与两个 API 函数完整；
- 后续预构建中门禁再次拦截一次 CLI 显示成功但实际缺少 64 个公开文件的残缺输出；该输出未部署，发布流程改用非同步目录中的提交快照构建；
- 全站 60 个可索引页面与 1 个不可索引页面静态校验、Quote API、Health API、JavaScript 语法和差异检查通过；
- 生产自动邮件仍受 Vercel 缺少 Resend 环境变量阻塞；代码兜底不能替代真实收件配置与验收。

## 2026-08-20 · 平板转化入口、焦点隔离与浏览器安全策略

### 今日唯一主任务

修复第二轮真实浏览器审计中仍会影响询盘可达性、键盘操作和生产安全的缺口。

### 已完成

- 移动抽屉断点由 780px 扩展至 900px，901–1040px 保留紧凑型询盘 CTA，消除小平板无常驻询盘入口的区间；
- 打开抽屉后将主内容、顶部栏、页脚、浮动联系入口和统计偏好层设为 `inert`，首焦点进入导航，并在菜单按钮与链接之间循环 Tab；
- Escape 关闭后焦点返回菜单按钮，旋转或跨断点仍会清理页面滚动锁和背景隔离；
- 26 个询盘表单的姓名、邮箱、电话、数量、尺寸、目的地、目标日期、详情和蜜罐字段增加与 API 完全一致的 `maxlength`，避免买家内容被服务端静默截断；
- Resend 服务端调用增加 10 秒中止信号，短于前端 18 秒兜底窗口；
- 以规范化询盘和附件内容生成稳定 SHA-256 幂等键，降低网络重试造成的重复邮件；
- 全站增加严格 `Content-Security-Policy`：脚本只允许同源、Google Tag 和 9 个经过哈希确认的内联脚本，不允许任意内联脚本或事件属性；
- CSP 同时限制表单目标、base URI、对象嵌入、frame ancestor、字体、图片和统计连接域，并启用不安全请求升级；
- 扩展 Permissions Policy，并增加 COOP、DNS 预取关闭和跨域策略文件禁用头；
- 统计同意条保持非阻断 region，并以 polite live region 宣告首次出现；从 Privacy 打开偏好后，保存选择并关闭面板会把焦点返回原触发链接。
- 将现有 SVG 品牌标识确定性导出为 512×512 PNG，加入 Web App Manifest、全站 Apple touch icon，并在 Organization schema 中声明 ImageObject 尺寸。
- 合并 56 张产品卡内重复指向同一目的地的图片、标题与 CTA 链接；全站产品卡链接由 152 个降至 64 个，减少 88 个重复 Tab 停靠点，同时保留整卡点击区域与可见焦点框。
- 92 个规格、测试和 RFQ 表格包装为可聚焦滚动区域，以各自 caption 提供可访问名称；移动端增加显式横向滚动提示。

### 验收与边界

- 850px 浏览器测试确认：关闭菜单不可聚焦、打开后首焦点为 Products、背景全部 inert、Tab 正反向循环、Escape 正确返焦；
- 950px 测试确认：导航 CTA 可见且页面无横向溢出；850px 无 JavaScript 测试确认内联导航和 CTA 仍可见；
- 生产站模拟 CSP 覆盖首页和 8 个内联计算工具，启用统计同意后 0 个 CSP 阻断；
- 产品目录在 1440px 与 390px 浏览器抽查中无横向溢出；22 张目录卡均只暴露一个语义链接，图片区域点击、键盘焦点和目标跳转正常；
- 390px RFQ 表格抽查确认可用方向键横向滚动、焦点框可见、提示可见且页面本身无横向溢出；桌面端自动隐藏提示；
- 全站静态校验、Quote API、Health API 和 JavaScript 语法回归通过；
- 生产自动邮件仍因 Vercel 未配置 Resend 环境变量而不可用；该外部配置不能由代码优化替代。

## 2026-08-20 · 询盘可靠性、作者实体与日期一致性

### 今日唯一主任务

消除影响询盘完成率和搜索信号可信度的技术断点。

### 已完成

- 26 个询盘表单增加真实的无 JavaScript URL-encoded 基础提交路径；
- 原生提交返回可读的成功或失败页面，不再只显示 API JSON；
- 附件仍由增强型 JavaScript 路径安全传输，原生文件名不会被误当附件内容；
- 前端请求增加 18 秒超时，断网、DNS、超时、404 和服务端错误均进入 Email、WhatsApp、复制简报兜底；
- 增加提交尝试、字段/附件错误和投递错误漏斗事件，成功后允许新一轮表单开始事件；
- 移动导航关闭时使用 `inert` 与隐藏语义，Escape 返回菜单按钮，屏幕旋转会解除滚动锁；
- 无 JavaScript 的移动端保留可见的内联导航和询盘入口；
- 撤回分析同意后刷新当前页，确保已加载的 Google 与 Vercel 分析脚本停止运行；
- 31 篇指南统一展示语义化发布日期，其中 8 篇同步展示真实更新日期；
- Privacy 的可见日期、结构化日期和 sitemap 日期统一为 2026-08-20；
- About 页增加可见的公司作者说明和稳定实体 ID，31 篇 Article 统一引用；
- 自动校验覆盖上述表单、导航、事件、作者、日期和缓存规则。

### 边界

- 不虚构个人作者、从业年限、评级、证书、MOQ 或交付承诺；
- Article 的 Updated 日期仅在 `dateModified` 晚于 `datePublished` 时展示；
- 生产询盘邮件仍依赖 Vercel 中的 Resend 环境变量，部署验收必须单独检查 `/api/health`。

## 2026-08-20 · 字体自托管与请求链路优化

### 今日唯一主任务

移除每页对 Google Fonts CSS 和字体域名的运行时依赖，缩短首屏关键请求链路。

### 已完成

- 自托管 Bodoni Moda 拉丁字符集 WOFF2（约 45 KB）；
- 自托管 Manrope 拉丁字符集 WOFF2（约 24 KB）；
- 保留两套字体的 SIL Open Font License 文件；
- 字体家族、字重范围和 `font-display: swap` 保持原设计意图；
- 61 页移除 `fonts.googleapis.com` 与 `fonts.gstatic.com` 请求；
- 61 页直接预加载两个本地字体文件；
- 字体使用版本化文件名，并配置一年 immutable 缓存与跨域读取头；
- 全站校验禁止重新引入外部 Google Fonts，并强制检查预加载、字体文件、许可证和 CSS 字体声明。
- 首页浮层工艺图新增 512×512 专用变体，从 129,962 B 降至 36,064 B，并设为低请求优先级；原始 1024×1024 素材保留供大尺寸内容使用。
- JavaScript 增强标记在 `<head>` 首次绘制前设置，避免移动导航的增强/无 JS 布局切换产生 CLS。

### 验收与限制

- 旧生产站 Fast 4G / 4× CPU 实验室测试：FCP/LCP 3.96–5.49 秒、CLS 0.005–0.006、TBT 22–93 毫秒；
- 当前自托管字体候选在同条件下：首页 FCP/LCP 1.73–1.79 秒，较重首图页面 LCP 1.95 秒，CLS 0、TBT 0；
- 上述是受控实验室数据，不替代真实用户 P75 的 LCP、CLS 与 INP；
- 部署后需确认 WOFF2 返回正确 MIME、长期缓存，并从目标市场复测请求链；
- 视觉抽查需确认标题和正文保持 Bodoni Moda / Manrope；
- 14 天复测日期：2026-09-03；
- 28 天复测日期：2026-09-17。

## 2026-08-20 · 全站图片传输优化

### 今日唯一主任务

降低产品页和指南页的图片传输体积，同时保留社交分享兼容性。

### 测量与决策

- 39 张 JPEG 合计约 8.2 MB；
- 最大单张约 383 KB；
- 最大图 WebP 质量 82 试验由 383 KB 降至约 152 KB，视觉检查未发现明显线条、文字或颜色损失；
- 全量 WebP 合计约 3.4 MB，相比 JPEG 集合减少约 59%；
- JPEG 不删除，继续作为 Open Graph 和 Twitter 分享图，避免社交抓取兼容风险。

### 已完成

- 为 39 张图片生成同尺寸、语义文件名一致的 WebP 版本；
- 348 个可见 `<img>` 引用切换到 WebP；
- 59 个首屏图片预加载切换到 WebP；
- Open Graph 和 Twitter 图片继续引用 JPEG；
- 全站校验强制要求可见本地图片和预加载使用 WebP；
- 全站校验强制要求 39 组 JPEG/WebP 文件一一对应，防止缺图或误删社交后备图。

### 验收与复测

- 所有页面必须继续通过图片存在、宽高、alt、内链和结构校验；
- 部署后抽查首页、产品目录、一个产品页和一个长指南的桌面/手机图片显示；
- 部署后从目标市场复测 LCP 和页面传输体积；
- 14 天复测日期：2026-09-03；
- 28 天复测日期：2026-09-17。

## 2026-08-20 · 询价表单渐进式优化

### 今日唯一主任务

降低询价表单的首屏认知负担，同时保留完整采购信息能力和无 JavaScript 兜底。

### 已完成

- 首屏保留 5 个必要字段：姓名、邮箱、产品、数量和交付国家/地区；
- 电话、尺寸、目标日期、项目描述和附件进入可展开的可选区；
- 页面 HTML 本身未隐藏字段，无 JavaScript 时仍显示并可正常提交；
- 使用原生 `details/summary`，支持键盘操作和展开状态语义；
- 成功提交并重置表单后，可选区自动收起；
- 增加 `quote_optional_details_toggle` 分析事件，用于判断买家是否需要展开详细 brief；
- 全站校验强制保护可选字段清单、折叠结构、重置和键盘焦点样式；
- 更新 CSS、站点脚本和 Analytics 缓存版本。

### 验收与复测

- 所有 26 个询价表单继续使用相同字段合同和 API；
- 静态校验、JavaScript 语法、Quote API 与 Health API 回归必须全部通过；
- 部署后需验证桌面与手机的展开/收起、附件、表单失败兜底和成功重置；
- 14 天复测日期：2026-09-03；
- 28 天复测日期：2026-09-17；
- 观察指标：`quote_form_start`、`quote_optional_details_toggle`、`generate_lead` 和合格询盘率。

### 决策规则

- 若开始率提高且合格询盘率不降，保留；
- 若询盘增加但尺寸/项目描述完整率明显下降，调整提示文案或默认展开产品页表单；
- 不在同一复测周期同时改变必填字段或 CTA 文案。

## 2026-08-20 · 测量回归与隐私一致性

### 今日唯一主任务

把采购模板下载从“已添加但容易被后续改坏”的事件，升级为受全站校验保护的长期转化指标。

### 已完成

- 全站校验现在强制要求 `resource_download` 事件存在；
- 强制要求下载事件按 `csv_template` 分类；
- 隐私页明确披露模板下载可能记录公开文件名和链接文字；
- 隐私页明确排除模板内容以及用户之后填写的信息；
- 仅隐私页发生实质内容更新，因此只更新该 URL 的 sitemap `lastmod`；
- 保留分析同意门槛，拒绝分析时不发送下载事件。

### 验收与限制

- 静态结构和回归校验已通过；
- 当前会话没有可调用的浏览器控制接口，未宣称完成真实点击测试；
- 部署后仍需在同意分析的测试会话中下载一个 CSV，并通过 GA4 DebugView/Realtime 确认一次 `resource_download`；
- 14 天复测日期：2026-09-03；
- 28 天复测日期：2026-09-17。

### 下一步队列

1. P0：完成 Resend/Vercel 邮件配置与真实收件；
2. 获取 GSC 查询和页面数据，选定首个数据驱动的商业页优化；
3. 部署后验证模板下载事件；
4. 检查 GA4 中 `generate_lead`、联系点击和模板下载是否适合标记为关键事件。

## 2026-08-19 · 第一轮基线与转化监控

### 今日唯一主任务

确认正式站的索引与询价链路，并补齐可下载采购工具的转化测量。

### 生产基线

- sitemap 中 60 个 URL 均直接返回 HTTP 200；
- 60 个页面 canonical 与正式 URL 一致；
- 页面 robots 指令允许索引；
- Apex、`www` 和 `/index.html` 跳转符合预期，最多一次跳转；
- `/api/health` 返回 HTTP 503；
- 正式站 `quoteEmail.configured` 为 `false`；
- 询价接口响应保持 `Cache-Control: no-store`。

### P0 阻塞

Vercel 生产环境缺少完整的 Resend 邮件配置。需要在 Vercel 项目中配置并重新部署：

- `RESEND_API_KEY`
- `QUOTE_TO_EMAIL`
- `QUOTE_FROM_EMAIL`

配置后必须再次运行 `node scripts/audit-production-services.mjs`，并完成一封无附件和一封带附件的真实收件测试。在此之前，在线提交会转入 Email、WhatsApp 和复制需求书兜底，不能视为完整交付链路。

### 已完成的代码优化

- 为所有 CSV 采购模板下载增加 `resource_download` GA4 事件；
- 事件包含模板文件名、资源类型和点击文字，不包含访客个人信息；
- 更新 Analytics 静态资源版本，避免浏览器继续使用旧缓存；
- 保留现有同意机制：只有访客允许分析后才发送事件。

### 基线与复测

- 修改前：模板下载无法在 GA4 中独立识别；
- 修改后验收：点击任一 `assets/templates/*.csv` 下载链接，应产生一次 `resource_download`；
- 生产复测：部署后使用 GA4 DebugView/Realtime 验证；
- 14 天复测日期：2026-09-02；
- 28 天复测日期：2026-09-16。

### 下一步队列

1. P0：完成 Resend/Vercel 邮件配置和真实交付测试；
2. 获取 GSC 最近 28 天查询与页面导出，生成首批排名 8–20 机会页；
3. 获取 GA4 落地页、询价与联系事件基线，判断优先优化哪个商业页面；
4. 在数据到位前，不新增缺乏一手证据的内容页。
# 2026-08-25：正式站收录启动

- 正式站抓取审计通过：sitemap 中 60 个 URL 均直接返回 HTTP 200，canonical 与 URL 一致并允许索引；
- `www` 与 `/index.html` 规范化跳转通过；
- 公开搜索结果仍显示旧首页与旧 `custom-boxes.html` 摘要，记录为优先重新抓取对象；
- 首页和 `custom-boxes.html` 已发生实质内容更新，sitemap `lastmod` 更新为 `2026-08-25`；
- 新增 `.vercelignore`，阻止 5 个 `* 2.html` 与 1 个重复 manifest 冲突副本进入正式部署；
- 新增 `INDEXING_LAUNCH_CHECKLIST.md`，统一 GSC、Bing、IndexNow、GA4 和 7 天复测步骤。
- 复核首页主图加载策略：桌面使用带媒体条件的高优先级 preload，移动端图片位于首屏文字之后，继续使用 lazy/low priority，避免移动端无效抢占带宽；
- 首页新增明确的 WebPage 与主图实体，并加强 Organization 的域名标识、别名和产品知识范围；
- 产品目录、盒型集合页和工厂页补充 publisher、about 与真实修改日期关系，帮助搜索和 AI 系统建立页面归属。

# 2026-08-28：精选产品索引页与询盘兜底优化

- 从 1,969 条授权目录中人工筛选 12 个差异明显的参考款，覆盖邮寄箱、纸袋、礼盒、吊牌、化妆品纸盒、食品二次包装、寿司包装评估、台面展示、茶盒、蜡烛盒和首饰展示卡；
- 为 12 个参考款建立独立、可索引、可分享的详情页，每页包含唯一标题和摘要、图片可见事实、待确认规格、风险边界、父级商业页、相关采购指南和带 GS 编号的询盘入口；
- 结构化数据使用 `WebPage + Service + BreadcrumbList`，不虚构 Product Offer、价格、库存、评论、星级、固定 MOQ 或认证；
- `products.html` 增加 12 个静态精选卡片和独立 ItemList；原目录对应卡片改为可抓取的完整详情链接，同时保留 Quick preview；
- 新页面和更新目录页已加入 sitemap，`llms.txt` 增加精选参考索引；
- 新增 `assets/catalog/curated-products.json`、生成脚本和专用校验，强制检查目录 ID、GS 编号、主图、唯一元数据、Service schema、事实边界、静态内链、sitemap、llms.txt 与询盘归因；
- 询盘表单增加 `/api/health` 短超时预检：明确检测到自动邮件未配置时，不再发起注定失败的 POST，直接准备 Email、WhatsApp 和完整简报复制；网络或健康检查异常时仍保留原提交路径；
- 全站静态校验通过：72 个可索引页面、73 个发布 HTML、4,228 个公开文件和 2 个 API handler 与源文件一致；
- 水印审计通过：2,143 张已发布图片，旧来源网址匹配 0、OCR 失败 0；
- 生产发布完成，72 个 sitemap URL 均直接返回 HTTP 200、canonical 一致并允许索引；
- 本次 13 个更新 URL 已由 IndexNow 接受，HTTP 200；
- 自动邮件仍受 Vercel 缺少 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL` 阻塞，生产 `/api/health` 为 503；当前直接渠道兜底可用，但不能等同于恢复自动邮件投递。

### 复测

- 7 天：检查 Google Search Console 的“已发现/已抓取/已编入索引”变化及新详情页曝光；
- 14 天：按查询和页面筛选首批进入排名 8–30 的参考页，强化父页内链和一手证据；
- 28 天：根据自然搜索、AI referral、`quote_form_start`、`quote_fallback_action` 和合格询盘，决定是否扩展第二批详情页；
- 只有在同类已策划详情页达到约 8 个且能提供独立选型内容时，才建立可索引分类页，避免薄页和关键词内耗。

## 2026-08-28 · 目录性能、图片发现与上下文内链第二阶段

### 已完成

- 将 1,635,121 字节的完整目录数据改为距离目录约 800px、鼠标进入或键盘聚焦时才加载；线上 Brotli 传输约 92.6KB，不浏览完整目录的访问不再下载和解析该数据，也不再提前创建首批 48 个动态卡片；
- 使用单一 Promise 防止重复请求，并保留无 IntersectionObserver 兜底、可见加载/失败状态和 `aria-busy` 语义；
- 12 张精选卡片改用 480px 与 800–960px 两档响应式图片，默认图合计由 1,897,053 字节降至 497,542 字节；普通像素密度完整浏览最多减少 1,399,511 字节（73.8%），详情页和弹窗继续使用高清图；
- 新增独立 `image-sitemap.xml`，把 12 个精选详情页分别关联到唯一高清主图；robots 声明、Vercel 缓存头、构建清单和专用生产审计同步完成；
- 在邮件盒、纸袋、通用盒型、吊牌、化妆品盒、香水盒和折叠纸盒商业父页中加入对应精选参考内链；详情页之间增加语义相关交叉链接，食品接触、PDQ 展示和寿司包装继续保留可行性与合规边界；
- 新增回归锁，强制检查延迟加载触发器、响应式精选图、至少两处上下文入链、12 对图片 Sitemap 映射、线上页面/图片状态、Content-Type、robots 与 X-Robots-Tag；
- sitemap 对 7 个实质更新的父级商业页更新 `lastmod`；
- 正式站发布完成，线上 `products.html` 与 `assets/catalog.js` 哈希和本地构建完全一致；
- 生产索引审计通过：72 个 sitemap URL 均直接 HTTP 200、canonical 匹配且允许索引；
- 生产图片 Sitemap 审计通过：12 个详情页和 12 张 JPEG 主图均在线并一一匹配；
- 水印审计继续通过：2,143 张发布图片中旧来源网址/品牌匹配 0、OCR 失败 0；
- 本次 20 个更新 URL 已由 IndexNow 接受，HTTP 200。

### 验证与限制

- 构建输出验证通过：4,229 个公开文件、73 个 HTML 文件和 2 个 API handler 均与源文件一致；构建验证器的过期 handler、无效配置和缺失 bundle 故障注入自测通过；
- 当前环境未提供 Chrome DevTools 性能追踪接口，因此没有虚构 Lighthouse、LCP、INP 或 CLS 分数；后续接入真实浏览器追踪后再做 CWV 基线与移动端复测；
- 图片 Sitemap 促进图片发现，但不保证 Google 收录或排名；仍需在 Google Search Console 中观察提交、发现、抓取与图片搜索变化；
- 自动邮件仍受 Vercel 缺少 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL` 阻塞，生产 `/api/health` 为 503；Email、WhatsApp 与复制简报兜底保持可用。

## 2026-08-28 · 公开事实一致性、图片实体与抓取层级第三阶段

### 已完成

- 12 个精选详情页新增独立 `ImageObject`，并由 `WebPage.primaryImageOfPage` 与 `Service.image` 共同引用；同步补齐 Open Graph 图片宽高、替代文字和 Twitter 图片替代文字；
- 10 个有真实商业父页的精选详情把父类目加入可见面包屑和 `BreadcrumbList`；Sushi 与 PDQ 两个可行性页不伪造独立父类目，其 Service 名称和类型明确限定为 feasibility review；
- 修复两个结构化名称中的重复 `Reference Reference`，并在生成校验中加入回归拦截；
- 公开目录不再暴露 1,969 条源站 MOQ、来源位置、清洗方法、源图尺寸等内部导入字段；私有审计证据保留在不发布的构建记录中；
- 487 条带来源认证、环保、食品接触或性能措辞的记录改用中性公开标题，并显式标记 `claimReviewRequired`；公开标题中未限定的 FSC、可回收、食品级、防水等措辞为 0；
- 目录说明改为受控运行时模板，用户看到的规格与证据边界不变；公开目录 JSON 由 1,635,121 字节降至 860,278 字节，减少 47.4%，gzip level 9 由 88,788 降至 65,460 字节，减少 26.3%；
- `catalog.js` 与 `catalog.json` 的查询版本均绑定文件内容 SHA-256 前 12 位，并配置一年 immutable 缓存；校验器会阻止数据更新但版本未同步；
- `custom-boxes.html` 的结构化更新时间与 sitemap 修正为一致；所有带结构化 `dateModified` 的页面现在都必须与 sitemap `lastmod` 匹配，sitemap 72 个 URL 也必须全部具有合法日期；
- 首页 Buyer tools 增加正文到 Blog hub 的入口；Rigid box 结构卡补齐 Lift-off、Shoulder-neck、Drawer、Collapsible 对应商业页链接；Candle 精选页修正为语义更相关的 Tea carton 交叉链接；
- RSS 生成器的 `lastBuildDate` 改为使用指南最大 `dateModified`，并增加 title、link、guid、pubDate、description 与文章结构化数据精确一致的回归检查；
- IndexNow 提交脚本新增正式 key、sitemap 成员、HTTP 200 和 canonical 预检，避免提交未上线或规范 URL 错误的页面。

### 生产验收

- 构建输出验证通过：4,229 个公开文件、73 个 HTML 和 2 个 API handler 完整且与源码一致；
- 生产索引审计通过：72 个 sitemap URL 均直接 HTTP 200、canonical 匹配并允许索引；
- 图片 Sitemap 验收通过：12 个详情页与 12 张 JPEG 主图在线且一一匹配；
- 线上目录验证通过：1,969 条产品，公开源 MOQ 0，未限定高风险标题 0，487 条记录保留项目文件核验标记；
- 线上 `catalog.js` 与 `catalog.json` 内容哈希匹配，均返回 `public, max-age=31536000, immutable`；
- 水印审计继续通过：2,143 张公开图片匹配 0、OCR 失败 0；
- 本轮 16 个实质更新 URL 经正式站预检后由 IndexNow 接受，HTTP 200。

### 限制与下一步

- 自动邮件仍缺 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL`，生产健康检查 HTTP 503；直接 Email、WhatsApp 和复制简报兜底可用；
- 未配置 Chrome DevTools MCP，本轮不宣称 Lighthouse、LCP、INP 或 CLS 实测分数；
- Google 重新抓取与收录不能由代码或 IndexNow 保证；需在已验证的 Search Console 对首页、Products、Custom Boxes 做 Live Test / Request indexing，并观察 Google-selected canonical；
- `glorystarpacking.com` 与 `glorystarpack.com` 的公司实体、地址和电话号码是否属于同一主体需要所有者确认，在确认前不添加 `sameAs` 或合并 Organization。

## 2026-08-28 · 内容图谱、发布白名单与图片隐私第四阶段

### 已完成

- 31 篇采购指南统一使用 `BlogPosting`；每篇的 `@id`、`mainEntityOfPage`、`isPartOf`、作者、发布/更新日期、Open Graph 日期和可见署名均由校验器一一核对；
- `blog.html` 的 Blog 实体只保留 31 个唯一 `@id` 引用，连接 WebSite 与 Organization，且可见卡片日期必须匹配正文；RSS 生成器改为解析被引用的正文实体并支持无写入 `--check`；
- Blog 同步脚本改为先在内存完成全部验证、再原子写入变更文件，支持幂等重跑；本轮第二次运行 0 文件变化；
- 三个刚性盒子页的可见与结构化面包屑统一为 `Home → Custom Boxes → Custom Rigid Boxes → 当前页`；Privacy 补齐 BreadcrumbList；
- `lid-and-base-boxes.html` 与 `embossed-foil-labels.html` 补上相关商业页和采购指南正文入口，消除正文死端；
- 全站链接图回归已固化：72 个可索引 URL 必须全部从首页到达、最大深度不超过 2、可见面包屑与 BreadcrumbList URL 顺序一致、商业正文必须有上下文内链；
- IndexNow 增加正式 sitemap 与本地逐字一致、待提交页面与本地 HTML SHA-256 一致的上线门槛；GitHub 手动工作流先执行正式抓取审计再提交；
- 构建验证器改为拒绝任何未声明的静态文件，故障注入测试确认额外文件会阻断发布；
- 从公开构建排除临时 OCR/源路径 JSON、私有清洗清单、内部导入报告、精选生成清单、16 张未使用类目占位图和 1 张已被高清版本替代的预览；这些旧线上地址均已确认返回 404；
- 对 3,995 个候选公开 JPEG 执行无损元数据审计，3,805 个文件移除 7,409 个 EXIF/XMP/IPTC/Photoshop/Comment 段，共减少 1,414,752 字节；实际部署的 3,978 个 JPEG 已全部通过零可移除元数据检查；
- 图片生成流水线和站点校验器加入 JPEG 元数据剥离/阻断，4 个曾含精确 GPS 的产品/预览衍生图在线复核均已清洁。

### 生产验收

- 正式部署 `dpl_B1GnpXMkYats46MNeLY4yumjedmM` 已完成并绑定 `https://glorystarpacking.com`；
- 构建输出验证通过：4,210 个公开文件、73 个 HTML 和 2 个 API handler 完整、无多余文件且与源码一致；
- 生产索引审计通过：72/72 个 Sitemap 页面直接 HTTP 200、canonical 匹配、允许索引，主机规范化最多一次跳转；
- 生产图片审计通过：12 个精选详情页与 12 张 JPEG 一一匹配且无可移除元数据；4 个已知 GPS 敏感衍生图也通过；
- IndexNow 在正式 sitemap 与 72 个线上 HTML 均通过本地内容哈希预检后接受 72 个 URL，HTTP 200；
- 水印审计继续通过：2,143 张发布图片旧来源域名/品牌匹配 0、OCR 失败 0。

### 限制

- 自动邮件仍缺 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL`，生产 `/api/health` 为 HTTP 503；Email、WhatsApp 与复制简报兜底保持可用；
- 当前环境仍没有 Chrome DevTools MCP 的性能追踪接口，因此没有宣称 Lighthouse、LCP、INP 或 CLS 实测结果；
- Google 收录和 AI 推荐不能由结构化数据或 IndexNow 保证；下一步仍应从已验证的 Google Search Console 导出最近 28 天查询/页面数据，按真实曝光、排名和询盘选择下一批优化页。

## 2026-08-28 · 联系电话统一更新

### 已完成

- 全站可见联系电话统一为 `+86 195 7760 8248`，WhatsApp 统一为 `https://wa.me/8619577608248`；
- 首页 Organization 与 ContactPoint 结构化电话统一为 `+86-195-7760-8248`；
- 同步更新页面询价入口、无 JavaScript 兜底、浏览器端询价脚本、服务端失败兜底、产品页生成器和回归测试；
- 增加生产联系方式审计，逐页拒绝旧号码并检查首页结构化电话和版本化浏览器询价脚本。

### 生产验收

- 正式部署 `dpl_6geHRZCfrvu9psb4z17XMWU6VR5n` 已完成并绑定 `https://glorystarpacking.com`；
- 72/72 个 Sitemap 页面均使用新 WhatsApp 地址，旧号码线上匹配 0；
- 首页两处结构化电话和浏览器端询价回退均通过正式站检查；
- IndexNow 在正式 Sitemap 与 72 个线上 HTML 全部通过本地内容哈希预检后接受 72 个 URL，HTTP 200。

## 2026-08-28 · 全站视觉系统统一

### 已完成

- 首页、产品目录、商业产品页、精选产品详情和采购指南共用同一套墨黑、暖纸色、金色强调与陶土色行动提示；
- 产品详情首屏并入全站深色首屏体系，统一标题、面包屑、规格表、证据说明和双按钮层级；
- 产品目录、精选目录和商业产品卡统一标题字体、边框、媒体底色、编号标签、悬停高度与阴影；
- 连续目录区块增加纸色层级与分隔线，页头首屏增加共同的印刷网格纹理，页脚增加统一金色收口线；
- 补齐此前缺失的次级轮廓按钮，并修正无 JavaScript 导航的字体变量；
- 站点校验器新增统一视觉系统回归信号，防止详情页、目录页和通用页面再次分裂成不同模板。

### 生产验收

- 正式部署 `dpl_3YbMWP4gDvpP31AtCVKemL84WRdY` 已完成并绑定 `https://glorystarpacking.com`；
- 73 个公开 HTML 全部引用内容版本 `9d44009f5a7a`，构建输出 4,210 个公开文件和 2 个 API handler 与源码一致；
- 正式站 72/72 个 Sitemap 页面直接返回 HTTP 200、canonical 匹配并允许索引；
- 正式样式文件 HTTP 200，85,349 字节，与本地已验证版本 SHA-256 完全一致。

## 2026-08-28 · 全站外壳与产品预览统一第二阶段

### 已完成

- 73 个公开页面的顶部品牌信息统一为同一句工厂与技术支持定位，消除页面间的模板文案跳变；
- 页脚品牌说明、业务范围和三列标题统一为 `Products / Explore / Contact`，保留各页面相关链接但使用同一外壳；
- 产品快速预览改为与正式产品详情相同的墨黑编辑式信息面板、暖纸色图片区、金色边界与一致的主次按钮；
- 桌面顶部联系方式增加细分隔线，页脚栏目使用统一竖向节奏，链接交互与全站卡片动效一致；
- 新增站点外壳同步器并通过幂等检查，产品详情生成器同步采用统一页脚；
- 新增正式站外壳审计，逐页验证页头、页脚、栏目顺序、样式版本和正式 CSS 内容哈希。

### 生产验收

- 正式部署 `dpl_6qT7y97z56SAiEbWNGxPr5R8VPoz` 已完成并绑定 `https://glorystarpacking.com`；
- 73/73 个公开页面使用同一顶部信息、页脚品牌、栏目节奏和样式版本 `cdc1ae6cb77d`；
- 正式 CSS 与本地已验证版本内容哈希一致，产品快速预览统一样式在线；
- 72/72 个 Sitemap 页面直接返回 HTTP 200、canonical 匹配并允许索引，私有构建文件继续返回 404。

## 2026-08-28 · 移动行动与长页阅读体验第三阶段

### 已完成

- 73 个公开页面统一使用同一套 Email / WhatsApp 快速联系入口，补齐此前 8 个缺失页面并通过同步器幂等回归；
- 手机端快速联系入口改为带文字标签的双按钮底部行动栏，使用 50px 触控目标、设备安全区和半透明背景；
- 移动导航或隐私选择面板打开时自动隐藏行动栏，关闭后恢复，避免浮层重叠和误触；
- 手机页脚增加底部安全留白，页脚链接触控高度统一为至少 44px；
- 长篇采购指南正文统一为 72ch 阅读宽度、舒适行距和段落换行节奏，减少跨模板的阅读差异；
- 页面生成器、站点外壳同步器、本地校验器和正式站审计均加入快速联系栏及移动端避让规则，防止后续页面再次脱离统一体验。

### 生产验收

- 正式部署 `dpl_FVFd1oXmTk4iTqavkRquaxgQoMSn` 已完成并绑定 `https://glorystarpacking.com`；
- 73/73 个公开页面使用同一快速联系栏和资源版本，正式 CSS `b0297f2128c5`、交互脚本 `c7142c3f7069` 均与本地发布内容哈希一致；
- 正式站逐页外壳审计通过，移动隐私面板避让及关闭恢复逻辑在线；
- 72/72 个 Sitemap 页面直接返回 HTTP 200、canonical 匹配并允许索引，私有构建文件继续返回 404。

## 2026-08-29 · 产品发现与全站交互一致性第四阶段

### 已完成

- 手机产品库由超过 3,200px 的横向类目滑动改为原生类目选择器，搜索、排序、类目和分页状态写入 URL，并支持浏览器前进、后退和分享恢复；
- 1,969 条产品的搜索文本在目录载入时预计算，输入采用 120ms 调度，减少低端手机连续输入时的重复文本规范化和卡片重建；
- 产品结果只保留一个简洁的读屏播报区域，移除 48 张卡片网格的重复 live region；目录按钮重建后恢复同类目焦点；
- 产品预览支持点击遮罩关闭、关闭按钮手机吸顶、关闭后回到原卡片，并在预览打开时避让底部联系工具栏；
- 从产品预览或带目录编号的链接进入询价时，自动展开已预填的项目明细，形成从浏览到询价的连续路径；
- 26 个询价表单统一关联本区标题、状态和附件说明；附件过大或类型不符时留在原表单就地提示并聚焦文件字段，不再误导为发送服务故障；
- 73 个页面的跳到主内容目标可可靠获得焦点；5 个栏目首页使用 `aria-current="page"`，65 个栏目子页使用 `aria-current="location"`，手机菜单增加明显金色当前位置标记；
- 移动导航根据顶部信息条与当前视口实测剩余高度，焦点循环纳入可见 Logo；
- 全站快速联系区改为语义化导航，并新增 `tel:+8619577608248` 直拨入口，手机端统一为 Email / WhatsApp / Call 三按钮。

### 生产验收

- 正式部署 `dpl_ASo18RUd7wdxCpb7TU9svQKr3eYy` 已完成并绑定 `https://glorystarpacking.com`；
- 构建输出验证通过：4,210 个公开文件、73 个 HTML 和 2 个 API handler 完整且与源码一致；
- 73/73 个公开页面使用同一可访问外壳、直拨联系栏和资源版本；正式 CSS `1ba971517564`、站点脚本 `f12e3bbc4359`、分析脚本 `9ccdf69a9847`、目录脚本 `f6623b1fc1b1` 均与本地内容哈希一致；
- 联系方式审计通过：72/72 个可收录页面同时提供当前 WhatsApp 与电话直拨，旧号码匹配 0，首页两处结构化电话一致；
- 索引审计通过：72/72 个 Sitemap 页面直接 HTTP 200、canonical 匹配并允许索引，主机规范化最多一次跳转，私有构建文件继续返回 404。

## 2026-08-29 · 产品详情移动阅读与图片清晰度第五阶段

### 已完成

- 12 个精选产品详情页的首屏统一拆分为产品简介、主图和商业详情三个连续区域；无样式与辅助技术环境下也按标题与用途、对应实物图、询价与规格的顺序读取；
- 桌面端保持图片左侧、信息右侧的双栏展示，手机端调整为标题与简短说明 → 产品图 → 询价按钮、关键规格与证据边界，避免客户在看到产品图前先穿过整组规格；
- 主图取消只适配单张图片的固定宽高比，改为使用文件真实比例，消除方形产品图被轻微压扁和插值变软的问题；
- 平板单栏主图限制为最多 680px 并居中，避免 800–960px 原图被无意义放大；小屏手机继续使用全宽展示；
- 11 个生成详情页与 1 个手工详情页完成同步，生成器、本地校验和正式图片 Sitemap 审计均加入三段结构、DOM 顺序、内容归属和旧包装器禁用检查。

### 生产验收

- 正式部署 `dpl_GU5tgktLWpsnaJTjjN8AZ2c2xQY5` 已完成并绑定 `https://glorystarpacking.com`；
- 构建输出验证通过：4,210 个公开文件、73 个 HTML 和 2 个 API handler 完整且与源码一致；
- 73/73 个公开页面使用样式版本 `81913ed4b15d`，正式 CSS、站点脚本、分析脚本和目录脚本均与本地发布内容哈希一致；
- 正式图片审计通过：12/12 个可收录详情页均采用新的标题—图片—详情顺序，12 张主图在线一一匹配且无可移除 JPEG 元数据；
- 联系方式审计通过：72/72 个可收录页面使用当前 WhatsApp 与电话直拨，旧号码匹配 0；
- 索引审计通过：72/72 个 Sitemap 页面直接 HTTP 200、canonical 匹配并允许索引，私有构建文件继续返回 404。

## 2026-08-29 · 搜索入口与图片发现第六阶段

### 已完成

- 新增 `paper-thickness-gsm-pt-mm-conversion-guide.html`，覆盖纸张/纸板厚度、GSM、包装卡尺点数、mm、µm 和 inch 等采购查询；页面明确区分 GSM 的单位面积质量与厚度，避免发布不准确的通用 GSM→mm 换算；
- 增加 PT、mm、µm 与 inch 的精确双向换算工具，并明确包装卡尺 `1 pt = 0.001 inch = 0.0254 mm`，同时说明它不是排版字号 point；
- 新指南加入 Blog、32 条 BlogPosting 内容图谱、RSS、`llms.txt` 和普通 Sitemap，并从纸盒、刚性盒、结构比较、内衬及 RFQ 模板等 5 个正文页面建立上下文入口；
- 新指南发布 BlogPosting、WebApplication、BreadcrumbList 与可见问答对应的结构化数据；结构化数据用于机器理解，不承诺搜索结果增强展示或排名；
- 图片 Sitemap 从只覆盖 12 个精选产品扩展为全站 37 张不重复 `og:image` 主图，每个条目同步普通 Sitemap 的 `lastmod`；12 个精选产品的严格页面—图片配对继续保留；
- 新增独立图片 Sitemap 生成器和 `--check` 发布门槛；本地、构建和正式站审核均检查全量主图映射、HTTP、抓取指令、JPEG 类型、元数据与精选产品阅读顺序；
- 本轮 7 个实质新增或更新 URL 通过正式站内容哈希、canonical 与 Sitemap 预检后由 IndexNow 接受，HTTP 200。

### 生产验收

- 正式部署 `dpl_CukspRvSLUWM6wEM3Sf5PqmPQBDe` 已完成并绑定 `https://glorystarpacking.com`；
- 构建输出验证通过：4,211 个公开文件、74 个 HTML 和 2 个 API handler 完整且与源码一致；
- 正式索引审计通过：73/73 个 Sitemap URL 直接 HTTP 200、canonical 匹配并允许索引，主机规范化最多一次跳转；
- 正式外壳审计通过：74/74 个公开页面共用同一可访问外壳；正式 CSS `81913ed4b15d`、站点脚本 `c0dc4bfb99a0`、分析脚本 `3aefe5da25cf`、目录脚本 `f6623b1fc1b1` 与本地发布内容一致；
- 正式图片审计通过：37 张不重复主 JPEG（7,458,439 字节）在线并映射到对应可收录页面，含 12 个精选产品；全部无可移除 JPEG 元数据，4 个已知敏感衍生图继续保持清洁；
- 联系方式审计通过：73/73 个可收录页面使用当前 WhatsApp 与电话直拨，旧号码匹配 0。

### 限制与下一步

- Google 抓取、收录、排名和实际流量增长不能由 Sitemap、结构化数据或 IndexNow 保证；下一轮应基于 Google Search Console 最近 28 天真实查询、页面曝光、CTR 和平均排名选择优化对象；
- 当前没有已授权的 Search Console 数据接口，本轮没有虚构曝光、收录或排名结果；
- 自动邮件仍需生产环境配置 `RESEND_API_KEY`、`QUOTE_TO_EMAIL` 与 `QUOTE_FROM_EMAIL`；Email、WhatsApp、电话和复制询价简报兜底继续可用。
## 2026-09-09 · 第三阶段内容发布体系首批

### 已完成

- 发布四篇英文内容：包装供应商资格审核清单、定制包装开发流程案例、包装测试记录指南、美妆行业包装采购指南；每篇均使用独立 canonical、BlogPosting、BreadcrumbList、FAQPage、作者实体和可见发布日期。
- Blog 首页新增本月内容批次卡片，四篇文章加入 BlogPosting 图谱、RSS、`llms.txt` 和图片发现链路，形成从内容到产品页和询价入口的内部链接路径。
- 新增两个可下载 CSV：供应商资格审核清单和包装测试记录模板；模板只用于记录与复核，不代替项目批准、认证或测试结论。
- 多语言发布脚本增加未审核页英文回退机制：新内容可以先保持 `noindex,follow`，待母语审核完成后再开放索引；已审核语言仍对缺失翻译严格报错。
- 内容发布文档明确月度节奏、证据边界、更新门槛和 GSC/GA4 复盘指标。

### 发布边界

- 开发案例是证据链流程案例，不发布虚构客户、订单量、节省、交期、测试结果、认证或性能结果。
- 测试记录指南不选择通用标准或 pass/fail 数值；实际测试必须绑定具体样品、方法、条件、结果和责任人。

### 生产验收

- 正式部署 `dpl_8RJWfNNDwNeEVSn17K9MyUBUChpS` 已完成并绑定 `https://glorystarpacking.com`；Git commit `3f9727e` 已推送至 `origin/main`。
- 正式站 78/78 个 Sitemap URL 可收录，390 个多语言页面继续保持 `noindex` 审核门槛；4 篇新文章均 HTTP 200、canonical 正确、BlogPosting 有效并出现在 Blog 与 RSS。
- 生产外壳、图片 Sitemap、联系入口和新内容专项审计全部通过；IndexNow 已接受 4 个新文章 URL，HTTP 200。
- 生产 `/api/health` 仍因上一阶段未配置 `RESEND_API_KEY`、`QUOTE_TO_EMAIL`、`QUOTE_FROM_EMAIL` 返回 503；本轮未改变邮件配置，Email、WhatsApp、电话和复制简报兜底继续可用。

## 2026-10-26 · 首页采购意图与首屏报价入口优化

### 数据与判断

- GSC 正确资源 `sc-domain:glorystarpacking.com`，近 28 天（2026-09-27 至 2026-10-24，上次更新约 3.5 小时前）：1,825 展示、8 点击、CTR 0.4%、平均排名 16.2。购买相关查询包含 `sustainable luxury packaging`、`custom drawer boxes`、`custom inserts`、`custom perfume boxes`、`custom durable labels` 和 `custom film labels`。高曝光产品/指南页已分别承接相应意图，不另建重复主题页。
- GSC 概览显示 83 个已编入索引、385 个未编入索引；未编入项包含站点主动 noindex 的多语言页。`sitemap.xml` 原提交状态成功，发现 84 个 URL，最后提交 2026-10-22；索引报告最近更新 2026-10-19。
- Bing 正确属性 `glorystarpacking.com/`，近 30 天（2026-09-26 至 2026-10-25）49 展示、0 点击；采购类查询含纸盒及包装产品组合词。相似域名 `glorystarpack.com` 的报表没有混入。
- GA4 使用正确属性 `548891831`（measurement ID `G-LYNMPWG9WK`），近 28 天（2026-09-28 至 2026-10-25）潜在客户获取报告为 0 个新潜在客户、无可用图表数据；这不能代替邮箱、电话和 WhatsApp 实际询盘核查。发布前 `/api/health` 审计显示 quote email delivery configured，未创建测试询盘。
- Semrush `sem.3ue.com` 当前跳转至登录页并明确提示登录过期/无效；没有把旧数据标作本轮新报告。最近可用同行估算仍为 2026-09 美国数据库（详见 [SEO_RESEARCH_20261015.md](SEO_RESEARCH_20261015.md)），仅作历史候选参考，等待重新登录后再更新。
- Reddit 近期讨论显示低 MOQ 买家会比较现货包装+定制标签与完全定制；现有低 MOQ 与小批原型指南已经覆盖该问题，不重复发文。未在 Reddit 发帖/私信。

### 已完成

- 首页 H1 调整为 `Custom paper packaging for your product.`，提高品类和采购用途的直观性；缩小桌面及移动首屏标题、缩短上下留白，让生产报价 CTA 更早进入视线。
- 同步首页 WebPage 结构化数据标题、摘要和修改日期；重生成普通 Sitemap 与图片 Sitemap，首页 lastmod 为 2026-10-26。更新其余页面共享 CSS 哈希，避免缓存旧样式。
- 补充两个外链目录候选到 `assets/templates/phase-4-outreach-tracker.csv`：Packaging Strategies 与 PackWow。已记录匹配类目、入口和待核实的费用/资格/链接属性；均未联系、未提交、未获得。
- 校验通过：84 个可索引 HTML 的站点静态验证、服务健康测试、Quote API 测试、站点脚本语法、IndexNow 首页 dry-run、AI discovery audit。生产 `/api/health` 审计通过。

### 上线与搜索提交

- Git commit `ad0eb599` 已推送到 GitHub `main`；正式首页于 2026-10-26 06:23 UTC 更新（HTTP 200，页面标题、主报价按钮、产品入口和首页 lastmod 均与本轮一致）。
- 正式生产壳层审计通过：85 个公开页共享同一外壳；索引审计通过：84 个 Sitemap URL 可索引、420 个未审本地化页维持 noindex、私有构建文件为 404；图片 Sitemap 审计通过：37 张主图均在线映射到可索引页。
- 正式 `/api/health` 审计通过，HTTP 200、`no-store`、quote email delivery configured；没有制造测试询盘或声称已有有效询盘。
- GSC `https://glorystarpacking.com/sitemap.xml` 于 2026-10-26 提交成功；GSC 显示 84 个已发现网页、0 视频。首页 URL Inspection 显示“网址已收录”，更新后的重新抓取请求已接受并加入优先抓取队列；请求不代表重新收录。
- Bing `https://glorystarpacking.com/sitemap.xml` 于 2026-10-26 提交成功；当前回执为 Processing，84 个 URL，0 错误、0 警告，上次抓取仍为 2026-10-23。IndexNow 接受首页 1 URL，HTTP 200。
- 上线前校验：`validate-site.mjs`、服务健康测试、Quote API 测试、JS 语法检查、普通/图片 Sitemap 检查、IndexNow dry-run、AI discovery audit 均通过；生产 shell/indexing/image/service 审计通过。
- Semrush 登录失效页显示“登录过期或无效”；需要重新登录后才能补充本月同行数据。

### 下一步

- 需要重新登录 Semrush 后重抓美国数据库同行页面和关键词。
- 28 天后复核首页与高曝光产品页的 GSC 展示、点击和 CTR；以 GA4 lead 事件、quote API 成功状态及实际收件箱/CRM 确认有效询盘，不把流量估算或提交成功当作成果。

## 2026-10-27 · 资源复核与高意图内容审查

- GSC 正确资源 `sc-domain:glorystarpacking.com`，Web 搜索近 28 天（2026-09-27 至 2026-10-24，界面更新约 4.5 小时前）：1,825 展示、8 点击、CTR 0.4%、平均排名 16.2。查询 `sustainable luxury packaging` 为 25 展示、0 点击、平均排名 17.6，唯一页面为 `/sustainable-luxury-packaging.html`。页面现有的组件 BOM、目标市场终端处理、保护验证与同条件报价已覆盖相同买家问题；不为追关键词新增相似内容。索引报告最后更新 2026-10-23：83 已编入索引、385 未编入索引，其中 380 主动 noindex、4 重定向、1 已抓取尚未编入索引。GSC Sitemap 最近于 10-26 成功，发现 84 页面。
- Bing 正确站点 `glorystarpacking.com/`，30 天（2026-09-27 至 2026-10-26）49 展示、0 点击。关键词报告有 45 个查询，混有少量拼写/主题噪声；只保留明确包装采购意图。Sitemap 84 URL，0 错误、0 警告，最近提交/抓取均为 10-26，状态 Success。
- Bing Pages 视图总计 13 个 URL；`/paper-thickness-gsm-pt-mm-conversion-guide.html` 13 展示、0 点击、平均位置 6.54；样品批准指南 10 展示、首页 9 展示，其他可见页均为 0 点击。
- GA4 已确认属性 Glorystarpacking `548891831` 与测量 ID `G-LYNMPWG9WK`；最近 7 天（10-20 至 10-26）新潜在客户/符合条件潜在客户/完成转化均为 0。概览仅 1 活跃用户、0 新用户、34 秒平均互动、27 事件、11 direct/none 会话；小样本不作增长结论。GA4 管理页显示尚无 Search Console 关联；本轮未更改属性关联，GA 不能提供联结后的自然查询/落地页报告。
- Semrush 镜像 `sem.3ue.com` 跳转至 `dash.3ue.com` 登录页，显示“登录过期或无效，请重新登录”；本轮没有 2026-10 美国数据库同行关键词/自然页面报告。10-15 的美国数据库 2026-09 估算只保留为历史依据。
- Reddit 近期讨论（10-21 发布，10-25/26 更新）强调整套包装终端处理、目标市场本地回收流、部件与胶/涂层、减材不能损害产品保护。现有 sustainable-luxury-packaging 指南已覆盖；未重复建文、未发帖/私信。
- 外链机会复核：Packaging Strategies 的申请入口/需企业资料、选产品类别并邮件确认已由官方页核实；新增 Global Packaging Network 供应商目录为 OUT-007，官方页说明通过联系申请建档、能力/材料/市场/联系人需管理员审批；费用、海外资格和外链属性都未知。两者均仅候选、未联系、未提交、未获得链接。详情见 `SEO_RESEARCH_20261027.md` 与 `assets/templates/phase-4-outreach-tracker.csv`。
- 正式生产审计通过：Shell 85 公共页面、84 Sitemap URL 可索引、420 未审核翻译 noindex、私有产物 404、主机规范化最多一次跳转、37 张图片映射，`/api/health` HTTP 200 且询盘邮件已配置。未提交测试询盘。
- 变更前创建仓库外 bundle 备份。根据 Bing 页面高位曝光与吻合的低量换算查询，优化 `paper-thickness-gsm-pt-mm-conversion-guide.html` 的 Title、OG/Twitter、BlogPosting 标题和 H1，明确覆盖 `pt to mm` / `µm`；不变更正文的换算事实和 GSM 区分。同步 dateModified、可见更新时间、RSS 与普通 Sitemap lastmod 至 2026-10-27。发布前验证、部署、生产验收、索引提交回执待补。
- commit `37f10aea` 已推送 GitHub `main`，Vercel 部署后目标页面 HTTP 200，线上 Title、H1、修改日期、规范链接、索引指令和询价入口与本轮内容一致。
- GSC sitemap 于 10-27 提交成功，84 网页/0 视频；更新页 URL Inspection 原已收录，重新抓取请求已接受进入优先抓取队列。Bing sitemap 10-27 提交回执为 Success/Processing、84 URL、0 错误/警告；IndexNow 接受该页 1 URL，HTTP 200。提交不是重新收录或流量结果。Reddit 已有内容匹配，本轮不另建文章；OUT-007 是经官方页核验的候选，未联系或提交。
- 本地额外尝试 `validate-build-output.mjs` 时该 worktree 没有 `.vercel/output`，故 build-output audit 报告缺少本地构建产物；发布实际由 Vercel push 部署完成，所需静态/服务检查和正式站 production audits 均通过。
- **后续动作：** Semrush 镜像需要用户重新登录；后续以同资源 GSC 点击/CTR、GA4 lead 事件和 CRM/收件箱已送达有效询盘复盘；GA4 当前没有 Search Console 关联，暂无 GA 联结后的自然搜索报告。

## 2026-10-29 · 纸张厚度页：补上 GSM→mm 搜索意图

### 数据与判断

- 依据 10-28 GSC 正确资源读数：`paper-thickness-gsm-pt-mm-conversion-guide.html` 163 展示/0 点击（全站展示最高页之一），查询 `gsm to mm` 45 展示/0 点击、`mm to gsm converter` 12/2。原页面标题只写 pt→mm，并明确写着“GSM is intentionally not an option”，与搜索者意图不匹配，是低 CTR 的最可能原因。本轮 GSC 网页端在内置浏览器中未登录，未取得新的页面级查询明细。
- 本地移动端性能抽测（Chromium 模拟 Pixel 5、4× CPU 限速）：首页、产品页、Blog、指南页 LCP 约 0.5–0.8 s、CLS 0，性能不是当前瓶颈，本轮不做性能改动。

### 已完成

- 新增“GSM to thickness estimator”区块（`#gsm-thickness-estimator`）：按 `厚度 µm = GSM ÷ 密度 g/cm³` 计算，可求厚度、GSM 或密度/松厚度；密度默认 0.8 仅作示例，界面要求替换为纸厂/供应商数据表数值，并保留“估算不代替实物样批准”的边界说明。不发布通用 GSM→mm 对照表。
- Title 改为 `GSM to mm & pt to mm: Paper Thickness Converter`；同步 meta/OG/Twitter 描述、BlogPosting headline、WebApplication 描述、H1、首屏副标题与按钮（新增“Estimate GSM to mm”锚点）；FAQ 第 1 题（可见文本与 FAQPage 同步）改为说明需借助密度换算并给出算例。
- `site.js` 新增估算器逻辑，`analytics.js` 新增 `gsm_thickness_estimator` 计算器事件；Blog 卡片与 `llms.txt` 描述同步；dateModified、可见更新日期、Sitemap/RSS lastmod 更新至 2026-10-29；重新同步站点外壳哈希并重建 5 种语言页（新区块在未审核语言页按英文回退，仍 noindex）。

### 校验

- `validate-site.mjs`（84 可索引页）、`validate-languages.py`（510 页）、Sitemap/图片 Sitemap `--check`、Quote API、服务健康、移动导航、语言运行时测试、JS 语法检查全部通过；Playwright 验证三种计算模式结果正确、手机/桌面无横向溢出、无控制台错误。
- 尚未推送 / 部署 / 提交 IndexNow 与 GSC；上线后按 PUBLISH_WORKFLOW 第 5–7 步执行，28 天后复核该页 CTR 与 `gsm to mm` 查询点击。

## 2026-10-29（续）· 按 GSC 真实查询改写首页级排名页的标题

- GSC 正确资源，近 28 天按网页：多篇指南已在第一页但 0 点击——纸张厚度 158 展示/排名 8.4、纸管 141/7.0（1 点击）、零售盒对比 63/10.3、烫金对比 48/6.1、RFQ 模板 43/9.5；商业产品页排名偏后：inserts 49.3、mailer 56.6、rigid 48.8、perfume 36.5。
- 查询中出现 AI 搜索式长提示（如 clear stickers + white ink 42 展示），说明 AI 检索已在抓取本站内容。可见商业查询：`custom drawer boxes` 9.2、`custom perfume packaging` 7.2、`perfume packaging company` 7.0、`retail box` 4.0、`overbox meaning` 7.2、`mailer box manufacturer` 10.8。
- 改写 8 页 Title/Description（同步 OG/Twitter/JSON-LD）：paper-tube、retail-box-vs-shipping-box、foil-vs-spot-uv、custom-packaging-rfq-template、custom-perfume-boxes、custom-drawer-boxes、clear-label-white-ink-artwork-guide、corrugated-shipping-box-specification-guide；只使用页面正文已支持的表述。重建 RSS 与语言页，validate-site / validate-languages / sitemap check 全部通过。
- GA4（548891831）将 `contact_click`（邮件/WhatsApp/电话点击，28 天内已有触发）标记为关键事件；`generate_lead` 原已为关键事件。GA4 ↔ Search Console 关联尚未建立，需账号所有者确认后操作。
- 上线：commit `d0452858` 推送至 GitHub `main`，Vercel 45 秒内完成生产部署。生产索引（84 可索引 / 420 noindex）、外壳、服务（询价邮件已配置）、图片 Sitemap、AI discovery 审计全部通过；IndexNow 接受 10 个 URL（HTTP 200）。
- GA4 ↔ Search Console 关联已建立（`glorystarpacking.com` 域资源 ↔ Glorystarpacking 网站数据流）。
- GSC 网址检查：纸张厚度、纸管尺寸、零售盒对比、香水盒 4 页均“网址已收录”，已请求重新编入索引（进入优先抓取队列，不代表立即更新摘要）。

## 2026-10-29（续）· 对标 LuxoPack 第一批

- 对标 luxopack.com（用户分享的 ChatGPT 分析 + 10-29 亲自核对站点）：60+ 篇采购型文章（尺寸指南、春节/斋月截单、付款安全、关税、EPR）、产品页摘要直接写起订量与交期、每页末尾“How buyers search in other markets”多语言词表。
- 新增 `chinese-new-year-2027-packaging-order-deadlines.html`（春节 2027 = 2027-02-06，来源 Drip Capital 引香港政府日历；大陆放假安排未公布，页面要求向供应商书面确认四个日期）；已加入 Blog、RSS、Sitemap、llms.txt。
- 10 个核心产品页新增德/法/西/意/葡五种语言的常见搜索词表（`#market-search-terms`）。
- validate-site（85 可索引页）、validate-languages（516 页）、Sitemap/图片 Sitemap 检查通过；Playwright 手机端无横向溢出、无脚本错误。
- 尚待用户提供：各品类起订量、打样/量产天数、价格区间——LuxoPack 产品页摘要的核心优势，本站不在未确认前写入。
- 用户确认订单事实：MOQ 1,000 pcs/款、打样 7 个工作日、量产 25–35 个工作日（打样确认后）、工厂福建厦门。已写入首页、custom-boxes 与 10 个核心产品页的 Title/Description、首屏事实行或 spec rail、FAQ（可见文本与 FAQPage 同步），并更新 MOQ 指南的 MOQ 问答。价格区间：LuxoPack 与其成本文章均未公开单价，市场平台报价差异极大，未发布任何价格数字。
- 上线：commit `b8663e4e` 推送 GitHub `main`，Vercel 45 秒完成部署；生产索引（85 可索引 / 425 noindex）、外壳、服务、图片 Sitemap、AI discovery 审计全部通过；IndexNow 接受 15 个 URL。GSC 新文章 `chinese-new-year-2027-packaging-order-deadlines.html` 显示“尚未收录”，已请求编入索引。

## 2026-10-29（续）· 第 1 周：斋月 2027 + WhatsApp 预填
- 新增 `ramadan-2027-gift-box-order-timeline.html`：斋月 2027 预计 2027-02-08 开始、开斋节约 03-09/10（Khaleej Times 引 Astronomy Centre，以月相为准），紧接春节 02-06；按本厂交期（MOQ 1,000、打样 7 工作日、量产 25–35 工作日）倒排，文件需 11 月中旬定稿。已加入 Blog、RSS、Sitemap、llms.txt。
- site.js：产品页原有 WhatsApp 预填保留；其余页面（首页、指南、博客）WhatsApp 链接自动附带页面名与“款式/尺寸/数量/目的国”模板。
- validate-site（86 可索引页）、validate-languages（522 页）通过；Playwright 验证预填链接与手机端无溢出。


## 2026-10-29（续）· 公司事实来源与商业页 AI 可引用性

- 新增 `about.html#supplier-facts`：公开公司主体、厦门所在地、定制纸盒 MOQ 1,000 pieces/款、约 7 工作日打样、样品批准后 25–35 工作日量产及货运时间另计。只使用既有用户确认信息；独立内托与其他组件继续按具体工艺报价。
- 首页和包装盒总页统一采购条件与公司事实来源，首页展示图标注为包装示例；不把图片当作已核实的生产批次证据。首页摘要补上样品批准与货运边界。
- 精修硬盒、邮寄盒、香水盒、折叠纸盒、内托 5 个核心商业页：首屏明确公司、产品与用途，补结构选择/询价输入及公司事实链接；移除其中 4 个页面的跨语言搜索词堆列。保留本日商业页 Title/Description 试验。
- 纸管尺寸、零售盒与运输盒、内托材料比较、RFQ 模板 4 篇指南加强具体产品报价入口；纸管工具旁补测量结果提交说明。实质更新页面日期与 Sitemap/图片 Sitemap 同步为 10-29，RSS 已重新校验。
- `llms.txt` 补充有来源的采购事实，区分供应商公开声明、项目报价与第三方证据。AI discovery audit 增加公司事实区和 5 个商业页的索引/引用来源校验，并修复本地预览与正式 canonical 的比较。
- 5 种语言重新生成，430 个未审核翻译内容页继续 noindex；没有新增未经核实的客户案例、证书、价格、外链或 AI 推荐记录。
- 发布前站点与多语言校验、FAQ/JSON-LD/本地链接复核、Quote API/服务健康回归、脚本语法、Sitemap/RSS 检查、12 URL IndexNow dry run 和本地 AI discovery audit 已通过。浏览器预览发现公司信息提示框网格空白，已修正结构。
- 当前工作是改善公开内容的可理解性、引用来源及采购路径；抓取/索引提交不等于实际收录、AI 引用或有效询盘。生产发布与提交回执在上线验收后补记。


### 本轮上线与提交验收

- 源码提交 `247f7db1` 已推送 GitHub main；Vercel Production `dpl_CiUV8RKsBjr8iuvCQViQ6rt1ih5G` 为 READY，正式域名返回新增公司事实区及最终文案。
- 正式站索引审计通过：86 Sitemap 页面可索引、430 未审核翻译内容页 noindex、主机规范化最多一次跳转、私有产物 404；87 公共页面的外壳与脚本/CSS 内容版本一致。
- 询盘服务健康检查通过（邮件已配置，no-store），新版 AI discovery audit 通过。没有发送测试询盘，因此此记录不代表邮件投递或客户询盘验证。
- 生产图片 Sitemap 审计有 7 个请求超时；随后针对这 7 个页面及各自 Sitemap 主图重试，14 个请求全部 HTTP 200，页面与图片 SHA-256 均匹配已校验的本地版本。没有发现图片缺失或部署内容不一致。
- IndexNow 已接受本轮 12 个更新 URL，HTTP 200。
- GSC 正确资源 `sc-domain:glorystarpacking.com` 重新提交 `sitemap.xml`，显示“已成功提交站点地图”，提交日期为 2026-10-29；上次读取仍 10-27、发现 84 页，属于旧抓取数据。`about.html` 原已收录，本次“请求编入索引”成功，进入优先抓取队列。
- 浏览器桌面检查确认首页、公司事实区、硬盒页及报价锚点正常；提示框布局修复后在独立预览中再次确认。所有提交结果只记录为抓取请求，不记录为新增收录、AI 引用或有效询盘。


## 2026-10-30 · 美国/加拿大询价输入与纸管尺寸转询盘

- 用户确认后续获客优先美国、加拿大。在物流指南加入两国配送询价清单与可下载 CSV，明确 ZIP/postal code、收货地点类型、尺寸/重量单位、所需到货日期、报价费用范围和责任；产品总页及行业页增加相关入口。不承诺当地仓库、税费或固定运输时效。
- 精修抽屉盒、磁吸盒、首饰盒、酒盒、纸袋 5 个产品页，补具体选型和询价输入、公司事实来源，移除 5 组跨语言关键词堆列。纸袋保留自身报价条件；纸盒量产时间明确从样品批准后起算，货运时间另计。保留已有 Title/Description 试验。
- 产品总页增加包装结构对比；行业页及美妆指南把应用直接连接到对应产品报价页。实质更新的 11 个页面日期改为 10-30，重建 Sitemap、图片 Sitemap、RSS、共享资源哈希与 5 种语言页面，未审核翻译内容页仍 noindex。
- 纸管尺寸工具新增明确点击的“Use these dimensions in my quote”：将当前 8 个数值及重新计算结果带入对应语言的纸管报价页，保留估算/打样批准说明，不覆盖已有填写。数据只在当前标签页临时保存 30 分钟且消费一次；URL 与分析事件不携带尺寸或个人信息。保存不可用时提供可复制摘要与普通报价链接。
- 新增回归覆盖当前值传递、过期/错误/超长草稿、目标路径、已有内容保护、字段长度、5 种语言、存储与剪贴板失败、来源归因和分析同意状态。未提交测试询盘。浏览器实测完成 70 mm 产品横截面带入报价，并修正 hidden 被 grid/button 样式覆盖造成的备用框误显示；备用框布局已预览。
- 发布前 Quote API、服务健康、移动导航、语言运行时、新增尺寸衔接回归、JavaScript 语法、Sitemap/RSS、11 URL IndexNow dry run、本地 AI discovery 检查通过。生产验收与抓取提交结果上线后补记。


### 2026-10-30 本轮上线与提交验收

- 功能提交 `12672d2d` 已推送 GitHub main；Vercel Production `dpl_D8T7WX1rDjrAwgNYbwdMZNfSmo3p`（源码 SHA `12672d2d2dd37d4ff5eb549954c96e9083d8cea4`）为 READY。正式纸管工具页面和北美询价 CSV 均 HTTP 200，SHA-256 与本地发布文件一致。
- 发布前校验通过：86 个可索引英文页及 1 个非索引页；522 个语言/源页面的一致性、表单、链接及共享资源版本均通过。正式站 87 个公共页面的外壳、CSS、site.js 和 analytics.js 版本与本地一致；询盘邮件服务已配置且使用 no-store，AI discovery audit 通过。未发送测试询盘，故不将配置检查记作邮件投递或有效询盘。
- 首次生产外壳检查启动时域名仍在返回上一个部署，版本核对失败；新部署就绪后完整重跑通过。首次服务请求也出现 fetch failed，部署完成后重跑通过。
- 全站索引巡检覆盖 86 个 Sitemap URL、430 个待审核翻译页、规范主机跳转与私有路径，仅 `custom-packaging-inserts.html` 请求失败；定向复核该页 HTTP 200、无跳转、index/follow、canonical 正确、无响应头 noindex，且内容 SHA-256 与本地一致，问题已排除。
- 图片巡检首次读取了旧版图片 Sitemap，另有 5 个页面/图片请求超时；针对最新图片 Sitemap 及这 5 组页面和主图复核，11 个请求全部 HTTP 200、无响应头 noindex，SHA-256 与本地一致，页面 canonical 和 JPEG 类型正确。其余图片检查未报告问题。
- 正式浏览器验证：将产品横截面改为 70 mm 后点击带入报价，目标表单显示正确尺寸及完整估算说明，选填详情自动展开；北美指南锚点与 CSV 下载入口可见。没有提交表单或发送邮件/WhatsApp。
- IndexNow 接受 11 个更新 URL，HTTP 200。GSC 正确域资源 `sc-domain:glorystarpacking.com` 显示“已成功提交站点地图”；提交和上次读取均为 2026-10-30，状态成功，发现 86 个网页/0 个视频。本轮无新增页面，未重复请求已在上一轮提交的纸管指南单页索引。
- 以上证明发布、可抓取条件与提交完成，不将发现网址或抓取请求记为实际 AI 推荐、新增收录或询盘增长。


## 2026-10-30 · 生成式 AI 真实基线与采购转化补齐

- 在 GSC 正确资源 `sc-domain:glorystarpacking.com` 打开生成式 AI 功能 Beta 报告，28 天范围 2026-09-30 至 2026-10-27，上次更新 4.5 小时前：总展示 245；美国 102、加拿大 8。网页首屏：透明标签白墨指南 55、运输纸箱规格指南 22、纸管尺寸指南 20、RFQ 模板 13、纸张厚度指南 13。此为 Google 生成式 AI 展示基线，未报告点击或有效询盘，也不能归因于本轮尚未发布的修改；不代表 ChatGPT 或所有 AI 的推荐情况。
- 设置页显示“生成式 AI 搜索：包含”，确认本站没有主动退出 Google AI 搜索展示。只读取，没有修改设置。证据截图保存在本地 tmp/gsc-ai-baseline-2026-10-30.png 与 tmp/gsc-ai-countries-2026-10-30.png。
- 依据 Google 当前官方说明 https://developers.google.com/search/docs/fundamentals/ai-optimization-guide，继续以实际采购内容、索引及转化路径为重点。llms.txt 本轮没有改动，不把该文件或特殊 Schema 作为 Google AI 展示的保证。
- 美妆盒、纸管、运输纸箱、折叠硬盒、天地盖 5 页补清公司、厦门所在地、产品用途及公司事实来源；4 个纸盒页展示已确认的 MOQ 与样品/生产条件，量产从样品批准后计算、货运另计。纸管最小量和具体交期保持按结构报价确认。运输纸箱页移除最后一组跨语言关键词堆列。
- 5 个产品页报价区补具体结构输入、相关选型指南和美国/加拿大配送信息入口。透明标签白墨指南依据 55 次 AI 展示的实际基线，在工具旁增加带具体输入要求的清晰报价入口，移除面向搜索引擎而非买家的“different search intent”说明；同步真实修改日期，保留本轮前标题试验。
- AI discovery 审计的公司事实来源检查由 6 页扩展至 16 页；多语言和 Sitemap/图片 Sitemap/RSS 已同步。发布前静态校验、Quote API、服务健康、语法、Sitemap/RSS、本地发现性审计及 6 URL IndexNow dry run 已通过。生产发布及提交结果另记。

- 上线验收：源码 `c623e75c` 已推送，Vercel Production `dpl_BzeMbv6h9E3n7LYR5KEhPwKQiHkp` 为 READY。IndexNow 脚本核对正式页面及 Sitemap 与本地版本后，6 个更新 URL 获 HTTP 200 接受；正式图片 Sitemap 与 RSS 内容哈希匹配本地。正式站扩展后的 16 页公司事实来源审计和服务健康检查通过，未发送测试询盘。浏览器确认透明标签工具旁的新报价入口已在正式站出现；GSC 正确资源显示“已成功提交站点地图”。


## 2026-10-30 · AI 已曝光指南的询价可用性

- 继续依据上一轮 GSC 2026-09-30 至 10-27 的 AI 展示基线优化，未把同日重复检查记作增长。透明标签商业页补公司、厦门所在地、公司事实来源、SKU 数量和白墨/应用输入；标签 MOQ 与具体交期保持按项目确认，不套用纸盒条款。
- 白墨指南新增可选取复制的询价示例，明确标为虚构填写示范、要求替换示例数值；不作为客户项目或起订量。链接真实产品报价入口及已有试验 CSV，明确 CSV 通过 email 发送。
- 运输纸箱规格指南在计算工具旁补 RFQ 输入和产品报价入口，要求区分内外尺寸并注明托盘数为需复核估算；加入北美收货地点、邮编和到货日期要求。
- 修复 RFQ 指南的发送指引：下载 CSV 后通过 email 发送，或把关键行粘贴到匹配表单的详情；明确网页附件只支持 PDF、JPG、PNG、WebP，3 MB 上限。没有扩大上传类型或改变邮件接口。
- 4 页真实修改日期、Sitemap、图片 Sitemap、RSS 和 5 种语言页同步，保留标题/描述试验。AI discovery 的公司事实来源检查扩展至 17 页。发布前站点、多语言、Quote API、服务健康、脚本语法、Sitemap/RSS、本地发现性审计与 4 URL IndexNow dry run 已通过；浏览器确认示例标签、内容与链接可见。生产回执另记。

- Production verification: source commit `6e0ee5f8` deployed READY at `glorystarpacking-jsylu46te-glorystarpack-s-projects.vercel.app`; production 17-page supplier-source discovery audit and quote service configuration checks passed. IndexNow verified changed pages and Sitemap against the release and accepted 4 URLs with HTTP 200. Production image Sitemap and RSS hashes match local. Browser confirmed the new example on the canonical domain; GSC returned sitemap submission success. No test inquiry was sent, and no new AI impression or inquiry result is attributed to this release.


## 2026-10-30 · 北美询价的配送信息与采购路线

- 为共享 JS 询价表单新增选填 ZIP/postal code（最多 32 字符）和收货类型，涵盖商业仓库、3PL、零售、住宅及其他地点，放在原选填区域，不增加必填项。原生无 JS 表单仍可按原字段提交。
- 后端新增两个有长度上限的字符串字段，询价邮件及完整备用摘要保留这些信息；前端备用 Email/WhatsApp 仍遵守原长度上限，完整复制保留所有内容。没有把邮编或收货类型加入分析事件。
- 新增回归覆盖美国和加拿大邮编、旧客户端缺省字段、长度限制、非字符串拒绝、原生失败页摘要、前端选填显示、6 个下拉选项与备用摘要。浏览器发现商业仓库选项标记错误，已修复并用下拉选项数量和实际选择复核；加拿大示例邮编和商业仓库可正常填写。未发送真实测试询盘。
- China vs local 指南新增美国/加拿大采购路线段落，按小批/变化需求、稳定纸盒订单和混合采购比较，引用已确认 MOQ 与样品批准后生产条件；物流指南提供入口。没有新增未经证实的价格、客户结果、关税或当地仓库承诺。
- 同步共享 JS 哈希、5 种语言、Sitemap/图片 Sitemap/RSS。站点静态校验、多语言、Quote API、配送/纸管衔接、服务健康、移动导航、语言运行时、语法、发现性审计和 6 URL IndexNow dry run 通过。原 GSC AI 展示基线未更新，不将本轮工作记为新增推荐或询盘增长；正式发布回执另记。

- Production verification: source `71e1a8e5` deployed READY as `dpl_GdNDUiYANdddDurD3rBKjaF23fub`. All 87 public-page shell/script versions match local; production service configuration and AI discovery audits passed. IndexNow accepted 6 priority URLs with HTTP 200 after release checks; image Sitemap and RSS hashes match local. Browser confirmed optional Canadian postal code and Commercial warehouse selection on the canonical homepage; no quote was submitted. GSC returned sitemap submission success. No new AI impression or inquiry growth is attributed to this release.


## 2026-10-30 · 标签询价路径与 AI 来源识别质量

- 将 AI 来源识别从品牌子串匹配改为已知入口的主机边界匹配，以及明确的 UTM 来源标签匹配。保留首次访问记录、原有普通搜索归因及缺失 referrer 时的 direct 分类；不把无法观察到的 AI 应用来源推断为已确认推荐。
- 回归覆盖 ChatGPT、Perplexity、Copilot、Claude、Gemini、You.com 的入口、相似但不匹配的域名、普通含品牌字样的活动标签、格式错误 referrer 和既有首次访问记录。官方 Copilot 旧入口在检查时重定向到 copilot.com，已加入新旧入口；该工具未能读取跳转后的页面正文，不作为页面内容或推荐结果证据。
- 标签总页新增按透明外观、环境暴露、酒瓶冷湿场景、装饰工艺选择报价入口的对比表；每行列出报价输入并直达对应产品表单。浏览器确认耐水标签入口到达正确页面并预选 Custom waterproof labels。
- 标签总页和耐水标签页补齐公司所在地、公司事实来源、项目报价条件和具体选型输入，北美配送信息明确引导使用表单的选填项。标签 MOQ/交期保持按项目确认，不套用纸盒条件。
- 共享脚本、5 种语言、Sitemap/图片 Sitemap/RSS 同步；公司来源审计扩展至 19 页。本轮测试覆盖来源识别、原询盘接口、配送与纸管衔接、移动导航、语言运行时及发现入口，不发送真实询盘。原 Google AI 展示基线未重读或计作本轮增长。发布验收另记。

- Production verification: source `4e697909` deployed READY at `glorystarpacking-c1tpgcsgj-glorystarpack-s-projects.vercel.app`. All 87 public-page shell and script versions match local; production service configuration and 19-page supplier-source discovery audit passed. IndexNow verified the release and accepted 3 priority URLs with HTTP 200. Production image Sitemap and RSS match local hashes. Browser confirmed the four label quote routes; GSC returned sitemap submission success. No live test inquiry was submitted and no new traffic or lead growth is claimed.


## 2026-10-30 · 起订条件适用范围与剩余组件询价信息

- 成本/MOQ 指南原 FAQ 把 1,000 件及样品/生产时间写为全品类条件，与已确认的定制纸盒范围不符；可见 FAQ 和结构化答案现同时明确 custom paper boxes per design、样品批准后量产、货运另计，标签/吊牌/薄页纸/单独组件需另行确认。首段补公司事实来源，保留原发布日并更新实际修改日期。
- 酒标、压纹烫金标签、吊牌、印刷薄页纸 4 个产品页补供应商、厦门所在地、公司事实来源和项目报价条件。各页增加具体输入：酒瓶冷湿试验、装饰标签工艺定位、吊牌 SKU/附件/数据版本、薄页纸尺寸与包数；引导美国和加拿大买家填写邮编、收货地点及到货日期。未套用纸盒 MOQ/交期。
- llms.txt 的条件边界同步纠正，不将该文件当作 Google AI 展示保证。AI discovery audit 扩展为 23 个公司事实来源页面，并增加成本指南的条件范围及文章索引检查；所有 5 页及 5 种语言、Sitemap/图片 Sitemap/RSS 同步。
- 发布前站点与多语言校验、FAQ/JSON-LD 一致性、Quote API、服务健康、语法、Sitemap/RSS、本地发现性审计及 5 URL IndexNow dry run 已通过。未发送真实询盘，没有将同日优化记录为新增 AI 展示、推荐或询盘结果。上线验收另记。

- Production verification: source `64d0c7c4` deployed READY as `dpl_GnsKPwRGgKup8geTMqdB35AVxgwK`. Production service configuration, the 23-page supplier-source audit, and the new paper-box MOQ-scope check passed. IndexNow verified the release and accepted 5 URLs with HTTP 200; image Sitemap, RSS, and llms.txt hashes match local. Browser confirmed the corrected ordering scope on the canonical domain. GSC returned sitemap submission success. No live test inquiry was sent and no traffic or inquiry growth is claimed for this release.
