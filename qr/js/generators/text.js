import {
    ValidationError,
    required
} from "../core/validator.js";

const textGenerator = {
    id: "text",

    label: "Text",

    description:
        "Generate a QR code containing plain text.",

    icon: "text",

    fields: [
        {
            name: "text",
            label: "Text",
            type: "textarea",
            placeholder: "Tulis teks yang ingin dimasukkan ke QR Code...",
            required: true,
            rows: 6,
            maxlength: 2000
        }
    ],

    generate(data) {
        const value = String(data.text || "").trim();

        required(value, "Text");

        if (value.length > 2000) {
            throw new ValidationError(
                "Teks terlalu panjang. Maksimal 2000 karakter.",
                "text"
            );
        }

        return {
            payload: value,

            preview: {
                title: "Text",
                value
            }
        };
    }
};

export default textGenerator;
