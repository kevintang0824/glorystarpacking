# GloryStarPack 网站优化报告（更新至 2026-07-29）

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
