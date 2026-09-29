const MAX_FILES = 20;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_DIMENSION = 12000;
const ACCEPTED_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif"
]);

const elements = {
    imageInput: document.querySelector("#imageInput"),
    dropZone: document.querySelector("#dropZone"),
    queuePanel: document.querySelector("#queuePanel"),
    queueMeta: document.querySelector("#queueMeta"),
    fileQueue: document.querySelector("#fileQueue"),
    clearFilesButton: document.querySelector("#clearFilesButton"),
    formatSelect: document.querySelector("#formatSelect"),
    qualityInput: document.querySelector("#qualityInput"),
    qualityValue: document.querySelector("#qualityValue"),
    maxWidthInput: document.querySelector("#maxWidthInput"),
    maxHeightInput: document.querySelector("#maxHeightInput"),
    processButton: document.querySelector("#processButton"),
    resetSettingsButton: document.querySelector("#resetSettingsButton"),
    statusBox: document.querySelector("#statusBox"),
    resultsSection: document.querySelector("#resultsSection"),
    resultsMeta: document.querySelector("#resultsMeta"),
    resultsGrid: document.querySelector("#resultsGrid"),
    downloadAllButton: document.querySelector("#downloadAllButton")
};

let files = [];
let results = [];
let isProcessing = false;

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

function fileKey(file) {
    return `${file.name}:${file.size}:${file.lastModified}`;
}

function isAcceptedFile(file) {
    return ACCEPTED_TYPES.has(file.type);
}

function validateDimension(value, label) {
    if (!value) return null;

    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_DIMENSION) {
        throw new Error(`${label} must be between 1 and ${MAX_DIMENSION.toLocaleString()} px.`);
    }

    return parsed;
}

function extensionForType(type) {
    if (type === "image/jpeg") return "jpg";
    if (type === "image/png") return "png";
    return "webp";
}

function baseName(filename) {
    const withoutExtension = filename.replace(/\.[^.]+$/, "").trim();
    return withoutExtension || "image";
}

function outputFilename(file, width, height, type) {
    return `${baseName(file.name)}-${width}x${height}.${extensionForType(type)}`;
}

function revokeResults() {
    results.forEach((result) => {
        if (result.url) URL.revokeObjectURL(result.url);
    });
    results = [];
}

function clearResults() {
    revokeResults();
    elements.resultsGrid.replaceChildren();
    elements.resultsSection.classList.add("hidden");
    elements.resultsMeta.textContent = "0 ready";
}

function renderQueue() {
    elements.fileQueue.replaceChildren();
    elements.queueMeta.textContent = `${files.length} ${files.length === 1 ? "file" : "files"}`;
    elements.queuePanel.classList.toggle("hidden", files.length === 0);

    files.forEach((file) => {
        const item = document.createElement("div");
        item.className = "queue-item";

        const name = document.createElement("strong");
        name.textContent = file.name;
        name.title = file.name;

        const meta = document.createElement("span");
        meta.textContent = formatBytes(file.size);

        item.append(name, meta);
        elements.fileQueue.append(item);
    });
}

function addFiles(incomingFiles) {
    if (isProcessing) return;

    const existingKeys = new Set(files.map(fileKey));
    let rejectedType = 0;
    let rejectedSize = 0;
    let duplicates = 0;
    let added = 0;

    for (const file of incomingFiles) {
        if (files.length >= MAX_FILES) break;

        if (!isAcceptedFile(file)) {
            rejectedType += 1;
            continue;
        }

        if (file.size > MAX_FILE_SIZE) {
            rejectedSize += 1;
            continue;
        }

        const key = fileKey(file);
        if (existingKeys.has(key)) {
            duplicates += 1;
            continue;
        }

        files.push(file);
        existingKeys.add(key);
        added += 1;
    }

    elements.imageInput.value = "";
    clearResults();
    renderQueue();

    if (files.length >= MAX_FILES && incomingFiles.length > added) {
        setStatus(`Added up to the ${MAX_FILES}-image limit.`, "neutral");
        return;
    }

    if (added > 0) {
        const notes = [];
        if (rejectedType) notes.push(`${rejectedType} unsupported`);
        if (rejectedSize) notes.push(`${rejectedSize} over 25 MB`);
        if (duplicates) notes.push(`${duplicates} duplicate`);

        setStatus(
            `${files.length} ${files.length === 1 ? "image" : "images"} ready${notes.length ? ` (${notes.join(", ")})` : ""}.`,
            "neutral"
        );
        return;
    }

    if (rejectedSize) {
        setStatus("No images added. Each file must be 25 MB or smaller.", "error");
    } else if (rejectedType) {
        setStatus("No supported image files found. Use PNG, JPEG, WebP, or AVIF.", "error");
    } else if (duplicates) {
        setStatus("Those images are already in the list.", "neutral");
    }
}

function updateQualityState() {
    const isPng = elements.formatSelect.value === "image/png";
    elements.qualityInput.disabled = isPng;
    elements.qualityValue.textContent = isPng ? "lossless" : `${elements.qualityInput.value}%`;
}

function resetSettings() {
    elements.formatSelect.value = "image/webp";
    elements.qualityInput.value = "85";
    elements.maxWidthInput.value = "";
    elements.maxHeightInput.value = "";
    updateQualityState();
    clearResults();
    setStatus(files.length ? `${files.length} ${files.length === 1 ? "image" : "images"} ready.` : "Choose one or more images to begin.", "neutral");
}

async function decodeImage(file) {
    if ("createImageBitmap" in window) {
        try {
            const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
            return {
                image: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                cleanup() {
                    bitmap.close?.();
                }
            };
        } catch {
            // Fall back to a normal image element below.
        }
    }

    const url = URL.createObjectURL(file);
    const image = new Image();

    try {
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error(`Could not decode ${file.name}.`));
            image.src = url;
        });

        return {
            image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            cleanup() {
                URL.revokeObjectURL(url);
            }
        };
    } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
    }
}

function calculateOutputSize(width, height, maxWidth, maxHeight) {
    const widthScale = maxWidth ? maxWidth / width : 1;
    const heightScale = maxHeight ? maxHeight / height : 1;
    const scale = Math.min(1, widthScale, heightScale);

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale))
    };
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error(`Your browser could not export ${type.replace("image/", "").toUpperCase()}.`));
                return;
            }

            if (blob.type && blob.type !== type) {
                reject(new Error(`${type.replace("image/", "").toUpperCase()} export is not supported by this browser.`));
                return;
            }

            resolve(blob);
        }, type, quality);
    });
}

async function processFile(file, settings) {
    const decoded = await decodeImage(file);

    try {
        if (!decoded.width || !decoded.height) {
            throw new Error(`${file.name} has invalid dimensions.`);
        }

        const outputSize = calculateOutputSize(
            decoded.width,
            decoded.height,
            settings.maxWidth,
            settings.maxHeight
        );

        const canvas = document.createElement("canvas");
        canvas.width = outputSize.width;
        canvas.height = outputSize.height;

        const context = canvas.getContext("2d", { alpha: settings.type !== "image/jpeg" });
        if (!context) {
            throw new Error("Canvas is not available in this browser.");
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        if (settings.type === "image/jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.drawImage(decoded.image, 0, 0, canvas.width, canvas.height);

        const blob = await canvasToBlob(canvas, settings.type, settings.quality);
        const url = URL.createObjectURL(blob);

        return {
            file,
            blob,
            url,
            sourceWidth: decoded.width,
            sourceHeight: decoded.height,
            outputWidth: outputSize.width,
            outputHeight: outputSize.height,
            filename: outputFilename(file, outputSize.width, outputSize.height, settings.type),
            type: settings.type
        };
    } finally {
        decoded.cleanup();
    }
}

function createStat(label, value) {
    const box = document.createElement("div");
    box.className = "stat-box";

    const labelElement = document.createElement("span");
    labelElement.textContent = label;

    const valueElement = document.createElement("strong");
    valueElement.textContent = value;

    box.append(labelElement, valueElement);
    return box;
}

function downloadResult(result) {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.filename;
    document.body.append(link);
    link.click();
    link.remove();
}

function renderResults() {
    elements.resultsGrid.replaceChildren();

    results.forEach((result, index) => {
        const card = document.createElement("article");
        card.className = "result-card";

        const heading = document.createElement("div");
        heading.className = "result-card-heading";

        const headingCopy = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = result.filename;
        name.title = result.filename;
        const number = document.createElement("span");
        number.textContent = `IMAGE ${String(index + 1).padStart(2, "0")}`;
        headingCopy.append(name, number);
        heading.append(headingCopy);

        const preview = document.createElement("div");
        preview.className = "result-preview";
        const image = document.createElement("img");
        image.src = result.url;
        image.alt = `Processed preview of ${result.file.name}`;
        preview.append(image);

        const stats = document.createElement("div");
        stats.className = "result-stats";
        stats.append(
            createStat("Original", `${result.sourceWidth}×${result.sourceHeight} · ${formatBytes(result.file.size)}`),
            createStat("Output", `${result.outputWidth}×${result.outputHeight} · ${formatBytes(result.blob.size)}`)
        );

        const difference = result.file.size > 0
            ? ((result.blob.size - result.file.size) / result.file.size) * 100
            : 0;
        const saving = document.createElement("p");
        saving.className = `result-saving ${difference <= 0 ? "is-smaller" : "is-larger"}`;
        saving.textContent = difference <= 0
            ? `${Math.abs(difference).toFixed(1)}% smaller than the original`
            : `${difference.toFixed(1)}% larger than the original`;

        const downloadWrap = document.createElement("div");
        downloadWrap.className = "result-download";
        const downloadButton = document.createElement("button");
        downloadButton.className = "brut-btn brut-btn--primary";
        downloadButton.type = "button";
        downloadButton.textContent = "Download image";
        downloadButton.addEventListener("click", () => downloadResult(result));
        downloadWrap.append(downloadButton);

        card.append(heading, preview, stats, saving, downloadWrap);
        elements.resultsGrid.append(card);
    });

    elements.resultsMeta.textContent = `${results.length} ${results.length === 1 ? "image" : "images"} ready`;
    elements.resultsSection.classList.toggle("hidden", results.length === 0);
}

async function processImages() {
    if (isProcessing) return;

    if (files.length === 0) {
        setStatus("Choose at least one image first.", "error");
        return;
    }

    let maxWidth;
    let maxHeight;

    try {
        maxWidth = validateDimension(elements.maxWidthInput.value, "Max width");
        maxHeight = validateDimension(elements.maxHeightInput.value, "Max height");
    } catch (error) {
        setStatus(error.message, "error");
        return;
    }

    const settings = {
        type: elements.formatSelect.value,
        quality: Number(elements.qualityInput.value) / 100,
        maxWidth,
        maxHeight
    };

    isProcessing = true;
    elements.processButton.disabled = true;
    elements.clearFilesButton.disabled = true;
    elements.downloadAllButton.disabled = true;
    clearResults();

    const processed = [];
    const failed = [];

    try {
        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            setStatus(`Processing ${index + 1} of ${files.length}: ${file.name}`, "working");

            try {
                const result = await processFile(file, settings);
                processed.push(result);
            } catch (error) {
                failed.push({ file, message: error.message || "Unknown processing error." });
            }

            await new Promise((resolve) => window.setTimeout(resolve, 0));
        }

        results = processed;
        renderResults();

        if (processed.length && failed.length === 0) {
            setStatus(`${processed.length} ${processed.length === 1 ? "image is" : "images are"} ready to download.`, "success");
        } else if (processed.length) {
            setStatus(`${processed.length} processed, ${failed.length} failed. The failed file may use a format your browser cannot decode.`, "error");
        } else {
            setStatus("No images could be processed in this browser.", "error");
        }
    } finally {
        isProcessing = false;
        elements.processButton.disabled = false;
        elements.clearFilesButton.disabled = false;
        elements.downloadAllButton.disabled = results.length === 0;
    }
}

async function downloadAll() {
    if (!results.length) return;

    for (const result of results) {
        downloadResult(result);
        await new Promise((resolve) => window.setTimeout(resolve, 180));
    }
}

function clearFiles() {
    if (isProcessing) return;

    files = [];
    elements.imageInput.value = "";
    renderQueue();
    clearResults();
    setStatus("Choose one or more images to begin.", "neutral");
}

elements.imageInput.addEventListener("change", () => {
    addFiles(Array.from(elements.imageInput.files || []));
});

elements.clearFilesButton.addEventListener("click", clearFiles);
elements.processButton.addEventListener("click", processImages);
elements.downloadAllButton.addEventListener("click", downloadAll);
elements.resetSettingsButton.addEventListener("click", resetSettings);
elements.formatSelect.addEventListener("change", () => {
    updateQualityState();
    clearResults();
});
elements.qualityInput.addEventListener("input", () => {
    elements.qualityValue.textContent = `${elements.qualityInput.value}%`;
    clearResults();
});
[elements.maxWidthInput, elements.maxHeightInput].forEach((input) => {
    input.addEventListener("input", clearResults);
});

["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (!isProcessing) elements.dropZone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.dropZone.classList.remove("is-dragging");
    });
});

elements.dropZone.addEventListener("drop", (event) => {
    if (isProcessing) return;
    addFiles(Array.from(event.dataTransfer?.files || []));
});

document.addEventListener("paste", (event) => {
    if (isProcessing) return;

    const pastedFiles = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith("image/"));
    if (!pastedFiles.length) return;

    event.preventDefault();
    elements.dropZone.classList.add("is-pasting");
    addFiles(pastedFiles);
    window.setTimeout(() => elements.dropZone.classList.remove("is-pasting"), 350);
});

window.addEventListener("beforeunload", revokeResults);

elements.downloadAllButton.disabled = true;
updateQualityState();
renderQueue();
