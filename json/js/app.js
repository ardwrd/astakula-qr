const elements = {
    input: document.querySelector("#jsonInput"),
    output: document.querySelector("#jsonOutput"),
    formatButton: document.querySelector("#formatButton"),
    minifyButton: document.querySelector("#minifyButton"),
    validateButton: document.querySelector("#validateButton"),
    clearButton: document.querySelector("#clearButton"),
    sampleButton: document.querySelector("#sampleButton"),
    copyButton: document.querySelector("#copyButton"),
    downloadButton: document.querySelector("#downloadButton"),
    indentSelect: document.querySelector("#indentSelect"),
    statusBox: document.querySelector("#statusBox"),
    dropZone: document.querySelector("#dropZone"),
    fileInput: document.querySelector("#jsonFile"),
    inputMeta: document.querySelector("#inputMeta"),
    outputMeta: document.querySelector("#outputMeta")
};

const SAMPLE_JSON = {
    name: "Astakula",
    tool: "JSON Formatter",
    features: [
        "format",
        "minify",
        "validate",
        "copy",
        "download"
    ],
    local: true
};

function setStatus(message, type = "neutral") {
    elements.statusBox.textContent = message;
    elements.statusBox.className = `status-box is-${type}`;
}

function updateMeta() {
    const inputLength = elements.input.value.length;
    const outputLength = elements.output.value.length;

    elements.inputMeta.textContent = `${inputLength.toLocaleString()} chars`;
    elements.outputMeta.textContent = `${outputLength.toLocaleString()} chars`;
}

function getInput() {
    const value = elements.input.value.trim();

    if (!value) {
        throw new Error("Paste or load some JSON first.");
    }

    return value;
}

function getErrorDetails(error, source) {
    const message = String(error?.message || "Invalid JSON.");

    const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColumnMatch) {
        return {
            message,
            line: Number(lineColumnMatch[1]),
            column: Number(lineColumnMatch[2])
        };
    }

    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
        const position = Number(positionMatch[1]);
        const before = source.slice(0, position);
        const lines = before.split("\n");

        return {
            message,
            line: lines.length,
            column: lines[lines.length - 1].length + 1
        };
    }

    return {
        message,
        line: null,
        column: null
    };
}

function parseJson() {
    const source = getInput();

    try {
        return {
            source,
            value: JSON.parse(source)
        };
    } catch (error) {
        const details = getErrorDetails(error, source);

        if (details.line && details.column) {
            throw new Error(
                `Invalid JSON at line ${details.line}, column ${details.column}. ${details.message}`
            );
        }

        throw new Error(`Invalid JSON. ${details.message}`);
    }
}

function getIndent() {
    const value = Number(elements.indentSelect.value);
    return value === 4 ? 4 : 2;
}

function formatJson() {
    try {
        const { value } = parseJson();
        elements.output.value = JSON.stringify(value, null, getIndent());
        setStatus("Valid JSON. Formatted successfully.", "success");
        updateMeta();
    } catch (error) {
        elements.output.value = "";
        setStatus(error.message, "error");
        updateMeta();
    }
}

function minifyJson() {
    try {
        const { value } = parseJson();
        elements.output.value = JSON.stringify(value);
        setStatus("Valid JSON. Minified successfully.", "success");
        updateMeta();
    } catch (error) {
        elements.output.value = "";
        setStatus(error.message, "error");
        updateMeta();
    }
}

function validateJson() {
    try {
        const { value } = parseJson();
        const type = Array.isArray(value)
            ? "array"
            : value === null
                ? "null"
                : typeof value;

        setStatus(`Valid JSON. Root type: ${type}.`, "success");
    } catch (error) {
        setStatus(error.message, "error");
    }
}

function clearAll() {
    elements.input.value = "";
    elements.output.value = "";
    elements.fileInput.value = "";
    setStatus("Ready.", "neutral");
    updateMeta();
    elements.input.focus();
}

function loadSample() {
    elements.input.value = JSON.stringify(SAMPLE_JSON, null, 2);
    elements.output.value = "";
    setStatus("Sample loaded.", "neutral");
    updateMeta();
}

async function copyOutput() {
    const value = elements.output.value;

    if (!value) {
        setStatus("Nothing to copy yet.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        setStatus("Output copied to clipboard.", "success");
    } catch {
        elements.output.select();
        document.execCommand("copy");
        setStatus("Output copied to clipboard.", "success");
    }
}

function downloadOutput() {
    const value = elements.output.value;

    if (!value) {
        setStatus("Nothing to download yet.", "error");
        return;
    }

    const blob = new Blob([value], {
        type: "application/json;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "formatted.json";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    setStatus("JSON file downloaded.", "success");
}

async function loadFile(file) {
    if (!file) {
        return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        setStatus("File is too large. Maximum size is 5 MB.", "error");
        return;
    }

    const isJsonFile =
        file.type === "application/json" ||
        file.name.toLowerCase().endsWith(".json");

    if (!isJsonFile) {
        setStatus("Choose a .json file.", "error");
        return;
    }

    try {
        elements.input.value = await file.text();
        elements.output.value = "";
        setStatus(`${file.name} loaded.`, "neutral");
        updateMeta();
    } catch {
        setStatus("Could not read that file.", "error");
    }
}

elements.formatButton.addEventListener("click", formatJson);
elements.minifyButton.addEventListener("click", minifyJson);
elements.validateButton.addEventListener("click", validateJson);
elements.clearButton.addEventListener("click", clearAll);
elements.sampleButton.addEventListener("click", loadSample);
elements.copyButton.addEventListener("click", copyOutput);
elements.downloadButton.addEventListener("click", downloadOutput);

elements.input.addEventListener("input", updateMeta);
elements.output.addEventListener("input", updateMeta);

elements.fileInput.addEventListener("change", () => {
    loadFile(elements.fileInput.files?.[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        elements.dropZone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        elements.dropZone.classList.remove("is-dragging");
    });
});

elements.dropZone.addEventListener("drop", (event) => {
    loadFile(event.dataTransfer?.files?.[0]);
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        formatJson();
    }
});

updateMeta();
