
export function escapeQrValue(value = "") {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/:/g, "\\:")
        .replace(/\n/g, "\\n");
}

export function normalizePhoneNumber(value = "") {
    let phone = String(value).trim();

    phone = phone.replace(/[^\d+]/g, "");

    if (phone.startsWith("+")) {
        return `+${phone.slice(1).replace(/\D/g, "")}`;
    }

    phone = phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
        return `+62${phone.slice(1)}`;
    }

    if (phone.startsWith("62")) {
        return `+${phone}`;
    }

    if (phone.startsWith("8")) {
        return `+62${phone}`;
    }

    return phone ? `+${phone}` : "";
}

export function normalizeWhatsAppNumber(value = "") {
    return normalizePhoneNumber(value).replace("+", "");
}

export function encodeQuery(value = "") {
    return encodeURIComponent(String(value).trim());
}

export function isValidUrl(value = "") {
    try {
        const url = new URL(String(value).trim());

        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
}

export function isValidEmail(value = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(value).trim()
    );
}

export function isValidLatitude(value) {
    const number = Number(value);

    return (
        Number.isFinite(number) &&
        number >= -90 &&
        number <= 90
    );
}

export function isValidLongitude(value) {
    const number = Number(value);

    return (
        Number.isFinite(number) &&
        number >= -180 &&
        number <= 180
    );
}

export function formatCalendarDate(date, time = "00:00") {
    if (!date) {
        return "";
    }

    const cleanDate = String(date).replaceAll("-", "");

    const parts = String(time || "00:00").split(":");

    const hours = (parts[0] || "00").padStart(2, "0");
    const minutes = (parts[1] || "00").padStart(2, "0");

    return `${cleanDate}T${hours}${minutes}00`;
}

export function removeEmptyLines(lines = []) {
    return lines.filter(
        (line) =>
            line !== null &&
            line !== undefined &&
            String(line).trim() !== ""
    );
}
