# Tools Astakula

A small collection of browser-based utilities by Astakula.

Live site: https://tools.astakula.com/

## Available

- QR Generator — https://tools.astakula.com/qr/
- JSON Formatter — https://tools.astakula.com/json/
- Base64 — https://tools.astakula.com/base64/
- UUID Generator — https://tools.astakula.com/uuid/
- Hash Generator — https://tools.astakula.com/hash/
- Image Tools — https://tools.astakula.com/image/
- PDF Tools — https://tools.astakula.com/pdf/
- GIF Maker — https://tools.astakula.com/gif/

The QR Generator supports URL, plain text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, location, and calendar event payloads, with PNG and SVG export.

The JSON Formatter supports formatting, minifying, validation, copy, download, drag-and-drop and pasted `.json` files, input/output swap, and 2/4-space indentation.

The Base64 tool supports UTF-8 text encode/decode, input/output swap, file-to-Base64 encoding, optional Data URL output, pasted or dropped files up to 20 MB, and Base64/Data URL decoding back to downloadable files.

The UUID Generator supports UUID v4 and UUID v7, 1–1000 values per batch, lowercase or uppercase output, optional hyphen removal, copy, regeneration, and `.txt` download.

The Hash Generator supports MD5, SHA-1, SHA-256, SHA-384, and SHA-512 for text or files up to 50 MB, lowercase or uppercase digest output, copy, `.txt` download, and hash comparison.

Image Tools supports local batch conversion to WebP, JPEG, or PNG, optional resize limits, JPEG/WebP quality control, drag-and-drop or pasted images, individual downloads, and batch downloads. Up to 20 files of 25 MB each can be queued.

PDF Tools supports local PDF merge, page extraction, page reordering, and page rotation. Merge mode supports up to 12 PDFs, with 50 MB per-file and 150 MB aggregate limits. Password-protected PDFs are not supported.

GIF Maker supports PNG, JPEG, WebP, and AVIF source frames, drag-and-drop or pasted images, frame reordering, configurable delay, 64/128/256-color palettes, contain/cover fitting, custom output dimensions up to 1200 px, background color, loop control, preview, and GIF download. Up to 30 source frames of 15 MB each can be queued, with a 180 MB aggregate source limit.

All eight tools process data locally in the browser.

## UI

The neobrutalist design-system foundation is loaded directly on each page from the pinned BRUT package `@sprtn/ui@1.3.2` through jsDelivr.

Shared local styling is consolidated in `assets/css/astakula.css`. It owns the authoritative Astakula token bridge, site chrome, global light/dark normalization, keyboard-focus treatment, BRUT compatibility, and shared responsive behavior.

Tool-level `style.css` files are reserved for tool-specific layout and presentation. Older page-local color aliases may still exist for compatibility, but the shared adapter is authoritative so they cannot drift between tools.

Keyboard focus uses a neutral high-contrast outline in both light and dark modes. Blue and other accent colors are reserved for the visual palette and interaction states rather than browser focus rings.

Global light/dark mode remains controlled by `assets/js/theme.js`.

PDF operations use the pinned browser build of `pdf-lib@1.17.1` from jsDelivr. GIF encoding uses `gifenc@1.0.3` as a browser-side ES module from jsDelivr.

## Structure

```text
astakula-tools/
├── assets/
│   ├── css/
│   │   └── astakula.css
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
├── image/
│   ├── index.html
│   ├── style.css
│   └── js/
├── pdf/
│   ├── index.html
│   ├── style.css
│   └── js/
├── gif/
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
