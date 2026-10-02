const MAX_FILES = 20;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_DIMENSION = 12000;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
    imageInput: $("#imageInput"), dropZone: $("#dropZone"), queuePanel: $("#queuePanel"), queueMeta: $("#queueMeta"),
    fileQueue: $("#fileQueue"), clearFilesButton: $("#clearFilesButton"), statusBox: $("#statusBox"),
    processButton: $("#processButton"), resetSettingsButton: $("#resetSettingsButton"), workspaceActions: $("#workspaceActions"),
    resultsSection: $("#resultsSection"), resultsMeta: $("#resultsMeta"), resultsGrid: $("#resultsGrid"), downloadAllButton: $("#downloadAllButton"),
    compressFormat: $("#compressFormat"), compressQuality: $("#compressQuality"), compressQualityValue: $("#compressQualityValue"),
    resizeWidth: $("#resizeWidth"), resizeHeight: $("#resizeHeight"), resizePercent: $("#resizePercent"), resizeFormat: $("#resizeFormat"), preventUpscale: $("#preventUpscale"),
    cropScale: $("#cropScale"), cropScaleValue: $("#cropScaleValue"), cropX: $("#cropX"), cropXValue: $("#cropXValue"), cropY: $("#cropY"), cropYValue: $("#cropYValue"), cropFormat: $("#cropFormat"), cropPreview: $("#cropPreview"), cropPreviewNote: $("#cropPreviewNote"),
    convertFormat: $("#convertFormat"), convertQuality: $("#convertQuality"), convertQualityValue: $("#convertQualityValue"), jpegBackground: $("#jpegBackground"),
    optimizePreset: $("#optimizePreset"), optimizeMegapixels: $("#optimizeMegapixels"), optimizeFormat: $("#optimizeFormat"),
    infoGrid: $("#infoGrid")
};

const tabLabels = { compress: "Compress images", resize: "Resize images", crop: "Crop images", convert: "Convert images", optimize: "Optimize images", info: "Inspect images" };
let activeTab = "compress";
let cropRatio = "free";
let files = [];
let results = [];
let isProcessing = false;
let queueUrls = new Map();
let cropPreviewResource = null;
let infoRenderToken = 0;

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** index);
    return `${value.toFixed(index === 0 ? 0 : value >= 10 ? 1 : 2)} ${units[index]}`;
}

function setStatus(message, state = "neutral") {
    elements.statusBox.textContent = message;
    elements.statusBox.className = `status-box is-${state}`;
}

function fileKey(file) { return `${file.name}:${file.size}:${file.lastModified}`; }
function baseName(name) { return name.replace(/\.[^.]+$/, "").trim() || "image"; }
function isAcceptedFile(file) { return ACCEPTED_TYPES.has(file.type); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a || 1; }
function mimeLabel(type) { return (type || "unknown").replace("image/", "").toUpperCase(); }

function extensionForType(type) {
    if (type === "image/jpeg") return "jpg";
    if (type === "image/png") return "png";
    if (type === "image/avif") return "avif";
    return "webp";
}

function requestedType(file, value) { return value === "same" ? file.type : value; }
function outputFilename(file, width, height, type, suffix) { return `${baseName(file.name)}-${suffix}-${width}x${height}.${extensionForType(type)}`; }

function validateDimension(value, label) {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_DIMENSION) throw new Error(`${label} must be between 1 and ${MAX_DIMENSION.toLocaleString()} px.`);
    return parsed;
}

function revokeResults() {
    for (const result of results) if (result.url) URL.revokeObjectURL(result.url);
    results = [];
}

function clearResults() {
    revokeResults();
    elements.resultsGrid.replaceChildren();
    elements.resultsSection.classList.add("hidden");
    elements.resultsMeta.textContent = "0 ready";
}

function queueUrl(file) {
    const key = fileKey(file);
    if (!queueUrls.has(key)) queueUrls.set(key, URL.createObjectURL(file));
    return queueUrls.get(key);
}

function revokeQueueUrl(file) {
    const key = fileKey(file);
    const url = queueUrls.get(key);
    if (url) URL.revokeObjectURL(url);
    queueUrls.delete(key);
}

function renderQueue() {
    elements.fileQueue.replaceChildren();
    elements.queueMeta.textContent = `${files.length} ${files.length === 1 ? "file" : "files"}`;
    elements.queuePanel.classList.toggle("hidden", files.length === 0);

    files.forEach((file) => {
        const item = document.createElement("div");
        item.className = "queue-item";
        const thumb = document.createElement("img");
        thumb.className = "queue-thumb";
        thumb.src = queueUrl(file);
        thumb.alt = "";
        const copy = document.createElement("div");
        copy.className = "queue-copy";
        const name = document.createElement("strong");
        name.textContent = file.name;
        name.title = file.name;
        const meta = document.createElement("span");
        meta.textContent = `${mimeLabel(file.type)} · ${formatBytes(file.size)}`;
        copy.append(name, meta);
        const remove = document.createElement("button");
        remove.className = "queue-remove";
        remove.type = "button";
        remove.setAttribute("aria-label", `Remove ${file.name}`);
        remove.textContent = "×";
        remove.addEventListener("click", () => removeFile(file));
        item.append(thumb, copy, remove);
        elements.fileQueue.append(item);
    });
}

function afterFilesChanged() {
    clearResults();
    renderQueue();
    if (activeTab === "info") renderInfo();
    refreshCropPreview();
}

function addFiles(incoming) {
    if (isProcessing) return;
    const existing = new Set(files.map(fileKey));
    let added = 0, rejected = 0, oversized = 0, duplicates = 0;
    for (const file of incoming) {
        if (files.length >= MAX_FILES) break;
        if (!isAcceptedFile(file)) { rejected += 1; continue; }
        if (file.size > MAX_FILE_SIZE) { oversized += 1; continue; }
        if (existing.has(fileKey(file))) { duplicates += 1; continue; }
        files.push(file); existing.add(fileKey(file)); added += 1;
    }
    elements.imageInput.value = "";
    afterFilesChanged();
    if (added) {
        const notes = [];
        if (rejected) notes.push(`${rejected} unsupported`);
        if (oversized) notes.push(`${oversized} over 25 MB`);
        if (duplicates) notes.push(`${duplicates} duplicate`);
        setStatus(`${files.length} ${files.length === 1 ? "image" : "images"} ready${notes.length ? ` (${notes.join(", ")})` : ""}.`);
    } else if (oversized) setStatus("No images added. Each file must be 25 MB or smaller.", "error");
    else if (rejected) setStatus("No supported images found. Use PNG, JPEG, WebP, or AVIF.", "error");
    else if (duplicates) setStatus("Those images are already in the list.");
}

function removeFile(file) {
    if (isProcessing) return;
    files = files.filter((item) => item !== file);
    revokeQueueUrl(file);
    afterFilesChanged();
    setStatus(files.length ? `${files.length} ${files.length === 1 ? "image" : "images"} ready.` : "Choose one or more images to begin.");
}

function clearFiles() {
    if (isProcessing) return;
    files.forEach(revokeQueueUrl);
    files = [];
    closeCropPreviewResource();
    afterFilesChanged();
    setStatus("Choose one or more images to begin.");
}

async function decodeImage(file) {
    if ("createImageBitmap" in window) {
        try {
            const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
            return { image: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close?.() };
        } catch { /* fallback */ }
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`Could not decode ${file.name}.`));
        image.src = url;
    });
    return { image, width: image.naturalWidth, height: image.naturalHeight, cleanup: () => URL.revokeObjectURL(url) };
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) return reject(new Error(`${mimeLabel(type)} export is not supported by this browser.`));
            if (blob.type && blob.type !== type) return reject(new Error(`${mimeLabel(type)} export is not supported by this browser.`));
            resolve(blob);
        }, type, quality);
    });
}

function calculateResize(width, height, maxWidth, maxHeight, percent, preventUpscale) {
    let scale = Math.max(0.01, percent / 100);
    if (maxWidth) scale = Math.min(scale, maxWidth / width);
    if (maxHeight) scale = Math.min(scale, maxHeight / height);
    if (preventUpscale) scale = Math.min(1, scale);
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function parseRatio(value, width, height) {
    if (value === "free") return width / height;
    const [a, b] = value.split(":").map(Number);
    return a / b;
}

function calculateCropRect(width, height) {
    const targetRatio = parseRatio(cropRatio, width, height);
    const sourceRatio = width / height;
    let cropWidth = width;
    let cropHeight = height;
    if (sourceRatio > targetRatio) cropWidth = height * targetRatio;
    else cropHeight = width / targetRatio;

    const scale = Number(elements.cropScale.value) / 100;
    cropWidth *= scale;
    cropHeight *= scale;
    const roomX = Math.max(0, width - cropWidth);
    const roomY = Math.max(0, height - cropHeight);
    const x = roomX * (Number(elements.cropX.value) / 100);
    const y = roomY * (Number(elements.cropY.value) / 100);
    return { x, y, width: cropWidth, height: cropHeight };
}

function optimizeSettings() {
    const preset = elements.optimizePreset.value;
    if (preset === "small") return { quality: .66, suffix: "optimized-small" };
    if (preset === "quality") return { quality: .9, suffix: "optimized-hq" };
    return { quality: .8, suffix: "optimized" };
}

function megapixelSize(width, height, maxMP) {
    if (!maxMP || width * height <= maxMP * 1_000_000) return { width, height };
    const scale = Math.sqrt((maxMP * 1_000_000) / (width * height));
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function drawToCanvas(decoded, source, output, type, background = "#ffffff") {
    const canvas = document.createElement("canvas");
    canvas.width = output.width;
    canvas.height = output.height;
    const context = canvas.getContext("2d", { alpha: type !== "image/jpeg" });
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (type === "image/jpeg") { context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.drawImage(decoded.image, source.x, source.y, source.width, source.height, 0, 0, output.width, output.height);
    return canvas;
}

async function processFile(file) {
    const decoded = await decodeImage(file);
    try {
        const source = { x: 0, y: 0, width: decoded.width, height: decoded.height };
        let output = { width: decoded.width, height: decoded.height };
        let type = file.type;
        let quality = .9;
        let suffix = activeTab;
        let background = "#ffffff";

        if (activeTab === "compress") {
            type = requestedType(file, elements.compressFormat.value);
            quality = Number(elements.compressQuality.value) / 100;
        } else if (activeTab === "resize") {
            const maxWidth = validateDimension(elements.resizeWidth.value, "Max width");
            const maxHeight = validateDimension(elements.resizeHeight.value, "Max height");
            const percent = clamp(Number(elements.resizePercent.value) || 100, 1, 400);
            output = calculateResize(decoded.width, decoded.height, maxWidth, maxHeight, percent, elements.preventUpscale.checked);
            type = requestedType(file, elements.resizeFormat.value);
            quality = .9;
        } else if (activeTab === "crop") {
            const crop = calculateCropRect(decoded.width, decoded.height);
            Object.assign(source, crop);
            output = { width: Math.max(1, Math.round(crop.width)), height: Math.max(1, Math.round(crop.height)) };
            type = requestedType(file, elements.cropFormat.value);
            quality = .9;
            suffix = `crop-${cropRatio.replace(":", "x")}`;
        } else if (activeTab === "convert") {
            type = elements.convertFormat.value;
            quality = Number(elements.convertQuality.value) / 100;
            background = elements.jpegBackground.value;
        } else if (activeTab === "optimize") {
            const opt = optimizeSettings();
            type = elements.optimizeFormat.value;
            quality = opt.quality;
            suffix = opt.suffix;
            output = megapixelSize(decoded.width, decoded.height, Number(elements.optimizeMegapixels.value));
        }

        if (type === "image/png") quality = undefined;
        const canvas = drawToCanvas(decoded, source, output, type, background);
        const blob = await canvasToBlob(canvas, type, quality);
        return {
            file, blob, url: URL.createObjectURL(blob), sourceWidth: decoded.width, sourceHeight: decoded.height,
            outputWidth: output.width, outputHeight: output.height, type,
            filename: outputFilename(file, output.width, output.height, type, suffix)
        };
    } finally { decoded.cleanup(); }
}

function createStat(label, value) {
    const box = document.createElement("div"); box.className = "stat-box";
    const span = document.createElement("span"); span.textContent = label;
    const strong = document.createElement("strong"); strong.textContent = value;
    box.append(span, strong); return box;
}

function downloadResult(result) {
    const link = document.createElement("a"); link.href = result.url; link.download = result.filename;
    document.body.append(link); link.click(); link.remove();
}

function renderResults() {
    elements.resultsGrid.replaceChildren();
    results.forEach((result, index) => {
        const card = document.createElement("article"); card.className = "result-card";
        const heading = document.createElement("div"); heading.className = "result-card-heading";
        const copy = document.createElement("div");
        const name = document.createElement("strong"); name.textContent = result.filename; name.title = result.filename;
        const number = document.createElement("span"); number.textContent = `IMAGE ${String(index + 1).padStart(2, "0")}`;
        copy.append(name, number); heading.append(copy);
        const preview = document.createElement("div"); preview.className = "result-preview";
        const image = document.createElement("img"); image.src = result.url; image.alt = `Processed preview of ${result.file.name}`; preview.append(image);
        const stats = document.createElement("div"); stats.className = "result-stats";
        stats.append(createStat("Original", `${result.sourceWidth}×${result.sourceHeight} · ${formatBytes(result.file.size)}`), createStat("Output", `${result.outputWidth}×${result.outputHeight} · ${formatBytes(result.blob.size)}`));
        const difference = result.file.size ? ((result.blob.size - result.file.size) / result.file.size) * 100 : 0;
        const saving = document.createElement("p"); saving.className = `result-saving ${difference <= 0 ? "is-smaller" : "is-larger"}`;
        saving.textContent = difference <= 0 ? `${Math.abs(difference).toFixed(1)}% smaller than original` : `${difference.toFixed(1)}% larger than original`;
        const downloadWrap = document.createElement("div"); downloadWrap.className = "result-download";
        const button = document.createElement("button"); button.className = "brut-btn brut-btn--primary"; button.type = "button"; button.textContent = "Download image"; button.addEventListener("click", () => downloadResult(result));
        downloadWrap.append(button); card.append(heading, preview, stats, saving, downloadWrap); elements.resultsGrid.append(card);
    });
    elements.resultsMeta.textContent = `${results.length} ${results.length === 1 ? "image" : "images"} ready`;
    elements.resultsSection.classList.toggle("hidden", results.length === 0);
}

async function processImages() {
    if (isProcessing || activeTab === "info") return;
    if (!files.length) return setStatus("Choose at least one image first.", "error");
    if (activeTab === "resize") {
        try { validateDimension(elements.resizeWidth.value, "Max width"); validateDimension(elements.resizeHeight.value, "Max height"); }
        catch (error) { return setStatus(error.message, "error"); }
    }

    isProcessing = true;
    elements.processButton.disabled = true;
    elements.clearFilesButton.disabled = true;
    elements.downloadAllButton.disabled = true;
    clearResults();
    const processed = [], failed = [];
    try {
        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            setStatus(`${tabLabels[activeTab]} — ${index + 1} of ${files.length}: ${file.name}`, "working");
            try { processed.push(await processFile(file)); }
            catch (error) { failed.push({ file, message: error.message || "Unknown processing error." }); }
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        results = processed; renderResults();
        if (processed.length && !failed.length) setStatus(`${processed.length} ${processed.length === 1 ? "image is" : "images are"} ready to download.`, "success");
        else if (processed.length) setStatus(`${processed.length} processed, ${failed.length} failed. ${failed[0].message}`, "error");
        else setStatus(failed[0]?.message || "No images could be processed in this browser.", "error");
    } finally {
        isProcessing = false; elements.processButton.disabled = false; elements.clearFilesButton.disabled = false; elements.downloadAllButton.disabled = results.length === 0;
    }
}

async function downloadAll() {
    for (const result of results) { downloadResult(result); await new Promise((resolve) => setTimeout(resolve, 160)); }
}

function setTab(name) {
    activeTab = name;
    $$(".tool-tab").forEach((button) => { const active = button.dataset.tab === name; button.classList.toggle("is-active", active); button.setAttribute("aria-selected", String(active)); });
    $$(".tool-panel").forEach((panel) => { const active = panel.dataset.panel === name; panel.hidden = !active; panel.classList.toggle("is-active", active); });
    clearResults();
    elements.processButton.textContent = tabLabels[name];
    elements.processButton.hidden = name === "info";
    elements.resetSettingsButton.textContent = name === "info" ? "Refresh info" : "Reset current tool";
    if (name === "info") renderInfo();
    if (name === "crop") refreshCropPreview();
    setStatus(files.length ? `${files.length} ${files.length === 1 ? "image" : "images"} ready for ${name}.` : "Choose one or more images to begin.");
}

function resetCurrentTool() {
    if (activeTab === "compress") { elements.compressFormat.value = "image/webp"; elements.compressQuality.value = "82"; }
    else if (activeTab === "resize") { elements.resizeWidth.value = ""; elements.resizeHeight.value = ""; elements.resizePercent.value = "100"; elements.resizeFormat.value = "same"; elements.preventUpscale.checked = true; }
    else if (activeTab === "crop") { cropRatio = "free"; elements.cropScale.value = "80"; elements.cropX.value = "50"; elements.cropY.value = "50"; elements.cropFormat.value = "same"; $$("#cropPresets button").forEach((b) => b.classList.toggle("is-active", b.dataset.ratio === "free")); }
    else if (activeTab === "convert") { elements.convertFormat.value = "image/webp"; elements.convertQuality.value = "90"; elements.jpegBackground.value = "#ffffff"; }
    else if (activeTab === "optimize") { elements.optimizePreset.value = "balanced"; elements.optimizeMegapixels.value = "8"; elements.optimizeFormat.value = "image/webp"; }
    else if (activeTab === "info") { renderInfo(); return; }
    syncLabels(); clearResults(); refreshCropPreview(); setStatus(files.length ? `${files.length} images ready.` : "Choose one or more images to begin.");
}

function syncLabels() {
    elements.compressQualityValue.textContent = `${elements.compressQuality.value}%`;
    elements.convertQualityValue.textContent = `${elements.convertQuality.value}%`;
    elements.cropScaleValue.textContent = `${elements.cropScale.value}%`;
    elements.cropXValue.textContent = `${elements.cropX.value}%`;
    elements.cropYValue.textContent = `${elements.cropY.value}%`;
}

function closeCropPreviewResource() {
    cropPreviewResource?.cleanup?.();
    cropPreviewResource = null;
}

async function refreshCropPreview() {
    if (activeTab !== "crop") return;
    const canvas = elements.cropPreview;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!files.length) { closeCropPreviewResource(); elements.cropPreviewNote.textContent = "Choose an image to preview the crop."; return; }
    const first = files[0];
    if (!cropPreviewResource || cropPreviewResource.file !== first) {
        closeCropPreviewResource();
        try { const decoded = await decodeImage(first); cropPreviewResource = { ...decoded, file: first }; }
        catch { elements.cropPreviewNote.textContent = "Could not preview this image."; return; }
    }
    const decoded = cropPreviewResource;
    const fit = Math.min(canvas.width / decoded.width, canvas.height / decoded.height);
    const drawW = decoded.width * fit, drawH = decoded.height * fit;
    const dx = (canvas.width - drawW) / 2, dy = (canvas.height - drawH) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.image, dx, dy, drawW, drawH);
    const crop = calculateCropRect(decoded.width, decoded.height);
    const cx = dx + crop.x * fit, cy = dy + crop.y * fit, cw = crop.width * fit, ch = crop.height * fit;
    context.save();
    context.fillStyle = "rgba(0,0,0,.52)";
    context.fillRect(dx, dy, drawW, Math.max(0, cy - dy));
    context.fillRect(dx, cy + ch, drawW, Math.max(0, dy + drawH - (cy + ch)));
    context.fillRect(dx, cy, Math.max(0, cx - dx), ch);
    context.fillRect(cx + cw, cy, Math.max(0, dx + drawW - (cx + cw)), ch);
    context.strokeStyle = "#ff5b2d"; context.lineWidth = 3; context.strokeRect(cx, cy, cw, ch);
    context.restore();
    elements.cropPreviewNote.textContent = `${first.name} · crop ${Math.round(crop.width)}×${Math.round(crop.height)} px`;
}

async function renderInfo() {
    const token = ++infoRenderToken;
    elements.infoGrid.replaceChildren();
    if (!files.length) { const p = document.createElement("p"); p.className = "empty-copy"; p.textContent = "Choose one or more images to inspect them."; elements.infoGrid.append(p); return; }
    for (const file of files) {
        try {
            const decoded = await decodeImage(file);
            if (token !== infoRenderToken) { decoded.cleanup(); return; }
            const d = gcd(decoded.width, decoded.height);
            const ratio = `${Math.round(decoded.width / d)}:${Math.round(decoded.height / d)}`;
            const mp = (decoded.width * decoded.height / 1_000_000).toFixed(2);
            const orientation = decoded.width === decoded.height ? "Square" : decoded.width > decoded.height ? "Landscape" : "Portrait";
            const card = document.createElement("article"); card.className = "image-info-card";
            const h = document.createElement("h4"); h.textContent = file.name; h.title = file.name;
            const dl = document.createElement("dl"); dl.className = "image-info-list";
            const rows = [["Type", mimeLabel(file.type)], ["File size", formatBytes(file.size)], ["Dimensions", `${decoded.width} × ${decoded.height}`], ["Aspect ratio", ratio], ["Megapixels", `${mp} MP`], ["Orientation", orientation], ["Modified", new Date(file.lastModified).toLocaleString()]];
            rows.forEach(([label, value]) => { const dt = document.createElement("dt"); dt.textContent = label; const dd = document.createElement("dd"); dd.textContent = value; dl.append(dt, dd); });
            card.append(h, dl); elements.infoGrid.append(card); decoded.cleanup();
        } catch {
            const p = document.createElement("p"); p.className = "empty-copy"; p.textContent = `${file.name}: could not decode.`; elements.infoGrid.append(p);
        }
    }
}

function handlePreset(button) {
    const [w, h] = button.dataset.preset.split("x");
    elements.resizeWidth.value = w; elements.resizeHeight.value = h; elements.resizePercent.value = "400";
    setStatus(`Resize preset ${w}×${h} selected. Aspect ratio will be preserved.`);
}

function bindEvents() {
    elements.imageInput.addEventListener("change", () => addFiles(elements.imageInput.files));
    elements.clearFilesButton.addEventListener("click", clearFiles);
    elements.processButton.addEventListener("click", processImages);
    elements.downloadAllButton.addEventListener("click", downloadAll);
    elements.resetSettingsButton.addEventListener("click", resetCurrentTool);

    elements.dropZone.addEventListener("dragover", (event) => { event.preventDefault(); elements.dropZone.classList.add("is-dragging"); });
    elements.dropZone.addEventListener("dragleave", () => elements.dropZone.classList.remove("is-dragging"));
    elements.dropZone.addEventListener("drop", (event) => { event.preventDefault(); elements.dropZone.classList.remove("is-dragging"); addFiles(event.dataTransfer.files); });
    document.addEventListener("paste", (event) => {
        const pasted = [...(event.clipboardData?.files || [])].filter((file) => file.type.startsWith("image/"));
        if (pasted.length) { event.preventDefault(); addFiles(pasted); }
    });

    $$(".tool-tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
    $$("#resizePresets button").forEach((button) => button.addEventListener("click", () => handlePreset(button)));
    $$("#cropPresets button").forEach((button) => button.addEventListener("click", () => {
        cropRatio = button.dataset.ratio;
        $$("#cropPresets button").forEach((item) => item.classList.toggle("is-active", item === button));
        refreshCropPreview();
    }));

    [elements.compressQuality, elements.convertQuality, elements.cropScale, elements.cropX, elements.cropY].forEach((input) => input.addEventListener("input", () => { syncLabels(); if ([elements.cropScale, elements.cropX, elements.cropY].includes(input)) refreshCropPreview(); }));
}

window.addEventListener("beforeunload", () => { files.forEach(revokeQueueUrl); revokeResults(); closeCropPreviewResource(); });

syncLabels();
bindEvents();
renderQueue();
setTab("compress");
