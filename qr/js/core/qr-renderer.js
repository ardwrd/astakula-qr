/**
 * Astakula QR Tools
 * QR Renderer
 *
 * Responsibilities:
 * - Generate QR matrix from payload
 * - Render QR Code to Canvas
 * - Render QR Code to SVG
 * - Provide PNG Blob for exporter
 * - Provide SVG element/string for exporter
 *
 * Dependency:
 * qrcode-generator
 *
 * Expected global:
 * window.qrcode
 */

class QRRenderer {
    constructor({
        container,
        size = 280,
        foreground = "#111111",
        background = "#ffffff",
        errorCorrection = "M",
        margin = 4
    } = {}) {
        this.container =
            this.resolveElement(container);

        this.size =
            this.validateSize(size);

        this.foreground =
            this.validateColor(
                foreground,
                "#111111"
            );

        this.background =
            this.validateColor(
                background,
                "#ffffff"
            );

        this.errorCorrection =
            this.validateErrorCorrection(
                errorCorrection
            );

        this.margin =
            this.validateMargin(margin);

        this.canvas = null;
        this.svgElement = null;

        this.qrModel = null;

        this.payload = "";
    }

    /**
     * Resolve renderer container.
     */
    resolveElement(target) {
        if (target instanceof HTMLElement) {
            return target;
        }

        if (typeof target === "string") {
            const element =
                document.querySelector(
                    target
                );

            if (!element) {
                throw new Error(
                    `QRRenderer container "${target}" was not found.`
                );
            }

            return element;
        }

        throw new TypeError(
            "QRRenderer container must be an HTMLElement or CSS selector."
        );
    }

    /**
     * Validate QR output size.
     */
    validateSize(value) {
        const size =
            Number(value);

        if (
            !Number.isFinite(size) ||
            size < 64 ||
            size > 4096
        ) {
            throw new RangeError(
                "QR size must be between 64 and 4096 pixels."
            );
        }

        return Math.round(size);
    }

    /**
     * Validate quiet-zone margin.
     *
     * Margin is measured in QR modules.
     */
    validateMargin(value) {
        const margin =
            Number(value);

        if (
            !Number.isInteger(margin) ||
            margin < 0 ||
            margin > 32
        ) {
            throw new RangeError(
                "QR margin must be an integer between 0 and 32."
            );
        }

        return margin;
    }

    /**
     * Validate error correction level.
     *
     * Supported:
     *
     * L = ~7%
     * M = ~15%
     * Q = ~25%
     * H = ~30%
     */
    validateErrorCorrection(value) {
        const level =
            String(value || "M")
                .toUpperCase();

        const supported = [
            "L",
            "M",
            "Q",
            "H"
        ];

        if (!supported.includes(level)) {
            throw new Error(
                `Unsupported QR error correction level "${level}".`
            );
        }

        return level;
    }

    /**
     * Validate CSS color value.
     */
    validateColor(
        value,
        fallback
    ) {
        const color =
            String(value || "").trim();

        if (!color) {
            return fallback;
        }

        if (
            typeof CSS !== "undefined" &&
            typeof CSS.supports ===
                "function" &&
            !CSS.supports(
                "color",
                color
            )
        ) {
            throw new Error(
                `Invalid QR color "${color}".`
            );
        }

        return color;
    }

    /**
     * Ensure QR library is available.
     */
    getQrLibrary() {
        const library =
            globalThis.qrcode;

        if (
            typeof library !==
            "function"
        ) {
            throw new Error(
                "QR library is not loaded. Load qrcode-generator before app.js."
            );
        }

        /*
         * qrcode-generator defaults may use
         * byte-oriented string encoding.
         *
         * Enable UTF-8 when the installed build
         * exposes the UTF-8 encoder.
         *
         * This is important for:
         *
         * - Indonesian text
         * - accented characters
         * - emoji
         * - vCard/event descriptions
         */
        if (
            library.stringToBytesFuncs &&
            typeof library
                .stringToBytesFuncs[
                "UTF-8"
            ] === "function"
        ) {
            library.stringToBytes =
                library
                    .stringToBytesFuncs[
                    "UTF-8"
                ];
        }

        return library;
    }

    /**
     * Generate QR matrix/model.
     */
    createQrModel(payload) {
        const library =
            this.getQrLibrary();

        try {
            /*
             * typeNumber = 0
             *
             * Let the library automatically
             * determine QR version.
             */
            const qr =
                library(
                    0,
                    this.errorCorrection
                );

            qr.addData(
                payload,
                "Byte"
            );

            qr.make();

            return qr;

        } catch (error) {
            console.error(
                "QR matrix generation failed:",
                error
            );

            const message =
                String(
                    error?.message ||
                    error ||
                    ""
                );

            if (
                message
                    .toLowerCase()
                    .includes("overflow")
            ) {
                throw new Error(
                    "Data terlalu besar untuk dimasukkan ke QR Code dengan konfigurasi saat ini."
                );
            }

            throw new Error(
                "Gagal membuat QR Code dari data yang diberikan."
            );
        }
    }

    /**
     * Render QR Code.
     *
     * Called by app.js:
     *
     * qrRenderer.render(payload)
     */
    render(payload) {
        const value =
            String(payload ?? "");

        if (!value) {
            throw new Error(
                "QR payload cannot be empty."
            );
        }

        this.clear();

        this.payload =
            value;

        this.qrModel =
            this.createQrModel(
                value
            );

        this.canvas =
            this.createCanvas(
                this.qrModel
            );

        this.svgElement =
            this.createSvg(
                this.qrModel
            );

        this.container.appendChild(
            this.canvas
        );

        /*
         * SVG is kept in DOM as an export
         * representation, but is not displayed.
         *
         * Canvas remains the visible preview.
         */
        this.svgElement.hidden =
            true;

        this.svgElement.setAttribute(
            "aria-hidden",
            "true"
        );

        this.container.appendChild(
            this.svgElement
        );

        return {
            canvas:
                this.canvas,

            svg:
                this.svgElement,

            payload:
                this.payload
        };
    }

    /**
     * Create visible Canvas QR.
     */
    createCanvas(qrModel) {
        const moduleCount =
            qrModel.getModuleCount();

        const totalModules =
            moduleCount +
            this.margin * 2;

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.className =
            "qr-renderer-canvas";

        canvas.width =
            this.size;

        canvas.height =
            this.size;

        canvas.setAttribute(
            "role",
            "img"
        );

        canvas.setAttribute(
            "aria-label",
            "Generated QR Code"
        );

        const context =
            canvas.getContext(
                "2d"
            );

        if (!context) {
            throw new Error(
                "Canvas 2D rendering is not supported by this browser."
            );
        }

        /*
         * QR codes should never use
         * image smoothing.
         */
        context.imageSmoothingEnabled =
            false;

        /*
         * Paint background first.
         */
        context.fillStyle =
            this.background;

        context.fillRect(
            0,
            0,
            this.size,
            this.size
        );

        context.fillStyle =
            this.foreground;

        const scale =
            this.size /
            totalModules;

        /*
         * Instead of drawing using fractional
         * module sizes directly, calculate
         * rounded pixel boundaries.
         *
         * This avoids tiny gaps between modules.
         */
        for (
            let row = 0;
            row < moduleCount;
            row++
        ) {
            for (
                let column = 0;
                column < moduleCount;
                column++
            ) {
                if (
                    !qrModel.isDark(
                        row,
                        column
                    )
                ) {
                    continue;
                }

                const x0 =
                    Math.round(
                        (
                            column +
                            this.margin
                        ) *
                        scale
                    );

                const y0 =
                    Math.round(
                        (
                            row +
                            this.margin
                        ) *
                        scale
                    );

                const x1 =
                    Math.round(
                        (
                            column +
                            this.margin +
                            1
                        ) *
                        scale
                    );

                const y1 =
                    Math.round(
                        (
                            row +
                            this.margin +
                            1
                        ) *
                        scale
                    );

                context.fillRect(
                    x0,
                    y0,
                    x1 - x0,
                    y1 - y0
                );
            }
        }

        return canvas;
    }

    /**
     * Create SVG QR representation.
     *
     * SVG uses QR module units instead of
     * pixels so it remains infinitely scalable.
     */
    createSvg(qrModel) {
        const namespace =
            "http://www.w3.org/2000/svg";

        const moduleCount =
            qrModel.getModuleCount();

        const totalModules =
            moduleCount +
            this.margin * 2;

        const svg =
            document.createElementNS(
                namespace,
                "svg"
            );

        svg.classList.add(
            "qr-renderer-svg"
        );

        svg.setAttribute(
            "xmlns",
            namespace
        );

        svg.setAttribute(
            "version",
            "1.1"
        );

        svg.setAttribute(
            "width",
            String(this.size)
        );

        svg.setAttribute(
            "height",
            String(this.size)
        );

        svg.setAttribute(
            "viewBox",
            `0 0 ${totalModules} ${totalModules}`
        );

        svg.setAttribute(
            "shape-rendering",
            "crispEdges"
        );

        /*
         * SVG background.
         */
        const backgroundRect =
            document.createElementNS(
                namespace,
                "rect"
            );

        backgroundRect.setAttribute(
            "x",
            "0"
        );

        backgroundRect.setAttribute(
            "y",
            "0"
        );

        backgroundRect.setAttribute(
            "width",
            String(totalModules)
        );

        backgroundRect.setAttribute(
            "height",
            String(totalModules)
        );

        backgroundRect.setAttribute(
            "fill",
            this.background
        );

        svg.appendChild(
            backgroundRect
        );

        /*
         * Instead of adding one <rect>
         * for every dark QR module,
         * combine consecutive modules
         * into one SVG path.
         *
         * This keeps SVG export significantly
         * smaller for large payloads.
         */
        let pathData = "";

        for (
            let row = 0;
            row < moduleCount;
            row++
        ) {
            let runStart = -1;

            for (
                let column = 0;
                column <= moduleCount;
                column++
            ) {
                const dark =
                    column <
                        moduleCount &&
                    qrModel.isDark(
                        row,
                        column
                    );

                if (
                    dark &&
                    runStart === -1
                ) {
                    runStart =
                        column;

                    continue;
                }

                if (
                    !dark &&
                    runStart !== -1
                ) {
                    const width =
                        column -
                        runStart;

                    const x =
                        runStart +
                        this.margin;

                    const y =
                        row +
                        this.margin;

                    pathData +=
                        `M${x} ${y}` +
                        `h${width}` +
                        "v1" +
                        `h-${width}` +
                        "z";

                    runStart = -1;
                }
            }
        }

        const modulesPath =
            document.createElementNS(
                namespace,
                "path"
            );

        modulesPath.setAttribute(
            "d",
            pathData
        );

        modulesPath.setAttribute(
            "fill",
            this.foreground
        );

        svg.appendChild(
            modulesPath
        );

        return svg;
    }

    /**
     * Clear rendered QR.
     *
     * Called by app.js when:
     *
     * - generator changes
     * - form resets
     * - a new QR is rendered
     */
    clear() {
        this.container.replaceChildren();

        this.canvas = null;
        this.svgElement = null;
        this.qrModel = null;

        this.payload = "";
    }

    /**
     * Return current Canvas.
     *
     * Used by exporter.js fallback.
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Return current SVG DOM element.
     *
     * Used by exporter.js fallback.
     */
    getSvgElement() {
        return this.svgElement;
    }

    /**
     * Return PNG Blob.
     *
     * Preferred API used by exporter.js.
     */
    getPngBlob() {
        if (!this.canvas) {
            return Promise.reject(
                new Error(
                    "No QR Code has been rendered yet."
                )
            );
        }

        return new Promise(
            (resolve, reject) => {
                this.canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(
                                new Error(
                                    "Failed to create PNG image."
                                )
                            );

                            return;
                        }

                        resolve(blob);
                    },
                    "image/png",
                    1
                );
            }
        );
    }

    /**
     * Return serialized SVG string.
     *
     * Preferred API used by exporter.js.
     */
    getSvgString() {
        if (!this.svgElement) {
            throw new Error(
                "No QR Code has been rendered yet."
            );
        }

        const clone =
            this.svgElement.cloneNode(
                true
            );

        /*
         * Remove DOM-only presentation
         * attributes from exported SVG.
         */
        clone.hidden = false;

        clone.removeAttribute(
            "hidden"
        );

        clone.removeAttribute(
            "aria-hidden"
        );

        clone.classList.remove(
            "qr-renderer-svg"
        );

        if (
            !clone.getAttribute(
                "xmlns"
            )
        ) {
            clone.setAttribute(
                "xmlns",
                "http://www.w3.org/2000/svg"
            );
        }

        const serializer =
            new XMLSerializer();

        return serializer
            .serializeToString(
                clone
            );
    }

    /**
     * Return current payload.
     */
    getPayload() {
        return this.payload;
    }

    /**
     * Return renderer container.
     *
     * Exporter can use this as fallback.
     */
    getContainer() {
        return this.container;
    }

    /**
     * Return whether a QR is currently rendered.
     */
    hasRenderedQr() {
        return Boolean(
            this.qrModel &&
            this.canvas &&
            this.svgElement
        );
    }
}

export default QRRenderer;
