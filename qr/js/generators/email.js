import {
    encodeQuery,
    isValidEmail
} from "../core/utils.js";

import {
    ValidationError,
    required
} from "../core/validator.js";

const emailGenerator = {
    id: "email",

    label: "Email",

    description:
        "Generate a QR code that opens an email composer with optional subject and message.",

    icon: "mail",

    fields: [
        {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "hello@astakula.com",
            required: true,
            autocomplete: "email"
        },
        {
            name: "subject",
            label: "Subject",
            type: "text",
            placeholder: "Subject email",
            required: false,
            maxlength: 200
        },
        {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Tulis isi email...",
            required: false,
            rows: 6,
            maxlength: 5000
        }
    ],

    generate(data) {
        const email = String(data.email || "").trim();
        const subject = String(data.subject || "").trim();
        const message = String(data.message || "").trim();

        required(email, "Email Address");

        if (!isValidEmail(email)) {
            throw new ValidationError(
                "Alamat email tidak valid.",
                "email"
            );
        }

        if (subject.length > 200) {
            throw new ValidationError(
                "Subject terlalu panjang. Maksimal 200 karakter.",
                "subject"
            );
        }

        if (message.length > 5000) {
            throw new ValidationError(
                "Isi pesan terlalu panjang. Maksimal 5000 karakter.",
                "message"
            );
        }

        /*
         * Standard mailto URI:
         *
         * mailto:user@example.com
         *
         * With subject:
         * mailto:user@example.com?subject=Hello
         *
         * With subject and body:
         * mailto:user@example.com?subject=Hello&body=Message
         */

        const queryParams = [];

        if (subject) {
            queryParams.push(
                `subject=${encodeQuery(subject)}`
            );
        }

        if (message) {
            queryParams.push(
                `body=${encodeQuery(message)}`
            );
        }

        let payload = `mailto:${email}`;

        if (queryParams.length > 0) {
            payload += `?${queryParams.join("&")}`;
        }

        const details = [];

        if (subject) {
            details.push({
                label: "Subject",
                value: subject
            });
        }

        if (message) {
            details.push({
                label: "Message",
                value: message
            });
        }

        return {
            payload,

            preview: {
                title: "Email",

                value: email,

                details
            }
        };
    }
};

export default emailGenerator;
