# Tools Astakula

A small collection of browser-based utilities by Astakula.

Live site: https://tools.astakula.com/

## Available

- QR Generator — https://tools.astakula.com/qr/
- JSON Formatter — https://tools.astakula.com/json/
- Base64 — https://tools.astakula.com/base64/
- UUID Generator — https://tools.astakula.com/uuid/
- Hash Generator — https://tools.astakula.com/hash/

The QR Generator supports URL, plain text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, location, and calendar event payloads, with PNG and SVG export.

The JSON Formatter supports formatting, minifying, validation, copy, download, drag-and-drop and pasted `.json` files, input/output swap, and 2/4-space indentation.

The Base64 tool supports UTF-8 text encode/decode, input/output swap, file-to-Base64 encoding, optional Data URL output, pasted or dropped files up to 20 MB, and Base64/Data URL decoding back to downloadable files.

The UUID Generator supports UUID v4 and UUID v7, 1–1000 values per batch, lowercase or uppercase output, optional hyphen removal, copy, regeneration, and `.txt` download.

The Hash Generator supports MD5, SHA-1, SHA-256, SHA-384, and SHA-512 for text or files up to 50 MB, lowercase or uppercase digest output, copy, `.txt` download, and hash comparison.

All five tools process data locally in the browser.

## UI

The neobrutalist UI foundation is loaded from the pinned BRUT CDN package `@sprtn/ui@1.3.2` via jsDelivr. Local CSS is kept only for Tools Astakula compatibility, page layout, responsive behavior, and tool-specific presentation.

Global light/dark mode remains controlled by `assets/js/theme.js`, with a small token bridge in `assets/css/tokens.css` so the CDN components follow the same theme.

## Planned

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
├── hash/
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
