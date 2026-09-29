
const form = document.getElementById("generatorForm");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");

const resultSection = document.getElementById("resultSection");
const qrContainer = document.getElementById("qrCode");

const generatedLink = document.getElementById("generatedLink");
const copyButton = document.getElementById("copyButton");
const downloadButton = document.getElementById("downloadButton");
const openWhatsAppButton = document.getElementById("openWhatsAppButton");

let currentQr = null;

/**
 * Normalize Indonesian phone numbers.
 *
 * Examples:
 * 081234567890   -> 6281234567890
 * 6281234567890  -> 6281234567890
 * +6281234567890 -> 6281234567890
 * 81234567890    -> 6281234567890
 */
function normalizePhoneNumber(phone) {
    let normalized = phone.replace(/\D/g, "");

    if (normalized.startsWith("0")) {
        normalized = "62" + normalized.substring(1);
    } else if (normalized.startsWith("8")) {
        normalized = "62" + normalized;
    }

    return normalized;
}

function isValidPhoneNumber(phone) {
    return /^62\d{8,13}$/.test(phone);
}

function buildWhatsAppLink(phone, message) {
    const baseUrl = `https://wa.me/${phone}`;

    if (!message.trim()) {
        return baseUrl;
    }

    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
}

function generateQrCode(link) {
    qrContainer.innerHTML = "";

    currentQr = new QRCode(qrContainer, {
        text: link,
        width: 220,
        height: 220,
        colorDark: "#111111",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
    });
}

function showResult(link) {
    generatedLink.value = link;
    openWhatsAppButton.href = link;

    generateQrCode(link);

    resultSection.classList.remove("hidden");

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const phone = normalizePhoneNumber(phoneInput.value);
    const message = messageInput.value;

    if (!isValidPhoneNumber(phone)) {
        alert("Nomor WhatsApp tidak valid. Contoh: 081234567890");
        phoneInput.focus();
        return;
    }

    const link = buildWhatsAppLink(phone, message);

    showResult(link);
});

copyButton.addEventListener("click", async function () {
    if (!generatedLink.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(generatedLink.value);

        const originalText = copyButton.textContent;

        copyButton.textContent = "Copied!";

        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 1500);
    } catch {
        generatedLink.select();
        document.execCommand("copy");

        copyButton.textContent = "Copied!";

        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 1500);
    }
});

downloadButton.addEventListener("click", function () {
    const qrImage = qrContainer.querySelector("img");
    const qrCanvas = qrContainer.querySelector("canvas");

    let imageUrl = null;

    if (qrImage && qrImage.src) {
        imageUrl = qrImage.src;
    } else if (qrCanvas) {
        imageUrl = qrCanvas.toDataURL("image/png");
    }

    if (!imageUrl) {
        alert("Generate QR Code terlebih dahulu.");
        return;
    }

    const downloadLink = document.createElement("a");

    downloadLink.href = imageUrl;
    downloadLink.download = "whatsapp-qr.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
});
