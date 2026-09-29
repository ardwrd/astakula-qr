# Tools Astakula

A small collection of browser-based utilities by Astakula.

Live site: https://tools.astakula.com/

## Available

- QR Generator — https://tools.astakula.com/qr/
- JSON Formatter — https://tools.astakula.com/json/
- Base64 — https://tools.astakula.com/base64/
- UUID Generator — https://tools.astakula.com/uuid/

The QR Generator supports URL, plain text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, location, and calendar event payloads, with PNG and SVG export.

The JSON Formatter supports formatting, minifying, validation, copy, download, drag-and-drop and pasted `.json` files, input/output swap, and 2/4-space indentation.

The Base64 tool supports UTF-8 text encode/decode, input/output swap, file-to-Base64 encoding, optional Data URL output, pasted or dropped files up to 20 MB, and Base64/Data URL decoding back to downloadable files.

The UUID Generator supports UUID v4 and UUID v7, 1–1000 values per batch, lowercase or uppercase output, optional hyphen removal, copy, regeneration, and `.txt` download.

All four tools process data locally in the browser.

## Planned

- Hash Generator
- Image Tools
- PDF Tools
- GIF Maker

## Structure

```text
astakula-tools/
├── assets/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   └── components.css
│   └── js/
│       └── theme.js
├── qr/
│   ├── index.html
│   ├── style.css
│   └── js/
├── json/
│   ├── index.html
│   ├── style.css
│   └── js/
├── base64/
│   ├── index.html
│   ├── style.css
│   └── js/
├── uuid/
│   ├── index.html
│   ├── style.css
│   └── js/
├── 404.html
├── favicon.svg
├── index.html
├── robots.txt
└── sitemap.xml
```

Where practical, processing is performed directly in the browser and user input is not uploaded to an Astakula server.

## License

MIT
