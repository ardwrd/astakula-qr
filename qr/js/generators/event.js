import {
    formatCalendarDate
} from "../core/utils.js";

import {
    ValidationError,
    required
} from "../core/validator.js";

function escapeICalendarText(value = "") {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");
}

function createEventDate(date, time) {
    if (!date || !time) {
        return null;
    }

    const value = new Date(`${date}T${time}:00`);

    if (Number.isNaN(value.getTime())) {
        return null;
    }

    return value;
}

const eventGenerator = {
    id: "event",

    label: "Event",

    description:
        "Generate a QR code containing a calendar event that can be added to compatible calendar apps.",

    icon: "calendar",

    fields: [
        {
            name: "title",
            label: "Event Title",
            type: "text",
            placeholder: "Meeting with Astakula",
            required: true,
            maxlength: 200
        },
        {
            name: "location",
            label: "Location",
            type: "text",
            placeholder: "Meeting Room / Address / Online",
            required: false,
            maxlength: 300
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true
        },
        {
            name: "startTime",
            label: "Start Time",
            type: "time",
            required: true
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: true
        },
        {
            name: "endTime",
            label: "End Time",
            type: "time",
            required: true
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Tambahkan catatan atau informasi mengenai event...",
            required: false,
            rows: 5,
            maxlength: 2000
        }
    ],

    generate(data) {
        const title =
            String(data.title || "").trim();

        const location =
            String(data.location || "").trim();

        const startDate =
            String(data.startDate || "").trim();

        const startTime =
            String(data.startTime || "").trim();

        const endDate =
            String(data.endDate || "").trim();

        const endTime =
            String(data.endTime || "").trim();

        const description =
            String(data.description || "").trim();

        required(title, "Event Title");
        required(startDate, "Start Date");
        required(startTime, "Start Time");
        required(endDate, "End Date");
        required(endTime, "End Time");

        if (title.length > 200) {
            throw new ValidationError(
                "Judul event terlalu panjang. Maksimal 200 karakter.",
                "title"
            );
        }

        if (location.length > 300) {
            throw new ValidationError(
                "Lokasi terlalu panjang. Maksimal 300 karakter.",
                "location"
            );
        }

        if (description.length > 2000) {
            throw new ValidationError(
                "Deskripsi terlalu panjang. Maksimal 2000 karakter.",
                "description"
            );
        }

        const start =
            createEventDate(startDate, startTime);

        const end =
            createEventDate(endDate, endTime);

        if (!start) {
            throw new ValidationError(
                "Tanggal atau waktu mulai tidak valid.",
                "startDate"
            );
        }

        if (!end) {
            throw new ValidationError(
                "Tanggal atau waktu selesai tidak valid.",
                "endDate"
            );
        }

        if (end <= start) {
            throw new ValidationError(
                "Waktu selesai harus setelah waktu mulai.",
                "endDate"
            );
        }

        /*
         * Floating local time is used intentionally.
         *
         * Example:
         * 20261010T090000
         *
         * No timezone is forced so the event is interpreted
         * using the user's local calendar timezone.
         */

        const dtStart =
            formatCalendarDate(
                startDate,
                startTime
            );

        const dtEnd =
            formatCalendarDate(
                endDate,
                endTime
            );

        /*
         * Standard iCalendar payload.
         *
         * BEGIN:VCALENDAR
         * VERSION:2.0
         * BEGIN:VEVENT
         * SUMMARY:Meeting
         * DTSTART:20261010T090000
         * DTEND:20261010T100000
         * LOCATION:Meeting Room
         * DESCRIPTION:Discussion
         * END:VEVENT
         * END:VCALENDAR
         */

        const lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Astakula Tools//QR Event Generator//EN",
            "BEGIN:VEVENT",
            `SUMMARY:${escapeICalendarText(title)}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`
        ];

        if (location) {
            lines.push(
                `LOCATION:${escapeICalendarText(location)}`
            );
        }

        if (description) {
            lines.push(
                `DESCRIPTION:${escapeICalendarText(description)}`
            );
        }

        lines.push(
            "END:VEVENT",
            "END:VCALENDAR"
        );

        const payload = lines.join("\r\n");

        const details = [
            {
                label: "Start",
                value: `${startDate} ${startTime}`
            },
            {
                label: "End",
                value: `${endDate} ${endTime}`
            }
        ];

        if (location) {
            details.push({
                label: "Location",
                value: location
            });
        }

        if (description) {
            details.push({
                label: "Description",
                value: description
            });
        }

        return {
            payload,

            preview: {
                title: "Event",

                value: title,

                details
            }
        };
    }
};

export default eventGenerator;
