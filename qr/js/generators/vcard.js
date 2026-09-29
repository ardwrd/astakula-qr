import {
    normalizePhoneNumber,
    isValidEmail,
    isValidUrl
} from "../core/utils.js";

import {
    ValidationError,
    required,
    validatePhone
} from "../core/validator.js";

function escapeVCardValue(value = "") {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");
}

const vcardGenerator = {
    id: "vcard",

    label: "Contact",

    description:
        "Generate a QR code containing contact information in standard vCard format.",

    icon: "contact",

    fields: [
        {
            name: "firstName",
            label: "First Name",
            type: "text",
            placeholder: "Ariyo",
            required: true,
            autocomplete: "given-name",
            maxlength: 100
        },
        {
            name: "lastName",
            label: "Last Name",
            type: "text",
            placeholder: "Ardiwardana",
            required: false,
            autocomplete: "family-name",
            maxlength: 100
        },
        {
            name: "phone",
            label: "Phone Number",
            type: "tel",
            placeholder: "081234567890 atau +6281234567890",
            required: false,
            autocomplete: "tel",
            help:
                "Nomor Indonesia dapat menggunakan format 08xxx, 62xxx, +62xxx, atau 8xxx."
        },
        {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "hello@astakula.com",
            required: false,
            autocomplete: "email",
            maxlength: 254
        },
        {
            name: "organization",
            label: "Organization",
            type: "text",
            placeholder: "Astakula Creative Studio",
            required: false,
            autocomplete: "organization",
            maxlength: 150
        },
        {
            name: "jobTitle",
            label: "Job Title",
            type: "text",
            placeholder: "Software Engineer",
            required: false,
            autocomplete: "organization-title",
            maxlength: 150
        },
        {
            name: "website",
            label: "Website",
            type: "url",
            placeholder: "https://astakula.com",
            required: false,
            autocomplete: "url"
        },
        {
            name: "address",
            label: "Address",
            type: "textarea",
            placeholder: "Alamat lengkap...",
            required: false,
            rows: 3,
            maxlength: 500,
            autocomplete: "street-address"
        }
    ],

    generate(data) {
        const firstName =
            String(data.firstName || "").trim();

        const lastName =
            String(data.lastName || "").trim();

        const rawPhone =
            String(data.phone || "").trim();

        const email =
            String(data.email || "").trim();

        const organization =
            String(data.organization || "").trim();

        const jobTitle =
            String(data.jobTitle || "").trim();

        const website =
            String(data.website || "").trim();

        const address =
            String(data.address || "").trim();

        required(firstName, "First Name");

        if (firstName.length > 100) {
            throw new ValidationError(
                "First Name terlalu panjang. Maksimal 100 karakter.",
                "firstName"
            );
        }

        if (lastName.length > 100) {
            throw new ValidationError(
                "Last Name terlalu panjang. Maksimal 100 karakter.",
                "lastName"
            );
        }

        let normalizedPhone = "";

        if (rawPhone) {
            normalizedPhone =
                normalizePhoneNumber(rawPhone);

            validatePhone(normalizedPhone);

            if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
                throw new ValidationError(
                    "Nomor telepon tidak valid. Gunakan nomor lengkap beserta kode negara.",
                    "phone"
                );
            }
        }

        if (email && !isValidEmail(email)) {
            throw new ValidationError(
                "Alamat email tidak valid.",
                "email"
            );
        }

        if (organization.length > 150) {
            throw new ValidationError(
                "Nama organisasi terlalu panjang. Maksimal 150 karakter.",
                "organization"
            );
        }

        if (jobTitle.length > 150) {
            throw new ValidationError(
                "Job Title terlalu panjang. Maksimal 150 karakter.",
                "jobTitle"
            );
        }

        if (website && !isValidUrl(website)) {
            throw new ValidationError(
                "Website tidak valid. Gunakan URL lengkap, contoh https://astakula.com",
                "website"
            );
        }

        if (address.length > 500) {
            throw new ValidationError(
                "Alamat terlalu panjang. Maksimal 500 karakter.",
                "address"
            );
        }

        const fullName = [
            firstName,
            lastName
        ]
            .filter(Boolean)
            .join(" ");

        /*
         * Standard vCard 3.0 payload:
         *
         * BEGIN:VCARD
         * VERSION:3.0
         * N:Last;First;;;
         * FN:First Last
         * ORG:Organization
         * TITLE:Job Title
         * TEL;TYPE=CELL:+6281234567890
         * EMAIL:hello@example.com
         * URL:https://example.com
         * ADR:;;Address;;;; 
         * END:VCARD
         */

        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",

            `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`,

            `FN:${escapeVCardValue(fullName)}`
        ];

        if (organization) {
            lines.push(
                `ORG:${escapeVCardValue(organization)}`
            );
        }

        if (jobTitle) {
            lines.push(
                `TITLE:${escapeVCardValue(jobTitle)}`
            );
        }

        if (normalizedPhone) {
            lines.push(
                `TEL;TYPE=CELL:${normalizedPhone}`
            );
        }

        if (email) {
            lines.push(
                `EMAIL:${escapeVCardValue(email)}`
            );
        }

        if (website) {
            lines.push(
                `URL:${website}`
            );
        }

        if (address) {
            lines.push(
                `ADR;TYPE=HOME:;;${escapeVCardValue(address)};;;;`
            );
        }

        lines.push("END:VCARD");

        const payload = lines.join("\r\n");

        const details = [];

        if (normalizedPhone) {
            details.push({
                label: "Phone",
                value: normalizedPhone
            });
        }

        if (email) {
            details.push({
                label: "Email",
                value: email
            });
        }

        if (organization) {
            details.push({
                label: "Organization",
                value: organization
            });
        }

        if (jobTitle) {
            details.push({
                label: "Job Title",
                value: jobTitle
            });
        }

        if (website) {
            details.push({
                label: "Website",
                value: website
            });
        }

        if (address) {
            details.push({
                label: "Address",
                value: address
            });
        }

        return {
            payload,

            preview: {
                title: "Contact",

                value: fullName,

                details
            }
        };
    }
};

export default vcardGenerator;
