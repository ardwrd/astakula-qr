import {
    normalizePhoneNumber
} from "../core/utils.js";

import {
    ValidationError,
    required,
    validatePhone
} from "../core/validator.js";

const phoneGenerator = {
    id: "phone",

    label: "Phone",

    description:
        "Generate a QR code that opens the phone dialer with a pre-filled number.",

    icon: "phone",

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
        }
    ],

    generate(data) {
        const rawPhone = String(data.phone || "").trim();

        required(rawPhone, "Phone Number");

        /*
         * normalizePhoneNumber()
         *
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

        /*
         * Standard telephone URI:
         *
         * tel:+6281234567890
         */
        const payload =
            `tel:${normalizedPhone}`;

        return {
            payload,

            preview: {
                title: "Phone",

                value: normalizedPhone,

                details: [
                    {
                        label: "Action",
                        value: "Open phone dialer"
                    }
                ]
            }
        };
    }
};

export default phoneGenerator;
