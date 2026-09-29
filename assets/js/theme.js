(() => {
    const STORAGE_KEY = "tools-astakula-theme";
    const LEGACY_KEY = "tools-astakula-json-theme";
    const DARK_COLOR = "#101214";
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

    function installResponsiveTypographyFix() {
        if (document.getElementById("tools-astakula-responsive-type")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "tools-astakula-responsive-type";
        style.textContent = `
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

    installResponsiveTypographyFix();
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
