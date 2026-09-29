import {
    escapeQrValue
} from "../core/utils.js";

import {
    ValidationError,
    required
} from "../core/validator.js";

function getUtf8ByteLength(value = "") {
    return new TextEncoder().encode(String(value)).length;
}

function validateWpaPassword(password) {
    const length = String(password).length;

    if (length < 8 || length > 63) {
        throw new ValidationError(
            "Password WPA/WPA2 harus memiliki 8–63 karakter.",
            "password"
        );
    }
}

function validateWepPassword(password) {
    const value = String(password);

    const validAsciiLengths = [5, 13];
    const validHexLengths = [10, 26];

    const isValidAscii =
        validAsciiLengths.includes(value.length);

    const isValidHex =
        validHexLengths.includes(value.length) &&
        /^[0-9A-Fa-f]+$/.test(value);

    if (!isValidAscii && !isValidHex) {
        throw new ValidationError(
            "Password WEP harus 5 atau 13 karakter ASCII, atau 10 atau 26 digit hexadecimal.",
            "password"
        );
    }
}

const wifiGenerator = {
    id: "wifi",

    label: "Wi-Fi",

    description:
        "Generate a QR code that lets compatible devices connect to a Wi-Fi network.",

    icon: "wifi",

    fields: [
        {
            name: "ssid",
            label: "Network Name (SSID)",
            type: "text",
            placeholder: "Astakula WiFi",
            required: true,
            autocomplete: "off",
            maxlength: 32,
            help:
                "Masukkan nama jaringan Wi-Fi. SSID maksimal 32 byte."
        },
        {
            name: "security",
            label: "Security",
            type: "select",
            required: true,
            default: "WPA",
            options: [
                {
                    value: "WPA",
                    label: "WPA / WPA2 / WPA3"
                },
                {
                    value: "WEP",
                    label: "WEP"
                },
                {
                    value: "nopass",
                    label: "No Password"
                }
            ]
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Wi-Fi password",
            required: false,
            autocomplete: "new-password",
            maxlength: 63,
            visibleWhen: {
                field: "security",
                notEquals: "nopass"
            },
            help:
                "WPA/WPA2 menggunakan 8–63 karakter. Password tidak diperlukan untuk jaringan terbuka."
        },
        {
            name: "hidden",
            label: "Hidden Network",
            type: "checkbox",
            required: false,
            default: false,
            help:
                "Aktifkan jika SSID Wi-Fi tidak disiarkan secara publik."
        }
    ],

    generate(data) {
        const ssid = String(data.ssid || "").trim();

        const security =
            String(data.security || "WPA").trim();

        const password =
            String(data.password || "");

        const hidden =
            data.hidden === true ||
            data.hidden === "true" ||
            data.hidden === "on" ||
            data.hidden === 1 ||
            data.hidden === "1";

        required(ssid, "Network Name (SSID)");

        /*
         * Wi-Fi SSID secara standar memiliki panjang
         * maksimum 32 byte, bukan 32 karakter.
         */
        if (getUtf8ByteLength(ssid) > 32) {
            throw new ValidationError(
                "SSID terlalu panjang. Maksimal 32 byte.",
                "ssid"
            );
        }

        const supportedSecurity = [
            "WPA",
            "WEP",
            "nopass"
        ];

        if (!supportedSecurity.includes(security)) {
            throw new ValidationError(
                "Jenis keamanan Wi-Fi tidak valid.",
                "security"
            );
        }

        if (security === "WPA") {
            required(password, "Password");
            validateWpaPassword(password);
        }

        if (security === "WEP") {
            required(password, "Password");
            validateWepPassword(password);
        }

        /*
         * Standard Wi-Fi QR format:
         *
         * WIFI:T:WPA;S:MyNetwork;P:password;H:false;;
         *
         * Open network:
         *
         * WIFI:T:nopass;S:MyNetwork;H:false;;
         */

        const escapedSsid =
            escapeQrValue(ssid);

        const escapedPassword =
            escapeQrValue(password);

        const passwordPart =
            security === "nopass"
                ? ""
                : `P:${escapedPassword};`;

        const payload =
            `WIFI:T:${security};` +
            `S:${escapedSsid};` +
            passwordPart +
            `H:${hidden ? "true" : "false"};;`;

        const securityLabel = {
            WPA: "WPA / WPA2 / WPA3",
            WEP: "WEP",
            nopass: "No Password"
        }[security];

        return {
            payload,

            preview: {
                title: "Wi-Fi",

                value: ssid,

                details: [
                    {
                        label: "Security",
                        value: securityLabel
                    },
                    {
                        label: "Password",
                        value:
                            security === "nopass"
                                ? "None"
                                : "••••••••"
                    },
                    {
                        label: "Hidden Network",
                        value:
                            hidden
                                ? "Yes"
                                : "No"
                    }
                ]
            }
        };
    }
};

export default wifiGenerator;
