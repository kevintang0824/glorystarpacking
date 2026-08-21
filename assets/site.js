(() => {
  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const mobileNavigation = window.matchMedia("(max-width: 900px)");
  const navigationBackground = () => [
    document.querySelector(".topline"),
    document.querySelector("main"),
    document.querySelector(".floating-contact"),
    document.querySelector("footer"),
    document.querySelector(".analytics-consent"),
  ].filter(Boolean);

  const navigationFocusables = () => [
    navToggle,
    ...nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ].filter((element) => element && !element.hasAttribute("disabled"));

  const setNavOpen = (open, returnFocus = false) => {
    if (!navToggle || !nav) return;
    const shouldOpen = mobileNavigation.matches && open;
    navToggle.setAttribute("aria-expanded", String(shouldOpen));
    navToggle.setAttribute("aria-label", shouldOpen ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", shouldOpen);
    document.body.classList.toggle("nav-open", shouldOpen);
    nav.toggleAttribute("inert", mobileNavigation.matches && !shouldOpen);
    navigationBackground().forEach((element) => element.toggleAttribute("inert", shouldOpen));
    if (mobileNavigation.matches && !shouldOpen) nav.setAttribute("aria-hidden", "true");
    else nav.removeAttribute("aria-hidden");
    if (shouldOpen) nav.querySelector("a[href]")?.focus();
    else if (returnFocus) navToggle.focus();
  };

  setNavOpen(false);

  navToggle?.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    const navigationOpen = navToggle?.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && navigationOpen) {
      setNavOpen(false, true);
      return;
    }
    if (event.key === "Tab" && navigationOpen) {
      const focusables = navigationFocusables();
      const first = focusables[0];
      const last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  const handleNavigationBreakpoint = () => {
    const focusNeedsRecovery = mobileNavigation.matches && Boolean(nav?.contains(document.activeElement));
    setNavOpen(false, focusNeedsRecovery);
  };
  if (typeof mobileNavigation.addEventListener === "function") {
    mobileNavigation.addEventListener("change", handleNavigationBreakpoint);
  } else {
    mobileNavigation.addListener(handleNavigationBreakpoint);
  }

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const currentLabel = (link.getAttribute("aria-label") || link.innerText || link.textContent || "")
      .replace(/\s*↗\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!currentLabel || /opens in a new tab/i.test(currentLabel)) return;
    link.setAttribute("aria-label", `${currentLabel} (opens in a new tab)`);
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const answerId = button.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;
      const icon = button.querySelector(".faq-icon");
      const isOpen = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isOpen));
      if (answer) answer.hidden = isOpen;
      if (icon) icon.textContent = isOpen ? "+" : "−";
    });
  });

  const params = new URLSearchParams(window.location.search);
  const requestedProduct = params.get("product");
  if (requestedProduct) {
    document.querySelectorAll('select[name="product"]').forEach((select) => {
      const hasOption = Array.from(select.options).some((option) => option.value === requestedProduct);
      if (hasOption) select.value = requestedProduct;
    });
  }

  const classifyDiscovery = () => {
    const explicitSource = (params.get("utm_source") || "").trim().toLowerCase();
    const aiSources = [
      { pattern: /chatgpt|openai/, source: "ChatGPT" },
      { pattern: /perplexity/, source: "Perplexity" },
      { pattern: /copilot/, source: "Microsoft Copilot" },
      { pattern: /claude|anthropic/, source: "Claude" },
      { pattern: /gemini/, source: "Google Gemini" },
      { pattern: /you\.com/, source: "You.com" },
    ];
    const searchHosts = /(^|\.)(google|bing|yahoo|duckduckgo|baidu|yandex)\./;

    if (explicitSource) {
      const aiMatch = aiSources.find(({ pattern }) => pattern.test(explicitSource));
      return {
        discoveryChannel: aiMatch ? "ai-search" : "campaign",
        discoverySource: aiMatch?.source || explicitSource,
      };
    }

    let referrerHost = "";
    try {
      referrerHost = new URL(document.referrer).hostname.toLowerCase();
    } catch {
      // An empty or malformed referrer is treated as direct traffic.
    }

    const aiMatch = aiSources.find(({ pattern }) => pattern.test(referrerHost));
    if (aiMatch) return { discoveryChannel: "ai-search", discoverySource: aiMatch.source };
    if (searchHosts.test(referrerHost)) return { discoveryChannel: "organic-search", discoverySource: referrerHost };
    if (referrerHost) return { discoveryChannel: "referral", discoverySource: referrerHost };
    return { discoveryChannel: "direct", discoverySource: "Direct" };
  };

  const attributionStorageKey = "glorystarpack-attribution";
  const currentAttribution = {
    landingPage: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer,
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    utmContent: params.get("utm_content") || "",
    ...classifyDiscovery(),
  };

  try {
    if (!sessionStorage.getItem(attributionStorageKey)) {
      sessionStorage.setItem(attributionStorageKey, JSON.stringify(currentAttribution));
    }
  } catch {
    // Quote submission still works when browser storage is unavailable.
  }

  const getAttribution = () => {
    try {
      return JSON.parse(sessionStorage.getItem(attributionStorageKey) || "null") || currentAttribution;
    } catch {
      return currentAttribution;
    }
  };

  const fileToAttachment = async (file) => {
    if (!file || !file.size) return null;
    const maximumBytes = 3 * 1024 * 1024;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

    if (file.size > maximumBytes) {
      throw new Error("Please keep the attachment under 3 MB.");
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Please attach a PDF, JPG, PNG, or WebP file.");
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("The attachment could not be read."));
      reader.readAsDataURL(file);
    });

    return {
      filename: file.name,
      contentType: file.type,
      content: String(dataUrl).split(",")[1] || "",
    };
  };

  const buildProjectBrief = (payload, includeAttribution = true) => {
    const lines = [
      `Name: ${payload.name || ""}`,
      `Email: ${payload.email || ""}`,
      `Phone / WhatsApp: ${payload.phone || "Not provided"}`,
      `Product: ${payload.product || ""}`,
      `Quantity: ${payload.quantity || ""}`,
      `Dimensions: ${payload.dimensions || "Not provided"}`,
      `Delivery country / region: ${payload.country || ""}`,
      `Target in-hand date: ${payload.targetDate || "Flexible / not provided"}`,
      "",
      "Project details:",
      payload.details || "Not provided",
    ];

    if (includeAttribution) {
      lines.splice(8, 0,
        `Landing page: ${payload.landingPage || "Not provided"}`,
        `Referrer: ${payload.referrer || "Direct / not provided"}`,
        `Discovery channel: ${payload.discoveryChannel || "Not provided"}`,
        `Discovery source: ${payload.discoverySource || "Not provided"}`,
        `Campaign: ${[payload.utmSource, payload.utmMedium, payload.utmCampaign].filter(Boolean).join(" / ") || "Not provided"}`
      );
    }

    return lines.join("\n");
  };

  const directBriefNotice = "[This direct-channel brief was shortened. Return to the webpage and copy the complete project brief before sending.]";
  const directUrlEncodedBudget = 1900;

  const limitCodePoints = (value, maximumLength) => Array.from(String(value || ""))
    .slice(0, maximumLength)
    .join("");

  const shortenForDirectChannel = (brief, encodedBudget) => {
    if (encodeURIComponent(brief).length <= encodedBudget) return brief;

    const suffix = `\n\n${directBriefNotice}`;
    let shortened = "";
    for (const character of brief) {
      if (encodeURIComponent(`${shortened}${character}${suffix}`).length > encodedBudget) break;
      shortened += character;
    }
    return `${shortened.trimEnd()}${suffix}`;
  };

  const buildDirectProjectBrief = (payload, reservedUrlLength) => {
    const encodedBudget = Math.max(300, directUrlEncodedBudget - reservedUrlLength);
    return shortenForDirectChannel(buildProjectBrief(payload, false), encodedBudget);
  };

  const buildMailto = (payload) => {
    const subjectProduct = limitCodePoints(payload.product, 60)
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const subject = `Packaging quote request — ${subjectProduct || "Custom project"}`;
    const urlPrefix = `mailto:kevin@GloryStarPack.com?subject=${encodeURIComponent(subject)}&body=`;
    const emailFootnote = "\n\nPlease attach any artwork directly to this email before sending.";
    const body = `${buildDirectProjectBrief(payload, urlPrefix.length + encodeURIComponent(emailFootnote).length)}${emailFootnote}`;

    return `${urlPrefix}${encodeURIComponent(body)}`;
  };

  const buildWhatsApp = (payload) => {
    const urlPrefix = "https://wa.me/8618020755949?text=";
    const greeting = "Hello Kevin, I would like a packaging quote.\n\n";
    const message = `${greeting}${buildDirectProjectBrief(payload, urlPrefix.length + encodeURIComponent(greeting).length)}`;
    return `${urlPrefix}${encodeURIComponent(message)}`;
  };

  let fallbackCopyIndex = 0;

  const renderDeliveryFallback = (status, payload, options = {}) => {
    if (!status) return;

    const copy = document.createElement("span");
    copy.className = "form-fallback-copy";
    copy.textContent = options.message
      || "Online delivery is temporarily unavailable. Your form is still filled in—Email and WhatsApp may contain a shortened brief, so copy the full brief if needed.";

    const actions = document.createElement("span");
    actions.className = "form-fallback-actions";

    const emailLink = document.createElement("a");
    emailLink.className = "button button--small";
    emailLink.href = buildMailto(payload);
    emailLink.textContent = "Continue by email";
    emailLink.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("glorystarpack:quote-fallback-action", { detail: { method: "email" } }));
    });

    const whatsappLink = document.createElement("a");
    whatsappLink.className = "button button--small";
    whatsappLink.href = buildWhatsApp(payload);
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener";
    whatsappLink.textContent = "Send by WhatsApp";
    whatsappLink.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("glorystarpack:quote-fallback-action", { detail: { method: "whatsapp" } }));
    });

    const copyButton = document.createElement("button");
    copyButton.className = "button button--small button--ghost";
    copyButton.type = "button";
    copyButton.textContent = "Copy project brief";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(buildProjectBrief(payload));
        copyButton.textContent = "Brief copied";
        document.dispatchEvent(new CustomEvent("glorystarpack:quote-fallback-action", { detail: { method: "copy" } }));
      } catch {
        status.querySelector(".form-fallback-manual")?.remove();
        fallbackCopyIndex += 1;

        const manualCopy = document.createElement("span");
        manualCopy.className = "form-fallback-manual";

        const manualLabel = document.createElement("label");
        const manualId = `fallback-brief-${fallbackCopyIndex}`;
        manualLabel.htmlFor = manualId;
        manualLabel.textContent = "Automatic copy is unavailable. Select this project brief manually:";

        const manualBrief = document.createElement("textarea");
        manualBrief.id = manualId;
        manualBrief.readOnly = true;
        manualBrief.rows = 8;
        manualBrief.value = buildProjectBrief(payload);
        manualBrief.addEventListener("focus", () => manualBrief.select());

        manualCopy.append(manualLabel, manualBrief);
        status.append(manualCopy);
        copyButton.textContent = "Brief ready to select";
        manualBrief.focus();
        manualBrief.select();
      }
    });

    actions.append(emailLink, whatsappLink, copyButton);
    const directChannelNote = document.createElement("small");
    directChannelNote.className = "form-fallback-note";
    directChannelNote.textContent = "If your brief is long, Email and WhatsApp may use a shortened version. Copy project brief always contains every detail.";
    status.replaceChildren(copy, actions, directChannelNote);

    const attachmentName = options.attachmentName || payload.attachment?.filename || "";
    if (attachmentName || payload.attachment) {
      const note = document.createElement("small");
      note.className = "form-fallback-note";
      note.textContent = `The selected artwork${attachmentName ? ` (${attachmentName})` : ""} was not included automatically. Add it again as an Email or WhatsApp attachment before sending.`;
      status.append(note);
    }

    status.dataset.state = "fallback";
    document.dispatchEvent(new CustomEvent("glorystarpack:quote-email-fallback", {
      detail: { hasAttachment: Boolean(attachmentName || payload.attachment) },
    }));
    if (options.focusFirst !== false) emailLink.focus();
  };

  document.querySelectorAll(".quote-form").forEach((form) => {
    const formGrid = form.querySelector(".form-grid");
    const optionalFieldNames = ["phone", "dimensions", "targetDate", "details", "attachment"];
    const optionalFields = optionalFieldNames
      .map((name) => form.querySelector(`[name="${name}"]`)?.closest(".field"))
      .filter(Boolean);

    if (formGrid && optionalFields.length === optionalFieldNames.length) {
      const optionalDetails = document.createElement("details");
      optionalDetails.className = "quote-form__optional field--full";

      const optionalSummary = document.createElement("summary");
      optionalSummary.dataset.quoteOptionalToggle = "true";
      optionalSummary.innerHTML = `<span>Add project details or artwork</span><small>Optional · helps us prepare a more specific reply</small>`;

      const optionalGrid = document.createElement("div");
      optionalGrid.className = "form-grid quote-form__optional-grid";
      optionalFields.forEach((field) => optionalGrid.append(field));
      optionalDetails.append(optionalSummary, optionalGrid);

      const trap = formGrid.querySelector(".form-trap");
      formGrid.insertBefore(optionalDetails, trap || null);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const status = form.querySelector(".form-status");
      const submitButton = form.querySelector('button[type="submit"]');
      const originalLabel = submitButton?.textContent || "Request my quote";
      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        product: String(formData.get("product") || "").trim(),
        quantity: String(formData.get("quantity") || "").trim(),
        dimensions: String(formData.get("dimensions") || "").trim(),
        country: String(formData.get("country") || "").trim(),
        targetDate: String(formData.get("targetDate") || "").trim(),
        details: String(formData.get("details") || "").trim(),
        website: String(formData.get("website") || "").trim(),
        sourcePage: window.location.pathname,
        ...getAttribution(),
      };

      if (status) {
        status.textContent = "Preparing your request…";
        status.dataset.state = "";
      }
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
      }

      let timeoutId;
      let deliveryAttempted = false;
      const fileInput = form.querySelector('input[type="file"]');

      try {
        payload.attachment = await fileToAttachment(fileInput?.files?.[0]);

        const controller = new AbortController();
        timeoutId = window.setTimeout(() => controller.abort(), 18000);
        deliveryAttempted = true;
        document.dispatchEvent(new CustomEvent("glorystarpack:quote-submit-attempt"));

        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          if (response.status >= 500 || response.status === 404) {
            document.dispatchEvent(new CustomEvent("glorystarpack:quote-delivery-error", {
              detail: { reason: "server", statusGroup: `${Math.floor(response.status / 100)}xx` },
            }));
            renderDeliveryFallback(status, payload);
            return;
          }
          document.dispatchEvent(new CustomEvent("glorystarpack:quote-delivery-error", {
            detail: { reason: "request", statusGroup: `${Math.floor(response.status / 100)}xx` },
          }));
          renderDeliveryFallback(status, payload, {
            message: `${result.error || "The online request could not be accepted."} Your form is still filled in—choose another way to send the same brief.`,
          });
          return;
        }

        form.reset();
        delete form.dataset.analyticsStarted;
        const optionalDetails = form.querySelector(".quote-form__optional");
        if (optionalDetails) optionalDetails.open = false;
        if (status) {
          status.textContent = "Request received. Kevin will follow up with the next project questions.";
          status.dataset.state = "success";
        }
        document.dispatchEvent(new CustomEvent("glorystarpack:lead", {
          detail: { product: payload.product },
        }));
      } catch (error) {
        if (deliveryAttempted && (error?.name === "AbortError" || error instanceof TypeError)) {
          document.dispatchEvent(new CustomEvent("glorystarpack:quote-delivery-error", {
            detail: { reason: error?.name === "AbortError" ? "timeout" : "network", statusGroup: "none" },
          }));
          renderDeliveryFallback(status, payload);
          return;
        }
        if (!deliveryAttempted) {
          document.dispatchEvent(new CustomEvent("glorystarpack:quote-validation-error", {
            detail: { reason: "attachment" },
          }));
          renderDeliveryFallback(status, payload, {
            message: `${error.message || "The selected artwork could not be prepared."} Your form is still filled in—send the brief through Email or WhatsApp and add the artwork manually.`,
            attachmentName: fileInput?.files?.[0]?.name || "",
          });
          return;
        }
        renderDeliveryFallback(status, payload, {
          message: `${error.message || "The request could not be sent."} Your form is still filled in—choose another way to send the same brief.`,
        });
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  });

  const roiCalculator = document.querySelector("#packaging-roi-calculator");
  if (roiCalculator) {
    const output = (name) => roiCalculator.querySelector(`[data-roi-output="${name}"]`);
    const formatNumber = (value, fractionDigits = 2) =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);

    const calculatePackagingBreakEven = () => {
      const formData = new FormData(roiCalculator);
      const baselineCost = Number(formData.get("baselineCost"));
      const customCost = Number(formData.get("customCost"));
      const quantity = Number(formData.get("quantity"));
      const oneTimeCost = Number(formData.get("oneTimeCost"));
      const contributionMargin = Number(formData.get("contributionMargin"));
      const values = [baselineCost, customCost, quantity, oneTimeCost, contributionMargin];

      if (values.some((value) => !Number.isFinite(value)) || quantity <= 0 || contributionMargin <= 0) return;

      const unitDelta = customCost - baselineCost;
      const investment = unitDelta * quantity + oneTimeCost;
      const breakEvenOrders = investment > 0 ? Math.ceil(investment / contributionMargin) : 0;
      const requiredLift = (breakEvenOrders / quantity) * 100;

      output("investment").textContent = formatNumber(investment);
      output("unit-delta").textContent = formatNumber(unitDelta);
      output("orders").textContent = new Intl.NumberFormat().format(breakEvenOrders);
      output("lift").textContent = `${formatNumber(requiredLift, 1)}%`;

      if (investment <= 0) {
        output("interpretation").textContent = `With these assumptions, the custom route is ${formatNumber(Math.abs(investment))} lower across the run in your chosen currency after one-time costs. Verify that both routes include the same usable landed scope.`;
      } else {
        output("interpretation").textContent = `With these assumptions, the upgrade needs contribution from ${new Intl.NumberFormat().format(breakEvenOrders)} incremental orders to recover ${formatNumber(investment)} in your chosen currency, before any verified operating savings are counted.`;
      }
    };

    roiCalculator.addEventListener("submit", (event) => {
      event.preventDefault();
      if (roiCalculator.reportValidity()) calculatePackagingBreakEven();
    });
    roiCalculator.addEventListener("input", calculatePackagingBreakEven);
    calculatePackagingBreakEven();
  }

  const rigidBoxLogisticsCalculator = document.querySelector("#rigid-box-logistics-calculator");
  if (rigidBoxLogisticsCalculator) {
    const output = (name) => rigidBoxLogisticsCalculator.querySelector(`[data-rigid-output="${name}"]`);
    const formatNumber = (value, fractionDigits = 2) =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);

    const calculateRigidBoxLogistics = () => {
      const formData = new FormData(rigidBoxLogisticsCalculator);
      const quantity = Number(formData.get("quantity"));
      const setupLength = Number(formData.get("setupLength"));
      const setupWidth = Number(formData.get("setupWidth"));
      const setupHeight = Number(formData.get("setupHeight"));
      const setupUnits = Number(formData.get("setupUnits"));
      const flatLength = Number(formData.get("flatLength"));
      const flatWidth = Number(formData.get("flatWidth"));
      const flatHeight = Number(formData.get("flatHeight"));
      const flatUnits = Number(formData.get("flatUnits"));
      const assemblySeconds = Number(formData.get("assemblySeconds"));
      const laborRate = Number(formData.get("laborRate"));
      const cubeRate = Number(formData.get("cubeRate") || 0);
      const values = [
        quantity,
        setupLength,
        setupWidth,
        setupHeight,
        setupUnits,
        flatLength,
        flatWidth,
        flatHeight,
        flatUnits,
        assemblySeconds,
        laborRate,
        cubeRate,
      ];

      if (values.some((value) => !Number.isFinite(value))) return;
      if ([quantity, setupLength, setupWidth, setupHeight, setupUnits, flatLength, flatWidth, flatHeight, flatUnits]
        .some((value) => value <= 0)) return;
      if ([assemblySeconds, laborRate, cubeRate].some((value) => value < 0)) return;

      const setupCartons = Math.ceil(quantity / setupUnits);
      const flatCartons = Math.ceil(quantity / flatUnits);
      const setupCube = setupCartons * setupLength * setupWidth * setupHeight / 1_000_000_000;
      const flatCube = flatCartons * flatLength * flatWidth * flatHeight / 1_000_000_000;
      const cubeDifference = setupCube - flatCube;
      const cubeChange = setupCube ? ((flatCube - setupCube) / setupCube) * 100 : 0;
      const assemblyHours = quantity * assemblySeconds / 3600;
      const assemblyLabor = assemblyHours * laborRate;
      const cubeValue = cubeDifference * cubeRate;
      const planningBalance = cubeValue - assemblyLabor;

      output("setup-cube").textContent = `${formatNumber(setupCube)} m³`;
      output("flat-cube").textContent = `${formatNumber(flatCube)} m³`;
      output("cube-difference").textContent = `${cubeDifference < 0 ? "−" : ""}${formatNumber(Math.abs(cubeDifference))} m³`;
      output("cube-change").textContent = `${cubeChange < 0 ? "−" : "+"}${formatNumber(Math.abs(cubeChange), 1)}%`;
      output("assembly-hours").textContent = `${formatNumber(assemblyHours)} h`;
      output("planning-balance").textContent = `${planningBalance < 0 ? "−" : ""}${formatNumber(Math.abs(planningBalance))}`;

      const direction = cubeDifference >= 0 ? "reduces" : "increases";
      output("interpretation").textContent = `Across ${new Intl.NumberFormat().format(quantity)} units, these inputs use ${new Intl.NumberFormat().format(setupCartons)} setup-box cartons and ${new Intl.NumberFormat().format(flatCartons)} collapsible cartons. The collapsible route ${direction} calculated empty-box cube by ${formatNumber(Math.abs(cubeDifference))} m³ and adds ${formatNumber(assemblyHours)} assembly hours. The optional planning balance is cube value minus assembly labor only.`;
    };

    rigidBoxLogisticsCalculator.addEventListener("submit", (event) => {
      event.preventDefault();
      if (rigidBoxLogisticsCalculator.reportValidity()) calculateRigidBoxLogistics();
    });
    rigidBoxLogisticsCalculator.addEventListener("input", calculateRigidBoxLogistics);
    calculateRigidBoxLogistics();
  }

  const shippingCasePlanner = document.querySelector("#shipping-case-planner");
  if (shippingCasePlanner) {
    const output = (name) => shippingCasePlanner.querySelector(`[data-case-output="${name}"]`);
    const formatNumber = (value, fractionDigits = 2) =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);

    const calculateShippingCasePlan = () => {
      const formData = new FormData(shippingCasePlanner);
      const caseCount = Number(formData.get("caseCount"));
      const unitsPerCase = Number(formData.get("unitsPerCase"));
      const caseLength = Number(formData.get("caseLength"));
      const caseWidth = Number(formData.get("caseWidth"));
      const caseHeight = Number(formData.get("caseHeight"));
      const caseWeight = Number(formData.get("caseWeight"));
      const palletLength = Number(formData.get("palletLength"));
      const palletWidth = Number(formData.get("palletWidth"));
      const loadHeight = Number(formData.get("loadHeight"));
      const values = [caseCount, unitsPerCase, caseLength, caseWidth, caseHeight, caseWeight, palletLength, palletWidth, loadHeight];

      if (values.some((value) => !Number.isFinite(value) || value <= 0)) return;

      const shippedUnits = Math.floor(caseCount) * Math.floor(unitsPerCase);
      const caseCube = caseLength * caseWidth * caseHeight / 1_000_000_000;
      const totalCube = caseCube * Math.floor(caseCount);
      const totalWeight = caseWeight * Math.floor(caseCount);
      const unrotatedPerLayer = Math.floor(palletLength / caseLength) * Math.floor(palletWidth / caseWidth);
      const rotatedPerLayer = Math.floor(palletLength / caseWidth) * Math.floor(palletWidth / caseLength);
      const casesPerLayer = Math.max(unrotatedPerLayer, rotatedPerLayer);
      const layers = Math.floor(loadHeight / caseHeight);
      const casesPerPallet = casesPerLayer * layers;
      const palletCount = casesPerPallet > 0 ? Math.ceil(Math.floor(caseCount) / casesPerPallet) : 0;
      const orientation = rotatedPerLayer > unrotatedPerLayer ? "rotated" : "unrotated";

      output("units").textContent = new Intl.NumberFormat().format(shippedUnits);
      output("case-cube").textContent = `${formatNumber(caseCube, 3)} m³`;
      output("total-cube").textContent = `${formatNumber(totalCube)} m³`;
      output("total-weight").textContent = `${formatNumber(totalWeight)} kg`;
      output("per-layer").textContent = new Intl.NumberFormat().format(casesPerLayer);
      output("pallets").textContent = casesPerPallet > 0 ? new Intl.NumberFormat().format(palletCount) : "No full layer";

      if (!casesPerLayer || !layers) {
        output("interpretation").textContent = "The entered case does not fit a complete same-orientation grid within the entered pallet footprint or available load height. Check the dimensions and obtain an engineered load plan.";
        return;
      }

      output("interpretation").textContent = `The ${orientation} same-orientation check fits ${new Intl.NumberFormat().format(casesPerLayer)} cases per layer. At ${new Intl.NumberFormat().format(layers)} full case layers, the simple grid holds ${new Intl.NumberFormat().format(casesPerPallet)} cases per pallet and requires ${new Intl.NumberFormat().format(palletCount)} pallet positions for ${new Intl.NumberFormat().format(Math.floor(caseCount))} cases. Confirm a physical unit load before approval.`;
    };

    shippingCasePlanner.addEventListener("submit", (event) => {
      event.preventDefault();
      if (shippingCasePlanner.reportValidity()) calculateShippingCasePlan();
    });
    shippingCasePlanner.addEventListener("input", calculateShippingCasePlan);
    calculateShippingCasePlan();
  }

  const jewelryInsertFitPlanner = document.querySelector("#jewelry-insert-fit-planner");
  if (jewelryInsertFitPlanner) {
    const output = (name) => jewelryInsertFitPlanner.querySelector(`[data-jewelry-output="${name}"]`);
    const formatNumber = (value, fractionDigits = 1) =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);
    const jewelryLabels = {
      ring: "ring",
      earrings: "earring",
      necklace: "necklace or pendant",
      watch: "watch or bracelet",
      set: "multi-item set",
    };
    const jewelryChecks = {
      ring: "setting clearance, slot compression, insertion and removal force, material contact, and recovery across the ring-size range",
      earrings: "pair alignment, post or hook clearance, back storage, release, material contact, and closed-box movement",
      necklace: "chain routing, pendant restraint, anchor release, material contact, closed-box movement, and the production sample",
      watch: "cushion compression, crown and clasp clearance, lift access, material contact, and closed-box movement",
      set: "item separation, removal order, lid clearance, material contact, tolerance across every cavity, and closed-box movement",
    };

    const calculateJewelryInsertFit = () => {
      const formData = new FormData(jewelryInsertFitPlanner);
      const jewelryType = String(formData.get("jewelryType") || "set");
      const productLength = Number(formData.get("productLength"));
      const productWidth = Number(formData.get("productWidth"));
      const heightAbove = Number(formData.get("heightAbove"));
      const spaceBelow = Number(formData.get("spaceBelow"));
      const perimeterAllowance = Number(formData.get("perimeterAllowance"));
      const lidClearance = Number(formData.get("lidClearance"));
      const boxLength = Number(formData.get("boxLength"));
      const boxWidth = Number(formData.get("boxWidth"));
      const boxHeight = Number(formData.get("boxHeight"));
      const values = [productLength, productWidth, heightAbove, spaceBelow, perimeterAllowance, lidClearance, boxLength, boxWidth, boxHeight];

      if (values.some((value) => !Number.isFinite(value))) return;
      if ([productLength, productWidth, boxLength, boxWidth, boxHeight].some((value) => value <= 0)) return;
      if ([heightAbove, spaceBelow, perimeterAllowance, lidClearance].some((value) => value < 0)) return;

      const minimumLength = productLength + perimeterAllowance * 2;
      const minimumWidth = productWidth + perimeterAllowance * 2;
      const minimumHeight = heightAbove + spaceBelow + lidClearance;
      const margins = {
        length: boxLength - minimumLength,
        width: boxWidth - minimumWidth,
        height: boxHeight - minimumHeight,
      };
      const dimensions = { length: "length", width: "width", height: "height" };
      const shortfalls = Object.entries(margins).filter(([, value]) => value < 0);
      const formatMargin = (value) => `${value >= 0 ? "+" : "−"}${formatNumber(Math.abs(value))} mm`;
      const label = jewelryLabels[jewelryType] || jewelryLabels.set;
      const checks = jewelryChecks[jewelryType] || jewelryChecks.set;

      output("minimum-size").textContent = `${formatNumber(minimumLength)} × ${formatNumber(minimumWidth)} × ${formatNumber(minimumHeight)} mm`;
      output("length-margin").textContent = formatMargin(margins.length);
      output("width-margin").textContent = formatMargin(margins.width);
      output("height-margin").textContent = formatMargin(margins.height);

      if (!shortfalls.length) {
        output("status").textContent = "Envelope clears";
        output("interpretation").textContent = `The proposed inside size clears this ${label} planning envelope in all three dimensions. Next confirm ${checks}.`;
        return;
      }

      const shortfallText = shortfalls
        .map(([dimension, value]) => `${dimensions[dimension]} by ${formatNumber(Math.abs(value))} mm`)
        .join(shortfalls.length > 1 ? ", " : "");
      output("status").textContent = "Review shortfall";
      output("interpretation").textContent = `The proposed inside size is below this ${label} planning envelope in ${shortfallText}. Revise the arranged layout, allowance, insert build, or box proposal, then confirm ${checks}.`;
    };

    jewelryInsertFitPlanner.addEventListener("submit", (event) => {
      event.preventDefault();
      if (jewelryInsertFitPlanner.reportValidity()) calculateJewelryInsertFit();
    });
    jewelryInsertFitPlanner.addEventListener("input", calculateJewelryInsertFit);
    jewelryInsertFitPlanner.addEventListener("change", calculateJewelryInsertFit);
    calculateJewelryInsertFit();
  }

  const paperTubeSizePlanner = document.querySelector("#paper-tube-size-planner");
  if (paperTubeSizePlanner) {
    const output = (name) => paperTubeSizePlanner.querySelector(`[data-tube-output="${name}"]`);
    const formatNumber = (value) =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value);

    const calculatePaperTubeSize = () => {
      const formData = new FormData(paperTubeSizePlanner);
      const productCrossSection = Number(formData.get("productCrossSection"));
      const productHeight = Number(formData.get("productHeight"));
      const radialAllowance = Number(formData.get("radialAllowance"));
      const bottomAllowance = Number(formData.get("bottomAllowance"));
      const topAllowance = Number(formData.get("topAllowance"));
      const proposedId = Number(formData.get("proposedId"));
      const proposedHeight = Number(formData.get("proposedHeight"));
      const wallThickness = Number(formData.get("wallThickness"));
      const values = [productCrossSection, productHeight, radialAllowance, bottomAllowance, topAllowance, proposedId, proposedHeight, wallThickness];

      if (values.some((value) => !Number.isFinite(value))) return;
      if ([productCrossSection, productHeight, proposedId, proposedHeight].some((value) => value <= 0)) return;
      if ([radialAllowance, bottomAllowance, topAllowance, wallThickness].some((value) => value < 0)) return;

      const minimumId = productCrossSection + radialAllowance * 2;
      const minimumHeight = productHeight + bottomAllowance + topAllowance;
      const idMargin = proposedId - minimumId;
      const heightMargin = proposedHeight - minimumHeight;
      const estimatedOd = proposedId + wallThickness * 2;
      const formatMargin = (value) => `${value >= 0 ? "+" : "−"}${formatNumber(Math.abs(value))} mm`;

      output("minimum-id").textContent = `${formatNumber(minimumId)} mm`;
      output("minimum-height").textContent = `${formatNumber(minimumHeight)} mm`;
      output("id-margin").textContent = formatMargin(idMargin);
      output("height-margin").textContent = formatMargin(heightMargin);
      output("estimated-od").textContent = `${formatNumber(estimatedOd)} mm`;

      const shortfalls = [];
      if (idMargin < 0) shortfalls.push(`inside diameter by ${formatNumber(Math.abs(idMargin))} mm`);
      if (heightMargin < 0) shortfalls.push(`usable height by ${formatNumber(Math.abs(heightMargin))} mm`);

      if (!shortfalls.length) {
        output("status").textContent = "Envelope clears";
        output("interpretation").textContent = "The proposed usable space clears the entered planning envelope. Next confirm the real loading path, insert, tube roundness, cap or shoulder intrusion, opening and removal force, tolerances, and production-equivalent sample.";
        return;
      }

      output("status").textContent = "Review shortfall";
      output("interpretation").textContent = `The proposed tube is below the entered planning envelope in ${shortfalls.join(" and ")}. Revise the loading orientation, allowance, usable space, insert, or tube proposal, then confirm the physical fit and full tolerance stack.`;
    };

    paperTubeSizePlanner.addEventListener("submit", (event) => {
      event.preventDefault();
      if (paperTubeSizePlanner.reportValidity()) calculatePaperTubeSize();
    });
    paperTubeSizePlanner.addEventListener("input", calculatePaperTubeSize);
    calculatePaperTubeSize();
  }
})();
