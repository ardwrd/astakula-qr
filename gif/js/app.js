import { GIFEncoder, quantize, applyPalette } from "https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm";

const MAX_FRAMES = 30;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_TOTAL_SIZE = 180 * 1024 * 1024;
const MAX_DIMENSION = 1200;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

const elements = {
    imageInput: document.querySelector("#imageInput"),
    dropZone: document.querySelector("#dropZone"),
    queuePanel: document.querySelector("#queuePanel"),
    queueMeta: document.querySelector("#queueMeta"),
    frameQueue: document.querySelector("#frameQueue"),
    clearFramesButton: document.querySelector("#clearFramesButton"),
    delayInput: document.querySelector("#delayInput"),
    colorsSelect: document.querySelector("#colorsSelect"),
    widthInput: document.querySelector("#widthInput"),
    heightInput: document.querySelector("#heightInput"),
    fitSelect: document.querySelector("#fitSelect"),
    backgroundInput: document.querySelector("#backgroundInput"),
    backgroundValue: document.querySelector("#backgroundValue"),
    loopToggle: document.querySelector("#loopToggle"),
    generateButton: document.querySelector("#generateButton"),
    resetSettingsButton: document.querySelector("#resetSettingsButton"),
    statusBox: document.querySelector("#statusBox"),
    resultSection: document.querySelector("#resultSection"),
    resultMeta: document.querySelector("#resultMeta"),
    gifPreview: document.querySelector("#gifPreview"),
    resultFrames: document.querySelector("#resultFrames"),
    resultDimensions: document.querySelector("#resultDimensions"),
    resultSize: document.querySelector("#resultSize"),
    resultDuration: document.querySelector("#resultDuration"),
    downloadButton: document.querySelector("#downloadButton")
};

let frames = [];
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

function formatDuration(ms) {
    if (ms < 1000) return `${ms} ms`;
    const seconds = ms / 1000;
    return `${seconds.toFixed(seconds >= 10 ? 1 : 2)} s`;
}

function setStatus(message, state = "neutral") {
    elements.statusBox.textContent = message;
    elements.statusBox.className = `status-box is-${state}`;
}

function fileKey(file) {
    return `${file.name}:${file.size}:${file.lastModified}`;
}

function isAcceptedImage(file) {
    if (!file) return false;
    if (ACCEPTED_TYPES.has(file.type)) return true;
    return /\.(png|jpe?g|webp|avif)$/i.test(file.name);
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("The browser could not decode this image."));
        image.src = url;
    });
}

function clearResult() {
    if (result?.url) URL.revokeObjectURL(result.url);
    result = null;
    elements.gifPreview.removeAttribute("src");
    elements.resultSection.classList.add("hidden");
    elements.resultMeta.textContent = "Ready";
    elements.resultFrames.textContent = "0";
    elements.resultDimensions.textContent = "0 × 0";
    elements.resultSize.textContent = "0 B";
    elements.resultDuration.textContent = "0 s";
}

function cleanupFrame(frame) {
    if (frame?.url) URL.revokeObjectURL(frame.url);
}

async function inspectFile(file) {
    const url = URL.createObjectURL(file);
    try {
        const image = await loadImage(url);
        if (!image.naturalWidth || !image.naturalHeight) {
            throw new Error("The image has no readable dimensions.");
        }
        return {
            id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            file,
            url,
            width: image.naturalWidth,
            height: image.naturalHeight
        };
    } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
    }
}

async function addFiles(fileList) {
    if (isGenerating) return;
    const incoming = [...fileList];
    if (!incoming.length) return;

    const existing = new Set(frames.map(({ file }) => fileKey(file)));
    let rejected = 0;
    let duplicates = 0;
    let added = 0;

    for (const file of incoming) {
        if (frames.length >= MAX_FRAMES) {
            rejected += 1;
            continue;
        }
        if (!isAcceptedImage(file) || file.size > MAX_FILE_SIZE) {
            rejected += 1;
            continue;
        }
        if (existing.has(fileKey(file))) {
            duplicates += 1;
            continue;
        }

        const currentTotal = frames.reduce((sum, frame) => sum + frame.file.size, 0);
        if (currentTotal + file.size > MAX_TOTAL_SIZE) {
            rejected += 1;
            continue;
        }

        try {
            const frame = await inspectFile(file);
            frames.push(frame);
            existing.add(fileKey(file));
            added += 1;
        } catch {
            rejected += 1;
        }
    }

    elements.imageInput.value = "";
    clearResult();
    renderQueue();

    if (!added && !frames.length) {
        setStatus("No images were added. Use PNG, JPEG, WebP, or AVIF files up to 15 MB each.", "error");
        return;
    }

    const notes = [];
    if (rejected) notes.push(`${rejected} rejected`);
    if (duplicates) notes.push(`${duplicates} duplicate`);
    const suffix = notes.length ? ` · ${notes.join(", ")}` : "";
    setStatus(`${frames.length} ${frames.length === 1 ? "frame" : "frames"} ready${suffix}.`, frames.length >= 2 ? "success" : "neutral");
}

function renderQueue() {
    elements.frameQueue.replaceChildren();
    elements.queuePanel.classList.toggle("hidden", frames.length === 0);

    const total = frames.reduce((sum, frame) => sum + frame.file.size, 0);
    elements.queueMeta.textContent = frames.length
        ? `${frames.length} ${frames.length === 1 ? "frame" : "frames"} · ${formatBytes(total)}`
        : "0 frames";

    frames.forEach((frame, index) => {
        const item = document.createElement("div");
        item.className = "frame-item";

        const thumb = document.createElement("img");
        thumb.className = "frame-thumb";
        thumb.src = frame.url;
        thumb.alt = "";

        const copy = document.createElement("div");
        copy.className = "frame-copy";
        const name = document.createElement("strong");
        name.textContent = `${String(index + 1).padStart(2, "0")} · ${frame.file.name}`;
        name.title = frame.file.name;
        const meta = document.createElement("span");
        meta.textContent = `${frame.width} × ${frame.height} · ${formatBytes(frame.file.size)}`;
        copy.append(name, meta);

        const actions = document.createElement("div");
        actions.className = "frame-actions";

        const up = document.createElement("button");
        up.className = "brut-btn brut-btn--sm";
        up.type = "button";
        up.textContent = "↑";
        up.setAttribute("aria-label", `Move ${frame.file.name} up`);
        up.disabled = index === 0;
        up.addEventListener("click", () => moveFrame(index, index - 1));

        const down = document.createElement("button");
        down.className = "brut-btn brut-btn--sm";
        down.type = "button";
        down.textContent = "↓";
        down.setAttribute("aria-label", `Move ${frame.file.name} down`);
        down.disabled = index === frames.length - 1;
        down.addEventListener("click", () => moveFrame(index, index + 1));

        const remove = document.createElement("button");
        remove.className = "brut-btn brut-btn--sm";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => removeFrame(index));

        actions.append(up, down, remove);
        item.append(thumb, copy, actions);
        elements.frameQueue.append(item);
    });
}

function moveFrame(from, to) {
    if (isGenerating || to < 0 || to >= frames.length) return;
    const [frame] = frames.splice(from, 1);
    frames.splice(to, 0, frame);
    clearResult();
    renderQueue();
    setStatus("Frame order updated.", "neutral");
}

function removeFrame(index) {
    if (isGenerating) return;
    const [frame] = frames.splice(index, 1);
    cleanupFrame(frame);
    clearResult();
    renderQueue();
    setStatus(frames.length >= 2 ? `${frames.length} frames ready.` : "Add at least two images to create a GIF.", "neutral");
}

function clearFrames() {
    if (isGenerating) return;
    frames.forEach(cleanupFrame);
    frames = [];
    elements.imageInput.value = "";
    clearResult();
    renderQueue();
    setStatus("Add at least two images to begin.", "neutral");
}

function resetSettings() {
    elements.delayInput.value = "250";
    elements.colorsSelect.value = "128";
    elements.widthInput.value = "";
    elements.heightInput.value = "";
    elements.fitSelect.value = "contain";
    elements.backgroundInput.value = "#ffffff";
    elements.backgroundValue.textContent = "#ffffff";
    elements.loopToggle.checked = true;
    clearResult();
    setStatus(frames.length >= 2 ? `${frames.length} frames ready.` : "Add at least two images to begin.", "neutral");
}

function getOutputDimensions() {
    if (!frames.length) throw new Error("Add images first.");

    const first = frames[0];
    const rawWidth = elements.widthInput.value.trim();
    const rawHeight = elements.heightInput.value.trim();
    let width = rawWidth ? Number(rawWidth) : null;
    let height = rawHeight ? Number(rawHeight) : null;

    if (width !== null && (!Number.isInteger(width) || width < 1 || width > MAX_DIMENSION)) {
        throw new Error(`Width must be between 1 and ${MAX_DIMENSION} px.`);
    }
    if (height !== null && (!Number.isInteger(height) || height < 1 || height > MAX_DIMENSION)) {
        throw new Error(`Height must be between 1 and ${MAX_DIMENSION} px.`);
    }

    const ratio = first.width / first.height;

    if (!width && !height) {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(first.width, first.height));
        width = Math.max(1, Math.round(first.width * scale));
        height = Math.max(1, Math.round(first.height * scale));
    } else if (width && !height) {
        height = Math.max(1, Math.round(width / ratio));
        if (height > MAX_DIMENSION) throw new Error(`Derived height exceeds ${MAX_DIMENSION} px.`);
    } else if (!width && height) {
        width = Math.max(1, Math.round(height * ratio));
        if (width > MAX_DIMENSION) throw new Error(`Derived width exceeds ${MAX_DIMENSION} px.`);
    }

    return { width, height };
}

function getSettings() {
    const delay = Number(elements.delayInput.value);
    if (!Number.isInteger(delay) || delay < 20 || delay > 10000) {
        throw new Error("Frame delay must be between 20 and 10000 ms.");
    }

    return {
        ...getOutputDimensions(),
        delay,
        colors: Number(elements.colorsSelect.value),
        fit: elements.fitSelect.value,
        background: elements.backgroundInput.value,
        repeat: elements.loopToggle.checked ? 0 : -1
    };
}

function drawFrame(context, image, width, height, fit, background) {
    context.save();
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const scaleX = width / image.naturalWidth;
    const scaleY = height / image.naturalHeight;
    const scale = fit === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, x, y, drawWidth, drawHeight);
    context.restore();
}

function nextPaint() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function generateGif() {
    if (isGenerating) return;
    if (frames.length < 2) {
        setStatus("Add at least two images to create an animated GIF.", "error");
        return;
    }

    let settings;
    try {
        settings = getSettings();
    } catch (error) {
        setStatus(error.message, "error");
        return;
    }

    clearResult();
    isGenerating = true;
    elements.generateButton.disabled = true;
    elements.clearFramesButton.disabled = true;

    try {
        const canvas = document.createElement("canvas");
        canvas.width = settings.width;
        canvas.height = settings.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas is not available in this browser.");

        const gif = GIFEncoder();

        for (let index = 0; index < frames.length; index += 1) {
            const frame = frames[index];
            setStatus(`Encoding frame ${index + 1} of ${frames.length}…`, "working");
            await nextPaint();

            const image = await loadImage(frame.url);
            drawFrame(context, image, settings.width, settings.height, settings.fit, settings.background);
            const rgba = context.getImageData(0, 0, settings.width, settings.height).data;
            const palette = quantize(rgba, settings.colors);
            const indexed = applyPalette(rgba, palette);

            gif.writeFrame(indexed, settings.width, settings.height, {
                palette,
                delay: settings.delay,
                repeat: settings.repeat
            });
        }

        gif.finish();
        const bytes = gif.bytes();
        const blob = new Blob([bytes], { type: "image/gif" });
        const url = URL.createObjectURL(blob);
        const filename = `astakula-${Date.now()}.gif`;

        result = { blob, url, filename };
        elements.gifPreview.src = url;
        elements.resultFrames.textContent = String(frames.length);
        elements.resultDimensions.textContent = `${settings.width} × ${settings.height}`;
        elements.resultSize.textContent = formatBytes(blob.size);
        elements.resultDuration.textContent = formatDuration(settings.delay * frames.length);
        elements.resultMeta.textContent = settings.repeat === 0 ? "Loop forever" : "Play once";
        elements.resultSection.classList.remove("hidden");
        setStatus(`GIF created from ${frames.length} frames.`, "success");
        elements.resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
        console.error(error);
        setStatus(error?.message || "Could not create the GIF.", "error");
    } finally {
        isGenerating = false;
        elements.generateButton.disabled = false;
        elements.clearFramesButton.disabled = false;
    }
}

function downloadResult() {
    if (!result) {
        setStatus("Create a GIF first.", "error");
        return;
    }

    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.filename;
    document.body.append(link);
    link.click();
    link.remove();
}

function setupDropZone() {
    ["dragenter", "dragover"].forEach((eventName) => {
        elements.dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            if (!isGenerating) elements.dropZone.classList.add("is-dragging");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        elements.dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            elements.dropZone.classList.remove("is-dragging");
        });
    });

    elements.dropZone.addEventListener("drop", (event) => {
        if (!isGenerating) addFiles(event.dataTransfer?.files || []);
    });
}

elements.imageInput.addEventListener("change", () => addFiles(elements.imageInput.files || []));
elements.clearFramesButton.addEventListener("click", clearFrames);
elements.generateButton.addEventListener("click", generateGif);
elements.resetSettingsButton.addEventListener("click", resetSettings);
elements.downloadButton.addEventListener("click", downloadResult);

elements.backgroundInput.addEventListener("input", () => {
    elements.backgroundValue.textContent = elements.backgroundInput.value.toLowerCase();
    clearResult();
});

[
    elements.delayInput,
    elements.colorsSelect,
    elements.widthInput,
    elements.heightInput,
    elements.fitSelect,
    elements.loopToggle
].forEach((control) => control.addEventListener("change", clearResult));

document.addEventListener("paste", async (event) => {
    if (isGenerating) return;
    const files = [...(event.clipboardData?.files || [])].filter(isAcceptedImage);
    if (!files.length) return;

    event.preventDefault();
    elements.dropZone.classList.add("is-pasting");
    try {
        await addFiles(files);
    } finally {
        window.setTimeout(() => elements.dropZone.classList.remove("is-pasting"), 350);
    }
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        generateGif();
    }
});

window.addEventListener("beforeunload", () => {
    frames.forEach(cleanupFrame);
    if (result?.url) URL.revokeObjectURL(result.url);
});

setupDropZone();
renderQueue();
