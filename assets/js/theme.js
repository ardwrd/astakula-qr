(() => {
    const STORAGE_KEY = "tools-astakula-theme";
    const LEGACY_KEY = "tools-astakula-json-theme";
    const DARK_COLOR = "#0f1115";
    const LIGHT_COLOR = "#f3f0e8";

    const SEO_TOOLS = {
        qr: {
            name: "QR Code Generator",
            title: "QR Code Generator for URL, Wi-Fi & WhatsApp | Tools Astakula",
            description: "Create free QR codes for URLs, text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, locations, and calendar events. Export PNG or SVG in your browser.",
            category: "UtilitiesApplication"
        },
        json: {
            name: "JSON Formatter",
            title: "JSON Formatter, Validator & Minifier | Tools Astakula",
            description: "Format, validate, minify, copy, and download JSON directly in your browser. Supports file drop, paste, indentation control, and local processing.",
            category: "DeveloperApplication"
        },
        base64: {
            name: "Base64 Encoder & Decoder",
            title: "Base64 Encoder & Decoder for Text and Files | Tools Astakula",
            description: "Encode or decode Base64 text and files in your browser. Convert files to Base64 or Data URLs and download decoded files without uploading them.",
            category: "DeveloperApplication"
        },
        uuid: {
            name: "UUID Generator",
            title: "UUID v4 & v7 Generator | Tools Astakula",
            description: "Generate UUID v4 and UUID v7 values individually or in bulk, with uppercase, lowercase, and hyphen options. Runs entirely in your browser.",
            category: "DeveloperApplication"
        },
        hash: {
            name: "Hash Generator",
            title: "MD5 & SHA Hash Generator for Text and Files | Tools Astakula",
            description: "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text or files, compare digests, and download results directly in your browser.",
            category: "DeveloperApplication"
        },
        image: {
            name: "Image Tools",
            title: "Image Converter, Resizer & Compressor | Tools Astakula",
            description: "Convert, resize, and compress PNG, JPEG, WebP, and AVIF images locally in your browser. Batch process files and download optimized output.",
            category: "MultimediaApplication"
        },
        pdf: {
            name: "PDF Tools",
            title: "PDF Merge, Extract, Reorder & Rotate Tools | Tools Astakula",
            description: "Merge PDFs, extract pages, reorder pages, and rotate PDF pages directly in your browser. Files are processed locally and are not uploaded.",
            category: "UtilitiesApplication"
        },
        gif: {
            name: "GIF Maker",
            title: "GIF Maker from Images | Tools Astakula",
            description: "Create animated GIFs from PNG, JPEG, WebP, or AVIF images. Reorder frames, set delay, size, fit, colors, and loop behavior in your browser.",
            category: "MultimediaApplication"
        },
        favicon: {
            name: "Favicon Generator",
            title: "Favicon Generator — ICO, PNG & App Icons | Tools Astakula",
            description: "Generate favicon.ico, PNG browser icons, Apple touch icons, Android web app icons, a web manifest, and HTML tags from one image.",
            category: "DeveloperApplication"
        },
        excel: {
            name: "Excel Tools",
            title: "Excel Tools — XLSX, CSV & JSON Viewer and Converter | Tools Astakula",
            description: "View, convert, clean, split, merge, search, sort, and deduplicate XLSX, XLS, CSV, and JSON spreadsheet data directly in your browser.",
            category: "BusinessApplication"
        },
        network: {
            name: "Network Tools",
            title: "Network Tools — Subnet, CIDR, IP, MAC & DNS | Tools Astakula",
            description: "Calculate IPv4 subnets, CIDR ranges, subnet splits, MAC formats, bandwidth, common ports, and DNS records with practical browser-based network tools.",
            category: "DeveloperApplication"
        }
    };

    function installRuntimeStyles() {
        if (document.getElementById("tools-astakula-runtime-styles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "tools-astakula-runtime-styles";
        style.textContent = `
            html[data-theme="dark"][data-theme="dark"] {
                color-scheme: dark;

                --ink: #d9d3c8 !important;
                --paper: #0f1115 !important;
                --paper-2: #13161b !important;
                --bone: #181b20 !important;

                --primary: #f5c842 !important;
                --primary-soft: #f8d86d !important;
                --primary-deep: #dfb52f !important;

                --concrete-300: #777b82 !important;
                --concrete-400: #aaa69f !important;

                --pop-blue: #6288ff !important;
                --pop-mint: #70d6a7 !important;
                --pop-pink: #ec7da7 !important;
                --pop-orange: #ed8b4c !important;
                --pop-purple: #9c7aed !important;

                --danger: #ff7676 !important;
                --danger-bg: #3a2025 !important;

                --bg-1: #0f1115 !important;
                --bg-2: #13161b !important;
                --bg-3: #181b20 !important;
                --fg-1: #f5f1e9 !important;
                --fg-2: #aaa69f !important;
                --fg-3: #777b82 !important;
                --accent: #f5c842 !important;
                --accent-soft: #f8d86d !important;
                --accent-deep: #dfb52f !important;

                --ta-bg: #0f1115 !important;
                --ta-surface: #181b20 !important;
                --ta-text: #f5f1e9 !important;
                --ta-muted: #aaa69f !important;
                --ta-border: #d9d3c8 !important;
                --ta-on-accent: #111318 !important;
                --ta-focus: #f5f1e9 !important;

                --ta-yellow: #f5c842 !important;
                --ta-yellow-hover: #dfb52f !important;
                --ta-blue: #6288ff !important;
                --ta-blue-hover: #7698ff !important;
                --ta-green: #70d6a7 !important;
                --ta-pink: #ec7da7 !important;
                --ta-orange: #ed8b4c !important;
                --ta-purple: #9c7aed !important;

                --ta-error: #ff7676 !important;
                --ta-error-light: #3a2025 !important;
                --ta-shadow-sm: 4px 4px 0 #050607 !important;
                --ta-shadow-md: 6px 6px 0 #050607 !important;
                --ta-shadow-lg: 8px 8px 0 #050607 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body {
                background: #0f1115 !important;
                color: #f5f1e9 !important;
            }

            html[data-theme="dark"][data-theme="dark"] ::selection {
                background: #f5c842 !important;
                color: #111318 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .site-header {
                background: #15181d !important;
                border-color: #d9d3c8 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .site-footer {
                background: #080a0d !important;
                color: #f5f1e9 !important;
                border-color: #d9d3c8 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .hero-section,
            html[data-theme="dark"][data-theme="dark"] body .header-badge,
            html[data-theme="dark"][data-theme="dark"] body .code-mark,
            html[data-theme="dark"][data-theme="dark"] body .image-mark,
            html[data-theme="dark"][data-theme="dark"] body .excel-mark,
            html[data-theme="dark"][data-theme="dark"] body .network-mark,
            html[data-theme="dark"][data-theme="dark"] body .info-card,
            html[data-theme="dark"][data-theme="dark"] body .tool-card:not(.tool-white),
            html[data-theme="dark"][data-theme="dark"] body .drop-zone,
            html[data-theme="dark"][data-theme="dark"] body .status-box.is-success,
            html[data-theme="dark"][data-theme="dark"] body .status-box.is-working,
            html[data-theme="dark"][data-theme="dark"] body .button-primary,
            html[data-theme="dark"][data-theme="dark"] body .brut-btn--primary,
            html[data-theme="dark"][data-theme="dark"] body .mode-tab.is-active,
            html[data-theme="dark"][data-theme="dark"] body .version-tab.is-active,
            html[data-theme="dark"][data-theme="dark"] body .generator-selector-button.is-active,
            html[data-theme="dark"][data-theme="dark"] body .generator-selector-button:hover {
                color: #111318 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .tool-card:not(.tool-white) p,
            html[data-theme="dark"][data-theme="dark"] body .info-card p {
                color: #1b1d22 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .tool-white,
            html[data-theme="dark"][data-theme="dark"] body .tool-white p {
                background: #181b20 !important;
                color: #f5f1e9 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .tool-status {
                background: rgba(17, 19, 24, .12) !important;
                color: #111318 !important;
                border-color: rgba(17, 19, 24, .48) !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .tool-status.available {
                background: #111318 !important;
                color: #f5f1e9 !important;
                border-color: #111318 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .eyebrow,
            html[data-theme="dark"][data-theme="dark"] body .button-secondary,
            html[data-theme="dark"][data-theme="dark"] body .theme-toggle,
            html[data-theme="dark"][data-theme="dark"] body .header-link,
            html[data-theme="dark"][data-theme="dark"] body .compact-select,
            html[data-theme="dark"][data-theme="dark"] body .brut-btn:not(.brut-btn--primary) {
                background: #181b20 !important;
                color: #f5f1e9 !important;
                border-color: #d9d3c8 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .button-secondary:hover:not(:disabled),
            html[data-theme="dark"][data-theme="dark"] body .theme-toggle:hover,
            html[data-theme="dark"][data-theme="dark"] body .header-link:hover,
            html[data-theme="dark"][data-theme="dark"] body .brut-btn:not(.brut-btn--primary):hover:not(:disabled) {
                background: #6288ff !important;
                color: #111318 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .brut-btn--primary {
                background: #f5c842 !important;
                color: #111318 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .brut-btn--primary:hover:not(:disabled) {
                background: #dfb52f !important;
                color: #111318 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .preview-panel,
            html[data-theme="dark"][data-theme="dark"] body .output-panel {
                background: #12151a !important;
                color: #f5f1e9 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .workspace-panel,
            html[data-theme="dark"][data-theme="dark"] body .toolbar-section,
            html[data-theme="dark"][data-theme="dark"] body .controls-section,
            html[data-theme="dark"][data-theme="dark"] body .settings-section,
            html[data-theme="dark"][data-theme="dark"] body .queue-panel,
            html[data-theme="dark"][data-theme="dark"] body .result-card,
            html[data-theme="dark"][data-theme="dark"] body .about-section,
            html[data-theme="dark"][data-theme="dark"] body .status-box.is-neutral,
            html[data-theme="dark"][data-theme="dark"] body .tool-panel,
            html[data-theme="dark"][data-theme="dark"] body .file-panel,
            html[data-theme="dark"][data-theme="dark"] body .sheet-toolbar {
                background: #181b20 !important;
                color: #f5f1e9 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .form-control,
            html[data-theme="dark"][data-theme="dark"] body .compact-select,
            html[data-theme="dark"][data-theme="dark"] body .brut-input,
            html[data-theme="dark"][data-theme="dark"] body .brut-select,
            html[data-theme="dark"][data-theme="dark"] body textarea {
                background-color: #12151a !important;
                color: #f5f1e9 !important;
                border-color: #d9d3c8 !important;
                box-shadow: 3px 3px 0 #050607 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .form-control:hover,
            html[data-theme="dark"][data-theme="dark"] body .form-control:focus,
            html[data-theme="dark"][data-theme="dark"] body .brut-input:hover,
            html[data-theme="dark"][data-theme="dark"] body .brut-input:focus,
            html[data-theme="dark"][data-theme="dark"] body .brut-select:hover,
            html[data-theme="dark"][data-theme="dark"] body .brut-select:focus,
            html[data-theme="dark"][data-theme="dark"] body textarea:hover,
            html[data-theme="dark"][data-theme="dark"] body textarea:focus {
                background-color: #1d2127 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .form-control::placeholder,
            html[data-theme="dark"][data-theme="dark"] body .brut-input::placeholder,
            html[data-theme="dark"][data-theme="dark"] body .json-editor::placeholder,
            html[data-theme="dark"][data-theme="dark"] body .code-editor::placeholder,
            html[data-theme="dark"][data-theme="dark"] body textarea::placeholder {
                color: #858a91 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .json-editor,
            html[data-theme="dark"][data-theme="dark"] body .code-editor,
            html[data-theme="dark"][data-theme="dark"] body .uuid-output,
            html[data-theme="dark"][data-theme="dark"] body .hash-output,
            html[data-theme="dark"][data-theme="dark"] body .payload-output {
                background: #0b0d10 !important;
                color: #f5f1e9 !important;
                border-color: #d9d3c8 !important;
            }

            html[data-theme="dark"][data-theme="dark"] body .status-box.is-error,
            html[data-theme="dark"][data-theme="dark"] body .error-box {
                background: #3a2025 !important;
                color: #ffdede !important;
            }

            @media (max-width: 680px) {
                body .hero-copy {
                    min-width: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                }

                body .hero-section h1 {
                    max-width: 100% !important;
                    font-size: clamp(34px, 10vw, 46px) !important;
                    line-height: 1.04 !important;
                    letter-spacing: -0.04em !important;
                    overflow-wrap: anywhere !important;
                    word-break: normal !important;
                    text-wrap: balance;
                }
            }

            @media (max-width: 360px) {
                body .hero-section h1 {
                    font-size: clamp(31px, 9.5vw, 36px) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function getCurrentToolSlug() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1] || "";
        return Object.prototype.hasOwnProperty.call(SEO_TOOLS, last) ? last : null;
    }

    function upsertMeta(selector, attributeName, attributeValue, content) {
        let meta = document.head.querySelector(selector);
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute(attributeName, attributeValue);
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
    }

    function installToolSeo() {
        const slug = getCurrentToolSlug();
        if (!slug) {
            return;
        }

        const seo = SEO_TOOLS[slug];
        const canonicalUrl = `https://tools.astakula.com/${slug}/`;

        document.title = seo.title;
        upsertMeta('meta[name="description"]', "name", "description", seo.description);
        upsertMeta('meta[name="robots"]', "name", "robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
        upsertMeta('meta[name="author"]', "name", "author", "Astakula");

        upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
        upsertMeta('meta[property="og:locale"]', "property", "og:locale", "en_US");
        upsertMeta('meta[property="og:title"]', "property", "og:title", seo.title);
        upsertMeta('meta[property="og:description"]', "property", "og:description", seo.description);
        upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
        upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", "Tools Astakula");

        upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
        upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.title);
        upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.description);

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl;

        let structuredData = document.getElementById("tools-astakula-seo-schema");
        if (!structuredData) {
            structuredData = document.createElement("script");
            structuredData.id = "tools-astakula-seo-schema";
            structuredData.type = "application/ld+json";
            document.head.appendChild(structuredData);
        }

        structuredData.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": `${canonicalUrl}#webpage`,
                    "url": canonicalUrl,
                    "name": seo.title,
                    "description": seo.description,
                    "breadcrumb": { "@id": `${canonicalUrl}#breadcrumb` },
                    "mainEntity": { "@id": `${canonicalUrl}#app` }
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": `${canonicalUrl}#breadcrumb`,
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Tools Astakula",
                            "item": "https://tools.astakula.com/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": seo.name,
                            "item": canonicalUrl
                        }
                    ]
                },
                {
                    "@type": "WebApplication",
                    "@id": `${canonicalUrl}#app`,
                    "name": seo.name,
                    "url": canonicalUrl,
                    "description": seo.description,
                    "applicationCategory": seo.category,
                    "operatingSystem": "Any",
                    "browserRequirements": "Requires JavaScript and a modern web browser",
                    "isAccessibleForFree": true,
                    "publisher": {
                        "@type": "Organization",
                        "name": "Astakula",
                        "url": "https://astakula.com/"
                    }
                }
            ]
        });
    }

    function getStoredTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "dark" || stored === "light") {
                return stored;
            }

            const legacy = localStorage.getItem(LEGACY_KEY);
            if (legacy === "dark" || legacy === "light") {
                localStorage.setItem(STORAGE_KEY, legacy);
                localStorage.removeItem(LEGACY_KEY);
                return legacy;
            }
        } catch {
            return null;
        }

        return null;
    }

    function getPreferredTheme() {
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function getTheme() {
        return document.documentElement.dataset.theme === "dark"
            ? "dark"
            : "light";
    }

    function updateThemeMeta(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute("content", theme === "dark" ? DARK_COLOR : LIGHT_COLOR);
        }
    }

    function updateToggleButtons(theme) {
        const isDark = theme === "dark";

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            button.textContent = isDark ? "Light" : "Dark";
            button.setAttribute("aria-pressed", String(isDark));
            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        });
    }

    function applyTheme(theme, persist = false) {
        const normalized = theme === "dark" ? "dark" : "light";

        document.documentElement.dataset.theme = normalized;
        updateThemeMeta(normalized);
        updateToggleButtons(normalized);

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, normalized);
            } catch {
                // Keep the active theme even when storage is unavailable.
            }
        }
    }

    function bindToggles() {
        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            if (button.dataset.themeBound === "true") {
                return;
            }

            button.dataset.themeBound = "true";
            button.addEventListener("click", () => {
                applyTheme(getTheme() === "dark" ? "light" : "dark", true);
            });
        });

        updateToggleButtons(getTheme());
        updateThemeMeta(getTheme());
    }

    installRuntimeStyles();
    installToolSeo();

    const storedTheme = getStoredTheme();
    applyTheme(storedTheme || getPreferredTheme());

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindToggles, { once: true });
    } else {
        bindToggles();
    }

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", (event) => {
        if (!getStoredTheme()) {
            applyTheme(event.matches ? "dark" : "light");
        }
    });

    window.ToolsAstakulaTheme = {
        getTheme,
        applyTheme
    };
})();
