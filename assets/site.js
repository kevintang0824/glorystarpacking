(() => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  const setNavOpen = (open) => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };

  navToggle?.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
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

  const buildMailto = (payload) => {
    const subject = `Packaging quote request — ${payload.product || "Custom project"}`;
    const body = [
      `Name: ${payload.name || ""}`,
      `Email: ${payload.email || ""}`,
      `Phone / WhatsApp: ${payload.phone || "Not provided"}`,
      `Product: ${payload.product || ""}`,
      `Quantity: ${payload.quantity || ""}`,
      `Dimensions: ${payload.dimensions || "Not provided"}`,
      `Delivery country / region: ${payload.country || ""}`,
      `Target in-hand date: ${payload.targetDate || "Flexible / not provided"}`,
      `Landing page: ${payload.landingPage || "Not provided"}`,
      `Referrer: ${payload.referrer || "Direct / not provided"}`,
      `Discovery channel: ${payload.discoveryChannel || "Not provided"}`,
      `Discovery source: ${payload.discoverySource || "Not provided"}`,
      `Campaign: ${[payload.utmSource, payload.utmMedium, payload.utmCampaign].filter(Boolean).join(" / ") || "Not provided"}`,
      "",
      "Project details:",
      payload.details || "Not provided",
      "",
      "Please attach any artwork directly to this email before sending.",
    ].join("\n");

    return `mailto:kevin@GloryStarPack.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  document.querySelectorAll(".quote-form").forEach((form) => {
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

      try {
        const fileInput = form.querySelector('input[type="file"]');
        payload.attachment = await fileToAttachment(fileInput?.files?.[0]);

        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          if (response.status >= 500 || response.status === 404) {
            window.location.href = buildMailto(payload);
            if (status) {
              status.textContent = "Your email app has been opened. Attach artwork there, then send.";
              status.dataset.state = "success";
            }
            return;
          }
          throw new Error(result.error || "Please review the form and try again.");
        }

        form.reset();
        if (status) {
          status.textContent = "Request received. Kevin will follow up with the next project questions.";
          status.dataset.state = "success";
        }
      } catch (error) {
        if (status) {
          status.textContent = error.message || "The request could not be sent. Please email us directly.";
          status.dataset.state = "error";
        }
      } finally {
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
})();
