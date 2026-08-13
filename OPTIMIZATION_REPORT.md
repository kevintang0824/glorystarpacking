# GloryStarPack 网站优化报告（更新至 2026-08-10）

## 本次完成

- 重新设计首页、定制包装盒页、标签页和 Insights 页
- 建立统一的 `assets/site.css` 视觉系统与 `assets/site.js` 交互脚本
- 增加手机端汉堡导航、键盘焦点、跳过导航和可访问 FAQ
- 每页调整为单一 H1，并补齐独立 title、description、canonical、Open Graph 和 Twitter Card
- 增加 Organization、WebSite、FAQPage、CollectionPage、Blog、BlogPosting 和 BreadcrumbList 结构化数据
- 增加 `robots.txt`、`sitemap.xml`、SVG favicon 和 Web App Manifest
- 将 39 张阿里 CDN 外链图片保存到项目，转换成适合网页的 JPEG，并改为语义化文件名
- 图片从约 55 MB PNG 原图压缩为约 8.2 MB，页面图片均使用尺寸声明、懒加载和异步解码
- 删除博客中的 `#` 占位链接，补充 4 篇可阅读的包装采购内容
- 建立 `/api/quote` Vercel Function，通过 Resend 发送询盘与附件
- 表单未配置邮件 API 或仍在 GitHub Pages 时，自动打开预填邮件作为兜底
- 增加表单附件类型/3 MB 大小校验、隐藏 honeypot、防空字段和明确的成功/错误状态
- 增加 Vercel 安全响应头和静态资源缓存策略

## 视觉方向

- 受众：海外品牌创始人、包装采购和产品团队
- 页面任务：提交一份具备报价条件的项目需求
- 视觉语言：炭黑、纸白、黄铜金和印刷套准红
- 识别元素：包装刀模网格、裁切角、套准标记和生产编号
- 字体：Bodoni Moda（展示）+ Manrope（正文和操作）

## 验证结果

- Lighthouse Mobile：
  - Accessibility：100
  - Best Practices：100
  - SEO：100
  - Agentic Browsing：100
- JavaScript 语法检查：通过
- Vercel Function 模拟发送：HTTP 200
- 未配置邮件环境时的兜底状态：HTTP 503，由前端转入邮件客户端
- Honeypot 模拟：通过
- 4 页 JSON-LD：全部可解析
- 4 页 ID：无重复
- 4 页 H1：每页 1 个
- 39 张本地图片：无缺失、浏览器请求均为 200
- 首页、包装盒页、标签页和 Insights 页：无控制台错误
- 桌面宽度 1200 px：无横向溢出
- 手机首屏、导航按钮和表单：通过浏览器检查

## 上线前仍需配置

1. 在 Resend 验证发件域名。
2. 在 Vercel 设置 `RESEND_API_KEY`、`QUOTE_TO_EMAIL` 和 `QUOTE_FROM_EMAIL`。
3. 按 `FORM_SETUP.md` 完成真实邮箱收件测试。
4. 在 Vercel 预览域名做最终内容与事实核对。
5. 确认后再切换正式域名，不要直接覆盖当前线上站点。

## 图片备份

下载的 39 张原始 PNG 共约 55 MB，已从工作区移到：

`/private/tmp/glorystarpacking-original-png`

工作区保留压缩后的 39 张 JPEG。原始 PNG 也可以从压缩包中的公开阿里 CDN URL 重新获取。

## 第二轮：竞品学习与 SEO 增长优化

根据 LuxoPack 的产品页、行业页、工厂信任和采购内容结构，本轮没有复制其品牌话术或未经证明的数据，而是建立了 GloryStarPack 自己的 “盒子 + 标签一体化” 获客架构。

### 新增 12 个页面

- `custom-rigid-boxes.html`
- `custom-magnetic-boxes.html`
- `custom-mailer-boxes.html`
- `cosmetic-packaging-boxes.html`
- `custom-wine-labels.html`
- `industries.html`
- `about.html`
- `privacy.html`
- `luxury-unboxing-guide.html`
- `foil-vs-spot-uv.html`
- `sustainable-luxury-packaging.html`
- `packaging-logistics-guide.html`

站点从 4 个可索引 URL 扩展到 16 个，每页有独立 title、description、canonical、H1、Open Graph、面包屑和相应的 Service、Article、FAQ 或集合页结构化数据。

### 更新现有页面

- 首页改为承接 `custom packaging manufacturer in China`，并突出盒子与标签统一开发。
- `custom-boxes.html` 改为集合页，增加盒型比较表并链接到独立产品页。
- `box-labels.html` 增加酒标入口，并收紧 RFID / NFC 的规格表述。
- `blog.html` 改为真正的文章索引，4 篇内容拆成独立 URL。
- 全站导航统一为 Custom boxes、Labels、Industries、Factory、Guides 和 Start a quote。
- 所有询价表单增加隐私说明链接。
- `sitemap.xml` 更新为 16 个 URL。
- 增加 `scripts/validate-site.mjs`，可在每次更新后自动检查元数据、H1、JSON-LD、重复 ID、资源、内链、锚点和 sitemap。

### 浏览器验收中修复

- 修复移动端导航因 `backdrop-filter` 建立包含块而只显示第一项的问题。
- 导航展开时的无障碍名称从 “Open navigation” 正确切换为 “Close navigation”。
- 修复图片带 HTML 高度属性而被拉成 1024px 高的问题，首页产品图回到正确比例，桌面首屏 CTA 可见。
- 收紧产品页桌面和手机标题尺寸，减少模板化超大标题。
- 手机宽度隐藏会遮挡主 CTA 的浮动联系方式。

### 本轮验证

- 16 个 HTML 页面静态校验通过。
- 每页恰好 1 个 H1、title、description 和 canonical。
- 全部 JSON-LD 可解析。
- 无重复 ID、断裂内链、缺失锚点或缺失本地图片。
- sitemap 包含全部 canonical URL。
- 16 个页面及 robots、sitemap、manifest、CSS、JS 均通过本地 HTTP 200 检查。
- JavaScript 和 Vercel Function 语法检查通过。
- 桌面 1280 × 720 与手机 390 × 844 无横向溢出。
- 手机导航展开/关闭、FAQ、询价产品预选均通过真实浏览器测试。
- 浏览器页面控制台无站点自身错误或警告。

详细关键词分工、可信度边界和上线后 90 天计划见 `SEO_GROWTH_PLAN.md`。

## 第三轮：产品目录扩充与内链优化

本轮将产品架构从“少量重点落地页”扩展为“总目录 → 分类中心 → 单一产品页”的三级浏览路径。新增内容仍以采购决策为主，没有复制竞品价格、认证、客户评价或无法核验的工厂数据。

### 新增 7 个页面

- `products.html`：12 个核心产品家族的总目录，并补充纸管、吊牌、卡片、纸张和丝带等询价入口；
- `custom-drawer-boxes.html`：抽屉盒的套筒、内抽、滑动公差、拉带、内托和装箱方向；
- `lid-and-base-boxes.html`：天地盖与肩颈盒的盖深、摩擦配合、包纸和内托；
- `folding-carton-boxes.html`：折叠纸盒的纸板、盒型、压痕、平板运输和装盒方式；
- `custom-packaging-inserts.html`：纸板、纸浆、EVA、EPE 和包布内托的选型与产品适配；
- `custom-paper-bags.html`：纸张、侧褶、承重、顶部加强、手挽和运输包装；
- `embossed-foil-labels.html`：烫金、压凸、击凸套准、胶黏剂、卷向和应用环境。

站点从 16 个可索引 URL 扩展到 23 个。

### 全站结构更新

- 主导航首项从 `Custom boxes` 改为 `Products`，所有页面都能直接进入产品总目录；
- 首页产品区从 3 个入口扩展到 6 个，并增加完整目录 CTA；
- `custom-boxes.html` 增加抽屉盒、天地盖、折叠纸盒、内托和纸袋的深层链接；
- `box-labels.html` 增加压凸与烫金标签的独立入口；
- 首页和分类页询价表补齐新增产品选项，支持 URL 参数预选；
- `sitemap.xml` 更新为 23 个 canonical URL，`lastmod` 更新为 2026-07-29；
- 静态校验脚本增加 FAQ 控件关联、主导航当前页唯一性、title 和 description 长度检查。
- 移除未确认的“24 小时回复”及标签页固定 MOQ/周期数字，保留可由实际项目条件确认的描述；
- 修正首页、About 和 Industries 页的可见 FAQ 与 JSON-LD 不一致；
- 面包屑允许自动换行，避免三层产品路径在 320px 左右的窄屏被裁切。

### 本轮静态验证

- 23 个 HTML 页面均有且仅有一个 title、description、canonical 和 H1；
- 全部 JSON-LD 可解析；
- 无重复 ID、断裂内链、缺失锚点或缺失本地图片；
- FAQ 按钮与答案的 `aria-controls` 关联有效；
- sitemap 包含全部 23 个 canonical URL；
- `assets/site.js` 与 `api/quote.js` 语法检查通过。

### 本轮浏览器验收

- 产品总目录在桌面 1280 × 720 和手机 390 × 844 下均无横向溢出；
- 目录页 15 张产品卡片和全部可见图片加载正常；
- 手机导航展开、关闭、页面锁定和无障碍名称切换正常；
- 产品 FAQ 展开状态、图标和答案显示正常；
- `?product=paper-bags#quote` 等 URL 可自动预选询价产品并定位到表单；
- 六个新增详情页在 390 px 宽度下均无横向溢出、缺失图片或重复当前导航；
- 首页扩展后的 6 张产品卡片在桌面端布局正常；
- 浏览器控制台无站点自身错误或警告。

## 第四轮：新品类扩充与目录深化

本轮继续把目录从通用包装入口细分为可独立承接搜索和询盘的产品页。参考竞品的产品分类方式，但没有沿用其价格、MOQ、客户、认证或无法核验的性能承诺。

### 新增 6 个产品页

- `collapsible-rigid-boxes.html`：折叠硬盒的平板运输、组装顺序、角部固定、闭合、包纸、装箱和运输体积；
- `custom-corrugated-shipping-boxes.html`：RSC 与邮寄盒选择、内尺寸、瓦楞纸板、堆码、封箱、内保护、托盘和运输测试；
- `custom-jewelry-boxes.html`：戒指、耳饰、项链和腕表的接触面、固定、取放、尺寸系列、抽检和外箱保护；
- `custom-tube-packaging.html`：纸筒结构、内径、高度、筒壁、卷边、接缝、盖合、内托、打样和装箱；
- `custom-hang-tags.html`：纸张、尺寸、孔位、鸡眼、绳带、烫金压凸、条码、可变数据、配套装袋和 QC；
- `custom-tissue-paper.html`：克重、遮盖度、单张尺寸、包裹方式、印刷覆盖、透印偏移、折叠、装箱和回收表述边界。

站点从 23 个可索引 URL 扩展到 29 个。

### 目录、首页与内链

- 产品总目录从 15 张卡片扩展到 18 张，ItemList 结构化数据同步为 18 项；
- 首页产品区从 6 张卡片扩展到 9 张，增加折叠硬盒、纸筒和运输箱入口；
- 珠宝行业入口改为直接进入珠宝盒产品页；
- 磁吸盒、邮寄盒、纸袋和标签页分别增加折叠硬盒、运输箱、薄页纸和吊牌的上下游内链；
- 首页、产品目录和盒型集合页补齐新品询价选项，URL 参数可自动预选具体产品；
- `sitemap.xml` 更新为全部 29 个 canonical URL；
- SEO 关键词分工增加 6 个新品类，避免同类页面互相抢占搜索意图。

### 校验能力与验收

- 静态校验脚本增加 `article`、`section`、`main`、`nav` 和 `form` 标签平衡检查；
- 产品总目录自动核对 ItemList 声明数量、结构化数据元素数量和可见产品卡片数量；
- 29 个 HTML 页面全部通过元数据、单一 H1、JSON-LD、FAQ 逐字一致、导航、ID、资源、内链、锚点和 sitemap 校验；
- `assets/site.js` 与 `api/quote.js` 语法检查通过；
- 产品总目录在 1280 × 720 和 390 × 844 下分别保持 18 张卡片、无横向溢出和无损坏图片；
- 六个新品页在 390 px 宽度下均无横向溢出或损坏图片，每页保持唯一当前导航、6 组 FAQ 和正确的询价产品预选；
- 首页产品区确认 9 张产品卡片，桌面端无横向溢出；
- 手机导航展开状态、无障碍名称切换、FAQ 展开和 `?product=custom-tube-packaging#quote` 自动预选均通过；
- 浏览器页面未发现来自站点代码的控制台错误或警告。

## 第四轮：高意向产品扩充与目录深化

本轮继续围绕买家的真实采购问题扩充产品覆盖。参考竞品的分类方式，但没有复制其价格、MOQ、认证、客户、产能或效果承诺；所有新页面都把结构、尺寸、材料、样品、质检、装箱和运输条件写成可用于询价的规格路径。

### 新增 6 个产品页

- `collapsible-rigid-boxes.html`：平板交付、组装顺序、折角保持、闭合、板材与包纸、仓储和装箱体积；
- `custom-corrugated-shipping-boxes.html`：RSC 与邮寄盒差异、内尺寸、楞型与纸板、封箱、堆码、内保护、运输测试和托盘方案；
- `custom-jewelry-boxes.html`：戒指、耳环、项链和手表的接触面、固定、取放、尺寸系列、样品、质检和外箱保护；
- `custom-tube-packaging.html`：纸筒结构、内径与高度、筒壁、卷边、接缝、盖合、内托、样品和主箱包装；
- `custom-hang-tags.html`：纸张、孔位、鸡眼、绳带、烫金、压凸、条码与变量数据、方向、配套装袋和质检；
- `custom-tissue-paper.html`：克重与不透明度、单张尺寸、包裹方式、印刷覆盖、透印与蹭色风险、折叠和装箱。

站点从 23 个可索引 URL 扩展到 29 个。

### 目录、首页与内链更新

- 产品总目录从 15 张卡片扩展到 18 张，并按 Boxes、Components、Labels 继续分组；
- 首页主产品区从 6 张卡片扩展到 9 张，增加折叠硬盒、纸筒包装和瓦楞运输箱；
- `custom-boxes.html` 增加折叠硬盒、运输箱和珠宝盒入口及比较信息；
- Industries 的珠宝入口直接连接到珠宝盒落地页；
- 磁吸盒、邮寄盒、纸袋和标签页分别增加与折叠硬盒、运输箱、薄页纸和吊牌相关的深层链接；
- 首页、目录页和分类页询价表补齐六类产品值，URL 查询参数可正确预选；
- ItemList 结构化数据更新为 18 个产品家族，`sitemap.xml` 更新为 29 个 canonical URL；
- 静态校验脚本增加常用结构标签开闭数量，以及目录 ItemList 与可见产品卡片数量、链接顺序一致性检查。

### 本轮验证

- 29 个 HTML 页面通过元数据、唯一 H1、JSON-LD、FAQ 逐字一致、导航、ID、图片、内链、锚点和 sitemap 校验；
- `assets/site.js` 与 `api/quote.js` 语法检查通过；
- 产品总目录在 1280 × 720 和 390 × 844 下均无横向溢出，18 张产品卡片和图片加载正常；
- 首页主产品区显示 9 张卡片，桌面端无横向溢出或坏图；
- 六个新增页面在 390px 宽度下均无横向溢出、坏图或重复当前导航，且各自的询价产品值正确；
- 手机导航展开/关闭、FAQ 展开和 `?product=custom-tube-packaging#quote` 自动预选通过；
- 浏览器控制台无站点自身错误或警告。

## 第五轮：高意向酒类、香水与标签页面扩充

本轮继续按“一个 URL 对应一个主要采购与搜索意图”的原则扩充目录。新增页面使用现有、可核验的产品与材料图片，不复制竞品价格、MOQ、认证、客户或无法确认的性能数据。

### 新增 4 个产品页

- `custom-wine-boxes.html`：围绕满瓶重量、瓶肩/瓶颈支撑、内托取放、底部承载、单瓶/双瓶布局和外运输箱建立酒类礼盒询价路径；
- `custom-perfume-boxes.html`：围绕玻璃瓶、瓶盖与泵头间隙、底部/肩部支撑、抗刮、取放、套装 SKU 和运输保护建立香水盒询价路径；
- `custom-clear-labels.html`：围绕透明容器、无标签外观、白墨衬底、可见雾度、表面和贴标条件建立透明标签询价路径；
- `custom-waterproof-labels.html`：围绕潮湿、摩擦、油污和温度等真实暴露条件建立耐久标签规格与测试路径。

站点页面数由 29 个扩展到 33 个。

### 目录、首页与页面职责

- 产品总目录由 18 张卡片扩展到 22 张，并保持 Boxes、Components、Labels 三类结构；
- 首页产品区由 9 张卡片扩展到 12 张，增加高意向酒盒、香水盒和耐久标签入口；
- `box-labels.html` 调整为标签分类中心，透明标签和防水耐久标签由独立子页面承接，减少关键词互相竞争；
- 酒盒页负责瓶身支撑、内托和运输，酒标页继续负责材料、胶黏剂与印刷；
- 香水盒页负责玻璃瓶、瓶盖/泵头、取放和套装，化妆品包装页继续作为更广泛的分类入口；
- 新页面与目录、行业、相关盒型/标签页之间增加描述性内链，形成分类中心与产品详情的双向路径。

### 询价与接口安全

- 全站 26 个询价表单使用一致字段：交付国家/地区为必填项，目标到手日期为可选项；
- 前端 API 提交和邮件兜底均保留 `country` 与 `targetDate`，减少因交付条件缺失造成的往返确认；
- `/api/quote` 对 PDF、JPG/JPEG、PNG 和 WebP 附件执行扩展名、MIME、Base64、解码后大小和文件签名字节校验，单文件上限为 3 MB；
- 询价 API 响应增加 `Cache-Control: no-store`；
- `.vercelignore` 改为公开文件 allowlist，避免项目文档和开发脚本进入部署包；
- `robots.txt` 增加 `Disallow: /api/`，`vercel.json` 明确使用 `trailingSlash: false`。

### 本轮验证

- 33 个 HTML 页面通过扩展后的静态校验：元数据与社交 URL、唯一 H1、JSON-LD 与可见 FAQ 逐字一致、导航、ID、图片尺寸、26 个询价表单、资源、内链、新品入口、API 安全信号和 sitemap 均一致；
- 产品总目录在 1280 × 900 与 390 × 844 下均显示 22 张产品卡片，桌面 3 列、手机 1 列，无横向溢出、损坏图片或目录 ItemList 顺序偏差；
- 首页主产品区确认 12 张产品卡片，桌面 3 列、手机 1 列，无横向溢出或损坏图片；
- 四个新增页面在 390 × 844 下均保持唯一 H1、唯一当前导航、6 组 FAQ、正确产品预选、必填国家、可选到手日期和零横向溢出；
- 手机导航展开/关闭与无障碍状态切换正常，FAQ 展开状态、答案和图标同步；
- `products.html?product=custom-clear-labels#quote` 可自动预选透明标签并定位询价区；
- 新增 `scripts/test-quote-api.mjs` 回归脚本；Vercel Function 模拟检查覆盖无附件、有效 PDF、缺少国家、禁止扩展名、伪造 PNG、错误 Base64 与错误请求方法，API 返回码、3 MB 限制和 `no-store` 响应符合预期；
- 浏览器未发现来自站点代码的控制台错误或警告。

## 第六轮：收录规范、GEO 内容与询盘来源闭环

本轮优先处理会影响搜索信号归一、AI 搜索发现和获客归因的技术问题，而不是继续批量增加相似产品页。

### 技术 SEO 与 AI 搜索抓取

- 全站内部首页链接由 `index.html` 统一为 `/`，避免内部链接继续强化与首页 canonical 不一致的重复 URL；
- Vercel 配置增加 `/index.html` 到 `/` 的永久跳转，以及 `www.glorystarpacking.com` 到主域的永久跳转；
- 34 个页面增加统一 robots meta，明确允许索引、跟踪链接和大图预览；
- `robots.txt` 明确允许 `OAI-SearchBot` 抓取公开页面，同时继续阻止 `/api/`；
- 移除未核实的固定 `100 pcs` MOQ、`12–18 days` 生产周期和无条件全球 DDP 表述，改为按结构、产能计划、目的地和具体贸易条件确认；
- 静态校验增加 robots meta、canonical 路径、首页链接、主域跳转、AI crawler policy 和 attribution API 信号检查。

### 新增长尾采购指南

- 新增 `packaging-sample-approval-checklist.html`，承接 `packaging sample approval checklist` 搜索意图；
- 内容覆盖样品类型、适配、开合、材料、稿件、色彩、烫金压凸、装箱、项目测试和版本控制；
- 从 `blog.html`、`about.html` 和 `products.html` 建立上下文内链；
- Article、BreadcrumbList、Open Graph、canonical 和 sitemap 已同步；
- 站点由 33 个可索引页面扩展到 34 个。

### 询盘来源归因

- 表单在 session storage 中保留首次进入页面、referrer 和标准 UTM 参数；
- 只有用户实际提交询价时，这些来源信息才随项目表单发送；
- API 邮件和 mailto 兜底均包含来源信息，可区分 Google、ChatGPT、合作伙伴和活动流量；
- 隐私说明已同步更新，不启用广告 Cookie。

### 本轮验证

- 34 个 HTML 页面通过元数据、robots、canonical、H1、JSON-LD、导航、图片、表单、内链、跳转、crawler policy、API 和 sitemap 校验；
- Quote API 通过来源归因、附件签名、Base64、大小限制、必填国家、no-store 和方法限制测试；
- 新指南在 1440 × 1000 和 390 × 844 下保持文档宽度与视口一致；
- 手机导航状态、横向滚动表格、全部图片和 UTM → 表单 payload 路径通过真实浏览器测试；
- 浏览器未发现站点控制台错误或资源 404。

### 尚未执行

- 当前目录已经是 Git worktree，但没有连接此项目的 `.vercel/project.json`，因此本轮没有覆盖正式线上环境；
- 正式发布前仍需确认公司主体、可公开地址、关联域名、证书、MOQ、交期和发送邮箱配置；
- 上线后需在 Google Search Console 与 Bing Webmaster Tools 提交 sitemap 并检查实际索引状态。

## 第七轮：成本与 MOQ 商业内容、AI 内容地图

本轮没有继续批量增加相似产品页，而是补充更接近采购决策和询价的商业信息缺口。

### 新增高意向采购指南

- 新增 `custom-packaging-cost-moq-guide.html`，承接 `custom packaging cost` 与 `custom packaging MOQ` 搜索意图；
- 内容按结构尺寸、材料、工具与开机、印刷表面处理、内托装配、数量版本、质检包装与交付七组成本驱动展开；
- 增加 MOQ 形成原因、打样/试单/复购/多 SKU 四种数量策略、降本路径、同口径报价对比和落地成本范围；
- 页面使用 Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage 结构化数据，不发布固定 MOQ、单价、认证或交期承诺；
- 从 `blog.html`、`products.html` 和 `custom-boxes.html` 建立上下文内链，`sitemap.xml` 同步新增 canonical URL；
- 站点由 34 个可索引页面扩展到 35 个。

### AI 发现与事实边界

- 新增根目录 `llms.txt`，提供站点定位、核心目录、高意向指南和最具体页面链接；
- 明确 MOQ、周期、认证、测试标准、材料声明、税费和贸易条件必须按实际项目核实，减少 AI 摘要把条件性说明改写成无条件承诺的风险；
- 静态校验脚本增加 `llms.txt` 内容地图和事实边界检查；`llms.txt` 仅作为辅助发现文件，不作为搜索或 AI 推荐保证。

### 本轮验证

- 35 个 HTML 页面通过 metadata、robots、canonical、唯一 H1、JSON-LD/FAQ 一致性、导航、图片、表单、内链、跳转、crawler policy、API、llms 和 sitemap 校验；
- Quote API 回归覆盖有效请求、来源归因、国家必填、文件白名单与签名、严格 Base64、`no-store` 和请求方法限制；
- 新指南、`llms.txt` 和 `sitemap.xml` 通过本地 HTTP 200 检查；
- 新指南在 1440 × 1000 桌面视图与 500 × 900 窄屏视图完成无头浏览器检查，移动标题、规格栏、图片和首屏文案无裁切；
- CSS 与 JavaScript、API、校验脚本语法检查及 `git diff --check` 通过。

## 第八轮：索引投递、AI 来源识别与错误页治理

本轮继续优先处理收录和衡量闭环，没有新增相似产品页，也没有加入未经业务确认的公司、认证、客户、MOQ 或交期信息。

### 技术 SEO 与收录工具

- 新增 `404.html`，使用 `noindex,follow`，保留产品目录、指南与询价入口，避免错误地址形成可索引的软 404 内容；
- 删除旧 GitHub Pages 使用的 `CNAME`，仓库只保留 Vercel 生产发布路径；
- 为 `/api/*` 增加 `X-Robots-Tag: noindex, nofollow` 与 `no-store` 响应头，为 robots、sitemap、llms 和 IndexNow key 配置明确缓存；
- 新增根目录 IndexNow 验证文件、`scripts/submit-indexnow.mjs` 和可手动运行的 GitHub Actions workflow；脚本默认读取 sitemap，也允许只提交本次真正更新的 URL，并拒绝站外 URL；
- 全站 `site.js` 缓存版本更新为 `20260801-1`，避免部署后继续使用旧归因脚本。

### GEO、实体与归因

- `llms.txt` 扩展为 Boxes、Components、Labels 三组具体产品与规格页面，AI 系统可直接定位到最具体的支持页面；
- 6 篇采购指南的可见作者署名与 Article author schema 均连接到 About 页面，强化内容与站点实体之间的一致关系；
- 询价来源新增 discovery channel/source：可区分 AI search、organic search、campaign、referral 与 direct；
- ChatGPT、Perplexity、Microsoft Copilot、Claude、Gemini 和 You.com 来源可随实际询价进入邮件，隐私说明同步更新；
- Article `dateModified`、Open Graph modified time 与 sitemap `lastmod` 保持一致，并由校验脚本自动检查。

### 验证与线上阻塞

- 35 个可索引页面和 1 个不可索引 404 页面通过静态 SEO、JSON-LD、内链、表单、sitemap、IndexNow 和 Vercel 配置校验；
- Quote API 回归通过，确认 AI discovery channel/source 会出现在询价邮件；
- IndexNow 完整 sitemap dry run 为 35 个 URL，指定 URL dry run 与同源限制通过；
- 本地 HTTP 共检查 42 个页面与资源，全部返回 200；JavaScript/API 语法与 `git diff --check` 通过；
- 正式域名验证仍受上线侧阻塞：现有 Vercel OIDC 凭据返回 403，命令行 TLS 请求失败，浏览器也未能加载正式域名。因此本轮没有声称已部署或已提交 IndexNow；需先恢复 Vercel 登录和域名访问，再发布并执行搜索平台提交。

## 第九轮：盒型比较搜索意图与内容发现一致性

本轮围绕具有明确采购决策意图的 `magnetic box vs drawer box` 主题新增一篇独立指南，并把内容发现、结构化数据和自动校验连接起来。

### 新增盒型比较指南

- 新增 `magnetic-box-vs-drawer-box.html`，从开盒动作、产品揭示、内托、配合公差、质量风险、装箱体积、运输和打样计划比较磁吸翻盖盒与抽屉盒；
- 内容加入同口径询价清单和选择矩阵，帮助采购方按产品、渠道、装配和物流条件做结构决策，不发布未经确认的固定价格、MOQ 或交期；
- 页面使用独立 title、description、canonical、Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage，作者实体继续连接到 About 页面；
- 站点由 35 个扩展到 36 个可索引页面。

### 内容发现与内部链接

- `blog.html` 增加可见文章卡片和 BlogPosting 条目，并补齐此前未进入 Blog schema 的成本与 MOQ 指南；
- 从磁吸盒、抽屉盒、硬盒和产品目录页建立上下文内链，新指南同时回链至相关产品规格、成本、打样和物流内容；
- `sitemap.xml`、`llms.txt` 与 SEO 关键词地图同步新增该 URL，博客 `lastmod` 更新为 2026-08-01；
- 统一 4 篇旧指南在 Blog schema 与 Article schema 中的 headline，减少同一文章的实体描述漂移。

### 自动校验与本轮验证

- 静态校验新增 Article 页面、博客可见入口和 BlogPosting 的 URL、headline、datePublished 双向一致性检查；
- 36 个可索引页面和 1 个不可索引 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms 和 sitemap 校验；
- Quote API 回归继续通过有效请求、AI/搜索来源归因、国家必填、附件签名、严格 Base64、`no-store` 和请求方法限制；
- IndexNow 完整 sitemap dry run 为 36 个同源 URL；JavaScript/API/校验脚本语法与 `git diff --check` 通过；
- 本地 HTTP 检查覆盖 36 个 sitemap URL、404、robots、sitemap、llms、IndexNow key 和核心 CSS/JavaScript，共 43 个页面与资源，全部返回 200；
- 本轮修改仍仅位于本地工作区；正式上线、IndexNow 实际提交和 Google Search Console 收录检查仍需先恢复 Vercel 发布权限及正式域名访问。

## 第十轮：硬盒成本搜索意图与询价前决策内容

本轮继续围绕采购方在询价前会主动搜索的问题扩展内容，不发布无法核验的固定价格、MOQ、交期、认证或节省比例。

### 新增硬盒成本指南

- 新增 `rigid-box-cost-drivers.html`，承接 `rigid box cost` 与 `custom rigid box price factors` 搜索意图；
- 按成品尺寸、结构部件、板材与包纸、内托、装饰工艺、数量与版本、包装与交付七组成本驱动建立报价地图；
- 增加数量版本、价值工程、同口径 RFQ 和落地成本检查，帮助买家识别不同报价中被省略或采用不同假设的项目；
- 使用 Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage，作者实体继续连接到 About 页面；
- 从博客、硬盒产品页和包装成本指南建立上下文内链，同时回链至磁吸/抽屉盒比较、内托、工艺、打样和物流内容；
- `sitemap.xml`、`llms.txt`、博客 BlogPosting 与 SEO 关键词地图同步新增该 URL，站点扩展到 37 个可索引页面。

### 联系入口与首页图标

- 全站顶部可见邮箱和 WhatsApp 手机号均改为可点击链接，并由静态校验阻止后续页面再次出现不可点击的联系文本；
- 首页询价区的邮箱与 WhatsApp 卡片增加线性图标、信息层级和悬停反馈；
- 首页右下角联系入口改为与包装刀模语言一致的裁角按钮、线性图标、套准点和键盘可见提示，同时继续在窄屏隐藏以避免遮挡主要 CTA；
- CSS 缓存版本统一更新为 `20260801-2`，保证 Vercel 发布后浏览器获取新版图标样式。

## 第十一轮：内托材料比较搜索意图与可恢复发布流程

本轮继续围绕买家在打样前的材料选择问题补充可验证内容，并把发布前后本地备份固化为可重复流程。

### 新增内托材料比较指南

- 新增 `packaging-inserts-material-comparison.html`，比较模切纸板、模塑纸浆、EVA 与 EPE 在固定、表面保护、取放、生产控制、测试、装箱和使用后处理方面的差异；
- 内容加入选择矩阵、产品适配、打样与测试计划、成本范围和同口径 RFQ 清单，不发布未经项目确认的绝对环保、性能、MOQ、价格或交期声明；
- 页面使用 Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage，作者实体连接到 About 页面；
- 从博客、包装内托产品页和可持续包装指南建立上下文内链，并同步更新 `sitemap.xml`、`llms.txt`、博客 BlogPosting 与 SEO 关键词地图；
- 站点由 37 个扩展到 38 个可索引页面。

### 本地备份与后续发布

- 发布前已在项目目录之外创建并校验完整 Git bundle，可恢复全部分支、标签和提交历史；
- 新增 `scripts/create-local-backup.sh`，后续每次发布可在提交前后生成带时间与提交号的完整 Git bundle，并自动执行完整性校验；
- 后续继续采用“本地备份、静态与接口回归、直接提交 GitHub main、Vercel 自动部署、生产检查、IndexNow 与 Google Search Console 提交”的固定顺序。

## 第十二轮：包装配色搜索意图与盒标协同内链

本轮承接 `Pantone color matching for packaging` 与 `box and label color matching` 搜索意图，强化“盒子与标签在同一打样、配色和生产流程中管理”的差异化定位。

### 新增包装配色指南

- 新增 `pantone-color-matching-packaging.html`，覆盖实体目标、Pantone coated / uncoated 参考、专色与 CMYK、基材与白墨、涂层与覆膜、实体打样、光源、测量、生产批准和复单对比；
- 页面明确区分屏幕稿、合同样、油墨展色、结构样和量产样能够证明的内容，不承诺跨材料的绝对同色或通用色差阈值；
- 使用 Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage，并引用 Pantone 与 X-Rite 官方资料支持实体色样和测量边界；
- 从博客、硬盒、标签和纸袋页面建立高相关上下文内链，新指南回链至相关产品页、工艺指南和打样清单；
- `sitemap.xml`、`llms.txt`、博客 BlogPosting、自动校验和 SEO 关键词地图同步新增该 URL，站点由 38 个扩展到 39 个可索引页面。

## 第十三轮：葡萄酒标签冷凝与胶黏测试搜索意图

本轮承接 `wine label condensation test`、`wine label adhesive testing` 与 `ice bucket label test` 搜索意图，连接酒标采购、材料选择、实际贴标条件和样品批准。

### 新增酒标测试指南

- 新增 `wine-label-condensation-adhesive-testing.html`，区分冷藏、冷凝、冰桶浸泡、湿手操作、擦拭和洗脱目标，不用单一“防水”描述代替可复现条件；
- 按瓶身材料/涂层/曲率、清洁与贴标温度、手贴或机贴、停放时间、面材、胶黏剂、印刷保护、烫金压凸和暴露顺序建立完整测试路径；
- 增加失效模式、观察时间、合格边界、RFQ 输入和批准记录，避免发布脱离实际瓶型、应用与环境的绝对性能保证；
- 使用 Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage，并引用 Avery Dennison、UPM Raflatac 与 FINAT 官方资料支持冷凝、冰桶和自粘标签测试边界；
- 从博客、酒标、防水耐用标签和标签分类页建立上下文内链，同时回链至透明标签和样品批准内容；
- `sitemap.xml`、`llms.txt`、博客 BlogPosting、自动校验和 SEO 关键词地图同步新增该 URL，站点由 39 个扩展到 40 个可索引页面。

## 第十四轮：电商邮寄盒尺寸与运输测试询盘路径

本轮承接 `mailer box sizing`、`ecommerce packaging dimensions` 与 `mailer box transit testing` 搜索意图，并把采购访客直接引向邮寄盒询价表。

### 新增电商邮寄盒采购指南

- 新增 `ecommerce-mailer-box-sizing-transit-test.html`，从产品最大包络、运输方向、保护系统和装箱公差向外推导内尺寸、瓦楞结构与外部运输尺寸；
- 区分内部适配尺寸和承运商计费/仓储/标签/输送/外箱/托盘使用的外尺寸，避免只提供一个未标注参照的长宽高；
- 覆盖内托、缓冲与填充、瓦楞纸板、锁扣与封箱、装箱动作、运输测试范围、失效复盘和同口径 RFQ 清单；
- 页面不把单次跌落或固定缓冲厚度写成通用保证，引用 ISTA、FedEx、UPS 与 Amazon 官方资料说明路线、承运商与项目测试边界；
- 使用 Article、BreadcrumbList 与 6 组可见 FAQ / FAQPage，从博客、邮寄盒和瓦楞运输箱建立高相关内链；文章末端 CTA 直接进入 `custom-mailer-boxes.html#quote`，缩短搜索访客到询价表的路径；
- `sitemap.xml`、`llms.txt`、博客 BlogPosting、自动校验和 SEO 关键词地图同步新增该 URL，站点由 40 个扩展到 41 个可索引页面。

## 第十五轮：包装采购贸易术语与落地成本询盘路径

本轮承接 `EXW vs FOB vs CIF vs DDP`、`packaging Incoterms` 与 `packaging landed cost` 搜索意图，把贸易术语解释连接到可比较报价和目的地询价。

### 新增包装 Incoterms 采购指南

- 新增 `exw-fob-cif-ddp-packaging-sourcing-guide.html`，按交货与风险点、主运输、出口/进口手续、保险、目的地费用和落地成本比较 EXW、FOB、CIF 与 DDP；
- 明确 FOB/CIF 只适用于海运或内河运输，并提示集装箱或多式联运根据实际交接点比较 FCA/CIP，避免把卖方支付运费误解为卖方一直承担运输风险；
- 增加 EXW/DDP 可执行性、进口商安排、报价同口径工作表、包装体积与出口装箱数据、完整 RFQ 清单和 6 组采购 FAQ；
- 引用 ICC Incoterms® 2020 清单、ICC Academy 和美国国际贸易署官方资料，不替代项目合同、法律、关务、税务或保险意见；
- 从博客、成本与 MOQ 指南、包装物流指南和瓦楞运输箱页面建立上下文内链，新指南回链至成本、物流、运输箱和询价入口；
- `sitemap.xml`、`llms.txt`、BlogPosting、自动校验和 SEO 关键词地图同步新增该 URL，站点由 41 个扩展到 42 个可索引页面。

### 本轮验证

- 42 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms 和 sitemap 自动校验；
- 询价 API 的有效请求、来源归因、国家必填、附件安全、Base64、`no-store` 和请求方法限制回归通过，IndexNow dry run 已准备 42 个同源 URL；
- 新指南在桌面 1280 px 与手机 390 × 844 下无页面级横向溢出，图片请求正常，手机导航展开/关闭和 FAQ 展开状态通过真实浏览器检查。

## 第十六轮：Reddit 话题研究与小企业低 MOQ 获客内容

本轮围绕 Reddit 小企业与电商社区反复出现的“销量尚未验证、定制包装 MOQ 高、库存占用现金、首批包装可能过时”问题，承接 `low MOQ custom packaging` 与 `custom packaging for small business` 搜索意图。

### 新增低 MOQ 分阶段采购指南

- 新增 `low-moq-custom-packaging-small-business.html`，把社区问题整理为四阶段路线：标准包装、标准包装加品牌组件、标准尺寸定制印刷或模块化组件、完全定制结构；
- 以产品和销量稳定度、可用现金、存储空间、装箱人工、运输尺寸、破损和剩余库存共同判断升级节点，不用一个脱离项目的通用 MOQ 或价格数字误导买家；
- 增加“每个可用订单的真实成本”、规格简化杠杆、装箱与运输测试、易错项、稿件版本控制、双路线 RFQ 清单和 6 组可见 FAQ；
- Reddit 讨论作为需求与措辞信号，解决方案边界由 Shopify 当前包装设计、包裹尺寸和重量指导补充，并明确社区价格和供应商主张不能直接视为生产规格；
- 从博客、定制盒分类页和成本/MOQ 指南建立高相关上下文内链，新指南回链到标签、纸巾、吊牌、内托、盒型、打样和邮寄测试内容；
- `sitemap.xml`、`llms.txt`、BlogPosting、FAQPage、自动校验和 SEO 关键词地图同步新增该 URL，站点由 42 个扩展到 43 个可索引页面。

### 本轮验证

- 43 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms 和 sitemap 自动校验；
- 询价 API 的有效请求、来源归因、国家必填、附件安全、Base64、`no-store` 和请求方法限制回归通过，IndexNow dry run 已准备 43 个同源 URL。

## 第十七轮：China vs Local 包装供应商采购意图

本轮承接 Reddit 中持续出现的“应选择本地供应商还是从中国采购定制包装”“海外单价、样品、付款、质量、运费和清关怎样放在一起比较”问题，覆盖 `custom packaging from China` 与 `China vs local packaging supplier` 搜索意图。

### 新增供应路线比较指南

- 新增 `custom-packaging-china-vs-local-supplier.html`，不按地域给出绝对结论，而是按数量、结构能力、开发协作、补货、质量控制和交付范围选择本地、中国或混合路线；
- 建立同规格 RFQ、四阶段样品证据、订单级质量验收、落地成本工作表、供应商尽调、平台订单保护边界和本地试产/海外复单/本地备份的混合策略；
- 引用 Reddit 真实采购讨论作为需求信号，并使用美国国际贸易署、美国海关、Alibaba Trade Assurance 与 ICC 官方资料限定尽调、进口责任、平台保护和贸易术语范围；
- 页面明确说明国家、平台徽章、视频或单件样品不能代替实际订单规格、批量检查、目的国合规和合格专业意见，也不承诺中国或本地路线必然更便宜、更快或质量更高；
- 从博客、工厂质量页和成本/MOQ 指南建立上下文内链，新指南回链至成本、低 MOQ、样品批准、Incoterms、物流和质量控制页面；
- `sitemap.xml`、`llms.txt`、BlogPosting、FAQPage、自动校验和 SEO 关键词地图同步新增该 URL，站点由 43 个扩展到 44 个可索引页面。

### 本轮验证

- 44 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms 和 sitemap 自动校验；
- 询价 API 与脚本语法回归通过，IndexNow dry run 已准备 44 个同源 URL。

## 第十八轮：包装刀模与印刷稿件高意图内容

本轮承接 Reddit 设计与包装社区持续出现的“没有供应商刀模能否先设计”“CAD 转 Illustrator 为什么缩放”“出血、安全区、图层和工艺文件怎么交付”“谁应该保留可编辑生产资产”等问题，覆盖 `packaging dieline` 与 `custom packaging artwork requirements` 搜索意图。

### 新增刀模与稿件控制指南

- 新增 `custom-packaging-dieline-artwork-requirements.html`，从产品与结构确认开始，覆盖最终供应商刀模、比例与尺寸、面板方向、切线/压线、胶位/非印刷区、出血与安全区、印刷及工艺图层；
- 增加结构/品牌/设计/印前/合规责任地图、六道批准关口、文件资产预检、校样证据层级、条码与可变信息、可编辑母版与生产文件版本归档；
- 不发布脱离供应商、材料与工艺的通用出血、分辨率、PDF、叠印或工艺间距数字；Adobe 和 GS1 官方资料用于解释软件与条码边界，最终执行以选定印厂书面要求为准；
- 使用 Reddit 近期讨论作为需求和买家措辞信号，明确 3D mockup、屏幕 PDF、结构白样、彩样和量产首件各自能够与不能够证明的内容；
- 从博客、定制盒分类页和工厂质量页建立上下文内链，新指南回链至盒型、色彩控制、工艺比较、样品批准和询价入口；
- `sitemap.xml`、`llms.txt`、BlogPosting、FAQPage、自动校验和 SEO 关键词地图同步新增该 URL，站点由 44 个扩展到 45 个可索引页面。

### 本轮验证

- 45 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms 和 sitemap 自动校验；
- 询价 API 与脚本语法回归通过，IndexNow dry run 已准备 45 个同源 URL。

## 第十九轮：Rigid Box vs Folding Carton 比较型搜索意图

本轮根据 Reddit 包装设计社区近期关于“厚重香水瓶是否必须使用硬盒”“折叠彩盒加内托能否提供足够保护”“厚重是否等于高端”的讨论，覆盖 `rigid box vs folding carton` 比较型采购意图。

### 新增产品优先的结构比较指南

- 新增 `rigid-box-vs-folding-carton.html`，不以厚度或“高端”标签给出绝对答案，而是按实际产品载荷、内托、支撑与避让、开箱体验、装配、仓储、运输体积、落地成本和测试路线比较；
- 增加两种结构对照表、产品保护逻辑、五项落地成本工作表、打样与运输验证、统一 RFQ 清单及 6 组可见 FAQ；
- Reddit 讨论只作为买家问题和措辞信号，ISTA 与 DHL 官方资料分别限定运输测试和体积重量边界，不把社区评论、通用运费公式或孤立样品当作项目保证；
- 从博客、硬盒、折叠彩盒和香水包装页建立上下文内链，新指南直接连接硬盒、折叠彩盒、香水盒和内托询价入口；
- `sitemap.xml`、`llms.txt`、BlogPosting、FAQPage、自动校验和 SEO 关键词地图同步新增该 URL，站点由 45 个扩展到 46 个可索引页面。

## 第二十轮：FSC 包装供应商核验搜索意图

本轮根据 Reddit 包装与采购社区近期关于“证书与公开数据库不一致”“怎样持续跟踪供应商证书状态”的讨论，覆盖 `verify FSC packaging supplier`、`FSC certificate packaging supplier` 与 `how to check FSC certificate` 搜索意图。

### 新增证书与订单证据核验指南

- 新增 `verify-fsc-packaging-supplier.html`，把供应商网站 Logo 或 PDF 证书拆解为公开数据库、直接供应商主体、实际生产站点、产品与活动范围、订单销售声明、标签审批和交付记录七层证据；
- 说明已认证企业仍可能销售非认证产品，企业证书不自动证明每个产品、材料或订单都获得认证，也不把 GloryStarPack 描述为 FSC 持证企业；
- 增加证书编号与许可编号、查询步骤、订单控制、标签责任、常见红旗、变更监控、采购声明边界、RFQ 信息和 6 组可见 FAQ；
- Reddit 讨论仅作为需求与措辞信号，事实边界引用 FSC Chain of Custody、Public Search、标签和商标使用官方资料，并明确页面不替代认证、法律、商标或监管意见；
- 从博客、关于/工厂证据页、可持续包装指南和 China vs Local 采购指南建立上下文内链，新指南回链至供应商比较、工厂证据、稿件控制和询价入口；
- `sitemap.xml`、`llms.txt`、BlogPosting、FAQPage、自动校验和 SEO 关键词地图同步新增该 URL，站点由 46 个扩展到 47 个可索引页面。

## 第二十一轮：定制包装 ROI 与盈亏平衡搜索意图

本轮根据 Reddit 小企业社区持续出现的“定制包装是否值得”“客户是否在意包装”“怎样兼顾高级感与利润”的讨论，覆盖 `is custom packaging worth it` 与 `custom packaging ROI calculator` 决策型搜索意图。

### 新增可交互的商业决策指南

- 新增 `is-custom-packaging-worth-it.html`，以可用落地成本、一次性费用、订单贡献毛利、库存风险和可验证运营节省替代“高级包装一定增加销量”的不可证实结论；
- 增加无需登录的盈亏平衡计算器，实时计算增量包装投入、单包增量现金、回收投入所需的增量订单和相对于本次生产量的订单提升门槛；
- 计算器明确使用访问者自己的假设，支持任意统一币种，不把输出描述为销售预测、回报保证或财务建议；
- 内容覆盖完整成本口径、Reddit 买家问题、六项升级关口、基准与定制路线对照表、受控测试方法、RFQ 衔接和 5 组可见 FAQ；
- 从博客、成本与 MOQ、低 MOQ 采购和开箱体验页面建立描述性内链，新页面回链到成本、低 MOQ、样品批准、盒型与询价入口；
- 同步 BlogPosting、Article、WebApplication、BreadcrumbList、FAQPage、`sitemap.xml`、`llms.txt` 与关键词地图，站点由 47 个扩展到 48 个可索引页面。

## 第二十二轮：GA4、询盘转化与同意管理

- 全站绑定 GA4 衡量 ID `G-LYNMPWG9WK`，所有 51 个 HTML 页面只加载一份本地分析控制脚本；
- Analytics 默认拒绝，访客主动允许后才加载 Google tag；广告存储、广告用户数据、广告个性化和 Google Signals 保持关闭；
- 增加可撤回的 Analytics 选择面板，拒绝后停止后续统计并删除本站可访问的 `_ga` Cookie，选择保存在浏览器本地；
- 记录 Email、WhatsApp、询价 CTA、询价表单开始、文件选择和包装 ROI 计算器使用；只有 API 确认询价成功后才发送官方推荐的 `generate_lead` 事件；
- 分析事件不包含姓名、邮箱、电话、留言内容、附件名称或附件内容，产品类别与页面路径用于评估流量到询盘的路径；
- 更新隐私页的 Google Analytics、数据类别、同意撤回和跨境服务说明，并为分析脚本、全站交互脚本和 CSS 统一更新缓存版本；
- 自动校验新增 GA4 脚本数量、缓存版本与衡量 ID 检查，防止以后新增页面漏装或重复安装统计代码。

## 第二十三轮：可折叠硬盒 vs Setup Box 体积与组装决策

本轮根据 Reddit 电商与包装社区反复出现的仓储占用、运输体积、库存压力和额外装箱人工问题，覆盖 `collapsible rigid box vs setup box` 与 `rigid box shipping cube calculator` 高意图搜索。

### 新增运输体积与组装工时指南

- 新增 `collapsible-rigid-box-vs-setup-box.html`，按产品保护、陈列体验、仓储、运输体积、装箱人工、结构风险和补货条件比较可折叠硬盒与预组装 Setup Box；
- 增加无需登录的体积与组装工时计算器，以供应商实际外箱长宽高、每箱装量、采购数量、实测组装秒数和人工费率计算总运输体积、相对体积变化、组装工时与规划余额；
- 计算器按整箱向上取整，并明确体积费率只是统一币种下的规划假设，不把通用百分比、单一运费公式或社区评论当作项目节省承诺；
- 增加同规格比较表、结构样确认、实际装箱试验、决策关口、RFQ 数据清单和 5 组可见 FAQ，帮助采购在报价前收集可验证数据；
- 从博客、硬盒和可折叠硬盒页面建立上下文内链，新指南回链到成本、打样、运输、盒型和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图和自动校验，站点由 48 个扩展到 49 个可索引页面；
- GA4 新增不含个人信息的 `calculator_use` 事件，用于判断该采购工具是否帮助访客进入询盘路径。

### 本轮验证

- 49 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms、脚本版本和 sitemap 自动校验；
- 在浏览器实测计算器整箱取整、体积差、相对变化、组装工时和规划余额输出，手机端 390px 视口无页面级横向溢出；
- 本地移动端 Lighthouse 的 Accessibility、Best Practices 与 SEO 均为 100，CLS 为 0.088，低于 0.1 的良好阈值。

## 第二十四轮：瓦楞运输箱规格表与托盘规划搜索意图

本轮根据 Reddit 包装、电商与卖家社区反复出现的主箱尺寸、每箱装量、体积重、托盘适配、箱体强度和运输损坏问题，覆盖 `corrugated shipping box specification` 与 `master carton pallet calculator` 高意图搜索。

### 新增运输箱 RFQ 与规划指南

- 新增 `corrugated-shipping-box-specification-guide.html`，把产品、单件包装、内箱、运输箱、托盘和运输路线拆成相互影响的控制层级；
- 增加无需登录的成箱体积与简易托盘规划工具，以实际外尺寸、箱数、每箱装量、毛重、托盘可用长宽和装载高度计算总件数、单箱体积、总方数、总毛重、同向摆放每层箱数和初算托盘数；
- 明确计算器不处理混合方向、鼓包、间隙、超托、载重、抗压、稳定性、捆扎、缠膜、设备、车辆和承运商规则，不能替代实际码托和工程批准；
- 内容覆盖内外尺寸、FEFCO 结构表达、ECT/耐破/成箱抗压证据边界、接合与封箱、托盘和包裹边界、整套包装运输测试、生产检验、变更控制、可比 RFQ 和 6 组可见 FAQ；
- Reddit 只用于识别买家问题，事实边界引用 FEFCO、Fibre Box Association、ISTA 与 UPS 官方资料，不把社区公式或单一材料等级当作项目保证；
- 从博客、瓦楞运输箱产品页和电商邮寄箱测试指南建立上下文内链，新指南回链制造、测试、样品、物流和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图和自动校验，站点由 49 个扩展到 50 个可索引页面；
- GA4 新增不含个人信息的 `calculator_use` 事件，用于衡量运输箱规划工具到询盘的辅助路径。

### 本轮验证

- 50 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms、脚本版本和 sitemap 自动校验；
- 在浏览器用第二组数据实测总件数、单箱方数、总方数、总毛重、旋转摆放每层箱数、整层数和向上取整托盘数，结果与人工计算一致；
- 手机端 390px 视口无页面级横向溢出或控制台错误；移动端 Lighthouse 的 Accessibility、Best Practices、SEO 与 Agentic Browsing 均为 100，CLS 为 0.046。

## 第二十五轮：珠宝盒内托设计与尺寸规划搜索意图

本轮根据 Reddit 珠宝制作、电商与买家社区反复出现的粗项链顶盖与移动、长链缠绕、耳钩运输断裂、低预算安全包装和不同首饰材料接触问题，覆盖 `jewelry box insert design` 与 `jewelry insert fit planner` 高意图搜索。

### 新增珠宝内托设计、接触与取出指南

- 新增 `jewelry-box-insert-design-guide.html`，按戒指、耳环、项链、手表/手镯和多件套拆解产品包络、展示面、固定点、活动件、上下空间、接触区、禁触区、取出路径和完整运输包装；
- 增加无需登录的内托尺寸规划工具，以产品展示状态长宽、展示面上下空间、四周预留和拟用盒内尺寸计算最低规划内尺寸、三个方向余量与缺口提示；
- 明确计算器不处理材料压缩、覆面与胶黏剂厚度、盒壁、铰链或盒盖侵入、磁性部件、产品与生产公差、插入/取出力、磨损、化学相容和运输性能，不能替代刀模或实物批准；
- 内容覆盖 Reddit 买家问题、首饰类型矩阵、接触材料图、珍珠与银饰事实边界、内托材料路线、取出动作、生产样与完整包装运输测试、可比 RFQ 和 6 组可见 FAQ；
- Reddit 只用于识别需求和买家措辞，事实边界引用 GIA、Canadian Conservation Institute 与 ISTA 官方资料，不把社区建议、通用软材料或单一包装描述成首饰保护保证；
- 从博客、珠宝盒商业页和定制内托商业页建立上下文内链，新指南回链到珠宝盒、内托、材料比较、样品批准与询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图和自动校验，站点由 50 个扩展到 51 个可索引页面；
- GA4 新增不含个人信息的 `calculator_use` 事件，用于衡量珠宝内托规划工具到询盘的辅助路径。

### 本轮验证

- 51 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms、脚本版本和 sitemap 自动校验；
- 浏览器实测默认规划尺寸与三个方向余量正确，并用第二组数据验证长、宽、高缺口提示与人工结果一致；
- 手机端 390px 视口无页面级横向溢出或控制台错误；移动端 Lighthouse 的 Accessibility、Best Practices、SEO 与 Agentic Browsing 均为 100，实验室性能记录 LCP 为 105ms、CLS 为 0。

## 第二十六轮：纸筒包装尺寸、盖合与取出搜索意图

本轮根据 Reddit 小企业与包装设计社区持续出现的低数量印刷筒盒、交期与成本取舍、圆筒仓储和运费、食品或补充剂接触、封口和取出问题，覆盖 `paper tube packaging size guide` 与 `paper tube diameter calculator` 高意图搜索。

### 新增纸筒可用空间与成品规格指南

- 新增 `paper-tube-packaging-size-guide.html`，把产品最大装载截面、内径、可用内高、筒体外径、最大闭合直径、成品闭合高度、筒壁、盖合、肩颈、端部和运输外箱拆成独立控制字段；
- 增加无需登录的纸筒尺寸规划工具，按产品最大截面、高度、单侧径向预留、底部与顶部预留、拟用内径、可用内高和筒壁输入，计算最低规划内径、最低可用内高、两个方向余量或缺口、估算筒体外径和下一步验证提示；
- 明确计算器不处理未输入的产品公差、异形与失圆、衬里压缩、接缝增厚、肩颈或盖部侵入、通气、摩擦、材料调湿、开启力、直接接触、运输性能或供应商生产公差，不能替代生产样、合规决定或订单批准；
- 内容覆盖近期 Reddit 买家问题、六项尺寸链、盖合公差、空气阻力和取出、结构与圆周稿件、圆筒主箱、完整包装测试、食品/化妆品接触边界、环保声明、五道批准关口、可比 RFQ 和 6 组可见 FAQ；
- Reddit 只用于识别需求和买家措辞，事实边界引用 GS1 包装尺寸、ISTA 包装系统测试与 FTC Green Guides，不把社区价格、通用径向间隙、纸质外观或单一材料描述成成本、性能、接触或可回收保证；
- 从博客和纸筒商业页建立描述性内链，新指南回链到纸筒、内托、稿件、样品、外箱、物流和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图和自动校验，站点由 51 个扩展到 52 个可索引页面；
- GA4 新增不含个人信息的 `calculator_use` 事件，用于衡量纸筒尺寸工具到询盘的辅助路径；
- 修复深色区块内浅色卡片继承白色标题和金色链接造成的全站对比度问题，并更新 CSS 缓存版本。

### 本轮验证

- 52 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms、脚本版本和 sitemap 自动校验；询价 API、JavaScript 语法和 IndexNow dry run 通过；
- 浏览器实测默认输出为最低内径 72.0 mm、最低可用内高 155.0 mm、内径余量 +2.0 mm、高度余量 +3.0 mm、估算筒体外径 78.0 mm；第二组不足数据正确输出内径 −1.5 mm 与高度 −4.0 mm；
- 手机端 390px 视口无页面级横向溢出或控制台错误；移动端 Lighthouse 的 Accessibility、Best Practices、SEO 与 Agentic Browsing 均为 100，实验室性能记录 LCP 为 97ms、CLS 为 0。

## 第二十七轮：首页抓取优先级与生产站索引体检

本轮先处理能够直接影响搜索引擎发现、规范网址集中和高意向访客路径的项目，不以批量新增文章代替技术与入口修复。

### 强化首页入口和规范网址

- 生产站 sitemap 的 52 个 URL 逐一检查，当前均直接返回 HTTP 200，页面 canonical 与 sitemap URL 一致；
- 发现 `www.glorystarpacking.com/index.html` 需要经过两次跳转，且 `www.glorystarpacking.com/` 根路径仍可独立返回 200；新增更具体的 Vercel 永久重定向，使两个入口都直接到 `https://glorystarpacking.com/`；
- 首页增加 `custom-boxes.html` 与 `custom-packaging-inserts.html` 的描述性上下文链接，提升两个商业中心页的发现路径；
- 首页新增 Quote-ready buyer tools 区块，直接链接纸筒尺寸、珠宝内托和运输箱/托盘三个高意向采购工具，减少新指南只依赖博客列表页的问题；
- 新增 `scripts/audit-production-indexing.mjs`，部署后可一次检查 live sitemap、HTTP 状态、canonical、robots meta、X-Robots-Tag、robots.txt 与关键域名跳转；
- 首页 sitemap `lastmod` 更新为 `2026-08-12`，仅反映本次真实页面更新。

### 本轮验证

- 52 个可索引页面和 1 个 `noindex` 404 页面继续通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、crawler policy、重定向与 sitemap 自动校验；询价 API 测试与 JavaScript 语法检查通过；
- 首页在 390px 手机视口下无页面级横向溢出或控制台错误，新增 5 个关键入口均为可抓取的普通链接；
- 移动端 Lighthouse 的 Accessibility、Best Practices、SEO 与 Agentic Browsing 均为 100；本地实验室性能记录 LCP 为 96ms、CLS 为 0；
- 当前受控浏览器会话未继承默认浏览器的 Google Search Console 登录状态，因此本轮不虚构后台覆盖率或“已收录”结论；上线后以生产审核脚本和 Search Console 实际数据继续判断。

## 第二十八轮：定制纸巾印刷与用量规划搜索意图

本轮根据 Reddit 小企业与包装社区反复出现的纸巾包装低量定制、现金占用、全版和多色印刷、急单交期、高端简洁体验、透印、蹭色和先用轻量品牌组件验证需求等问题，覆盖 `custom tissue paper printing guide` 与 `tissue paper quantity calculator` 高意图搜索。

### 新增纸巾用量、印刷和验收指南

- 新增 `custom-tissue-paper-printing-guide.html`，与 `custom-tissue-paper.html` 分工：商业页负责供应与询价，新指南负责用量、路线、稿件、样品、验收和可比 RFQ；
- 增加无需登录的纸巾用量与整包取整规划器，按包装订单数、每单用纸、买家自定预留、供应商每包张数和单张尺寸计算基础张数、规划张数、整包数量、采购张数、超出规划张数和采购纸张面积；
- 明确预留比例是买家输入，不是通用建议；计算器不预测供应商 MOQ、生产损耗、生产超欠数、交付张数、成本、纸张重量、装箱人工、储存寿命或补货点；
- 内容覆盖库存/半定制/全定制三条路线、平张与包法、重复图案、供应商出血值、克重与不透明度、颜色关系、透印、油墨摩擦与转移、折叠与整包、外箱、QC、FSC 和回收声明边界、可比 RFQ 与 6 组可见 FAQ；
- Reddit 只用于识别买家措辞和决策，不把社区价格、MOQ、工艺和供应商推荐当作项目证据；事实边界引用 Adobe、FSC 和 FTC 官方资料；
- 从首页、博客、纸巾商业页和低 MOQ 指南建立描述性内链，新指南回链纸巾商业页、稿件、样品、FSC 验证与询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图、GA4 `calculator_use` 事件和自动校验，站点由 52 个扩展到 53 个可索引页面。

### 本轮验证

- 53 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、表单、llms、脚本版本、crawler policy、重定向和 sitemap 自动校验；询价 API 与 JavaScript 语法检查通过；
- 默认数据正确输出基础 2,400 张、规划 2,520 张、6 包、采购 3,000 张、多出 480 张和 1,050.0 m²；第二组数据正确输出 413 张、444 张、2 包、500 张、多出 56 张和 95.0 m²；
- 390px 手机视口无页面级横向溢出或页面控制台错误；性能追踪记录 LCP 为 101ms、CLS 为 0；移动端 Lighthouse 的 Accessibility、SEO 与 Agentic Browsing 均为 100。本地 Lighthouse 对 Google Fonts 的一次外部连接关闭使 Best Practices 为 96，部署后从生产站复测。

## 第二十九轮：吊牌生产、条码变量与零售就绪搜索意图

本轮根据 Reddit 小企业与零售社区持续出现的条码吊牌批量生成、手工贴标耗时、标签脱落、供应商代贴价格/UPC、SKU 与价格更新和零售就绪入库问题，覆盖 `hang tag production checklist` 与 `hang tag quantity calculator` 高意图搜索。

### 新增吊牌用量、变量数据与生产检查指南

- 新增 `hang-tag-production-checklist.html`，与 `custom-hang-tags.html` 分工：商业页负责吊牌产品开发与询价，新指南负责数量、变量数据、条码、应用、装袋、检验和数量对账；
- 增加无需登录的吊牌用量与整包取整规划器，按产品件数、每件吊牌数、买家自定预留、SKU 数、每 SKU 样品数和供应商每包张数计算基础用量、预留、样品、规划量、整包数量、采购量与超出规划量；
- 明确预留和样品是买家输入，不是通用建议；计算器不建立 MOQ、生产损耗、交付数量、吊牌套数、附件损耗、SKU 分配、条码有效性、成本或补货库存；
- 新增 `assets/templates/hang-tag-variable-data-template.csv`，覆盖记录 ID、SKU、产品、颜色、尺码、GTIN/条码数据、码制、人可读文字、价格、币种、稿件版本、吊牌设计、附件、装袋组、数量、状态和备注；示例行明确禁止用于生产；
- 内容覆盖吊牌成品尺寸、孔位坐标、绳带/附件、产品应用点、变量数据字段、异常报告、条码数据/符号/验证/系统扫描、静态稿件与变量校样、生产样、零售就绪装配、装袋和数量对账、FTC 服装护理/纤维标签边界、可比 RFQ 与 6 组可见 FAQ；
- Reddit 只用于识别运营问题和买家措辞，不把社区建议的条码尺寸、设备、价格、供应商或附件方式当作项目标准；事实边界引用 GS1 与 FTC 官方资料；
- 从首页、博客、吊牌商业页和稿件指南建立描述性内链，新指南回链吊牌、标签、稿件和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图、GA4 `calculator_use` 事件和自动校验，站点由 53 个扩展到 54 个可索引页面；
- 自动校验新增对变量数据 CSV 模板及其必要字段的检查，避免以后模板链接存在但生产字段被误删。

### 本轮验证

- 54 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、下载模板、表单、llms、脚本版本、crawler policy、重定向和 sitemap 自动校验；询价 API 与 JavaScript 语法检查通过；
- 吊牌计算器默认数据正确输出基础 2,400、预留 72、SKU 样品 24、规划 2,496、5 包、采购 2,500 和多出 4 张；第二组数据正确输出基础 1,750、预留 79、样品 21、规划 1,850、8 包、采购 2,000 和多出 150 张；
- 变量数据 CSV 可下载且包含记录 ID、SKU、GTIN/条码数据、码制、稿件版本、附件、装袋组、数量和记录状态等必要字段；390px 手机视口无页面级横向溢出或页面脚本错误；性能追踪记录 LCP 为 101ms、CLS 为 0；移动端 Lighthouse 的 Accessibility、SEO 与 Agentic Browsing 均为 100，本地 Google Fonts 外链的一次连接关闭使 Best Practices 为 96；
- 条码和服装标签内容明确要求按真实 POS、零售商、市场和产品验证，不把手机扫码、吊牌或计算器结果写成合规或生产批准。

## 第三十轮：葡萄酒礼盒规格、满瓶载荷与运输测试搜索意图

本轮根据 Reddit 包装与葡萄酒社区持续出现的礼盒装瓶后底部下垂、提手承载、搬运冲击、瓶体移动、是否需要额外包裹、专用酒瓶运输箱与破损/渗漏担忧，覆盖 `wine bottle gift box specification`、`wine bottle gift box dimensions` 与 `wine box fit calculator` 高意图搜索。

### 新增酒瓶礼盒尺寸、载荷和 RFQ 指南

- 新增 `wine-bottle-gift-box-specification.html`，与 `custom-wine-boxes.html` 分工：商业页负责产品开发和询价，新指南负责瓶型数据、规划包络、支撑、内托取放、运输外箱、测试、验收和可比 RFQ；
- 增加无需登录的酒瓶套装规划器，按每盒瓶数、最大瓶身直径、总高、买家自定单侧/上下预留、瓶间隔板、单瓶满载重量和配件重量，计算单瓶规划腔体、套装内宽/内深/可用内高、瓶体载荷、内容物载荷和规划内部体积；
- 明确工具仅建模“同一圆瓶包络、直立、单排”的矩形规划空间，不输出刀模、成品外尺寸、板材、成本、MOQ、抗压、运输总重或测试结论，也不把预留数值写成生产建议；
- 新增 `assets/templates/wine-bottle-gift-box-rfq-template.csv`，覆盖瓶型、玻璃瓶规格、满载重量、最大尺寸、瓶肩/瓶颈/瓶盖、标签位置、保护表面、礼盒配置、方向、配件、内托、外箱装量、运输路线、测试/验收依据、稿件、数量、国家、日期和状态；示例行明确禁止用于生产；
- 内容覆盖 AWRI 玻璃瓶规格、瓶型差异与公差，瓶底载荷路径、瓶体/瓶肩/瓶颈限制、玻璃隔离、标签/瓶帽保护、满载取放、礼盒结构、配件、主箱、预先声明验收标准、ISTA 测试选择、代表性样品、完整测试顺序、现场运输反馈、检验和变更控制；
- Reddit 仅用于识别真实买家问题，不把社区推荐的尺寸、材料、箱型、航运经历或供应商写成性能和运输保证；事实边界引用 AWRI 与 ISTA 官方资料；
- 从首页、博客和酒盒商业页建立描述性内链，新指南回链酒盒、内托、内托材料、运输箱、样品、酒标测试、物流和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图、GA4 `calculator_use` 事件和自动校验，站点由 54 个扩展到 55 个可索引页面；
- 自动校验新增对酒瓶礼盒 RFQ CSV 模板及其瓶型、尺寸、满载重量、保护面、外箱、路线、测试和状态字段的检查。

### 本轮验证

- 55 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、下载模板、表单、llms、脚本版本、crawler policy、重定向和 sitemap 自动校验；
- 默认数据正确输出规划腔体 94.0 mm、套装内宽 191.0 mm、内深 94.0 mm、可用内高 333.0 mm、瓶体载荷 2,500 g、内容物载荷 2,850 g 与规划体积 5.98 L；第二组数据正确输出 102.5 × 315.5 × 350.0 mm、4,275 g、4,900 g 和 11.32 L；
- RFQ CSV 可下载且包含关键受控字段；390px 手机视口无页面级横向溢出或控制台错误；移动端 Lighthouse 的 Accessibility、Best Practices、SEO 与 Agentic Browsing 均为 100，性能追踪记录 LCP 为 127ms、CLS 为 0；
- 运输内容要求按实际包型、重量、路线、承运商或零售商要求、风险和预先声明的损坏/包装退化标准选择当前测试程序，不把礼盒、单一材料或一次社区运输经历写成运输批准。

## 第三十一轮：香水盒内托、泵头间隙与套装配置搜索意图

本轮根据 Reddit 包装、香水与小企业社区持续出现的重玻璃瓶和重瓶盖承载、折叠盒或硬盒选择、瓶盖刮花、瓶盖误压泵头、实物样与量产一致性、泄漏、喷头表现、运输破损和高 MOQ 问题，覆盖 `perfume box insert checklist` 与 `perfume bottle insert fit planner` 高意图搜索。

### 新增香水瓶适配、内托和 RFQ 指南

- 新增 `perfume-box-insert-checklist.html`，与 `custom-perfume-boxes.html` 分工：商业页负责产品开发和询价，新指南负责瓶体数据、内托适配、支撑、泵头/瓶盖无接触区、表面保护、取放、套装配置、运输验证和可比 RFQ；
- 增加无需登录的香水瓶内托适配规划器，按完全组装后的最大长宽高、买家自定四周/底部/顶部规划预留和拟用腔体可用尺寸，计算最低规划包络、三个方向余量或缺口、腔体体积和尺寸提示；
- 明确工具只是矩形尺寸筛查，不输出内托图、刀模、外箱尺寸、保持力、释放力、材料、成本、MOQ、跌落结果、危险品分类或量产批准，也不处理瓶体曲面、重心、玻璃公差、泵头行程、瓶盖配合、材料压缩和运输危害；
- 新增 `assets/templates/perfume-box-insert-rfq-template.csv`，覆盖瓶体 SKU、装满重量、最大尺寸、组件版本、泵头/瓶盖无接触区、保护面、支撑面、方向、内托、取放、套装、外箱、路线、危险品分类责任方、测试/验收、稿件、数量、国家、日期和状态；示例行明确禁止用于生产；
- 内容覆盖 Reddit 买家问题、瓶体和组件主数据、装载路径、无接触图、纸板/纸浆/泡棉或覆面内托、用户取出动作、套装组件隔离、配置与数量对账、完整包装测试、生产检验、变更控制和可比 RFQ；
- Reddit 只用于识别需求和买家措辞，不把社区材料建议、纸张克重、供应商评价、样品经历或 MOQ 写成项目保证；事实边界引用 ISTA 当前测试程序分类与 IATA 危险品分类责任说明；
- 从首页、博客、香水盒商业页和内托商业页建立描述性内链，新指南回链香水盒、内托、材料比较、稿件、样品、运输箱、物流和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图、GA4 `calculator_use` 事件和自动校验，站点由 55 个扩展到 56 个可索引页面；
- 自动校验新增对香水盒内托 RFQ CSV 模板及其瓶体、组件、无接触、保护面、支撑面、取放、套装、外箱、路线、危险品责任方、测试和状态字段的检查。

### 本轮验证

- 56 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、下载模板、表单、llms、脚本版本、crawler policy、重定向和 sitemap 自动校验；询价 API、JavaScript 语法和 IndexNow dry run 通过；
- 默认数据正确输出最低规划尺寸 60.0 × 34.0 × 117.0 mm、长宽高余量 +1.0 / +1.0 / +3.0 mm、腔体体积 0.26 L 和无规划缺口；第二组不足数据正确输出 67.5 × 43.0 × 142.0 mm、缺口 −1.5 / −1.0 / −2.0 mm、0.39 L 和尺寸复核提示；
- RFQ CSV 可下载且关键受控字段齐全；390px 手机视口无页面级横向溢出；修复浅色区按钮对比度后，移动端 Lighthouse Accessibility、Best Practices 与 SEO 均为 100；性能追踪记录 LCP 为 109ms、CLS 为 0；
- 运输内容明确要求按实际成分、数量、包装、模式、路线、承运商和当前规则由托运方及合格责任方确认危险品分类、包装、标记、标签和文件，不把二级纸包装指南写成运输合规批准。

## 第三十二轮：透明标签白墨稿件、透明窗口与应用试样搜索意图

本轮根据 Reddit 小企业与商业印刷社区持续出现的透明材料上白色不印、彩色透底、供应商无法猜测白墨范围、白墨套印偏差形成白边，以及试样没有绑定真实容器的问题，覆盖 `clear label white ink artwork`、`transparent label artwork guide` 与 `clear label sample planner` 高意图搜索。

### 新增白墨稿件、容器试样和生产放行指南

- 新增 `clear-label-white-ink-artwork-guide.html`，与 `custom-clear-labels.html` 分工：商业页负责透明标签结构开发和询价，新指南负责白墨分色、透明窗口、印刷面/顺序、陷印责任、容器背景、贴标试样、验收和放行；
- 增加无需登录的应用试样矩阵规划器，按容器/内容物组合、白墨处理、贴标路线、每组合重复数、观察时间点和买家自定备用比例，计算唯一组合、应用样、备用、最低样品标签、观察记录与每时间点记录数；
- 明确工具只计算买家定义的矩阵，不建立统计有效样本量、量产损耗、MOQ、白墨不透明度、印次、陷印/缩边、胶黏剂停放时间、条码等级、验收极限、寿命、合规、成本或量产批准；
- 新增 `assets/templates/clear-label-artwork-trial-template.csv`，覆盖标签/稿件/容器版本、容器与内容物颜色、尺寸、薄膜与胶黏剂、印刷面、白墨处理及图层名、陷印责任、透明窗口、条码数据责任人、贴标/卷材参数、试样条件、观察时间点、验收依据和记录状态；示例行明确禁止用于生产；
- 内容覆盖 Reddit 买家问题、刀线/CMYK/白墨/透明窗口/特殊版分层、套印和分色预览、无白/局部白/满版白路线、容器颜色与内容物、弧面与接缝、正面/反面观看、手贴/机贴、GS1 条码对比、试样矩阵、重复观察、生产预检、卷材放行和变更控制；
- Reddit 只用于识别买家措辞和交付失败，不把社区建议的白墨图层名、印刷顺序、陷印数值、设备或材料写成通用标准；事实边界引用 Adobe 官方套印/分色说明、GS1 官方条码颜色和 Quiet Zone 指南；
- 从首页、博客、透明标签商业页和通用稿件指南建立描述性内链，新指南回链透明标签、防水标签、酒标冷凝测试、通用稿件和询价入口；
- 同步 Article、WebApplication、BreadcrumbList、FAQPage、BlogPosting、`sitemap.xml`、`llms.txt`、关键词地图、GA4 `calculator_use` 事件和自动校验，站点由 56 个扩展到 57 个可索引页面；
- 自动校验新增对透明标签稿件/试样 CSV 及其版本、白墨、透明窗口、条码、贴标、观察、验收和状态字段的检查。

### 本轮验证

- 57 个可索引页面和 1 个 `noindex` 404 页面通过 metadata、canonical、H1、JSON-LD/FAQ、文章发现、内链、下载模板、表单、llms、脚本版本、crawler policy、重定向和 sitemap 自动校验；询价 API、JavaScript 语法和 Git diff 检查通过；
- 默认数据正确输出 6 个组合、18 张应用样、2 张备用、最低 20 张样品标签、54 条观察记录和每时间点 18 条；第二组数据正确输出 12 个组合、48 张应用样、6 张备用、最低 54 张样品标签、240 条观察记录和每时间点 48 条；
- CSV 可下载且关键受控字段齐全；390px 手机视口无页面级横向溢出；修复 3 处浅色区小字号来源链接对比度后，移动端 Lighthouse Accessibility、Best Practices、SEO 与 Agentic Browsing 均为 100；性能追踪记录 LCP 为 93ms、CLS 为 0；
- 白墨与条码内容要求由选定印刷商、数据所有人和实际应用系统确认，不把屏幕预览、通用陷印值、手机扫码、社区工作流或规划器数量写成生产批准。
