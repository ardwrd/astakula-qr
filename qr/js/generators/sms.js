import {
    normalizePhoneNumber,
    encodeQuery
} from "../core/utils.js";

import {
    ValidationError,
    required,
    validatePhone
} from "../core/validator.js";

const smsGenerator = {
    id: "sms",

    label: "SMS",

    description:
        "Generate a QR code that opens the SMS app with a phone number and optional pre-filled message.",

    icon: "message-square",

    fields: [
        {
            name: "phone",
            label: "Phone Number",
            type: "tel",
            placeholder: "081234567890 atau +6281234567890",
            required: true,
            autocomplete: "tel",
            help:
                "Nomor Indonesia dapat menggunakan format 08xxx, 62xxx, +62xxx, atau 8xxx. Untuk nomor internasional gunakan kode negara."
        },
        {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Tulis pesan SMS...",
            required: false,
            rows: 5,
            maxlength: 1600,
            help:
                "Pesan bersifat opsional. Panjang maksimum 1600 karakter."
        }
    ],

    generate(data) {
        const rawPhone =
            String(data.phone || "").trim();

        const message =
            String(data.message || "").trim();

        required(rawPhone, "Phone Number");

        /*
         * Examples:
         *
         * 081234567890   -> +6281234567890
         * 81234567890    -> +6281234567890
         * 6281234567890  -> +6281234567890
         * +6281234567890 -> +6281234567890
         * +60123456789   -> +60123456789
         */
        const normalizedPhone =
            normalizePhoneNumber(rawPhone);

        validatePhone(normalizedPhone);

        if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
            throw new ValidationError(
                "Nomor telepon tidak valid. Gunakan nomor lengkap beserta kode negara.",
                "phone"
            );
        }

        if (message.length > 1600) {
            throw new ValidationError(
                "Pesan terlalu panjang. Maksimal 1600 karakter.",
                "message"
            );
        }

        /*
         * Standard SMS URI:
         *
         * sms:+6281234567890
         *
         * With message:
         *
         * sms:+6281234567890?body=Hello
         */

        let payload =
            `sms:${normalizedPhone}`;

        if (message) {
            payload +=
                `?body=${encodeQuery(message)}`;
        }

        const details = [
            {
                label: "Phone Number",
                value: normalizedPhone
            }
        ];

        if (message) {
            details.push({
                label: "Message",
                value: message
            });
        }

        return {
            payload,

            preview: {
                title: "SMS",

                value: normalizedPhone,

                details
            }
        };
    }
};

export default smsGenerator;
