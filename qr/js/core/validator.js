
export class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);

        this.name = "ValidationError";
        this.field = field;
    }
}

export function required(value, label = "Field") {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        throw new ValidationError(
            `${label} wajib diisi.`
        );
    }

    return value;
}

export function validateUrl(value, validator) {
    required(value, "URL");

    if (!validator(value)) {
        throw new ValidationError(
            "URL tidak valid.",
            "url"
        );
    }

    return value;
}

export function validateEmail(value, validator) {
    required(value, "Email");

    if (!validator(value)) {
        throw new ValidationError(
            "Alamat email tidak valid.",
            "email"
        );
    }

    return value;
}

export function validatePhone(value) {
    required(value, "Nomor telepon");

    const digits = String(value).replace(/\D/g, "");

    if (digits.length < 8 || digits.length > 15) {
        throw new ValidationError(
            "Nomor telepon tidak valid.",
            "phone"
        );
    }

    return value;
}

export function validateCoordinates(
    latitude,
    longitude,
    latitudeValidator,
    longitudeValidator
) {
    required(latitude, "Latitude");
    required(longitude, "Longitude");

    if (!latitudeValidator(latitude)) {
        throw new ValidationError(
            "Latitude harus berada antara -90 dan 90.",
            "latitude"
        );
    }

    if (!longitudeValidator(longitude)) {
        throw new ValidationError(
            "Longitude harus berada antara -180 dan 180.",
            "longitude"
        );
    }

    return true;
}
