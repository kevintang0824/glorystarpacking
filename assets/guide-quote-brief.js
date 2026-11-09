(() => {
  const definitions = {
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
  const validValues = (definition, values) => values && definition.fields.every(([name, , minimum, integer]) => {
    const value = values[name];
    return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= 10000000
      && (!integer || Number.isSafeInteger(value));
  });
  const buildBrief = (definition, values) => [
    translate(definition.title),
    ...definition.fields.map(([name, label]) => `${translate(label)}: ${values[name]}`),
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
    const readValues = () => Object.fromEntries(definition.fields.map(([name]) => {
      const raw = form.querySelector(`[name="${name}"]`)?.value.trim();
      return [name, raw ? Number(raw) : NaN];
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
    refresh();
    form.addEventListener("input", () => {
      setStatus(panel, "");
      refresh();
    });
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
  const optional = details.closest("details");
  if (optional) optional.open = true;
  setStatus(panel, canImport
    ? "Planning inputs added to your project details. Review them and add your order quantity before sending."
    : "Your existing project details were kept. Review or copy the planning inputs below to add them yourself.");
  emit(definition, canImport ? "imported" : "kept_existing");
})();
