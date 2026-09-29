import { isValidUrl } from "../core/utils.js";
import {
    ValidationError,
    required
} from "../core/validator.js";

const urlGenerator = {
    id: "url",

    label: "URL",

    description:
        "Generate a QR code that opens a website or web page.",

    icon: "link",

    fields: [
        {
            name: "url",
            label: "URL",
            type: "url",
            placeholder: "https://astakula.com",
            required: true,
            autocomplete: "url"
        }
    ],

    generate(data) {
        const value = String(data.url || "").trim();

        required(value, "URL");

        if (!isValidUrl(value)) {
            throw new ValidationError(
                "Masukkan URL yang valid, contoh https://astakula.com",
                "url"
            );
        }

        return {
            payload: value,

            preview: {
                title: "URL",
                value
            }
        };
    }
};

export default urlGenerator;
