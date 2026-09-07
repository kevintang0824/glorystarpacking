"""Build local, indexable language editions from reviewed translation dictionaries.

Run with --extract to refresh source strings. Translation generation is separate;
the production build never calls a translation service or downloads a model.
"""
import argparse
import html
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from bs4 import BeautifulSoup, Comment, Doctype, NavigableString

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://glorystarpacking.com"
LANGUAGES = {"en": ("English", "🇺🇸"), "fr": ("Français", "🇫🇷"), "es": ("Español", "🇪🇸"), "pt": ("Português", "🇵🇹"), "ru": ("Русский", "🇷🇺"), "zh-CN": ("简体中文", "🇨🇳")}
ATTRIBUTES = ("alt", "title", "placeholder", "aria-label")
SCHEMA_TEXT = {"name", "description", "text", "headline", "caption", "articleBody", "knowsAbout"}
PAGES = sorted(p for p in ROOT.glob("*.html") if not re.search(r" \d+\.html$", p.name))
PAGE_NAMES = {p.name for p in PAGES}

# These are maintained product terms and interface sentences. They keep the
# generated editions readable when a source sentence contains a term that a
# literal dictionary entry translated incorrectly (for example, treating
# packaging clearance as customs clearance). They are deliberately local and
# deterministic; the production build never calls a translation service.
EXACT_COPY = {
    "zh-CN": {
        "Foil": "箔材",
        "Embossed": "击凸",
        "Tuck end": "插舌式",
        "Wrapped insert": "包裹式内衬",
        "Mailer packaging": "邮寄包装",
        "Cap clearance": "瓶盖净空",
        "White-ink artwork and trial planner": "白墨图稿与打样规划器",
        "White-ink treatments": "白墨工艺",
        "clear-label white-ink artwork and applied-trial planner": "透明标签白墨图稿与应用打样规划器",
        "Automatic email delivery is temporarily unavailable. Complete the form to prepare the same brief for Email or WhatsApp.": "自动邮件发送暂不可用。请完成表单，以生成相同的邮件或 WhatsApp 需求摘要。",
        "The proposed inside size clears this {{0}} planning envelope in all three dimensions. Next confirm {{1}}.": "建议内尺寸在三个方向均满足该{{0}}规划包络。接下来确认{{1}}。",
        "The proposed inside size is below this {{0}} planning envelope in {{1}}. Revise the arranged layout, allowance, insert build, or box proposal, then confirm {{2}}.": "建议内尺寸在{{1}}方向小于该{{0}}规划包络。请调整排列方式、余量、内衬结构或盒型方案，然后确认{{2}}。",
        "The proposed usable space clears the entered planning envelope. Next confirm the real loading path, insert, tube roundness, cap or shoulder intrusion, opening and removal force, tolerances, and production-equivalent sample.": "建议可用空间满足已输入的规划包络。接下来确认实际装载路径、内衬、管体圆度、瓶盖或肩部侵入、开启和取出力度、尺寸公差以及量产等效样品。",
        "Turn product dimensions into a controlled packaging brief.": "将产品尺寸转化为可控的包装需求说明。",
        "We could not deliver this form. Return to review the required fields, or send the brief directly by email or WhatsApp.": "无法发送此表单。请返回检查必填字段，或直接通过邮件或 WhatsApp 发送需求摘要。",
        "A buyer guide to corrugated shipping case dimensions, case pack, board evidence, closure, pallet planning, test scope, and comparable RFQ data.": "关于瓦楞运输箱尺寸、箱装数量、纸板依据、封合、托盘规划、测试范围和可比 RFQ 数据的买方指南。",
        "Appropriate corrugated grade, locking tabs, right-sized cavity or insert": "合适的瓦楞纸板等级、锁舌以及尺寸匹配的内腔或内衬",
        "Build a corrugated shipping box specification with a free case-cube and pallet planning tool, RFQ fields, board evidence, and test checklist.": "使用箱体立方数和托盘规划工具、RFQ 字段、纸板依据及测试清单，建立瓦楞运输箱规格。",
        "Corrugated outer cartons developed around loaded weight, stacking, closure, inner protection, and pallet planning.": "围绕装载重量、堆叠、封合、内部保护和托盘规划开发的瓦楞外箱。",
        "Corrugated outer cartons developed around packed weight, stacking, closure, inner protection, and the delivery route.": "围绕包装重量、堆叠、封合、内部保护和交付路线开发的瓦楞外箱。",
        "Corrugated shipping box": "瓦楞运输箱",
        "Corrugated shipping boxes": "瓦楞运输箱",
        "Corrugated mailer boxes": "瓦楞邮寄盒",
        "Greyboard and corrugated": "灰板纸与瓦楞纸板",
        "White-ink artwork and applied-trial planner": "白墨图稿与应用打样规划器",
        "Clear cosmetic labels": "透明化妆品标签",
        "Clear PET": "透明 PET",
        "Clear film": "透明薄膜",
        "Clear film label": "透明薄膜标签",
        "Clear flexible label film": "透明柔性标签薄膜",
        "Clear gloss contrast": "透明光泽对比",
        "Clear windows": "透明窗口",
        "Clear tube-body diameter after the specified lining, wrap effect, shoulder, sleeve, or insert condition.": "在指定的内衬、包材、肩部、袖套或内衬条件下，确定管身直径。",
        "Clear vertical space between finished internal base and the closed cap, end, platform, pad, or other intrusion.": "确定成品内底与闭合瓶盖、端部、平台、垫片或其他突出物之间的垂直净空。",
        "Clear-label release gates and records.": "透明标签放行门槛和记录。",
        "Custom Clear Label Development and Printing": "定制透明标签开发与印刷",
        "Custom Clear Labels": "定制透明标签",
        "Cushioning system": "缓冲系统",
        "Die line, lift risk, visual alignment, stripping, roll stability, and room for normal print-to-cut and finish movement.": "刀模线、提拉风险、视觉对齐、剥离、卷材稳定性，以及印刷到模切和表面工艺正常偏移所需的余量。",
        "Die line, liner release, matrix stripping, spacing, and set alignment during application.": "刀模线、离型纸释放、废料排除、间距以及应用时的套位对齐。",
        "Envelope clears": "包络满足",
        "Keep foil, embossing, heavy ink, and coatings clear of vulnerable folds where possible": "在可能的情况下，让烫金、压纹、重墨和涂层避开易损折线",
        "Kept clear of functional sliding zones": "避开功能性滑动区域",
        "Confirm whether a window, laminate, magnet, or fabric layer can be removed cleanly.": "确认窗口、覆膜、磁铁或织物层能否无残留移除。",
        "Clear Label Applied Trial Matrix Planner": "透明标签应用打样矩阵规划器",
        "Clear Label White Ink Artwork": "透明标签白墨图稿",
        "Clear Label White Ink Artwork Guide": "透明标签白墨图稿指南",
        "Clear Label White Ink Artwork Guide & Trial Planner": "透明标签白墨图稿指南与打样规划器",
        "Clear Label White Ink Artwork Guide and Trial Planner": "透明标签白墨图稿指南与打样规划器",
        "The representative product fits, removes cleanly, survives handling, meets color and finish expectations, and has a controlled specification.": "代表性产品装配合适、取出顺畅，经得住搬运，符合颜色和表面工艺要求，并有受控规格。",
        "Magnetic, drawer, shoulder-neck, and collapsible structures for premium retail and gifting.": "磁吸、抽屉、肩颈和可折叠结构，适用于高端零售和礼赠。",
        "Branded corrugated mailers that protect the product and make ecommerce delivery feel intentional.": "品牌化瓦楞邮寄盒，保护产品并让电商交付更有开箱感。",
        "Paper, film, foil, embossed, and smart labels matched to your product surface and use conditions.": "纸张、薄膜、箔材、压纹和智能标签，匹配产品表面与使用条件。",
        "Sleeve-and-tray presentation developed around sliding feel, pull access, insert fit, and packing direction.": "套筒与托盘式包装，围绕顺滑滑动手感、拉取空间、内衬适配和装箱方向开发。",
        "Space-efficient retail cartons specified through paperboard, crease, closure, finish, and packing method.": "通过纸板、压痕、封合、表面工艺和装箱方式打造节省空间的零售彩盒。",
        "Retail carry bags matched to the box system through paper, reinforcement, handle, color, and logo finish.": "通过纸张、加固、提手、颜色和标志表面工艺，使零售手提袋与盒型系统匹配。",
        "Flat-delivered presentation boxes planned around assembly, corner retention, closure, storage, and pack-out.": "平铺交付的展示盒，围绕组装、护角、封合、储存和装箱方式规划。",
        "Cylindrical packs specified through diameter, lid fit, edge, seam, artwork wrap, insert, and product removal.": "通过直径、盖子适配、边缘、接缝、包材图稿、内衬和产品取出方式定义圆柱形包装。",
        "Bottle packaging developed around filled weight, neck and shoulder support, removal, presentation, and the outer transit pack.": "围绕装瓶重量、瓶颈与肩部支撑、取出、展示和外部运输包装开发瓶装包装。",
        "Fragrance packaging planned around glass bottle fit, cap or pump clearance, scuff control, removal, and multi-SKU sets.": "围绕玻璃瓶适配、瓶盖或泵净空、防刮、取出和多 SKU 套装规划香氛包装。",
        "Film labels matched to the actual surface, moisture, abrasion, temperature, application, and service-life brief.": "薄膜标签匹配实际表面、湿气、磨损、温度、贴标方式和使用寿命要求。",
        "Need to choose the structure before selecting a product page? Start with the custom box structure guide ": "选择产品页前是否需要先确定结构？先查看定制盒型结构指南，",
        "Structure, artwork, color, finish, assembly, and packing are reviewed against the signed-off proof. You receive progress photos at the checkpoints that matter.": "结构、图稿、颜色、表面工艺、组装和装箱均依据签样审核。我们会在关键检查节点提供进度照片。",
        "Structural dieline and artwork preflight before tooling": "开模前完成结构刀模线和图稿预检",
        "Physical pre-production sample available before the bulk run": "大货生产前提供量产前实物样",
        "Photo and video verification during printing, finishing, and packing": "印刷、表面工艺和装箱过程中的照片与视频核查",
        "Air, rail, sea, and door-delivery planning where available for the destination": "根据目的地情况规划空运、铁路、海运和送货上门路线",
        "Start with what the product must survive.": "从产品需要经受的真实条件开始。",
        "Industry pages connect presentation goals to practical risks such as bottle movement, scratching, condensation, courier handling, and label application.": "行业页面把展示目标与瓶体移动、刮擦、冷凝、快递搬运和贴标等实际风险联系起来。",
        "Four decisions. One clear approval path.": "四个决定，一条清晰的审批路径。",
        "Each stage has a defined output, so your team can track what is approved and what happens next.": "每个阶段都有明确产出，团队可以追踪已批准内容和下一步安排。",
        "One brand language across box and label.": "让盒子和标签使用统一的品牌语言。",
        "Paper, film, lamination, and foil reproduce color differently. We work from shared brand references, then approve each component in its real material.": "纸张、薄膜、覆膜和箔材对颜色的呈现不同。我们先建立统一的品牌参考，再在真实材料上逐项确认。",
        "Custom insert": "定制内衬",
        "MOQ by build": "按结构确定 MOQ",
        "Paper options": "纸张选项",
        "Inside print": "内印",
        "Transit planning": "运输路线规划",
        "Waterproof": "防水",
        "Roll format": "卷材规格",
        "Ribbon pull": "丝带拉手",
        "Controlled slide": "受控滑动",
        "Fitted tray": "匹配内托",
        "Flat packed": "平装交付",
        "Retail print": "零售印刷",
        "Reinforced top": "顶部加固",
        "Custom handle": "定制提手",
        "Foil logo": "箔材标志",
        "Flat delivered": "平铺交付",
        "Assembly sample": "组装样",
        "Magnetic option": "磁吸选项",
        "Custom diameter": "定制直径",
        "Telescopic lid": "套筒式盖",
        "Insert option": "内衬选项",
        "RSC format": "RSC 箱型",
        "Board selection": "纸板选择",
        "Logistics brief": "物流需求说明",
        "Bottle fit": "瓶身适配",
        "Insert support": "内衬支撑",
        "Outer shipper": "外部运输箱",
        "Glass bottle fit": "玻璃瓶适配",
        "Cap clearance": "瓶盖净空",
        "Set layout": "套装布局",
        "Exposure brief": "暴露条件说明",
        "Adhesive match": "胶黏剂匹配",
        "Test plan": "测试计划",
        "Paper tube fit planner": "纸管适配规划器",
        "Jewelry insert fit planner": "珠宝内衬适配规划器",
        "Case and pallet planner": "外箱与托盘规划器",
        "Tissue sheet planner": "薄页纸规划器",
        "Hang tag production planner": "吊牌生产规划器",
        "Wine gift-box fit and load planner": "酒类礼盒适配与装载规划器",
        "Perfume bottle insert fit planner": "香水瓶内衬适配规划器",
        "RFQ and quote coverage planner": "RFQ 与报价覆盖规划器",
        "Inspection and shipment release planner": "检验与出货放行规划器",
        "Waterproof-label test matrix": "防水标签测试矩阵",
    },
    "es": {
        "Foil": "Estampado en foil",
        "Embossed": "Relieve",
        "Tuck end": "Solapa de cierre",
        "Wrapped insert": "Inserto forrado",
        "Mailer packaging": "Embalaje para envíos",
        "Quote": "Cotización",
        "Quote and approval": "Cotización y aprobación",
        "Clearance": "Holgura",
        "Clear label": "Etiqueta transparente",
        "Clear labels": "Etiquetas transparentes",
        "Clear PET": "PET transparente",
        "Clear film": "Película transparente",
        "Clear film label": "Etiqueta de película transparente",
        "Clear flexible label film": "Película flexible transparente para etiquetas",
        "Clear gloss contrast": "Contraste de brillo sobre transparente",
        "Clear windows": "Ventanas transparentes",
        "Clear-label release gates and records.": "Criterios y registros de liberación de etiquetas transparentes.",
        "Custom Clear Label Development and Printing": "Desarrollo e impresión de etiquetas transparentes a medida",
        "Custom Clear Labels": "Etiquetas transparentes a medida",
        "Cushioning system": "Sistema de amortiguación",
        "Customs clearance, local delivery capacity, and appointment rules.": "Despacho aduanero, capacidad de entrega local y reglas de cita.",
        "Seller arranges delivery to the named destination, ready for unloading; import clearance and import charges remain buyer responsibilities under the rule.": "El vendedor organiza la entrega al destino indicado, lista para descargar; el despacho de importación y los cargos de importación siguen siendo responsabilidad del comprador según la regla.",
        "Dieline, engineering, cutting die, print plate, foil or emboss die, mold, proof, and production-intent sample.": "Troquel, ingeniería, matriz de corte, plancha de impresión, matriz de estampado o relieve, molde, prueba y muestra destinada a producción.",
        "Engineering, cutting die, print plate, foil or emboss die, mold, setup, sample, inspection, and other conditional charges.": "Ingeniería, matriz de corte, plancha de impresión, matriz de estampado o relieve, molde, preparación, muestra, inspección y otros cargos condicionales.",
        "A clear label looks most integrated when the film, adhesive layer, printing, container color, cleanliness, curvature, and application all work together. A transparent face alone does not guarantee an invisible edge or a haze-free result.": "Una etiqueta transparente se integra mejor cuando la película, el adhesivo, la impresión, el color del envase, la limpieza, la curvatura y la aplicación funcionan juntos. Una cara transparente por sí sola no garantiza un borde invisible ni un resultado sin velo.",
        "Adhesive haze and tiny reflective channels can appear differently immediately after application and after dwell. Surface cleanliness, container texture, application pressure, trapped air, curve, and viewing light can change the result.": "La bruma del adhesivo y los pequeños canales reflectantes pueden verse de forma distinta justo después de la aplicación y tras el tiempo de reposo. La limpieza de la superficie, la textura del envase, la presión de aplicación, el aire atrapado, la curvatura y la luz de observación pueden cambiar el resultado.",
        "Translate water, condensation, oil, cleaner, rubbing, cold, heat and outdoor use into controlled samples, sequences, checkpoints and acceptance records.": "Convierte el agua, la condensación, el aceite, los productos de limpieza, el frotamiento, el frío, el calor y el uso exterior en muestras, secuencias, puntos de control y registros de aceptación controlados.",
        "Magnetic, drawer, shoulder-neck, and collapsible structures for premium retail and gifting.": "Estructuras magnéticas, de cajón, hombro-cuello y plegables para retail premium y regalos.",
        "Branded corrugated mailers that protect the product and make ecommerce delivery feel intentional.": "Cajas de envío corrugadas personalizadas que protegen el producto y hacen que la entrega de comercio electrónico se sienta cuidada.",
        "Paper, film, foil, embossed, and smart labels matched to your product surface and use conditions.": "Etiquetas de papel, película, foil, relieve e inteligentes adaptadas a la superficie del producto y a sus condiciones de uso.",
        "Sleeve-and-tray presentation developed around sliding feel, pull access, insert fit, and packing direction.": "Presentación de funda y bandeja desarrollada en torno al deslizamiento, el acceso de extracción, el ajuste del inserto y la dirección de embalaje.",
        "Space-efficient retail cartons specified through paperboard, crease, closure, finish, and packing method.": "Cajas de cartón para retail, eficientes en espacio, definidas por el cartón, los pliegues, el cierre, el acabado y el método de embalaje.",
        "Retail carry bags matched to the box system through paper, reinforcement, handle, color, and logo finish.": "Bolsas de compra para retail coordinadas con el sistema de cajas mediante papel, refuerzo, asas, color y acabado del logotipo.",
        "Flat-delivered presentation boxes planned around assembly, corner retention, closure, storage, and pack-out.": "Cajas de presentación entregadas planas, planificadas para el montaje, la retención de esquinas, el cierre, el almacenamiento y el embalaje final.",
        "Cylindrical packs specified through diameter, lid fit, edge, seam, artwork wrap, insert, and product removal.": "Envases cilíndricos definidos por el diámetro, el ajuste de la tapa, el borde, la costura, la envoltura gráfica, el inserto y la extracción del producto.",
        "Bottle packaging developed around filled weight, neck and shoulder support, removal, presentation, and the outer transit pack.": "Embalaje para botellas desarrollado en torno al peso lleno, el soporte del cuello y el hombro, la extracción, la presentación y el embalaje exterior de transporte.",
        "Fragrance packaging planned around glass bottle fit, cap or pump clearance, scuff control, removal, and multi-SKU sets.": "Embalaje para fragancias planificado para el ajuste de la botella de vidrio, la holgura de la tapa o la bomba, el control de roces, la extracción y los conjuntos multi-SKU.",
        "Film labels matched to the actual surface, moisture, abrasion, temperature, application, and service-life brief.": "Etiquetas de película adaptadas a la superficie real, la humedad, la abrasión, la temperatura, la aplicación y la vida útil prevista.",
        "Structure, artwork, color, finish, assembly, and packing are reviewed against the signed-off proof. You receive progress photos at the checkpoints that matter.": "La estructura, el arte final, el color, el acabado, el montaje y el embalaje se revisan contra la prueba aprobada. Recibirás fotos de progreso en los puntos de control clave.",
        "Structural dieline and artwork preflight before tooling": "Troquel estructural y preflight del arte antes de fabricar la herramienta",
        "Physical pre-production sample available before the bulk run": "Muestra física de preproducción disponible antes de la tirada principal",
        "Photo and video verification during printing, finishing, and packing": "Verificación fotográfica y de vídeo durante la impresión, el acabado y el embalaje",
        "Air, rail, sea, and door-delivery planning where available for the destination": "Planificación de entrega aérea, ferroviaria, marítima o puerta a puerta según el destino",
        "Start with what the product must survive.": "Empieza por las condiciones que el producto debe soportar.",
        "Industry pages connect presentation goals to practical risks such as bottle movement, scratching, condensation, courier handling, and label application.": "Las páginas por sector conectan los objetivos de presentación con riesgos prácticos como el movimiento de la botella, los arañazos, la condensación, la manipulación del mensajero y la aplicación de etiquetas.",
        "Four decisions. One clear approval path.": "Cuatro decisiones. Un proceso de aprobación claro.",
        "Each stage has a defined output, so your team can track what is approved and what happens next.": "Cada etapa tiene un resultado definido para que tu equipo pueda seguir lo aprobado y saber qué ocurre después.",
        "One brand language across box and label.": "Un mismo lenguaje de marca en cajas y etiquetas.",
        "Paper, film, lamination, and foil reproduce color differently. We work from shared brand references, then approve each component in its real material.": "El papel, la película, la laminación y el foil reproducen el color de forma distinta. Trabajamos con referencias de marca compartidas y aprobamos cada componente en su material real.",
        "Custom insert": "Inserto personalizado",
        "MOQ by build": "MOQ según la estructura",
        "Paper options": "Opciones de papel",
        "Inside print": "Impresión interior",
        "Transit planning": "Planificación del tránsito",
        "Waterproof": "Resistente al agua",
        "Roll format": "Formato de rollo",
        "Ribbon pull": "Tirador de cinta",
        "Controlled slide": "Deslizamiento controlado",
        "Fitted tray": "Bandeja ajustada",
        "Flat packed": "Embalaje plano",
        "Retail print": "Impresión para retail",
        "Reinforced top": "Parte superior reforzada",
        "Custom handle": "Asa personalizada",
        "Foil logo": "Logotipo en foil",
        "Flat delivered": "Entrega plana",
        "Assembly sample": "Muestra de montaje",
        "Magnetic option": "Opción magnética",
        "Custom diameter": "Diámetro personalizado",
        "Telescopic lid": "Tapa telescópica",
        "Insert option": "Opción de inserto",
        "RSC format": "Formato RSC",
        "Board selection": "Selección de cartón",
        "Logistics brief": "Especificación logística",
        "Bottle fit": "Ajuste de la botella",
        "Insert support": "Soporte del inserto",
        "Outer shipper": "Caja exterior de transporte",
        "Glass bottle fit": "Ajuste de la botella de vidrio",
        "Cap clearance": "Holgura de la tapa",
        "Set layout": "Diseño del conjunto",
        "Exposure brief": "Resumen de exposición",
        "Adhesive match": "Adhesivo adecuado",
        "Test plan": "Plan de pruebas",
        "Paper tube fit planner": "Planificador de ajuste de tubos de papel",
        "Jewelry insert fit planner": "Planificador de ajuste de inserto para joyería",
        "Case and pallet planner": "Planificador de cajas y palés",
        "Tissue sheet planner": "Planificador de hojas de papel tisú",
        "Hang tag production planner": "Planificador de producción de etiquetas colgantes",
        "Wine gift-box fit and load planner": "Planificador de ajuste y carga para cajas de vino",
        "Perfume bottle insert fit planner": "Planificador de ajuste del inserto para frascos de perfume",
        "RFQ and quote coverage planner": "Planificador de cobertura de RFQ y cotización",
        "Inspection and shipment release planner": "Planificador de inspección y liberación del envío",
        "Waterproof-label test matrix": "Matriz de pruebas para etiquetas resistentes al agua",
    },
    "pt": {
        "Foil": "Foil",
        "Embossed": "Relevo",
        "Tuck end": "Fecho tuck-end",
        "Wrapped insert": "Inserto revestido",
        "Mailer packaging": "Embalagem para envio",
        "Quote": "Cotação",
        "Quote and approval": "Cotação e aprovação",
        "Quote by product and channel": "Cotação por produto e canal",
        "For a privacy request, email": "Para um pedido de privacidade, envie um email",
        "Clearance": "Folga",
        "Clear label": "Etiqueta transparente",
        "Clear labels": "Etiquetas transparentes",
        "Clear PET": "PET transparente",
        "Clear film": "Filme transparente",
        "Clear film label": "Etiqueta de filme transparente",
        "Clear flexible label film": "Filme flexível transparente para etiquetas",
        "Clear gloss contrast": "Contraste de brilho sobre transparente",
        "Clear windows": "Janelas transparentes",
        "Clear-label release gates and records.": "Critérios e registos de aprovação de etiquetas transparentes.",
        "Custom Clear Label Development and Printing": "Desenvolvimento e impressão de etiquetas transparentes personalizadas",
        "Custom Clear Labels": "Etiquetas transparentes personalizadas",
        "Cushioning system": "Sistema de amortecimento",
        "Seller arranges delivery to the named destination, ready for unloading; import clearance and import charges remain buyer responsibilities under the rule.": "O vendedor organiza a entrega no destino indicado, pronta para descarregar; o desembaraço de importação e os respetivos encargos continuam a ser responsabilidade do comprador segundo a regra.",
        "Check against agreed criteria for print, foil coverage, finish register, relief, die cut, release, unwind, core, gap, count, joins, roll labels, and packing.": "Verifique os critérios acordados para impressão, cobertura de foil, registro do acabamento, relevo, corte, descolagem, desenrolamento, núcleo, folga, contagem, emendas, etiquetas em rolo e embalagem.",
        "Check large labels, neck labels, complex die shapes, heavy embellishment, and tight curves separately": "Verifique separadamente etiquetas grandes, etiquetas de gargalo, formatos de corte complexos, aplicações de acabamento intensas e curvas fechadas.",
        "Construction, print side, color, white opacity, registration, clear windows, fine detail and die cut.": "Estrutura, lado de impressão, cor, opacidade do branco, registro, janelas transparentes, detalhes finos e corte.",
        "Dieline, engineering, cutting die, print plate, foil or emboss die, mold, proof, and production-intent sample.": "Faca de corte, engenharia, matriz de corte, chapa de impressão, matriz de foil ou relevo, molde, prova e amostra destinada à produção.",
        "A bottle-first route from real dimensions and loaded weight to support, samples, QC, and protected carton packing.": "Uma abordagem baseada na garrafa, das dimensões e do peso reais ao suporte, às amostras, ao controle de qualidade e à embalagem externa protegida.",
        "A glass-bottle-first route from real size and weight to insert support, cap clearance, surface protection, samples, QC, and outer packing.": "Uma abordagem baseada na garrafa de vidro, do tamanho e peso reais ao suporte da inserção, à folga da tampa, à proteção da superfície, às amostras, ao controle de qualidade e à embalagem externa.",
        "Review face stock, adhesive, ink, protection, finish, die shape, and supply format as one construction.": "Analise o material frontal, o adesivo, a tinta, a proteção, o acabamento, o formato de corte e o formato de fornecimento como uma única construção.",
        "Adhesive haze and tiny reflective channels can appear differently immediately after application and after dwell. Surface cleanliness, container texture, application pressure, trapped air, curve, and viewing light can change the result.": "A névoa do adesivo e pequenos canais refletivos podem aparecer de forma diferente logo após a aplicação e depois do tempo de repouso. A limpeza da superfície, a textura do recipiente, a pressão de aplicação, o ar preso, a curvatura e a luz de observação podem alterar o resultado.",
        "Translate water, condensation, oil, cleaner, rubbing, cold, heat and outdoor use into controlled samples, sequences, checkpoints and acceptance records.": "Converta água, condensação, óleo, produtos de limpeza, fricção, frio, calor e uso exterior em amostras, sequências, pontos de controlo e registos de aceitação controlados.",
        "Magnetic, drawer, shoulder-neck, and collapsible structures for premium retail and gifting.": "Estruturas magnéticas, de gaveta, ombro-pescoço e dobráveis para retalho premium e presentes.",
        "Branded corrugated mailers that protect the product and make ecommerce delivery feel intentional.": "Caixas de envio caneladas personalizadas que protegem o produto e tornam a entrega de comércio eletrónico mais cuidada.",
        "Paper, film, foil, embossed, and smart labels matched to your product surface and use conditions.": "Etiquetas de papel, filme, foil, relevo e inteligentes adaptadas à superfície do produto e às condições de utilização.",
        "Sleeve-and-tray presentation developed around sliding feel, pull access, insert fit, and packing direction.": "Apresentação de manga e bandeja desenvolvida em torno do deslizamento, do acesso para puxar, do ajuste da inserção e da direção de embalagem.",
        "Space-efficient retail cartons specified through paperboard, crease, closure, finish, and packing method.": "Cartuchos de retalho eficientes em espaço, especificados pelo cartão, vincos, fecho, acabamento e método de embalagem.",
        "Retail carry bags matched to the box system through paper, reinforcement, handle, color, and logo finish.": "Sacos de transporte para retalho coordenados com o sistema de caixas através do papel, reforço, pegas, cor e acabamento do logótipo.",
        "Flat-delivered presentation boxes planned around assembly, corner retention, closure, storage, and pack-out.": "Caixas de apresentação fornecidas planas, planeadas para montagem, retenção dos cantos, fecho, armazenamento e acondicionamento final.",
        "Cylindrical packs specified through diameter, lid fit, edge, seam, artwork wrap, insert, and product removal.": "Embalagens cilíndricas especificadas pelo diâmetro, ajuste da tampa, bordo, união, revestimento gráfico, inserção e remoção do produto.",
        "Bottle packaging developed around filled weight, neck and shoulder support, removal, presentation, and the outer transit pack.": "Embalagem para garrafas desenvolvida em torno do peso cheio, suporte do gargalo e ombro, remoção, apresentação e embalagem exterior de transporte.",
        "Fragrance packaging planned around glass bottle fit, cap or pump clearance, scuff control, removal, and multi-SKU sets.": "Embalagem para fragrâncias planeada para o ajuste da garrafa de vidro, folga da tampa ou bomba, controlo de riscos, remoção e conjuntos multi-SKU.",
        "Film labels matched to the actual surface, moisture, abrasion, temperature, application, and service-life brief.": "Etiquetas de filme adaptadas à superfície real, humidade, abrasão, temperatura, aplicação e vida útil prevista.",
        "Structure, artwork, color, finish, assembly, and packing are reviewed against the signed-off proof. You receive progress photos at the checkpoints that matter.": "A estrutura, a arte final, a cor, o acabamento, a montagem e a embalagem são revistos face à prova aprovada. Receberá fotografias de progresso nos pontos de controlo relevantes.",
        "Structural dieline and artwork preflight before tooling": "Faca estrutural e preflight da arte antes de fabricar a ferramenta",
        "Physical pre-production sample available before the bulk run": "Amostra física de pré-produção disponível antes da produção principal",
        "Photo and video verification during printing, finishing, and packing": "Verificação por fotografia e vídeo durante a impressão, acabamento e embalagem",
        "Air, rail, sea, and door-delivery planning where available for the destination": "Planeamento de entrega aérea, ferroviária, marítima ou porta a porta conforme o destino",
        "Start with what the product must survive.": "Comece pelas condições reais que o produto tem de suportar.",
        "Industry pages connect presentation goals to practical risks such as bottle movement, scratching, condensation, courier handling, and label application.": "As páginas por setor ligam os objetivos de apresentação a riscos práticos como movimento da garrafa, riscos, condensação, manuseamento do transportador e aplicação da etiqueta.",
        "Four decisions. One clear approval path.": "Quatro decisões. Um caminho claro de aprovação.",
        "Each stage has a defined output, so your team can track what is approved and what happens next.": "Cada etapa tem um resultado definido, para que a sua equipa acompanhe o que foi aprovado e o que acontece a seguir.",
        "One brand language across box and label.": "Uma linguagem de marca comum a caixas e etiquetas.",
        "Paper, film, lamination, and foil reproduce color differently. We work from shared brand references, then approve each component in its real material.": "Papel, filme, laminação e foil reproduzem a cor de formas diferentes. Trabalhamos com referências de marca partilhadas e aprovamos cada componente no seu material real.",
        "Custom insert": "Inserção personalizada",
        "MOQ by build": "MOQ conforme a estrutura",
        "Paper options": "Opções de papel",
        "Inside print": "Impressão interior",
        "Transit planning": "Planeamento do trânsito",
        "Waterproof": "Resistente à água",
        "Roll format": "Formato de rolo",
        "Ribbon pull": "Puxador de fita",
        "Controlled slide": "Deslizamento controlado",
        "Fitted tray": "Bandeja ajustada",
        "Flat packed": "Embalagem plana",
        "Retail print": "Impressão para retalho",
        "Reinforced top": "Topo reforçado",
        "Custom handle": "Pega personalizada",
        "Foil logo": "Logótipo em foil",
        "Flat delivered": "Fornecido plano",
        "Assembly sample": "Amostra de montagem",
        "Magnetic option": "Opção magnética",
        "Custom diameter": "Diâmetro personalizado",
        "Telescopic lid": "Tampa telescópica",
        "Insert option": "Opção de inserção",
        "RSC format": "Formato RSC",
        "Board selection": "Seleção do cartão",
        "Logistics brief": "Especificação logística",
        "Bottle fit": "Ajuste da garrafa",
        "Insert support": "Suporte da inserção",
        "Outer shipper": "Caixa exterior de transporte",
        "Glass bottle fit": "Ajuste da garrafa de vidro",
        "Cap clearance": "Folga da tampa",
        "Set layout": "Disposição do conjunto",
        "Exposure brief": "Resumo da exposição",
        "Adhesive match": "Adesivo adequado",
        "Test plan": "Plano de testes",
        "Paper tube fit planner": "Planeador de ajuste de tubos de papel",
        "Jewelry insert fit planner": "Planeador de ajuste da inserção para joalharia",
        "Case and pallet planner": "Planeador de caixas e paletes",
        "Tissue sheet planner": "Planeador de folhas de papel de seda",
        "Hang tag production planner": "Planeador de produção de etiquetas pendentes",
        "Wine gift-box fit and load planner": "Planeador de ajuste e carga para caixas de vinho",
        "Perfume bottle insert fit planner": "Planeador de ajuste da inserção para frascos de perfume",
        "RFQ and quote coverage planner": "Planeador de cobertura de RFQ e cotação",
        "Inspection and shipment release planner": "Planeador de inspeção e libertação da expedição",
        "Waterproof-label test matrix": "Matriz de testes para etiquetas resistentes à água",
    },
    "fr": {
        "Foil": "Dorure à chaud",
        "Embossed": "Relief",
        "Tuck end": "Rabat rentrant",
        "Wrapped insert": "Insert habillé",
        "Mailer packaging": "Emballage d’expédition",
        "Clearance": "Dégagement",
        "Clear label": "Étiquette transparente",
        "Clear labels": "Étiquettes transparentes",
        "Clear PET": "PET transparent",
        "Clear film": "Film transparent",
        "Clear film label": "Étiquette en film transparent",
        "Clear flexible label film": "Film flexible transparent pour étiquettes",
        "Clear gloss contrast": "Contraste brillant sur support transparent",
        "Clear windows": "Fenêtres transparentes",
        "Clear-label release gates and records.": "Critères et dossiers de libération des étiquettes transparentes.",
        "Custom Clear Label Development and Printing": "Développement et impression d’étiquettes transparentes sur mesure",
        "Custom Clear Labels": "Étiquettes transparentes sur mesure",
        "Adhesive haze and tiny reflective channels can appear differently immediately after application and after dwell. Surface cleanliness, container texture, application pressure, trapped air, curve, and viewing light can change the result.": "Un voile d’adhésif et de petits canaux réfléchissants peuvent apparaître différemment juste après l’application et après le temps de repos. La propreté de la surface, la texture du contenant, la pression d’application, l’air emprisonné, la courbure et la lumière d’observation peuvent modifier le résultat.",
        "Magnetic, drawer, shoulder-neck, and collapsible structures for premium retail and gifting.": "Structures magnétiques, à tiroir, à épaulement et pliables pour le retail premium et les cadeaux.",
        "Branded corrugated mailers that protect the product and make ecommerce delivery feel intentional.": "Emballages d’expédition en carton ondulé, personnalisés pour protéger le produit et soigner l’expérience de livraison e-commerce.",
        "Paper, film, foil, embossed, and smart labels matched to your product surface and use conditions.": "Étiquettes en papier, film, aluminium, relief ou intelligentes adaptées à la surface du produit et à ses conditions d’utilisation.",
        "Sleeve-and-tray presentation developed around sliding feel, pull access, insert fit, and packing direction.": "Présentation avec fourreau et plateau conçue autour du coulissement, de la prise, de l’ajustement de l’insert et du sens de conditionnement.",
        "Space-efficient retail cartons specified through paperboard, crease, closure, finish, and packing method.": "Étuis de vente compacts définis par le carton, les rainages, la fermeture, la finition et le mode de conditionnement.",
        "Retail carry bags matched to the box system through paper, reinforcement, handle, color, and logo finish.": "Sacs de vente assortis au système de boîtes par le papier, le renfort, la poignée, la couleur et la finition du logo.",
        "Flat-delivered presentation boxes planned around assembly, corner retention, closure, storage, and pack-out.": "Boîtes de présentation livrées à plat, planifiées pour le montage, la tenue des angles, la fermeture, le stockage et le conditionnement.",
        "Cylindrical packs specified through diameter, lid fit, edge, seam, artwork wrap, insert, and product removal.": "Emballages cylindriques définis par le diamètre, l’ajustement du couvercle, le bord, la jonction, l’habillage graphique, l’insert et le retrait du produit.",
        "Bottle packaging developed around filled weight, neck and shoulder support, removal, presentation, and the outer transit pack.": "Emballage pour bouteilles développé autour du poids rempli, du soutien du col et de l’épaule, du retrait, de la présentation et de l’emballage extérieur de transport.",
        "Fragrance packaging planned around glass bottle fit, cap or pump clearance, scuff control, removal, and multi-SKU sets.": "Emballage de parfum planifié autour de l’ajustement du flacon en verre, du dégagement du bouchon ou de la pompe, du contrôle des frottements, du retrait et des coffrets multi-UGS.",
        "Film labels matched to the actual surface, moisture, abrasion, temperature, application, and service-life brief.": "Étiquettes en film adaptées à la surface réelle, à l’humidité, à l’abrasion, à la température, à l’application et à la durée de vie prévue.",
        "Structure, artwork, color, finish, assembly, and packing are reviewed against the signed-off proof. You receive progress photos at the checkpoints that matter.": "La structure, le fichier graphique, la couleur, la finition, le montage et le conditionnement sont vérifiés par rapport à l’épreuve validée. Vous recevez des photos d’avancement aux points de contrôle importants.",
        "Structural dieline and artwork preflight before tooling": "Dieline structurelle et prépresse du fichier graphique avant outillage",
        "Physical pre-production sample available before the bulk run": "Échantillon physique de préproduction disponible avant la série principale",
        "Photo and video verification during printing, finishing, and packing": "Vérification photo et vidéo pendant l’impression, la finition et le conditionnement",
        "Air, rail, sea, and door-delivery planning where available for the destination": "Planification d’une livraison aérienne, ferroviaire, maritime ou porte à porte selon la destination",
        "Start with what the product must survive.": "Commencez par les conditions réelles que le produit doit supporter.",
        "Industry pages connect presentation goals to practical risks such as bottle movement, scratching, condensation, courier handling, and label application.": "Les pages par secteur relient les objectifs de présentation aux risques pratiques : mouvement du flacon, rayures, condensation, manutention du transporteur et pose de l’étiquette.",
        "Four decisions. One clear approval path.": "Quatre décisions. Un parcours d’approbation clair.",
        "Each stage has a defined output, so your team can track what is approved and what happens next.": "Chaque étape produit un résultat défini, afin que votre équipe suive ce qui est approuvé et la suite du projet.",
        "One brand language across box and label.": "Un langage de marque cohérent sur les boîtes et les étiquettes.",
        "Paper, film, lamination, and foil reproduce color differently. We work from shared brand references, then approve each component in its real material.": "Le papier, le film, la lamination et l’aluminium restituent les couleurs différemment. Nous partons de références de marque communes, puis validons chaque composant dans son matériau réel.",
        "Custom insert": "Insert sur mesure",
        "MOQ by build": "MOQ selon la construction",
        "Paper options": "Options de papier",
        "Inside print": "Impression intérieure",
        "Transit planning": "Planification du transit",
        "Waterproof": "Résistant à l’eau",
        "Roll format": "Format en rouleau",
        "Ribbon pull": "Tirette en ruban",
        "Controlled slide": "Coulissement contrôlé",
        "Fitted tray": "Plateau ajusté",
        "Flat packed": "Conditionné à plat",
        "Retail print": "Impression pour la vente au détail",
        "Reinforced top": "Haut renforcé",
        "Custom handle": "Poignée sur mesure",
        "Foil logo": "Logo en aluminium",
        "Flat delivered": "Livré à plat",
        "Assembly sample": "Échantillon de montage",
        "Magnetic option": "Option magnétique",
        "Custom diameter": "Diamètre sur mesure",
        "Telescopic lid": "Couvercle télescopique",
        "Insert option": "Option d’insert",
        "RSC format": "Format RSC",
        "Board selection": "Choix du carton",
        "Logistics brief": "Spécification logistique",
        "Bottle fit": "Ajustement du flacon",
        "Insert support": "Support de l’insert",
        "Outer shipper": "Emballage extérieur de transport",
        "Glass bottle fit": "Ajustement du flacon en verre",
        "Cap clearance": "Dégagement du bouchon",
        "Set layout": "Disposition du coffret",
        "Exposure brief": "Résumé d’exposition",
        "Adhesive match": "Adhésif adapté",
        "Test plan": "Plan d’essai",
        "Paper tube fit planner": "Planificateur d’ajustement des tubes en papier",
        "Jewelry insert fit planner": "Planificateur d’ajustement des inserts pour bijoux",
        "Case and pallet planner": "Planificateur de caisses et de palettes",
        "Tissue sheet planner": "Planificateur de feuilles de papier de soie",
        "Hang tag production planner": "Planificateur de production des étiquettes suspendues",
        "Wine gift-box fit and load planner": "Planificateur d’ajustement et de charge des coffrets à vin",
        "Perfume bottle insert fit planner": "Planificateur d’ajustement de l’insert pour flacons de parfum",
        "RFQ and quote coverage planner": "Planificateur de couverture RFQ et devis",
        "Inspection and shipment release planner": "Planificateur d’inspection et de libération des expéditions",
        "Waterproof-label test matrix": "Matrice d’essai des étiquettes résistantes à l’eau",
    },
    "ru": {
        "Foil": "Фольга",
        "Embossed": "Тиснение",
        "Tuck end": "Клапан tuck-end",
        "Wrapped insert": "Обёрнутая вставка",
        "Mailer packaging": "Почтовая упаковка",
        "Clearance": "Зазор",
        "Clear label": "Прозрачная этикетка",
        "Clear labels": "Прозрачные этикетки",
        "Clear PET": "Прозрачный ПЭТ",
        "Clear film": "Прозрачная плёнка",
        "Clear film label": "Этикетка из прозрачной плёнки",
        "Clear flexible label film": "Прозрачная гибкая плёнка для этикеток",
        "Clear gloss contrast": "Контраст глянца на прозрачном материале",
        "Clear windows": "Прозрачные окна",
        "Clear-label release gates and records.": "Критерии и записи выпуска прозрачных этикеток.",
        "Custom Clear Label Development and Printing": "Разработка и печать прозрачных этикеток на заказ",
        "Custom Clear Labels": "Прозрачные этикетки на заказ",
        "Kept clear of functional sliding zones": "Не занимать рабочую зону скольжения",
        "Confirm whether a window, laminate, magnet, or fabric layer can be removed cleanly.": "Проверьте, можно ли аккуратно снять окно, ламинат, магнит или тканевый слой.",
        "Seller arranges delivery to the named destination, ready for unloading; import clearance and import charges remain buyer responsibilities under the rule.": "Продавец организует доставку в указанное место, готовое к разгрузке; таможенное оформление и импортные сборы остаются ответственностью покупателя по этому правилу.",
        "Adhesive haze and tiny reflective channels can appear differently immediately after application and after dwell. Surface cleanliness, container texture, application pressure, trapped air, curve, and viewing light can change the result.": "Клеевая дымка и мелкие отражающие каналы могут выглядеть по-разному сразу после нанесения и после выдержки. Чистота поверхности, текстура контейнера, давление нанесения, захваченный воздух, кривизна и свет при осмотре могут изменить результат.",
        "Translate water, condensation, oil, cleaner, rubbing, cold, heat and outdoor use into controlled samples, sequences, checkpoints and acceptance records.": "Преобразуйте воздействие воды, конденсата, масла, чистящих средств, трения, холода, тепла и улицы в контролируемые образцы, последовательности, контрольные точки и записи приемки.",
        "Magnetic, drawer, shoulder-neck, and collapsible structures for premium retail and gifting.": "Магнитные, выдвижные, плечевые и складные конструкции для премиальной розницы и подарков.",
        "Branded corrugated mailers that protect the product and make ecommerce delivery feel intentional.": "Брендированные гофрированные почтовые коробки, которые защищают товар и делают доставку в электронной коммерции продуманной.",
        "Paper, film, foil, embossed, and smart labels matched to your product surface and use conditions.": "Бумажные, плёночные, фольгированные, рельефные и умные этикетки, подобранные под поверхность изделия и условия использования.",
        "Sleeve-and-tray presentation developed around sliding feel, pull access, insert fit, and packing direction.": "Подача в формате футляр-поддон, разработанная с учётом скольжения, доступа для вытягивания, посадки вставки и направления упаковки.",
        "Space-efficient retail cartons specified through paperboard, crease, closure, finish, and packing method.": "Компактные розничные картонные коробки, определённые материалом, биговкой, закрытием, отделкой и способом упаковки.",
        "Retail carry bags matched to the box system through paper, reinforcement, handle, color, and logo finish.": "Розничные пакеты, согласованные с системой коробок по бумаге, усилению, ручкам, цвету и отделке логотипа.",
        "Flat-delivered presentation boxes planned around assembly, corner retention, closure, storage, and pack-out.": "Презентационные коробки, поставляемые плоскими и спроектированные с учётом сборки, фиксации углов, закрытия, хранения и укладки товара.",
        "Cylindrical packs specified through diameter, lid fit, edge, seam, artwork wrap, insert, and product removal.": "Цилиндрическая упаковка, заданная диаметром, посадкой крышки, краем, швом, графической обёрткой, вставкой и извлечением товара.",
        "Bottle packaging developed around filled weight, neck and shoulder support, removal, presentation, and the outer transit pack.": "Упаковка для бутылок, разработанная с учётом веса наполненной бутылки, поддержки горлышка и плеча, извлечения, презентации и внешней транспортной упаковки.",
        "Fragrance packaging planned around glass bottle fit, cap or pump clearance, scuff control, removal, and multi-SKU sets.": "Упаковка для ароматов, спроектированная под стеклянный флакон, зазор крышки или помпы, защиту от потёртостей, извлечение и наборы с несколькими SKU.",
        "Film labels matched to the actual surface, moisture, abrasion, temperature, application, and service-life brief.": "Плёночные этикетки, подобранные под реальную поверхность, влажность, истирание, температуру, нанесение и заявленный срок службы.",
        "Structure, artwork, color, finish, assembly, and packing are reviewed against the signed-off proof. You receive progress photos at the checkpoints that matter.": "Конструкция, макет, цвет, отделка, сборка и упаковка проверяются по утверждённой пробе. На важных контрольных этапах вы получаете фотографии прогресса.",
        "Structural dieline and artwork preflight before tooling": "Проверка конструктивной развёртки и макета перед изготовлением оснастки",
        "Physical pre-production sample available before the bulk run": "Физический предпроизводственный образец до запуска основной партии",
        "Photo and video verification during printing, finishing, and packing": "Фото- и видеопроверка во время печати, отделки и упаковки",
        "Air, rail, sea, and door-delivery planning where available for the destination": "Планирование воздушной, железнодорожной, морской или адресной доставки с учётом направления",
        "Start with what the product must survive.": "Начните с реальных условий, которые должен выдержать товар.",
        "Industry pages connect presentation goals to practical risks such as bottle movement, scratching, condensation, courier handling, and label application.": "Страницы по отраслям связывают задачи презентации с практическими рисками: движением бутылки, царапинами, конденсатом, обработкой курьером и нанесением этикетки.",
        "Four decisions. One clear approval path.": "Четыре решения. Один понятный путь утверждения.",
        "Each stage has a defined output, so your team can track what is approved and what happens next.": "На каждом этапе есть определённый результат, поэтому команда видит, что утверждено и что будет дальше.",
        "One brand language across box and label.": "Единый язык бренда для коробок и этикеток.",
        "Paper, film, lamination, and foil reproduce color differently. We work from shared brand references, then approve each component in its real material.": "Бумага, плёнка, ламинация и фольга по-разному передают цвет. Мы используем общие эталоны бренда и утверждаем каждый компонент на реальном материале.",
        "Custom insert": "Индивидуальная вставка",
        "MOQ by build": "MOQ по конструкции",
        "Paper options": "Варианты бумаги",
        "Inside print": "Внутренняя печать",
        "Transit planning": "Планирование перевозки",
        "Waterproof": "Водостойкий",
        "Roll format": "Рулонный формат",
        "Ribbon pull": "Ленточная ручка",
        "Controlled slide": "Контролируемое скольжение",
        "Fitted tray": "Подогнанный поддон",
        "Flat packed": "Плоская упаковка",
        "Retail print": "Печать для розницы",
        "Reinforced top": "Усиленный верх",
        "Custom handle": "Ручка на заказ",
        "Foil logo": "Логотип из фольги",
        "Flat delivered": "Поставка в плоском виде",
        "Assembly sample": "Образец сборки",
        "Magnetic option": "Магнитный вариант",
        "Custom diameter": "Индивидуальный диаметр",
        "Telescopic lid": "Телескопическая крышка",
        "Insert option": "Вариант вставки",
        "RSC format": "Формат RSC",
        "Board selection": "Выбор картона",
        "Logistics brief": "Логистическая спецификация",
        "Bottle fit": "Посадка бутылки",
        "Insert support": "Поддержка вставки",
        "Outer shipper": "Внешняя транспортная коробка",
        "Glass bottle fit": "Посадка стеклянной бутылки",
        "Cap clearance": "Зазор крышки",
        "Set layout": "Компоновка набора",
        "Exposure brief": "Описание воздействия",
        "Adhesive match": "Подходящий клей",
        "Test plan": "План испытаний",
        "Paper tube fit planner": "Планировщик посадки бумажной тубы",
        "Jewelry insert fit planner": "Планировщик посадки вставки для украшений",
        "Case and pallet planner": "Планировщик транспортной коробки и паллеты",
        "Tissue sheet planner": "Планировщик листов папиросной бумаги",
        "Hang tag production planner": "Планировщик производства подвесных бирок",
        "Wine gift-box fit and load planner": "Планировщик посадки и нагрузки винных подарочных коробок",
        "Perfume bottle insert fit planner": "Планировщик посадки вставки для флаконов духов",
        "RFQ and quote coverage planner": "Планировщик покрытия RFQ и котировок",
        "Inspection and shipment release planner": "Планировщик инспекции и выпуска отгрузки",
        "Waterproof-label test matrix": "Матрица испытаний водостойких этикеток",
    },
}

def normalize(text):
    return re.sub(r"\s+", " ", str(text)).strip()

def prose(text):
    text = normalize(text)
    if re.match(r"^(?:[#.]|--|[A-Za-z_-]+\[[^\]]+\])", text):
        return False
    if re.search(r"(?:=>|===|!==|\b(?:querySelector|addEventListener|classList|textContent|dataset)\b)", text):
        return False
    return bool(re.search(r"[A-Za-z]{2}", text)) and not re.search(r"https?://|www\.|@|^[\w./-]+\.(?:html|js|css|json|jpg|png|svg|webp)$", text) and not re.fullmatch(r"[A-Z\d–—_ /+×.,:;()%-]+", text)

def replace_term(text, old, new):
    """Replace a term while retaining sentence-initial capitalization."""
    def replacement(match):
        matched = match.group(0)
        return new.capitalize() if matched[:1].isupper() else new
    return re.sub(re.escape(old), replacement, text, flags=re.IGNORECASE)

def normalize_language_value(language, source, value):
    """Apply authored terminology corrections to one dictionary value."""
    if not isinstance(value, str):
        return value
    source_text = normalize(source)
    source_lower = source_text.lower()
    result = EXACT_COPY.get(language, {}).get(source_text, value)
    # Source extraction can retain HTML entities from parsed text nodes. Decode
    # them before serializing the localized HTML so ampersands and quotation
    # marks are not rendered twice (for example, ``&amp;amp;``).
    result = html.unescape(result)

    if language == "zh-CN":
        if "corrugated" in source_lower:
            result = re.sub(r"腐蚀(?:性|的|式)?", "瓦楞", result)
        if "planning envelope" in source_lower:
            result = result.replace("规划信封", "规划包络")
        if "dieline" in source_lower:
            result = result.replace("死线", "刀模线")
        if "closure" in source_lower:
            result = result.replace("关闭", "封合").replace("闭合", "封合")
        if "board" in source_lower:
            result = result.replace("板面", "纸板")
        if "clearance" in source_lower and "customs clearance" not in source_lower and "import clearance" not in source_lower:
            result = result.replace("清关", "净空").replace("清除", "净空")
        if "removal" in source_lower:
            result = result.replace("清除", "取出")
        if "clean removal" in source_lower:
            result = result.replace("取出", "干净移除")
        if source_lower.startswith(("clear label", "clear pet", "clear film", "clear flexible label", "clear gloss", "clear windows")):
            result = result.replace("清除", "透明")
        if source_lower in {"clear material route", "envelope clears"}:
            result = result.replace("清除", "透明").replace("信封", "包络")
        if "keep " in source_lower and " clear of " in source_lower or source_lower.startswith("kept clear of"):
            result = result.replace("清除", "避开")
        if "removed cleanly" in source_lower:
            result = result.replace("清除", "无残留移除")
        if source_lower.startswith("the representative product fits"):
            result = result.replace("清除干净", "取出顺畅")
        if "clears this necklace or pendant planning envelope" in source_lower:
            result = "建议内尺寸在三个方向均满足该项链或吊坠规划包络。接下来确认链路走向、吊坠限位、锚点释放、材料接触、闭盒移动和量产样品。"
        if "abrasion" in source_lower:
            result = result.replace("<unk>", "磨损")
    elif language == "es":
        result = replace_term(result, "Una presupuesto", "un presupuesto")
        if "clearance" in source_lower and "customs clearance" not in source_lower and "import clearance" not in source_lower:
            result = replace_term(result, "limpieza", "holgura")
        if "removal" in source_lower and "clean removal" not in source_lower:
            result = replace_term(result, "limpieza", "retirada")
        if "clean removal" in source_lower:
            result = replace_term(result, "limpieza", "retirada limpia")
        if "short runs" in source_lower:
            result = replace_term(result, "carreras cortas", "tiradas cortas")
        if "named place" in source_lower:
            result = replace_term(result, "nombre del lugar", "lugar designado")
        if "one-time charges" in source_lower:
            result = replace_term(result, "cargos por vez única", "cargos únicos")
        if "cutting die" in source_lower:
            result = replace_term(result, "corte die", "troquelado")
        if "emboss die" in source_lower:
            result = replace_term(result, "embosca mueren", "troquel de estampado o relieve")
            result = replace_term(result, "grabado mueren", "troquel de estampado o relieve")
        if "die-cut" in source_lower:
            result = replace_term(result, "corte die", "cartón troquelado")
        if "production-intent" in source_lower:
            result = replace_term(result, "producción-intención", "destinada a producción")
    elif language == "pt":
        if "quotation" in source_lower or "quote" in source_lower or source_text in {"Quote", "Quote and approval"}:
            result = replace_term(result, "Citação", "cotação")
        if "clearance" in source_lower and "customs clearance" not in source_lower and "import clearance" not in source_lower:
            result = replace_term(result, "limpeza", "folga")
            result = replace_term(result, "limpar", "liberar")
        if "removal" in source_lower and "clean removal" not in source_lower:
            result = replace_term(result, "limpeza", "remoção")
        if "gap" in source_lower:
            result = replace_term(result, "intervalo", "folga")
        if "die" in source_lower:
            result = replace_term(result, "corte de morrer", "corte e matriz")
            result = replace_term(result, "forma de morrer", "forma de corte")
            result = replace_term(result, "formas complexas de morrer", "formas complexas de corte")
        if "emboss die" in source_lower:
            result = replace_term(result, "gravação morrem", "matriz de relevo")
        if "short runs" in source_lower:
            result = replace_term(result, "corridas curtas", "tiragens curtas")
    elif language == "fr":
        if "clearance" in source_lower and "customs clearance" not in source_lower and "import clearance" not in source_lower:
            result = replace_term(result, "nettoyage", "dégagement")
        if "removal" in source_lower:
            result = replace_term(result, "nettoyage", "retrait")
        if "quotation" in source_lower:
            result = replace_term(result, "cotation", "devis")
    elif language == "ru":
        if "clearance" in source_lower and "customs clearance" not in source_lower and "import clearance" not in source_lower:
            result = replace_term(result, "очистку", "зазор")
            result = replace_term(result, "очистки", "зазора")
            result = replace_term(result, "очистка", "зазор")
        if "removal" in source_lower:
            result = replace_term(result, "очистку", "извлечение")
            result = replace_term(result, "очистки", "извлечения")
            result = replace_term(result, "очистка", "извлечение")
    return result

def normalize_dictionary(language, dictionary):
    return {key: normalize_language_value(language, key, value) for key, value in dictionary.items()}

def excluded(tag):
    return any(p.name in ("script", "style", "code", "pre", "textarea") or p.get("translate") == "no" or "logo" in p.get("class", []) or "form-trap" in p.get("class", []) for p in [tag, *tag.parents] if p.name)

def text_nodes(soup):
    for node in soup.find_all(string=True):
        if not isinstance(node, (Comment, Doctype)) and not excluded(node.parent) and prose(node):
            yield node

def schema_strings(value, key=""):
    if isinstance(value, dict):
        for k, v in value.items():
            yield from schema_strings(v, k)
    elif isinstance(value, list):
        for item in value:
            yield from schema_strings(item, key)
    elif isinstance(value, str) and key in SCHEMA_TEXT and prose(value):
        yield normalize(value)

def visible_strings(soup):
    yield from (normalize(node) for node in text_nodes(soup))
    for tag in soup.find_all(True):
        if excluded(tag):
            continue
        for attribute in ATTRIBUTES:
            if tag.get(attribute) and prose(tag[attribute]):
                yield normalize(tag[attribute])
    for tag in soup.select('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]'):
        if prose(tag.get("content", "")):
            yield normalize(tag["content"])
    for script in soup.select('script[type="application/ld+json"]'):
        yield from schema_strings(json.loads(script.string))

def runtime_strings():
    strings = set()
    source = ROOT / "tmp/i18n/runtime.json"
    if source.exists():
        for text in json.loads(source.read_text()):
            if "<" in text and ">" in text:
                strings.update(visible_strings(BeautifulSoup(text, "html.parser")))
            elif prose(text):
                strings.add(normalize(text))
    catalog = json.loads((ROOT / "assets/catalog/catalog.json").read_text())
    def collect(value, key=""):
        if isinstance(value, dict):
            for k, v in value.items(): collect(v, k)
        elif isinstance(value, list):
            for item in value: collect(item, key)
        elif isinstance(value, str) and key in {"title", "description", "category", "name", "imagePresentation"} and prose(value):
            strings.add(normalize(value))
    collect(catalog)
    # Catalog descriptions are composed from a title plus approved policy text.
    for key, text in catalog.get("copyPolicy", {}).items():
        strings.add(normalize(text.replace("{title}", "{{0}}")))
    strings.add("Select language")
    return strings

def extract():
    strings = set(runtime_strings())
    for page in PAGES:
        strings.update(visible_strings(BeautifulSoup(page.read_text(), "html.parser")))
    directory = ROOT / "translations"
    directory.mkdir(exist_ok=True)
    (directory / "en.json").write_text(json.dumps(sorted(strings), ensure_ascii=False, indent=2) + "\n")
    print(f"Extracted {len(strings)} strings from {len(PAGES)} pages and dynamic content.")

def route(file, language):
    suffix = "" if file == "index.html" else file
    return "/" + suffix if language == "en" else f"/{language}" + (f"/{suffix}" if suffix else "")

def localize_url(value, language):
    parsed = urlsplit(value)
    if parsed.netloc and parsed.netloc != "glorystarpacking.com":
        return value
    if parsed.scheme and parsed.scheme not in ("https", "http"):
        return value
    if not parsed.path:
        return value
    name = parsed.path.lstrip("/")
    if not name or name in PAGE_NAMES:
        target = route(name or "index.html", language)
    else:
        target = "/" + name
    return urlunsplit((parsed.scheme, parsed.netloc, target, parsed.query, parsed.fragment))

def picker(file, language):
    name, flag = LANGUAGES[language]
    links = "\n".join(f'<li><a href="{route(file, code)}" lang="{code}" hreflang="{code}" data-language="{code}"' + (' aria-current="true"' if code == language else '') + f'><span class="language-switcher__flag" aria-hidden="true">{item[1]}</span><span>{item[0]}</span></a></li>' for code, item in LANGUAGES.items())
    return f'''<details class="language-switcher" translate="no">
  <summary aria-label="Select language"><svg class="language-switcher__globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>{name}</span></summary>
  <ul class="language-switcher__menu">{links}</ul>
</details>'''

def version(file):
    return hashlib.sha256((ROOT / file).read_bytes()).hexdigest()[:12]

def content_text_nodes(tag):
    return [
        node for node in tag.descendants
        if isinstance(node, NavigableString) and not isinstance(node, Comment) and normalize(node)
    ]

def apply_headline_preserving_markup(tag, headline, source_slots, language):
    target_slots = content_text_nodes(tag)
    if not target_slots:
        tag.append(headline)
        return
    if len(target_slots) == 1:
        target_slots[0].replace_with(headline)
        return

    if language == "zh-CN":
        units = list(headline)
        weights = [max(1, len(normalize(node))) for node in target_slots]
    else:
        units = re.findall(r"\S+\s*", headline)
        weights = [max(1, len(normalize(node).split())) for node in source_slots]
        if len(weights) != len(target_slots):
            weights = [max(1, len(normalize(node).split())) for node in target_slots]

    if len(units) < len(target_slots):
        target_slots[0].replace_with(headline)
        for node in target_slots[1:]: node.replace_with("\u2060")
        return

    total_weight = sum(weights)
    boundaries = [0]
    for index in range(1, len(target_slots)):
        proposed = round(len(units) * sum(weights[:index]) / total_weight)
        minimum = boundaries[-1] + 1
        maximum = len(units) - (len(target_slots) - index)
        boundaries.append(max(minimum, min(proposed, maximum)))
    boundaries.append(len(units))
    for index, node in enumerate(target_slots):
        node.replace_with("".join(units[boundaries[index]:boundaries[index + 1]]))

def translate_page(page, language, dictionary):
    soup = BeautifulSoup(page.read_text(), "html.parser")
    source_h1_slots = content_text_nodes(soup.h1)
    def tr(value):
        key = normalize(value)
        if not key or not prose(key): return value
        translated = dictionary.get(key)
        if translated is None: raise ValueError(f"{language}: missing translation: {key[:100]}")
        # Preserve spacing at inline boundaries.
        return re.match(r"^\s*", value)[0] + translated + re.search(r"\s*$", value)[0]
    for node in list(text_nodes(soup)):
        node.replace_with(NavigableString(tr(str(node))))
    for tag in soup.find_all(True):
        if not excluded(tag):
            for attr in ATTRIBUTES:
                if tag.get(attr) and prose(tag[attr]): tag[attr] = tr(tag[attr])
        for attr in ("href", "src", "action", "poster"):
            if tag.get(attr): tag[attr] = localize_url(tag[attr], language)
        for attr in ("srcset", "imagesrcset"):
            if tag.get(attr):
                tag[attr] = re.sub(r"(?<![/\w])assets/", "/assets/", tag[attr])
    for tag in soup.select('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]'):
        tag["content"] = tr(tag["content"])
    for tag in soup.select('meta[property="og:url"]'):
        tag["content"] = ORIGIN + route(page.name, language)
    def translate_schema(value, key=""):
        if isinstance(value, dict): return {k: translate_schema(v, k) for k, v in value.items()}
        if isinstance(value, list): return [translate_schema(item, key) for item in value]
        if not isinstance(value, str): return value
        if key == "inLanguage": return language
        if key in SCHEMA_TEXT and prose(value): return tr(value)
        # Organization/website identities and shared images remain stable.
        if value.startswith(ORIGIN) and key in {"url", "@id"} and not value.endswith(("#organization", "#website")):
            return localize_url(value, language)
        return value
    for script in soup.select('script[type="application/ld+json"]'):
        script.string = json.dumps(translate_schema(json.loads(script.string)), ensure_ascii=False).replace("</", "<\\/")
    soup.html["lang"] = language
    headlines = json.loads((ROOT / "translations/pages.json").read_text())
    native_headline = headlines[page.name][headlines["_languages"].index(language)]
    # Keep the English H1's inline markup (for example emphasis spans), while
    # distributing the reviewed native headline across the same text slots.
    apply_headline_preserving_markup(soup.h1, native_headline, source_h1_slots, language)
    headline = normalize(soup.h1.get_text(" ", strip=True))
    title = headline.rstrip(".!?。？！") + " | GloryStarPack"
    soup.title.string = title
    for tag in soup.select('meta[property="og:title"], meta[name="twitter:title"]'):
        tag["content"] = title
    for script in soup.select('script[type="application/ld+json"]'):
        schema = json.loads(script.string)
        def update_headline(value):
            if isinstance(value, dict):
                if value.get("@type") in {"WebPage", "Article", "BlogPosting"}:
                    if "name" in value: value["name"] = title
                    if "headline" in value: value["headline"] = headline
                for item in value.values(): update_headline(item)
            elif isinstance(value, list):
                for item in value: update_headline(item)
        update_headline(schema)
        script.string = json.dumps(schema, ensure_ascii=False).replace("</", "<\\/")
    for existing in soup.select('.language-switcher, link[hreflang], script[data-language-dictionary]'):
        existing.decompose()
    soup.select_one(".site-nav").append(BeautifulSoup(picker(page.name, language), "html.parser"))
    soup.select_one('.language-switcher summary')["aria-label"] = dictionary["Select language"]
    for code in [*LANGUAGES, "x-default"]:
        link = soup.new_tag("link", rel="alternate", hreflang=code, href=ORIGIN + route(page.name, "en" if code == "x-default" else code))
        soup.head.append(link)
    for field in soup.select('input[name="sourcePage"]'):
        field["value"] = route(page.name, language)
    runtime_path = f"assets/i18n/{language}.js"
    script = soup.new_tag("script", src=f"/{runtime_path}?v={version(runtime_path)}", defer="", attrs={"data-language-dictionary": language})
    soup.select_one('script[src*="assets/languages.js"]').insert_before(script)
    return str(soup)

def build():
    runtime = runtime_strings()
    editorial = json.loads((ROOT / "translations/editorial.json").read_text())
    native_keys = ["Quote request received", "Quote request not sent", "Thank you. Your packaging brief has been delivered, and we will reply with the next technical questions.", "We could not deliver this form. Return to review the required fields, or send the brief directly by email or WhatsApp.", "GloryStarPack packaging project support", "Return to the quote form", "Email Kevin", "Continue by email", "Send by WhatsApp", "Direct channels may contain a shortened brief. Copy the full brief below to send every detail.", "Complete project brief"]
    native_copy = {}
    for language in LANGUAGES:
        if language == "en": continue
        dictionary = json.loads((ROOT / f"translations/{language}.json").read_text())
        language_index = editorial["_languages"].index(language)
        dictionary.update({key: value[language_index] for key, value in editorial.items() if not key.startswith("_")})
        dictionary = normalize_dictionary(language, dictionary)
        (ROOT / f"translations/{language}.json").write_text(json.dumps(dictionary, ensure_ascii=False, indent=2) + "\n")
        native_copy[language] = {key: dictionary[key] for key in native_keys if key in dictionary}
        runtime_dict = {key: dictionary[key] for key in sorted(runtime) if key in dictionary and prose(key)}
        target = ROOT / "assets/i18n"
        target.mkdir(exist_ok=True)
        (target / f"{language}.js").write_text("window.GloryStarTranslations = " + json.dumps(runtime_dict, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";\n")
        (ROOT / language).mkdir(exist_ok=True)
        for page in PAGES:
            (ROOT / language / page.name).write_text(translate_page(page, language, dictionary))
        print(f"Built {language}: {len(PAGES)} pages; {len(runtime_dict)} dynamic translations.", flush=True)
    entries = [f"  <url><loc>{ORIGIN}{route(page.name, language)}</loc></url>" for language in LANGUAGES if language != "en" for page in PAGES if page.name != "404.html"]
    (ROOT / "sitemap-languages.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(entries) + '\n</urlset>\n')
    (ROOT / "api/quote-locales.json").write_text(json.dumps(native_copy, ensure_ascii=False, indent=2) + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--extract", action="store_true")
    args = parser.parse_args()
    extract() if args.extract else build()
