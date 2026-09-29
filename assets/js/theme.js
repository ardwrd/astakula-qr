(() => {
    const STORAGE_KEY = "tools-astakula-theme";
    const LEGACY_KEY = "tools-astakula-json-theme";
    const DARK_COLOR = "#171717";
    const LIGHT_COLOR = "#f3f0e8";

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
