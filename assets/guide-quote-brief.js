(() => {
  const definitions = {
    "waterproof-trial-v1": {
      source: "waterproof-label-testing-guide.html",
      target: "custom-waterproof-labels.html",
      form: "waterproof-label-test-form",
      calculator: "waterproof_label_test_matrix",
      title: "Waterproof-label trial planning inputs",
      boundary: "Buyer-defined trial inputs only. Sample counts are not production order quantity or an approved test plan. Confirm the container, application, exposure sequence, acceptance criteria, material construction and production quantity separately.",
      fields: [
        ["constructions", "Label constructions", 1, true],
        ["substrates", "Substrate / surface variants", 1, true],
        ["sequences", "Exposure sequences", 1, true],
        ["replicates", "Replicates per exposed combination", 1, true],
        ["controls", "Unexposed controls per construction / surface", 0, true],
        ["checkpoints", "Inspection checkpoints per sample", 1, true],
      ],
    },
    "hang-tag-plan-v1": {
      source: "hang-tag-production-checklist.html",
      target: "custom-hang-tags.html",
      form: "hang-tag-quantity-form",
      calculator: "hang_tag_quantity_and_bundle",
      title: "Hang-tag quantity planning inputs",
      boundary: "Buyer-entered quantity assumptions only. The reserve and bundle plan is not a confirmed production order. Confirm quantities by SKU, variable-data records, attachment, kitting, allowed overrun or underrun and approved samples before production.",
      fields: [
        ["sellableUnits", "Sellable product units", 1, true],
        ["tagsPerUnit", "Tags per product unit", 0.1],
        ["reservePercent", "Buyer planning reserve (%)", {"type": "number", "min": 0, "max": 100}],
        ["skuCount", "SKUs or variable records", 1, true],
        ["samplesPerSku", "Setup / approval samples per SKU", 0, true],
        ["bundleSize", "Supplier tags per bundle", 1, true],
      ],
    },
    "wine-box-fit-v1": {
      source: "wine-bottle-gift-box-specification.html",
      target: "custom-wine-boxes.html",
      form: "wine-gift-box-planner",
      calculator: "wine_gift_box_fit_and_load",
      title: "Wine gift-box planning inputs",
      boundary: "Buyer-entered planning inputs only. Bottle count is not order quantity; planning allowances are not approved material or finished box dimensions. Confirm filled-bottle support, insert, removal, outer case and physical samples before production.",
      fields: [
        ["bottleCount", "Bottles per gift box", { type: "number", min: 1, max: 12, integer: true }],
        ["bottleDiameter", "Maximum bottle body diameter (mm)", 1],
        ["bottleHeight", "Maximum overall bottle height (mm)", 1],
        ["radialAllowance", "Planning allowance per side (mm)", 0],
        ["baseAllowance", "Planning allowance below bottle (mm)", 0],
        ["topAllowance", "Planning allowance above bottle (mm)", 0],
        ["dividerThickness", "Divider between cavities (mm)", 0],
        ["filledWeight", "Filled weight per bottle (g)", 1],
        ["accessoryWeight", "Accessories and documents (g)", 0],
      ],
    },
    "jewelry-fit-v1": {
      source: "jewelry-box-insert-design-guide.html",
      target: "custom-jewelry-boxes.html",
      form: "jewelry-insert-fit-planner",
      calculator: "jewelry_insert_fit_planner",
      title: "Jewelry insert planning inputs",
      boundary: "Buyer-entered planning inputs only. An arranged envelope is not a cutting file, finished box size or fit approval. Confirm contact materials, chain or clasp routing, retention, removal and a production-equivalent sample before production.",
      fields: [
        ["jewelryType", "Jewelry layout", { type: "choice", choices: ["ring", "earrings", "necklace", "watch", "set"] }],
        ["productLength", "Arranged length (mm)", 0.1],
        ["productWidth", "Arranged width (mm)", 0.1],
        ["heightAbove", "Height above presentation plane (mm)", 0],
        ["spaceBelow", "Space below presentation plane (mm)", 0],
        ["perimeterAllowance", "Perimeter allowance per side (mm)", 0],
        ["lidClearance", "Lid clearance above item (mm)", 0],
        ["boxLength", "Proposed box inside length (mm)", 0.1],
        ["boxWidth", "Proposed box inside width (mm)", 0.1],
        ["boxHeight", "Proposed box inside height (mm)", 0.1],
      ],
    },
    "shipping-case-plan-v1": {
      source: "corrugated-shipping-box-specification-guide.html",
      target: "custom-corrugated-shipping-boxes.html",
      form: "shipping-case-planner",
      calculator: "shipping_case_and_pallet_planner",
      title: "Shipping-case planning inputs",
      boundary: "Buyer-entered planning inputs only. Case count is a shipment assumption, not a confirmed box order quantity. Confirm whether dimensions are inside or outside; freight calculations need final packed outside dimensions. Board strength, stacking, pallet stability, carrier limits and transit approval require separate review.",
      fields: [
        ["caseCount", "Number of cases", 1, true],
        ["unitsPerCase", "Units per case", 1, true],
        ["caseLength", "Case length (mm)", 1],
        ["caseWidth", "Case width (mm)", 1],
        ["caseHeight", "Case height (mm)", 1],
        ["caseWeight", "Gross case weight (kg)", 0.01],
        ["palletLength", "Pallet load length (mm)", 1],
        ["palletWidth", "Pallet load width (mm)", 1],
        ["loadHeight", "Available load height above pallet (mm)", 1],
      ],
    },
    "rigid-box-brief-v1": {
      source: "rigid-box-cost-drivers.html",
      target: "custom-rigid-boxes.html",
      form: "rigid-box-brief-form",
      calculator: "rigid_box_quote_brief",
      title: "Rigid box quotation brief",
      boundary: "Buyer requirements for quotation only. Confirm finished dimensions, construction, insert, decoration, packing and sample approval before production.",
      fields: [
        ["productSummary", "Product or set to pack", { type: "text", max: 180 }],
        ["productSize", "Product dimensions and units, if known", { type: "text", max: 160, optional: true }],
        ["structure", "Preferred rigid box structure", { type: "choice", choices: ["Please advise", "Magnetic rigid box", "Drawer box", "Lid-and-base box", "Collapsible rigid box"] }],
        ["requestedQuantity", "Requested quantity per design", { type: "number", min: 1, integer: true, optional: true }],
        ["projectNotes", "Insert and finishing requirements", { type: "text", max: 400, optional: true }],
      ],
    },
    "mailer-box-brief-v1": {
      source: "ecommerce-mailer-box-sizing-transit-test.html",
      target: "custom-mailer-boxes.html",
      form: "mailer-box-brief-form",
      calculator: "mailer_box_quote_brief",
      title: "Mailer box quotation brief",
      boundary: "Buyer requirements for quotation only. Product size is not finished mailer size. Confirm board, closure, loaded samples, final outside dimensions and agreed transit tests before production.",
      fields: [
        ["productSummary", "Product or set to pack", { type: "text", max: 180 }],
        ["productSize", "Product dimensions and units, if known", { type: "text", max: 160, optional: true }],
        ["packedWeight", "Packed shipment weight (kg), if known", { type: "number", min: 0.001, optional: true }],
        ["printCoverage", "Mailer print coverage", { type: "choice", choices: ["Please advise", "Outside printing only", "Inside and outside printing", "Unprinted mailer"] }],
        ["requestedQuantity", "Requested quantity per design", { type: "number", min: 1, integer: true, optional: true }],
        ["projectNotes", "Closure, protection and shipping requirements", { type: "text", max: 400, optional: true }],
      ],
    },
    "insert-material-brief-v1": {
      source: "packaging-inserts-material-comparison.html",
      target: "custom-packaging-inserts.html",
      form: "insert-material-brief-form",
      calculator: "insert_material_quote_brief",
      title: "Packaging insert material comparison brief",
      boundary: "Buyer requirements for material comparison only. Material preferences do not approve fit or protection. Confirm contact areas, retention, removal, outer box and physical samples before production.",
      fields: [
        ["productSummary", "Product or set to pack", { type: "text", max: 180 }],
        ["productSize", "Product dimensions and units, if known", { type: "text", max: 160, optional: true }],
        ["boxInsideSize", "Outer box inside dimensions and units, if known", { type: "text", max: 160, optional: true }],
        ["materialFirst", "First material to evaluate", { type: "choice", choices: ["Please advise", "Die-cut paperboard", "Molded pulp", "EVA foam", "EPE foam"] }],
        ["materialSecond", "Second material to compare", { type: "choice", choices: ["Please advise", "Die-cut paperboard", "Molded pulp", "EVA foam", "EPE foam"] }],
        ["requestedQuantity", "Requested quantity per design", { type: "number", min: 1, integer: true, optional: true }],
        ["projectNotes", "Product weight, fragile areas and removal needs", { type: "text", max: 400, optional: true }],
      ],
    },
    "perfume-insert-v1": {
      source: "perfume-box-insert-checklist.html",
      target: "custom-perfume-boxes.html",
      form: "perfume-insert-fit-form",
      calculator: "perfume_bottle_insert_fit",
      title: "Perfume insert planning inputs",
      boundary: "Buyer-entered planning inputs only. Cavity dimensions are not finished box dimensions. Confirm bottle fit, support, removal and pump clearance with physical samples before production.",
      fields: [
        ["bottleLength", "Maximum bottle length (mm)", 1],
        ["bottleWidth", "Maximum bottle width (mm)", 1],
        ["bottleHeight", "Maximum assembled height (mm)", 1],
        ["sideAllowance", "Planning allowance per side (mm)", 0],
        ["baseAllowance", "Planning space below bottle (mm)", 0],
        ["topAllowance", "Planning no-contact space above (mm)", 0],
        ["cavityLength", "Proposed cavity length (mm)", 1],
        ["cavityWidth", "Proposed cavity width (mm)", 1],
        ["cavityHeight", "Proposed usable cavity height (mm)", 1],
      ],
    },
    "clear-label-trial-v1": {
      source: "clear-label-white-ink-artwork-guide.html",
      target: "custom-clear-labels.html",
      form: "clear-label-trial-form",
      calculator: "clear_label_applied_trial_matrix",
      title: "Clear-label trial planning inputs",
      boundary: "Buyer-defined trial only. These counts are not the production order quantity or an approved sampling plan. Confirm label size, artwork, container, acceptance criteria and production quantity separately.",
      fields: [
        ["containerVariants", "Container / contents variants", 1, true],
        ["whiteTreatments", "White-ink treatments", 1, true],
        ["applicationRoutes", "Application routes / settings", 1, true],
        ["replicates", "Replicates per combination", 1, true],
        ["timepoints", "Observation timepoints", 1, true],
        ["sparePercent", "Unapplied setup / spare labels (%)", 0],
      ],
    },
  };
  const translate = (value) => window.GloryStarI18n?.translate(value) || value;
  const lifetime = 30 * 60 * 1000;
  const prefix = location.pathname.match(/^\/(fr|es|pt|ru|zh-CN)\//)?.[0] || "/";
  const keyFor = (id) => `glorystarpack-guide-brief-${id}`;
  const rulesFor = ([, , rules, integer]) => typeof rules === "object" ? rules : { type: "number", min: rules, integer };
  const validValues = (definition, values) => values && definition.fields.every((field) => {
    const value = values[field[0]];
    const rules = rulesFor(field);
    if (value === null && rules.optional) return true;
    if (rules.type === "choice") return rules.choices.includes(value);
    if (rules.type === "text") return typeof value === "string" && value.trim().length > 0
      && value.length <= rules.max && !/[\u0000-\u001f\u007f]/.test(value);
    return typeof value === "number" && Number.isFinite(value) && value >= rules.min && value <= (rules.max ?? 10000000)
      && (!rules.integer || Number.isSafeInteger(value));
  });
  const buildBrief = (definition, values) => [
    translate(definition.title),
    ...definition.fields.filter(([name]) => values[name] !== null).map((field) => {
      const [name, label] = field;
      const value = rulesFor(field).type === "choice" ? translate(values[name]) : values[name];
      return `${translate(label)}: ${value}`;
    }),
    translate(definition.boundary),
    `https://glorystarpacking.com${prefix}${definition.source}`,
  ].join("\n");
  const emit = (definition, action) => document.dispatchEvent(new CustomEvent("glorystarpack:guide-brief", {
    detail: { calculator: definition.calculator, action },
  }));
  const setStatus = (panel, text) => {
    panel.querySelector("[data-guide-brief-status]").textContent = translate(text);
  };
  const bindCopy = (panel, definition, refresh) => {
    panel.querySelector("[data-guide-brief-copy]").addEventListener("click", async () => {
      if (refresh && !refresh()) return;
      const textarea = panel.querySelector("[data-guide-brief-text]");
      try {
        await navigator.clipboard.writeText(textarea.value);
        setStatus(panel, "Planning inputs copied. Paste them into your project details if needed.");
        emit(definition, "copied");
      } catch {
        panel.querySelector("details").open = true;
        textarea.focus();
        textarea.select();
        setStatus(panel, "Select and copy the planning inputs, then paste them into your project details.");
        emit(definition, "manual_copy");
      }
    });
  };

  for (const [id, definition] of Object.entries(definitions)) {
    const form = document.getElementById(definition.form);
    const panel = form?.querySelector("[data-guide-brief]");
    if (!panel || location.pathname !== `${prefix}${definition.source}`) continue;
    const button = panel.querySelector("[data-guide-brief-send]");
    const preview = panel.querySelector("[data-guide-brief-text]");
    const readValues = () => Object.fromEntries(definition.fields.map((field) => {
      const [name] = field;
      const rules = rulesFor(field);
      const raw = (form.querySelector(`[name="${name}"]`)?.value || "").trim().replace(/\s+/g, " ");
      return [name, !raw && rules.optional ? null : rules.type === "number" ? (raw ? Number(raw) : NaN) : raw];
    }));
    const refresh = () => {
      const values = readValues();
      const valid = validValues(definition, values);
      preview.value = valid ? buildBrief(definition, values) : "";
      if (!valid) setStatus(panel, "Check all planner inputs before continuing.");
      return valid;
    };
    button.hidden = false;
    panel.querySelector("details").hidden = false;
    // Empty brief builders wait for buyer input; numeric calculators can preview their examples.
    if (validValues(definition, readValues())) refresh();
    form.addEventListener("input", () => {
      setStatus(panel, "");
      refresh();
    });
    if (form.hasAttribute("data-quote-brief-builder")) form.addEventListener("submit", (event) => {
      event.preventDefault();
      button.click();
    });
    const fields = form.querySelector("[data-guide-brief-fields]");
    if (fields) {
      fields.disabled = false;
      fields.hidden = false;
    }
    bindCopy(panel, definition, () => form.reportValidity() && refresh());
    button.addEventListener("click", () => {
      if (!form.reportValidity() || !refresh()) return;
      const targetPath = `${prefix}${definition.target}`;
      try {
        sessionStorage.setItem(keyFor(id), JSON.stringify({ version: 1, createdAt: Date.now(), targetPath, values: readValues() }));
        emit(definition, "prepared");
        location.assign(`${targetPath}?planning=${id}#quote`);
      } catch {
        panel.querySelector("details").open = true;
        setStatus(panel, "Automatic transfer is unavailable. Copy these inputs, then open the quote form.");
        emit(definition, "storage_unavailable");
      }
    });
  }

  const id = new URLSearchParams(location.search).get("planning");
  const definition = Object.hasOwn(definitions, id) ? definitions[id] : null;
  if (!definition || location.pathname !== `${prefix}${definition.target}`) return;
  const form = document.querySelector(".quote-form");
  const panel = form?.querySelector("[data-guide-brief]");
  const details = form?.querySelector('[name="details"]');
  if (!panel || !details) return;
  panel.hidden = false;
  let saved;
  try {
    const raw = sessionStorage.getItem(keyFor(id));
    sessionStorage.removeItem(keyFor(id));
    if (raw && raw.length <= 4096) saved = JSON.parse(raw);
  } catch { /* A manual quote remains available when storage is blocked. */ }
  const age = Date.now() - saved?.createdAt;
  if (!saved || saved.version !== 1 || saved.targetPath !== location.pathname
    || typeof saved.createdAt !== "number" || !Number.isFinite(age) || age < 0 || age > lifetime
    || !validValues(definition, saved.values)) {
    setStatus(panel, "Saved planning inputs are unavailable or expired. Return to the guide or enter your project details below.");
    emit(definition, "unavailable");
    return;
  }
  const brief = buildBrief(definition, saved.values);
  panel.querySelector("[data-guide-brief-text]").value = brief;
  panel.querySelector("details").hidden = false;
  bindCopy(panel, definition);
  const maximum = Number(details.getAttribute("maxlength")) || 3000;
  const canImport = !details.value.trim() && brief.length <= maximum;
  if (canImport) details.value = brief;
  // Only an explicitly named order quantity can populate the quote quantity field.
  // Keep all measurements and material preferences in the reviewable project brief.
  const quantity = form.querySelector('[name="quantity"]');
  const hasOrderQuantity = definition.fields.some(([name]) => name === "requestedQuantity");
  if (canImport && hasOrderQuantity && saved.values.requestedQuantity != null && quantity && !quantity.value.trim()) {
    quantity.value = String(saved.values.requestedQuantity);
  }
  const optional = details.closest("details");
  if (optional) optional.open = true;
  setStatus(panel, canImport
    ? hasOrderQuantity
      ? "Planning inputs added to your project details. Review your brief and order quantity before sending."
      : "Planning inputs added to your project details. Review them and add your order quantity before sending."
    : "Your existing project details were kept. Review or copy the planning inputs below to add them yourself.");
  emit(definition, canImport ? "imported" : "kept_existing");
})();
