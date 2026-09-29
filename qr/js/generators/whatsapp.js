import {
    normalizeWhatsAppNumber,
    normalizePhoneNumber,
    encodeQuery
} from "../core/utils.js";

import {
    ValidationError,
    required,
    validatePhone
} from "../core/validator.js";

const whatsappGenerator = {
    id: "whatsapp",

    label: "WhatsApp",

    description:
        "Generate a QR code that opens a WhatsApp chat with an optional pre-filled message.",

    icon: "message-circle",

    fields: [
        {
            name: "phone",
            label: "Phone Number",
            type: "tel",
            placeholder: "081234567890 atau +6281234567890",
            required: true,
            autocomplete: "tel",
            help:
                "Nomor Indonesia dapat menggunakan format 08xxx, 62xxx, +62xxx, atau 8xxx. Nomor internasional gunakan kode negara, contoh +60123456789."
        },
        {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Halo, saya ingin bertanya mengenai...",
            required: false,
            rows: 5,
            maxlength: 2000
        }
    ],

    generate(data) {
        const rawPhone = String(data.phone || "").trim();
        const message = String(data.message || "").trim();

        required(rawPhone, "Phone Number");

        /*
         * normalizePhoneNumber()
         *
         * Examples:
         * 081234567890   -> +6281234567890
         * 81234567890    -> +6281234567890
         * 6281234567890  -> +6281234567890
         * +6281234567890 -> +6281234567890
         * +60123456789   -> +60123456789
         */
        const normalizedPhone = normalizePhoneNumber(rawPhone);

        validatePhone(normalizedPhone);

        /*
         * WhatsApp wa.me requires the phone number
         * without +, spaces, dashes, or parentheses.
         */
        const whatsappNumber =
            normalizeWhatsAppNumber(normalizedPhone);

        if (!/^\d{8,15}$/.test(whatsappNumber)) {
            throw new ValidationError(
                "Nomor WhatsApp tidak valid. Gunakan nomor lengkap beserta kode negara.",
                "phone"
            );
        }

        if (message.length > 2000) {
            throw new ValidationError(
                "Pesan terlalu panjang. Maksimal 2000 karakter.",
                "message"
            );
        }

        let payload =
            `https://wa.me/${whatsappNumber}`;

        if (message) {
            payload +=
                `?text=${encodeQuery(message)}`;
        }

        return {
            payload,

            preview: {
                title: "WhatsApp",

                value: normalizedPhone,

                details: message
                    ? [
                        {
                            label: "Message",
                            value: message
                        }
                    ]
                    : []
            }
        };
    }
};

export default whatsappGenerator;
