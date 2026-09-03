(() => {
  const root = document.querySelector("[data-authorized-catalog]");
  if (!root) return;

  const grid = root.querySelector("[data-catalog-library-grid]");
  const categoryList = root.querySelector("[data-catalog-library-categories]");
  const resultCount = root.querySelector("[data-catalog-library-count]");
  const resultTitle = root.querySelector("[data-catalog-library-title]");
  const status = root.querySelector("[data-catalog-library-status]");
  const categorySelect = root.querySelector("[data-catalog-library-category-select]");
  const searchInput = root.querySelector("[data-catalog-library-search]");
  const sortSelect = root.querySelector("[data-catalog-library-sort]");
  const previousButton = root.querySelector("[data-catalog-library-previous]");
  const nextButton = root.querySelector("[data-catalog-library-next]");
  const pageText = root.querySelector("[data-catalog-library-page]");
  const dialog = root.querySelector("[data-catalog-library-dialog]");
  const dialogImage = dialog?.querySelector("[data-catalog-dialog-image]");
  const dialogCategory = dialog?.querySelector("[data-catalog-dialog-category]");
  const dialogTitle = dialog?.querySelector("[data-catalog-dialog-title]");
  const dialogDescription = dialog?.querySelector("[data-catalog-dialog-description]");
  const dialogReference = dialog?.querySelector("[data-catalog-dialog-reference]");
  const dialogImageNote = dialog?.querySelector("[data-catalog-dialog-image-note]");
  const dialogQuote = dialog?.querySelector("[data-catalog-dialog-quote]");
  const dialogDetail = dialog?.querySelector("[data-catalog-dialog-detail]");
  const quoteProduct = document.querySelector('select[name="product"]');
  const quoteDetails = document.querySelector('textarea[name="details"]');
  const pageSize = 48;
  const catalogStateParams = {
    category: "catalogCategory",
    query: "catalogQuery",
    sort: "catalogSort",
    page: "catalogPage",
  };
  const supportedSorts = new Set(["catalog", "az", "category"]);
  const readCatalogStateFromUrl = () => {
    const params = new URL(window.location.href).searchParams;
    const page = Number.parseInt(params.get(catalogStateParams.page) || "1", 10);
    const category = (params.get(catalogStateParams.category) || "all").trim();
    const sort = (params.get(catalogStateParams.sort) || "catalog").trim();
    return {
      category: /^[a-z0-9-]+$/i.test(category) ? category : "all",
      query: (params.get(catalogStateParams.query) || "").trim().slice(0, 120),
      sort: supportedSorts.has(sort) ? sort : "catalog",
      page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
    };
  };
  const state = readCatalogStateFromUrl();
  let catalog = null;
  let catalogLoadPromise = null;
  let catalogObserver = null;
  let activeProduct = null;
  let dialogReturnFocus = null;
  let restoreDialogFocus = true;
  let searchRenderTimeout = 0;

  const curatedProductPages = new Map([
    ["1601585909249", { title: "Printed Corrugated Ecommerce Mailer", href: "printed-corrugated-ecommerce-mailer-gs-5909249.html" }],
    ["1601195409107", { title: "Black Paper Shopping Bag with Gold Detail", href: "black-gold-paper-shopping-bag-gs-5409107.html" }],
    ["1600082295707", { title: "Ribbon-Tied Paper Gift Box Set", href: "ribbon-paper-gift-boxes-gs-2295707.html" }],
    ["1600805461726", { title: "Embossed Apparel Hang Tags with String", href: "embossed-apparel-hang-tags-gs-5461726.html" }],
    ["1601006445340", { title: "Gold Essential-Oil Folding Carton Range", href: "essential-oil-folding-cartons-gs-6445340.html" }],
    ["1601201294765", { title: "Tall Blue Perfume Folding Carton", href: "perfume-carton-gs-1294765.html" }],
    ["1601206842703", { title: "Printed Chocolate-Bar Secondary Carton", href: "chocolate-bar-carton-gs-6842703.html" }],
    ["1601240659772", { title: "Window Sushi Takeaway Box", href: "window-sushi-takeaway-box-gs-0659772.html" }],
    ["1601425045668", { title: "Printed PDQ Counter Display", href: "pdq-counter-display-gs-5045668.html" }],
    ["1601715878715", { title: "Botanical Printed Tea Folding Carton", href: "printed-tea-carton-gs-5878715.html" }],
    ["1600913423123", { title: "Botanical Candle Folding Carton", href: "candle-folding-carton-gs-3423123.html" }],
    ["1600278039093", { title: "Fold-Over Jewelry Display Card", href: "jewelry-display-card-gs-8039093.html" }],
  ]);

  const normalize = (value) => String(value || "").normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
  const language = window.GloryStarI18n?.language || "en";
  if (language !== "en") {
    curatedProductPages.forEach((page) => { page.href = `/${language}/${page.href}`; });
  }

  const syncCatalogControls = () => {
    if (searchInput && searchInput.value !== state.query) searchInput.value = state.query;
    if (sortSelect && sortSelect.value !== state.sort) sortSelect.value = state.sort;
    if (categorySelect && categorySelect.value !== state.category) categorySelect.value = state.category;
  };

  const normalizeCatalogState = () => {
    if (!catalog) return;
    const categorySlugs = new Set(["all", ...catalog.categories.map((category) => category.slug)]);
    if (!categorySlugs.has(state.category)) state.category = "all";
    if (!supportedSorts.has(state.sort)) state.sort = "catalog";
    if (!Number.isFinite(state.page) || state.page < 1) state.page = 1;
    state.query = String(state.query || "").trim().slice(0, 120);
    syncCatalogControls();
  };

  const writeCatalogStateToUrl = (mode = "replace") => {
    const url = new URL(window.location.href);
    const setOrDelete = (name, value, defaultValue) => {
      if (value === defaultValue || value === "") url.searchParams.delete(name);
      else url.searchParams.set(name, String(value));
    };
    setOrDelete(catalogStateParams.category, state.category, "all");
    setOrDelete(catalogStateParams.query, state.query, "");
    setOrDelete(catalogStateParams.sort, state.sort, "catalog");
    setOrDelete(catalogStateParams.page, state.page, 1);
    if (url.href === window.location.href) return;
    window.history[mode === "push" ? "pushState" : "replaceState"](
      { glorystarpackCatalog: true },
      "",
      url
    );
  };

  const catalogDescriptionFor = (product, policy) => {
    const base = String(policy?.base || "").replace("{title}", product.title);
    const translate = window.GloryStarI18n?.translate || ((value) => value);
    if (product.claimReviewRequired === true) return `${translate(base)}${translate(policy?.claimReview || "")}`;
    if (product.category === "Food packaging" || product.category === "Sushi packaging") return `${translate(base)}${translate(policy?.food || "")}`;
    if (product.category === "Healthcare packaging") return `${translate(base)}${translate(policy?.healthcare || "")}`;
    return translate(base);
  };

  const filteredProducts = () => {
    if (!catalog) return [];
    const query = normalize(state.query);
    const products = catalog.products.filter((product) => {
      const categoryMatch = state.category === "all" || product.categorySlug === state.category;
      if (!categoryMatch) return false;
      if (!query) return true;
      return product.searchText.includes(query);
    });
    if (state.sort === "az") products.sort((a, b) => a.title.localeCompare(b.title));
    if (state.sort === "category") products.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
    return products;
  };

  const openProduct = (product, trigger) => {
    if (!dialog) return;
    activeProduct = product;
    dialogReturnFocus = trigger || document.activeElement;
    restoreDialogFocus = true;
    if (dialogImage) {
      dialogImage.onerror = () => {
        dialogImage.onerror = null;
        dialogImage.src = product.image;
      };
      dialogImage.src = product.previewImage || product.image;
      dialogImage.alt = product.title;
      dialogImage.width = product.previewWidth || 960;
      dialogImage.height = product.previewHeight || 960;
      dialogImage.decoding = "async";
    }
    if (dialogCategory) dialogCategory.textContent = product.category;
    if (dialogTitle) dialogTitle.textContent = product.title;
    if (dialogDescription) dialogDescription.textContent = product.description;
    if (dialogReference) dialogReference.textContent = `Catalog reference GS-${product.id.slice(-7)}`;
    if (dialogImageNote) dialogImageNote.textContent = product.imagePresentation;
    if (dialogDetail) {
      const curated = curatedProductPages.get(String(product.id));
      dialogDetail.hidden = !curated;
      if (curated) {
        dialogDetail.href = curated.href;
        dialogDetail.setAttribute("aria-label", `Open full details for ${curated.title}`);
      } else {
        dialogDetail.removeAttribute("href");
      }
    }
    document.body.classList.add("catalog-dialog-open");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else {
      dialog.setAttribute("open", "");
      dialog.querySelector("button")?.focus();
    }
  };

  const createCard = (product) => {
    const curated = curatedProductPages.get(String(product.id));
    const article = document.createElement("article");
    article.className = "catalog-library-card";

    const media = document.createElement("div");
    media.className = "catalog-library-card__media";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;
    image.width = 480;
    image.height = 480;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
    const reference = document.createElement("span");
    reference.className = "catalog-library-card__reference";
    reference.textContent = `GS-${product.id.slice(-7)}`;
    media.append(reference);

    const body = document.createElement("div");
    body.className = "catalog-library-card__body";
    const category = document.createElement("p");
    category.className = "catalog-library-card__category";
    category.textContent = product.category;
    const title = document.createElement("h3");
    if (curated) {
      const titleLink = document.createElement("a");
      titleLink.href = curated.href;
      titleLink.textContent = curated.title;
      title.append(titleLink);
    } else {
      title.textContent = product.title;
    }
    const description = document.createElement("p");
    description.className = "catalog-library-card__description";
    description.textContent = product.description;
    const commercial = document.createElement("div");
    commercial.className = "catalog-library-card__commercial";
    const quote = document.createElement("strong");
    quote.textContent = "Custom quote";
    const moq = document.createElement("span");
    moq.textContent = "MOQ · specification-led";
    commercial.append(quote, moq);
    const actions = document.createElement("div");
    actions.className = "catalog-library-card__actions";
    if (curated) {
      const detailLink = document.createElement("a");
      detailLink.className = "catalog-library-card__button catalog-library-card__button--detail";
      detailLink.href = curated.href;
      detailLink.textContent = "Full details";
      detailLink.setAttribute("aria-label", `Open full details for ${curated.title}`);
      actions.append(detailLink);
    }
    const button = document.createElement("button");
    button.className = "catalog-library-card__button";
    button.type = "button";
    button.textContent = curated ? "Quick preview" : "View product";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-label", `Preview ${product.title}`);
    button.addEventListener("click", (event) => openProduct(product, event.currentTarget));
    actions.append(button);
    body.append(category, title, description, commercial, actions);
    article.append(media, body);
    return article;
  };

  const renderCategories = () => {
    if (!catalog) return;
    const categories = [{ name: "All products", slug: "all", count: catalog.total }, ...catalog.categories];
    if (categoryList) categoryList.replaceChildren();
    if (categorySelect) categorySelect.replaceChildren();
    categories.forEach((category) => {
      if (categorySelect) {
        const option = document.createElement("option");
        option.value = category.slug;
        option.textContent = `${category.name} (${Number(category.count).toLocaleString()})`;
        categorySelect.append(option);
      }
      if (!categoryList) return;
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.catalogLibraryCategory = category.slug;
      button.setAttribute("aria-pressed", String(state.category === category.slug));
      button.setAttribute("aria-controls", "catalog-library-grid");
      const label = document.createElement("span");
      label.textContent = category.name;
      const count = document.createElement("strong");
      count.textContent = String(category.count);
      button.append(label, count);
      button.addEventListener("click", () => {
        state.category = category.slug;
        state.page = 1;
        renderCategories();
        renderProducts(true);
        writeCatalogStateToUrl("push");
        window.requestAnimationFrame(() => {
          Array.from(categoryList.querySelectorAll("[data-catalog-library-category]"))
            .find((candidate) => candidate.dataset.catalogLibraryCategory === category.slug)
            ?.focus({ preventScroll: true });
        });
      });
      item.append(button);
      categoryList.append(item);
    });
    if (categorySelect) {
      categorySelect.disabled = false;
      categorySelect.value = state.category;
    }
    window.requestAnimationFrame(() => {
      categoryList?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
    });
  };

  const renderProducts = (scrollToResults = false) => {
    if (!catalog || !grid) return;
    const products = filteredProducts();
    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
    state.page = Math.max(1, Math.min(Math.floor(state.page) || 1, totalPages));
    const firstIndex = (state.page - 1) * pageSize;
    const pageProducts = products.slice(firstIndex, firstIndex + pageSize);
    const fragment = document.createDocumentFragment();
    pageProducts.forEach((product) => fragment.append(createCard(product)));
    grid.replaceChildren(fragment);
    grid.toggleAttribute("data-empty", pageProducts.length === 0);

    const activeCategory = state.category === "all"
      ? "All products"
      : catalog.categories.find((category) => category.slug === state.category)?.name || "Products";
    if (resultTitle) resultTitle.textContent = activeCategory;
    if (resultCount) resultCount.textContent = `${products.length.toLocaleString()} ${products.length === 1 ? "product" : "products"}`;
    if (status) status.textContent = products.length === 0
      ? "No products match this search. Try a broader keyword or another category."
      : `Showing ${firstIndex + 1}–${Math.min(firstIndex + pageSize, products.length)} of ${products.length.toLocaleString()} products.`;
    if (pageText) pageText.textContent = `Page ${state.page} of ${totalPages}`;
    if (previousButton) previousButton.disabled = state.page <= 1;
    if (nextButton) nextButton.disabled = state.page >= totalPages;
    if (scrollToResults) root.querySelector("[data-catalog-library-results]")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  syncCatalogControls();

  searchInput?.addEventListener("input", () => {
    state.query = searchInput.value;
    state.page = 1;
    writeCatalogStateToUrl();
    window.clearTimeout(searchRenderTimeout);
    searchRenderTimeout = window.setTimeout(() => renderProducts(), 120);
  });
  categorySelect?.addEventListener("change", () => {
    state.category = categorySelect.value || "all";
    state.page = 1;
    renderCategories();
    renderProducts(true);
    writeCatalogStateToUrl("push");
  });
  sortSelect?.addEventListener("change", () => {
    state.sort = sortSelect.value;
    state.page = 1;
    renderProducts();
    writeCatalogStateToUrl();
  });
  previousButton?.addEventListener("click", () => {
    if (state.page <= 1) return;
    state.page -= 1;
    renderProducts(true);
    writeCatalogStateToUrl("push");
  });
  nextButton?.addEventListener("click", () => {
    state.page += 1;
    renderProducts(true);
    writeCatalogStateToUrl("push");
  });
  dialogQuote?.addEventListener("click", () => {
    if (!activeProduct) return;
    restoreDialogFocus = false;
    if (quoteProduct && Array.from(quoteProduct.options).some((option) => option.value === "other")) quoteProduct.value = "other";
    if (quoteDetails) {
      quoteDetails.value = `Catalog reference GS-${activeProduct.id.slice(-7)}\nProduct: ${activeProduct.title}\nCategory: ${activeProduct.category}`;
      const optionalDetails = quoteDetails.closest("details");
      if (optionalDetails) optionalDetails.open = true;
    }
    dialog?.close?.();
    window.setTimeout(() => document.querySelector('#quote .quote-form input[name="name"]')?.focus({ preventScroll: true }), 0);
  });
  dialog?.addEventListener("close", () => {
    document.body.classList.remove("catalog-dialog-open");
    if (restoreDialogFocus && dialogReturnFocus?.isConnected) dialogReturnFocus.focus();
    dialogReturnFocus = null;
    restoreDialogFocus = true;
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close?.();
  });

  window.addEventListener("popstate", () => {
    Object.assign(state, readCatalogStateFromUrl());
    if (!catalog) {
      loadCatalog();
      return;
    }
    normalizeCatalogState();
    renderCategories();
    renderProducts(true);
  });

  const loadCatalog = () => {
    if (catalogLoadPromise) return catalogLoadPromise;
    root.setAttribute("aria-busy", "true");
    if (status) status.textContent = "Loading the full searchable product library…";
    if (resultCount) resultCount.textContent = "Loading catalog…";

    catalogLoadPromise = fetch("/assets/catalog/catalog.json?v=140d15071c2c", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!Array.isArray(payload?.products) || !Array.isArray(payload?.categories)) {
          throw new Error("Catalog data is invalid");
        }
        payload.products.forEach((product) => {
          product.description = catalogDescriptionFor(product, payload.copyPolicy);
          const translate = window.GloryStarI18n?.translate || ((value) => value);
          // Keep English and local names searchable, with stable product IDs.
          product.searchText = normalize(`${product.title} ${product.category} ${product.description} ${translate(product.title)} ${translate(product.category)} GS-${product.id.slice(-7)}`);
          for (const key of ["image", "previewImage"]) {
            if (product[key]?.startsWith("assets/")) product[key] = `/${product[key]}`;
          }
        });
        catalog = payload;
        normalizeCatalogState();
        renderCategories();
        renderProducts();
        writeCatalogStateToUrl();
        return payload;
      })
      .catch(() => {
        if (status) status.textContent = "The full catalog could not be loaded. The selected product references and engineering routes remain available.";
        if (resultCount) resultCount.textContent = "Catalog unavailable";
        return null;
      })
      .finally(() => root.removeAttribute("aria-busy"));

    return catalogLoadPromise;
  };

  const requestCatalogLoad = () => {
    catalogObserver?.disconnect();
    catalogObserver = null;
    loadCatalog();
  };

  if ("IntersectionObserver" in window) {
    catalogObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) requestCatalogLoad();
    }, { rootMargin: "800px 0px" });
    catalogObserver.observe(root);
  } else {
    requestCatalogLoad();
  }

  root.addEventListener("pointerenter", requestCatalogLoad, { once: true, passive: true });
  root.addEventListener("focusin", requestCatalogLoad, { once: true });
})();
