import {
    isValidLatitude,
    isValidLongitude
} from "../core/utils.js";

import {
    ValidationError,
    required
} from "../core/validator.js";

const locationGenerator = {
    id: "location",

    label: "Location",

    description:
        "Generate a QR code that opens a geographic location using latitude and longitude.",

    icon: "map-pin",

    fields: [
        {
            name: "latitude",
            label: "Latitude",
            type: "number",
            placeholder: "-6.200000",
            required: true,
            step: "any",
            min: -90,
            max: 90,
            inputmode: "decimal",
            help:
                "Nilai latitude harus berada antara -90 dan 90."
        },
        {
            name: "longitude",
            label: "Longitude",
            type: "number",
            placeholder: "106.816666",
            required: true,
            step: "any",
            min: -180,
            max: 180,
            inputmode: "decimal",
            help:
                "Nilai longitude harus berada antara -180 dan 180."
        },
        {
            name: "label",
            label: "Location Label",
            type: "text",
            placeholder: "Astakula Creative Studio",
            required: false,
            maxlength: 150,
            help:
                "Label lokasi bersifat opsional dan hanya digunakan sebagai metadata/preview."
        }
    ],

    generate(data) {
        const rawLatitude =
            String(data.latitude ?? "").trim();

        const rawLongitude =
            String(data.longitude ?? "").trim();

        const label =
            String(data.label || "").trim();

        required(rawLatitude, "Latitude");
        required(rawLongitude, "Longitude");

        if (!isValidLatitude(rawLatitude)) {
            throw new ValidationError(
                "Latitude tidak valid. Gunakan nilai antara -90 dan 90.",
                "latitude"
            );
        }

        if (!isValidLongitude(rawLongitude)) {
            throw new ValidationError(
                "Longitude tidak valid. Gunakan nilai antara -180 dan 180.",
                "longitude"
            );
        }

        if (label.length > 150) {
            throw new ValidationError(
                "Label lokasi terlalu panjang. Maksimal 150 karakter.",
                "label"
            );
        }

        const latitude = Number(rawLatitude);
        const longitude = Number(rawLongitude);

        /*
         * Standard geo URI:
         *
         * geo:-6.200000,106.816666
         *
         * Label sengaja tidak dimasukkan ke payload utama
         * agar format geo tetap sederhana dan kompatibel.
         */
        const payload =
            `geo:${latitude},${longitude}`;

        const details = [
            {
                label: "Latitude",
                value: String(latitude)
            },
            {
                label: "Longitude",
                value: String(longitude)
            }
        ];

        if (label) {
            details.push({
                label: "Location Label",
                value: label
            });
        }

        return {
            payload,

            preview: {
                title: "Location",

                value:
                    label ||
                    `${latitude}, ${longitude}`,

                details
            }
        };
    }
};

export default locationGenerator;
