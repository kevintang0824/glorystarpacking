(() => {
  const loader = document.currentScript;
  const measurementId = loader?.dataset.measurementId || "";
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

  const consentKey = "glorystarpack-analytics-consent";
  const consentGranted = "granted";
  const consentDenied = "denied";
  let googleTagLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: consentDenied,
    ad_storage: consentDenied,
    ad_user_data: consentDenied,
    ad_personalization: consentDenied,
    wait_for_update: 500,
  });

  const getConsent = () => {
    try {
      return localStorage.getItem(consentKey) || "";
    } catch {
      return "";
    }
  };

  const saveConsent = (choice) => {
    try {
      localStorage.setItem(consentKey, choice);
    } catch {
      // Consent still applies for the current page when storage is unavailable.
    }
  };

  const deleteAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    cookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.glorystarpacking.com; SameSite=Lax`;
    });
  };

  const loadGoogleTag = () => {
    if (googleTagLoaded) return;
    googleTagLoaded = true;

    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    tag.dataset.analyticsTag = "true";
    document.head.append(tag);

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  };

  const grantAnalytics = () => {
    saveConsent(consentGranted);
    window.gtag("consent", "update", {
      analytics_storage: consentGranted,
      ad_storage: consentDenied,
      ad_user_data: consentDenied,
      ad_personalization: consentDenied,
    });
    loadGoogleTag();
    document.dispatchEvent(new CustomEvent("glorystarpack:analytics-consent", { detail: { choice: consentGranted } }));
  };

  const denyAnalytics = () => {
    saveConsent(consentDenied);
    window.gtag("consent", "update", {
      analytics_storage: consentDenied,
      ad_storage: consentDenied,
      ad_user_data: consentDenied,
      ad_personalization: consentDenied,
    });
    deleteAnalyticsCookies();
    document.dispatchEvent(new CustomEvent("glorystarpack:analytics-consent", { detail: { choice: consentDenied } }));
  };

  const track = (eventName, parameters = {}) => {
    if (getConsent() !== consentGranted || !googleTagLoaded) return;
    window.gtag("event", eventName, {
      send_to: measurementId,
      page_path: window.location.pathname,
      ...parameters,
    });
  };

  const closeConsentPanel = () => {
    document.querySelector(".analytics-consent")?.remove();
  };

  const showConsentPanel = (moveFocus = false) => {
    closeConsentPanel();
    const panel = document.createElement("section");
    panel.className = "analytics-consent";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Analytics choices");
    panel.innerHTML = `
      <div class="analytics-consent__copy">
        <strong>Help us improve this website?</strong>
        <p>With your permission, we use Google Analytics to understand page visits and inquiry actions. We do not send your name, email, phone number, message, or uploaded files to Analytics. <a href="privacy.html#cookies-and-analytics">Privacy details</a></p>
      </div>
      <div class="analytics-consent__actions">
        <button class="button button--ghost button--small" type="button" data-analytics-deny>Decline</button>
        <button class="button button--small" type="button" data-analytics-allow>Allow analytics</button>
      </div>`;

    panel.querySelector("[data-analytics-deny]")?.addEventListener("click", () => {
      denyAnalytics();
      closeConsentPanel();
    });
    panel.querySelector("[data-analytics-allow]")?.addEventListener("click", () => {
      grantAnalytics();
      closeConsentPanel();
    });
    document.body.append(panel);
    if (moveFocus) {
      panel.querySelector(getConsent() === consentGranted ? "[data-analytics-deny]" : "[data-analytics-allow]")?.focus();
    }
  };

  const currentConsent = getConsent();
  if (currentConsent === consentGranted) grantAnalytics();
  if (currentConsent === consentDenied) denyAnalytics();

  const initializeConsentControls = () => {
    if (!currentConsent) showConsentPanel();
    document.querySelectorAll("[data-analytics-preferences]").forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        showConsentPanel(true);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeConsentControls, { once: true });
  } else {
    initializeConsentControls();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";

    if (href.startsWith("mailto:")) {
      track("contact_click", { contact_method: "email" });
      return;
    }
    if (/^https:\/\/wa\.me\//i.test(href)) {
      track("contact_click", { contact_method: "whatsapp" });
      return;
    }
    if (href.includes("#quote")) {
      track("quote_cta_click", { link_location: link.closest("header") ? "header" : "page" });
    }
  });

  document.querySelectorAll(".quote-form").forEach((form) => {
    form.addEventListener("focusin", () => {
      if (form.dataset.analyticsStarted) return;
      form.dataset.analyticsStarted = "true";
      track("quote_form_start", { form_name: "packaging_quote" });
    });
    form.querySelector('input[type="file"]')?.addEventListener("change", (event) => {
      if (!event.target.files?.length) return;
      track("quote_file_attach", { form_name: "packaging_quote" });
    });
  });

  document.addEventListener("glorystarpack:lead", (event) => {
    track("generate_lead", {
      lead_source: "website_quote_form",
      product_category: String(event.detail?.product || "custom_packaging").slice(0, 80),
    });
  });

  document.addEventListener("glorystarpack:quote-email-fallback", () => {
    track("quote_email_fallback", { form_name: "packaging_quote" });
  });

  document.querySelector("#packaging-roi-calculator")?.addEventListener("submit", () => {
    track("calculator_use", { calculator_name: "packaging_break_even" });
  });
})();
