(() => {
    const STORAGE_KEY = "tools-astakula-theme";
    const LEGACY_KEY = "tools-astakula-json-theme";
    const DARK_COLOR = "#101214";
    const LIGHT_COLOR = "#f3f0e8";

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
