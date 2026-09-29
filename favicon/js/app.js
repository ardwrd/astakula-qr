const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
    "image/svg+xml"
]);

const OUTPUT_SPECS = [
    { name: "favicon-16x16.png", size: 16, label: "Browser · 16×16" },
    { name: "favicon-32x32.png", size: 32, label: "Browser · 32×32" },
    { name: "favicon-48x48.png", size: 48, label: "Browser · 48×48" },
    { name: "apple-touch-icon.png", size: 180, label: "Apple · 180×180" },
    { name: "android-chrome-192x192.png", size: 192, label: "Web app · 192×192" },
    { name: "android-chrome-512x512.png", size: 512, label: "Web app · 512×512" }
];

const ICO_SIZES = [16, 32, 48, 256];

const elements = {
    sourceInput: document.querySelector("#sourceInput"),
    dropZone: document.querySelector("#dropZone"),
    sourcePreviewPanel: document.querySelector("#sourcePreviewPanel"),
    sourcePreview: document.querySelector("#sourcePreview"),
    sourceName: document.querySelector("#sourceName"),
    sourceDetails: document.querySelector("#sourceDetails"),
    removeSourceButton: document.querySelector("#removeSourceButton"),

    fitSelect: document.querySelector("#fitSelect"),
    paddingInput: document.querySelector("#paddingInput"),
    paddingValue: document.querySelector("#paddingValue"),
    backgroundColor: document.querySelector("#backgroundColor"),
    backgroundValue: document.querySelector("#backgroundValue"),
    transparentToggle: document.querySelector("#transparentToggle"),
    backgroundField: document.querySelector(".background-field"),
    generateButton: document.querySelector("#generateButton"),
    resetSettingsButton: document.querySelector("#resetSettingsButton"),

    statusBox: document.querySelector("#statusBox"),
    resultSection: document.querySelector("#resultSection"),
    resultMeta: document.querySelector("#resultMeta"),
    preview16: document.querySelector("#preview16"),
    preview32: document.querySelector("#preview32"),
    preview180: document.querySelector("#preview180"),
    downloadIcoButton: document.querySelector("#downloadIcoButton"),
    downloadZipButton: document.querySelector("#downloadZipButton"),
    assetGrid: document.querySelector("#assetGrid"),
    snippetOutput: document.querySelector("#snippetOutput"),
    copySnippetButton: document.querySelector("#copySnippetButton")
};

let source = null;
let result = null;
let isGenerating = false;

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** index);
    const decimals = index === 0 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(decimals)} ${units[index]}`;
}

function setStatus(message, state = "neutral") {
    elements.statusBox.textContent = message;
    elements.statusBox.className = `status-box is-${state}`;
}

function isAcceptedImage(file) {
    if (!file) return false;
    if (ACCEPTED_TYPES.has(file.type)) return true;
    return /\.(png|jpe?g|webp|avif|svg)$/i.test(file.name || "");
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("The browser could not decode this image."));
        image.src = url;
    });
}

function cleanupSource() {
    if (source?.url) URL.revokeObjectURL(source.url);
    source = null;
}

function cleanupResult() {
    if (result?.assets) {
        result.assets.forEach((asset) => {
            if (asset.url) URL.revokeObjectURL(asset.url);
        });
    }
    if (result?.icoUrl) URL.revokeObjectURL(result.icoUrl);
    result = null;
    elements.resultSection.classList.add("hidden");
    elements.assetGrid.replaceChildren();
    elements.preview16.removeAttribute("src");
    elements.preview32.removeAttribute("src");
    elements.preview180.removeAttribute("src");
    elements.snippetOutput.value = "";
    elements.resultMeta.textContent = "Ready";
}

async function setSource(file) {
    if (isGenerating) return;
    if (!isAcceptedImage(file)) {
        setStatus("Choose a PNG, JPEG, WebP, AVIF, or SVG image.", "error");
        return;
    }
    if (file.size > MAX_FILE_SIZE) {
        setStatus("The source image must be 15 MB or smaller.", "error");
        return;
    }

    const url = URL.createObjectURL(file);

    try {
        const image = await loadImage(url);
        if (!image.naturalWidth || !image.naturalHeight) {
            throw new Error("The image has no readable dimensions.");
        }

        cleanupSource();
        cleanupResult();
        source = {
            file,
            url,
            width: image.naturalWidth,
            height: image.naturalHeight
        };

        elements.sourcePreview.src = url;
        elements.sourceName.textContent = file.name || "pasted-image";
        elements.sourceDetails.textContent = `${source.width} × ${source.height} · ${formatBytes(file.size)}`;
        elements.sourcePreviewPanel.classList.remove("hidden");
        elements.sourceInput.value = "";
        setStatus("Source image ready. Adjust the settings or generate the favicon package.", "success");
    } catch (error) {
        URL.revokeObjectURL(url);
        setStatus(error?.message || "Could not read this image.", "error");
    }
}

function removeSource() {
    if (isGenerating) return;
    cleanupSource();
    cleanupResult();
    elements.sourceInput.value = "";
    elements.sourcePreview.removeAttribute("src");
    elements.sourceName.textContent = "No file";
    elements.sourceDetails.textContent = "0 × 0 · 0 B";
    elements.sourcePreviewPanel.classList.add("hidden");
    setStatus("Choose an image to begin.", "neutral");
}

function resetSettings() {
    elements.fitSelect.value = "contain";
    elements.paddingInput.value = "8";
    elements.paddingValue.textContent = "8%";
    elements.backgroundColor.value = "#ffffff";
    elements.backgroundValue.textContent = "#ffffff";
    elements.transparentToggle.checked = true;
    updateBackgroundState();
    cleanupResult();
    setStatus(source ? "Settings reset. Generate the favicon package when ready." : "Choose an image to begin.", "neutral");
}

function updateBackgroundState() {
    const transparent = elements.transparentToggle.checked;
    elements.backgroundColor.disabled = transparent;
    elements.backgroundField.classList.toggle("is-disabled", transparent);
}

function markSettingsChanged() {
    cleanupResult();
    if (source) setStatus("Settings changed. Generate the favicon package again.", "neutral");
}

function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Could not render a PNG image."));
        }, "image/png");
    });
}

function drawImageToCanvas(image, size, settings) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Canvas is not available in this browser.");

    context.clearRect(0, 0, size, size);
    if (!settings.transparent) {
        context.fillStyle = settings.background;
        context.fillRect(0, 0, size, size);
    }

    const paddingPixels = size * (settings.padding / 100);
    const boxSize = Math.max(1, size - (paddingPixels * 2));
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    let drawWidth;
    let drawHeight;

    if (settings.fit === "cover") {
        if (sourceRatio >= 1) {
            drawHeight = boxSize;
            drawWidth = boxSize * sourceRatio;
        } else {
            drawWidth = boxSize;
            drawHeight = boxSize / sourceRatio;
        }
    } else if (sourceRatio >= 1) {
        drawWidth = boxSize;
        drawHeight = boxSize / sourceRatio;
    } else {
        drawHeight = boxSize;
        drawWidth = boxSize * sourceRatio;
    }

    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;

    context.save();
    context.beginPath();
    context.rect(paddingPixels, paddingPixels, boxSize, boxSize);
    context.clip();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, x, y, drawWidth, drawHeight);
    context.restore();

    return canvas;
}

async function renderPng(image, size, settings) {
    const canvas = drawImageToCanvas(image, size, settings);
    return canvasToBlob(canvas);
}

async function blobToBytes(blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

async function buildIco(entries) {
    const encoded = [];
    for (const entry of entries) {
        encoded.push({ size: entry.size, bytes: await blobToBytes(entry.blob) });
    }

    const directorySize = 6 + (16 * encoded.length);
    const payloadSize = encoded.reduce((sum, entry) => sum + entry.bytes.length, 0);
    const buffer = new ArrayBuffer(directorySize + payloadSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, encoded.length, true);

    let offset = directorySize;

    encoded.forEach((entry, index) => {
        const directoryOffset = 6 + (index * 16);
        const dimension = entry.size >= 256 ? 0 : entry.size;

        view.setUint8(directoryOffset, dimension);
        view.setUint8(directoryOffset + 1, dimension);
        view.setUint8(directoryOffset + 2, 0);
        view.setUint8(directoryOffset + 3, 0);
        view.setUint16(directoryOffset + 4, 1, true);
        view.setUint16(directoryOffset + 6, 32, true);
        view.setUint32(directoryOffset + 8, entry.bytes.length, true);
        view.setUint32(directoryOffset + 12, offset, true);

        bytes.set(entry.bytes, offset);
        offset += entry.bytes.length;
    });

    return new Blob([buffer], { type: "image/x-icon" });
}

function buildManifest() {
    return JSON.stringify({
        name: "Website",
        short_name: "Website",
        icons: [
            { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ],
        theme_color: elements.backgroundColor.value,
        background_color: elements.backgroundColor.value,
        display: "standalone"
    }, null, 2);
}

function buildSnippet() {
    return [
        '<link rel="icon" href="/favicon.ico" sizes="any">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
        '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">'
    ].join("\n");
}

function getSettings() {
    return {
        fit: elements.fitSelect.value,
        padding: Number(elements.paddingInput.value),
        transparent: elements.transparentToggle.checked,
        background: elements.backgroundColor.value
    };
}

function createAssetCard(asset) {
    const card = document.createElement("article");
    card.className = "asset-card";

    const preview = document.createElement("div");
    preview.className = "asset-preview";
    const image = document.createElement("img");
    image.src = asset.url;
    image.alt = "";
    preview.append(image);

    const copy = document.createElement("div");
    copy.className = "asset-copy";
    const name = document.createElement("strong");
    name.textContent = asset.name;
    name.title = asset.name;
    const meta = document.createElement("span");
    meta.textContent = `${asset.size}×${asset.size} · ${formatBytes(asset.blob.size)}`;
    const button = document.createElement("button");
    button.className = "brut-btn brut-btn--sm";
    button.type = "button";
    button.textContent = "Download";
    button.addEventListener("click", () => downloadBlob(asset.blob, asset.name));
    copy.append(name, meta, button);

    card.append(preview, copy);
    return card;
}

function renderResult() {
    elements.assetGrid.replaceChildren();
    result.assets.forEach((asset) => elements.assetGrid.append(createAssetCard(asset)));

    const bySize = new Map(result.assets.map((asset) => [asset.size, asset]));
    elements.preview16.src = bySize.get(16).url;
    elements.preview32.src = bySize.get(32).url;
    elements.preview180.src = bySize.get(180).url;
    elements.snippetOutput.value = result.snippet;

    const packageBytes = result.assets.reduce((sum, asset) => sum + asset.blob.size, 0) + result.ico.size;
    elements.resultMeta.textContent = `${result.assets.length + 3} files · ${formatBytes(packageBytes)}+`;
    elements.resultSection.classList.remove("hidden");
}

async function generateFavicons() {
    if (isGenerating) return;
    if (!source) {
        setStatus("Choose an image first.", "error");
        return;
    }

    cleanupResult();
    isGenerating = true;
    elements.generateButton.disabled = true;

    try {
        const settings = getSettings();
        setStatus("Rendering favicon sizes…", "working");
        const image = await loadImage(source.url);
        const generatedBySize = new Map();

        for (const size of [...new Set([...OUTPUT_SPECS.map((item) => item.size), ...ICO_SIZES])]) {
            generatedBySize.set(size, await renderPng(image, size, settings));
        }

        const assets = OUTPUT_SPECS.map((spec) => {
            const blob = generatedBySize.get(spec.size);
            return {
                ...spec,
                blob,
                url: URL.createObjectURL(blob)
            };
        });

        setStatus("Building favicon.ico…", "working");
        const ico = await buildIco(ICO_SIZES.map((size) => ({ size, blob: generatedBySize.get(size) })));
        const icoUrl = URL.createObjectURL(ico);
        const manifest = buildManifest();
        const snippet = buildSnippet();

        result = { assets, ico, icoUrl, manifest, snippet };
        renderResult();
        setStatus("Favicon package ready.", "success");
        elements.resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
        console.error(error);
        cleanupResult();
        setStatus(error?.message || "Could not generate the favicon package.", "error");
    } finally {
        isGenerating = false;
        elements.generateButton.disabled = false;
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadIco() {
    if (!result) {
        setStatus("Generate the favicon package first.", "error");
        return;
    }
    downloadBlob(result.ico, "favicon.ico");
}

async function downloadZip() {
    if (!result) {
        setStatus("Generate the favicon package first.", "error");
        return;
    }
    if (!window.JSZip) {
        setStatus("ZIP library did not load. Refresh the page and try again.", "error");
        return;
    }

    elements.downloadZipButton.disabled = true;
    try {
        setStatus("Building ZIP package…", "working");
        const zip = new window.JSZip();
        zip.file("favicon.ico", result.ico);
        result.assets.forEach((asset) => zip.file(asset.name, asset.blob));
        zip.file("site.webmanifest", result.manifest);
        zip.file("favicon-snippet.html", result.snippet);
        const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
        downloadBlob(blob, "favicon-package.zip");
        setStatus("Favicon package downloaded.", "success");
    } catch (error) {
        console.error(error);
        setStatus("Could not build the ZIP package.", "error");
    } finally {
        elements.downloadZipButton.disabled = false;
    }
}

async function copySnippet() {
    if (!result?.snippet) {
        setStatus("Generate the favicon package first.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(result.snippet);
        setStatus("HTML tags copied.", "success");
    } catch {
        elements.snippetOutput.select();
        document.execCommand("copy");
        setStatus("HTML tags copied.", "success");
    }
}

function getClipboardImage(data) {
    if (!data?.items) return null;
    for (const item of data.items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
            return item.getAsFile();
        }
    }
    return null;
}

function setDragging(active) {
    elements.dropZone.classList.toggle("is-dragging", active);
}

elements.sourceInput.addEventListener("change", () => {
    const file = elements.sourceInput.files?.[0];
    if (file) setSource(file);
});

elements.removeSourceButton.addEventListener("click", removeSource);
elements.generateButton.addEventListener("click", generateFavicons);
elements.resetSettingsButton.addEventListener("click", resetSettings);
elements.downloadIcoButton.addEventListener("click", downloadIco);
elements.downloadZipButton.addEventListener("click", downloadZip);
elements.copySnippetButton.addEventListener("click", copySnippet);

elements.paddingInput.addEventListener("input", () => {
    elements.paddingValue.textContent = `${elements.paddingInput.value}%`;
    markSettingsChanged();
});

elements.backgroundColor.addEventListener("input", () => {
    elements.backgroundValue.textContent = elements.backgroundColor.value.toLowerCase();
    markSettingsChanged();
});

elements.transparentToggle.addEventListener("change", () => {
    updateBackgroundState();
    markSettingsChanged();
});

elements.fitSelect.addEventListener("change", markSettingsChanged);

["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        setDragging(true);
    });
});

["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        setDragging(false);
    });
});

elements.dropZone.addEventListener("drop", (event) => {
    const file = [...(event.dataTransfer?.files || [])].find(isAcceptedImage);
    if (file) setSource(file);
    else setStatus("Drop a PNG, JPEG, WebP, AVIF, or SVG image.", "error");
});

document.addEventListener("paste", async (event) => {
    const file = getClipboardImage(event.clipboardData);
    if (!file) return;
    event.preventDefault();
    elements.dropZone.classList.add("is-pasting");
    try {
        await setSource(file);
    } finally {
        window.setTimeout(() => elements.dropZone.classList.remove("is-pasting"), 350);
    }
});

window.addEventListener("beforeunload", () => {
    cleanupSource();
    cleanupResult();
});

updateBackgroundState();
