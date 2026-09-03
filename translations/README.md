# 原生多语言内容

网站提供英语、法语、西班牙语、葡萄牙语、俄语及简体中文版本。
英语保留原网址；其他语言使用 `/fr`、`/es`、`/pt`、`/ru`、`/zh-CN`。
各语言的正文、标题和表单直接包含在 HTML 中，关闭 JavaScript 也能阅读。
运行时只使用本站文件，不使用翻译插件、代理、在线翻译 API 或外部语言服务。

## 内容维护

- `pages.json`：每个页面的完整语言标题；文字会填入当前英语标题的相同排版结构。
- `editorial.json`：导航、首页重点文案、表单和产品术语；优先于对应语言内容文件。
- `en.json`：内容条目清单；各语言 `.json`：页面及动态界面的本地内容。
- `scripts/build-languages.py`：根据英语页面结构及内容文件生成其他语言的 HTML、语言站点地图和动态界面内容。
- `scripts/synchronize-site-shell.mjs`：统一英语页面中的语言菜单、语言对应关系及资源版本。

重新生成只需要 Python、beautifulsoup4 和 Node.js，不需要翻译模型或服务账号。

```sh
node scripts/synchronize-site-shell.mjs
python3 scripts/build-languages.py
python3 scripts/validate-languages.py
node scripts/validate-site.mjs
node scripts/test-quote-api.mjs
```

编辑正文后应检查每种语言的内容条目。生成器遇到缺少内容会失败，不会静默放入英文段落。
需更新动态界面条目清单时，先安装开发解析工具：

```sh
npm install --prefix tmp/i18n-tools acorn linkedom
node scripts/extract-language-runtime.mjs
python3 scripts/build-languages.py --extract
```

内部链接保持当前语言。切换语言保留当前页面、查询条件和锚点。明确选择英语会覆盖已保存的语言偏好。
产品编号、规格数值、图片、表单字段值及用户输入均保持原值。
