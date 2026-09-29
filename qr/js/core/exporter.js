/**
 * Astakula QR Tools
 * QR Exporter
 *
 * Responsibilities:
 * - Export rendered QR Code as PNG
 * - Export rendered QR Code as SVG
 * - Handle browser downloads
 * - Normalize filenames
 *
 * Expected QRRenderer interface:
 *
 * Preferred:
 *   getPngBlob()
 *   getSvgString()
 *
 * Fallback:
 *   getCanvas()
 *   getSvgElement()
 */

class Exporter {
    constructor({
        qrRenderer
    } = {}) {
        if (!qrRenderer) {
            throw new TypeError(
                "Exporter requires a QRRenderer instance."
            );
        }

        this.qrRenderer =
            qrRenderer;
    }

    /**
     * Download current QR Code as PNG.
     *
     * Compatible with app.js:
     *
     * await exporter.downloadPng(
     *     "astakula-qr-url.png"
     * );
     */
    async downloadPng(
        filename = "qr-code.png"
    ) {
        const normalizedFilename =
            this.normalizeFilename(
                filename,
                "png"
            );

        const blob =
            await this.getPngBlob();

        if (!(blob instanceof Blob)) {
            throw new Error(
                "Failed to create PNG export."
            );
        }

        this.downloadBlob(
            blob,
            normalizedFilename
        );

        return blob;
    }

    /**
     * Download current QR Code as SVG.
     *
     * Compatible with app.js:
     *
     * await exporter.downloadSvg(
     *     "astakula-qr-url.svg"
     * );
     */
    async downloadSvg(
        filename = "qr-code.svg"
    ) {
        const normalizedFilename =
            this.normalizeFilename(
                filename,
                "svg"
            );

        const svgString =
            await this.getSvgString();

        if (
            !svgString ||
            typeof svgString !== "string"
        ) {
            throw new Error(
                "Failed to create SVG export."
            );
        }

        const blob =
            new Blob(
                [svgString],
                {
                    type:
                        "image/svg+xml;charset=utf-8"
                }
            );

        this.downloadBlob(
            blob,
            normalizedFilename
        );

        return blob;
    }

    /**
     * Get PNG Blob from QRRenderer.
     *
     * Preferred renderer API:
     *
     * qrRenderer.getPngBlob()
     *
     * Fallback:
     *
     * qrRenderer.getCanvas()
     */
    async getPngBlob() {
        /**
         * Preferred implementation.
         */
        if (
            typeof this.qrRenderer
                .getPngBlob ===
            "function"
        ) {
            const blob =
                await this.qrRenderer
                    .getPngBlob();

            if (blob instanceof Blob) {
                return blob;
            }
        }

        /**
         * Canvas fallback.
         */
        if (
            typeof this.qrRenderer
                .getCanvas ===
            "function"
        ) {
            const canvas =
                this.qrRenderer
                    .getCanvas();

            if (
                canvas instanceof
                HTMLCanvasElement
            ) {
                return this.canvasToBlob(
                    canvas
                );
            }
        }

        /**
         * Last attempt:
         * search renderer container for canvas.
         */
        const canvas =
            this.findCanvas();

        if (canvas) {
            return this.canvasToBlob(
                canvas
            );
        }

        throw new Error(
            "PNG export is unavailable because no QR canvas was found."
        );
    }

    /**
     * Convert Canvas into PNG Blob.
     */
    canvasToBlob(canvas) {
        return new Promise(
            (resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(
                                new Error(
                                    "Browser failed to create PNG image."
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
     * Get SVG markup from QRRenderer.
     *
     * Preferred:
     *
     * qrRenderer.getSvgString()
     *
     * Fallback:
     *
     * qrRenderer.getSvgElement()
     */
    async getSvgString() {
        /**
         * Preferred implementation.
         */
        if (
            typeof this.qrRenderer
                .getSvgString ===
            "function"
        ) {
            const svg =
                await this.qrRenderer
                    .getSvgString();

            if (
                typeof svg === "string" &&
                svg.trim()
            ) {
                return this.prepareSvgString(
                    svg
                );
            }
        }

        /**
         * SVG element fallback.
         */
        if (
            typeof this.qrRenderer
                .getSvgElement ===
            "function"
        ) {
            const svgElement =
                this.qrRenderer
                    .getSvgElement();

            if (
                svgElement instanceof
                SVGElement
            ) {
                return this.serializeSvg(
                    svgElement
                );
            }
        }

        /**
         * Last attempt:
         * search QR renderer container.
         */
        const svgElement =
            this.findSvgElement();

        if (svgElement) {
            return this.serializeSvg(
                svgElement
            );
        }

        throw new Error(
            "SVG export is unavailable because no SVG QR representation was found."
        );
    }

    /**
     * Serialize an SVG DOM node.
     */
    serializeSvg(svgElement) {
        const clone =
            svgElement.cloneNode(true);

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

        if (
            !clone.getAttribute(
                "xmlns:xlink"
            )
        ) {
            clone.setAttribute(
                "xmlns:xlink",
                "http://www.w3.org/1999/xlink"
            );
        }

        const serializer =
            new XMLSerializer();

        const svg =
            serializer.serializeToString(
                clone
            );

        return this.prepareSvgString(
            svg
        );
    }

    /**
     * Make sure SVG output contains
     * valid XML/SVG metadata.
     */
    prepareSvgString(svg) {
        let value =
            String(svg).trim();

        if (
            !value.includes(
                'xmlns="http://www.w3.org/2000/svg"'
            )
        ) {
            value =
                value.replace(
                    "<svg",
                    '<svg xmlns="http://www.w3.org/2000/svg"'
                );
        }

        if (
            !value.startsWith(
                "<?xml"
            )
        ) {
            value =
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                value;
        }

        return value;
    }

    /**
     * Find Canvas directly from QRRenderer container.
     */
    findCanvas() {
        const container =
            this.getRendererContainer();

        if (!container) {
            return null;
        }

        return container.querySelector(
            "canvas"
        );
    }

    /**
     * Find SVG directly from QRRenderer container.
     */
    findSvgElement() {
        const container =
            this.getRendererContainer();

        if (!container) {
            return null;
        }

        return container.querySelector(
            "svg"
        );
    }

    /**
     * Resolve container exposed
     * by QRRenderer.
     */
    getRendererContainer() {
        if (
            this.qrRenderer.container
            instanceof HTMLElement
        ) {
            return this.qrRenderer
                .container;
        }

        if (
            typeof this.qrRenderer
                .getContainer ===
            "function"
        ) {
            const container =
                this.qrRenderer
                    .getContainer();

            if (
                container instanceof
                HTMLElement
            ) {
                return container;
            }
        }

        return null;
    }

    /**
     * Trigger browser download
     * using an object URL.
     */
    downloadBlob(
        blob,
        filename
    ) {
        if (!(blob instanceof Blob)) {
            throw new TypeError(
                "Download data must be a Blob."
            );
        }

        const objectUrl =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            objectUrl;

        link.download =
            filename;

        link.style.display =
            "none";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        /**
         * Do not revoke immediately.
         * Some browsers need a short delay
         * after the click event.
         */
        window.setTimeout(
            () => {
                URL.revokeObjectURL(
                    objectUrl
                );
            },
            1000
        );
    }

    /**
     * Normalize and sanitize export filename.
     */
    normalizeFilename(
        filename,
        extension
    ) {
        const safeExtension =
            String(extension)
                .toLowerCase()
                .replace(
                    /[^a-z0-9]/g,
                    ""
                );

        let value =
            String(
                filename ||
                `qr-code.${safeExtension}`
            )
                .trim();

        /**
         * Remove characters invalid on
         * Windows/macOS/Linux filenames.
         */
        value =
            value.replace(
                /[<>:"/\\|?*\u0000-\u001F]/g,
                "-"
            );

        /**
         * Avoid repeated spaces.
         */
        value =
            value.replace(
                /\s+/g,
                "-"
            );

        /**
         * Avoid repeated dashes.
         */
        value =
            value.replace(
                /-+/g,
                "-"
            );

        /**
         * Remove leading/trailing dots,
         * spaces and dashes.
         */
        value =
            value.replace(
                /^[.\s-]+|[.\s-]+$/g,
                ""
            );

        if (!value) {
            value =
                "qr-code";
        }

        const extensionPattern =
            new RegExp(
                `\\.${safeExtension}$`,
                "i"
            );

        if (
            !extensionPattern.test(
                value
            )
        ) {
            /**
             * Remove another known image
             * extension before applying the
             * requested extension.
             */
            value =
                value.replace(
                    /\.(png|svg)$/i,
                    ""
                );

            value +=
                `.${safeExtension}`;
        }

        return value;
    }
}

export default Exporter;
