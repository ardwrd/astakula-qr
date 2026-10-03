# Astakula Tools

A growing collection of practical browser-based utilities developed by Ariyo Ardiwardana under Astakula.

Live site: https://tools.astakula.com/

Most tools process user input directly in the browser. No Astakula application backend is used for ordinary file-processing workflows. Features that intentionally contact external services are documented in the interface and Privacy Policy.

## Available tools

| Tool | Route | Main use |
| --- | --- | --- |
| QR Code Generator | `/qr/` | Generate QR codes for URLs, text, WhatsApp, Wi-Fi, contacts, locations, calendar events, and more |
| JSON Formatter | `/json/` | Format, minify, validate, copy, and download JSON |
| Base64 Encoder & Decoder | `/base64/` | Encode/decode UTF-8 text and files |
| UUID Generator | `/uuid/` | Generate UUID v4 and v7 individually or in bulk |
| Hash Generator | `/hash/` | Generate and compare MD5 and SHA hashes |
| Image Tools | `/image/` | Compress, resize, crop, convert, optimize, and inspect images |
| PDF Tools | `/pdf/` | Merge, extract, reorder, and rotate PDF pages |
| GIF Maker | `/gif/` | Create animated GIFs from image sequences |
| Favicon Generator | `/favicon/` | Generate favicon, Apple touch, and web-app icon packages |
| Excel Tools | `/excel/` | View, convert, clean, split, merge, sort, and deduplicate spreadsheet data |
| Network Tools | `/network/` | Subnet, IP, MAC, bandwidth, port-reference, and DNS utilities |
| Social Media Tools | `/social/` | Carousel splitting, profile-grid preview, and social-media safe-zone guides |
| Work Schedule Generator | `/schedule/` | Build monthly staff schedules, record requested days off, validate assignments, and export Excel |
| Bulk Certificate Generator | `/certificate/` | Merge a finished certificate design with spreadsheet participant data and generate certificates in bulk |

## Tool details

### QR Code Generator

Supports URL, plain text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, location, and calendar-event payloads, with PNG and SVG export.

### JSON Formatter

Supports formatting, minifying, validation, copy, download, drag-and-drop and pasted `.json` files, input/output swap, and 2/4-space indentation.

### Base64

Supports UTF-8 text encode/decode, input/output swap, file-to-Base64 encoding, optional Data URL output, pasted or dropped files up to 20 MB, and Base64/Data URL decoding back to downloadable files.

### UUID Generator

Supports UUID v4 and UUID v7, 1–1000 values per batch, lowercase or uppercase output, optional hyphen removal, copy, regeneration, and `.txt` download.

### Hash Generator

Supports MD5, SHA-1, SHA-256, SHA-384, and SHA-512 for text or files up to 50 MB, lowercase or uppercase digest output, copy, `.txt` download, and hash comparison.

### Image Tools

Provides browser-side image compression, resize, crop, format conversion, optimization, and basic image inspection. PNG, JPEG, WebP, and AVIF workflows depend on browser decoding/encoding support. Batch operations are available where applicable.

### PDF Tools

Supports local PDF merge, page extraction, page reordering, and page rotation. Merge mode supports up to 12 PDFs, with 50 MB per-file and 150 MB aggregate limits. Password-protected PDFs are not supported.

### GIF Maker

Supports PNG, JPEG, WebP, and AVIF source frames, frame reordering, configurable delay, palette size, contain/cover fitting, custom output dimensions, background color, loop control, preview, and GIF download. Up to 30 source frames can be queued.

### Favicon Generator

Accepts PNG, JPEG, WebP, AVIF, and SVG sources up to 15 MB. It generates a multi-size `favicon.ico`, browser PNGs, Apple touch icon, 192/512 px web-app icons, `site.webmanifest`, recommended HTML tags, and a ZIP package.

### Excel Tools

Accepts XLSX, XLS, CSV, and JSON files up to 50 MB. Features include spreadsheet preview/search, XLSX/CSV/JSON export, sheet extraction, workbook splitting, workbook merge, sheet combining, empty-row/column cleanup, whitespace trimming, find/replace, column rename, sorting, and duplicate detection/removal. The tool is data-first; complex macros, charts, pivots, and advanced formatting are not guaranteed to survive transformations.

### Network Tools

Includes an IPv4 subnet calculator, CIDR reference, exact IP-range-to-CIDR summarization, subnet splitting, IPv4 binary/hex/integer conversion, MAC normalization and flag inspection, bandwidth conversion, ideal transfer-time estimation, common-port reference, and DNS record inspection. Network calculations run locally; DNS inspection sends the requested domain and record type to Cloudflare's public DNS-over-HTTPS resolver.

### Social Media Tools

The Social category currently includes:

- `/social/carousel-splitter/` — split one seamless design into 2–10 social-media slides and download individual images or a ZIP.
- `/social/grid-preview/` — arrange up to 12 images in a three-column profile-grid preview and export the preview.
- `/social/safe-zone/` — preview automatic platform-oriented safe-zone guides with optional manual fine-tuning.

Safe-zone presets are practical guides, not official platform specifications.

### Work Schedule Generator

Creates monthly employee work/shift schedules with configurable shifts and minimum coverage. Each employee has a monthly request-off form. Requested dates are treated as unavailable during generation, while manual overrides are flagged by validation. The tool also checks minimum shift coverage, excessive consecutive work days, and consecutive night-shift limits.

Schedule projects are stored locally in IndexedDB so previous months can be reopened from the same browser profile. Users can duplicate setup to the next month, export a project backup as JSON, import a backup, and export the schedule as an XLSX workbook containing Schedule, Staff Summary, Shift Definitions, and Validation sheets.

### Bulk Certificate Generator

The certificate workflow is intentionally a bulk-generation tool rather than a full design editor:

1. Upload an almost-finished certificate design as PNG, JPG, WebP, or PDF. Static elements such as the background, border, logo, event title, signatures, and decorations should already be part of the design.
2. Download the optional Astakula participant Excel template or upload an existing XLSX/XLS/CSV participant list. The first row is treated as column headers.
3. Detected spreadsheet columns become dynamic fields. Add the fields needed on the certificate, drag them into position, and configure typography.
4. Preview different recipients and generate the current certificate, a PNG ZIP batch, or a multi-page PDF.

The supplied spreadsheet template is recommended, not mandatory. `name` is the typical minimum field, while optional data can include `certificate_no`, `company`, `role`, `event`, `date`, or any custom spreadsheet column. The interface currently limits imported participant rows to 500 for a predictable browser-side workflow.

Certificate typography uses a curated Google Fonts list loaded on demand. The browser contacts Google Fonts only when a selected font needs to be loaded. The certificate design and participant spreadsheet remain processed in the browser rather than being uploaded to an Astakula application backend.

## Privacy and data flow

Most transformations run locally in the browser. Important exceptions or persistent browser behavior currently include:

- **DNS Inspector:** sends the requested domain and record type to Cloudflare DNS-over-HTTPS.
- **Work Schedule Generator:** stores editable schedule projects in the browser's IndexedDB until site data is cleared or the projects are deleted.
- **Theme preference:** stored in `localStorage`.
- **Bulk Certificate Generator:** loads selected web fonts from Google Fonts; participant spreadsheets and certificate templates are processed locally.
- **CDN libraries:** several tools load browser libraries from jsDelivr. Loading those assets creates normal requests to jsDelivr, but Astakula application code does not intentionally send tool-input contents to the CDN.

See `/privacy/` for the public Privacy Policy.

## UI

The UI uses a shared neobrutalist design system. The BRUT package `@sprtn/ui@1.3.2` is loaded through jsDelivr and normalized by the shared Astakula styles.

- `assets/css/astakula.css` contains the shared token bridge, site chrome, light/dark normalization, focus treatment, BRUT compatibility, and responsive behavior.
- Tool-level `style.css` files contain only tool-specific presentation.
- `assets/js/theme.js` controls shared light/dark mode and common site enhancements.

## Browser dependencies

Current browser-side libraries include:

- `pdf-lib@1.17.1` for PDF page operations.
- `pdfjs-dist@4.10.38` for rendering the first page of an uploaded PDF certificate template.
- `gifenc@1.0.3` for GIF encoding.
- `jszip@3.10.1` for ZIP creation.
- `xlsx@0.18.5` for spreadsheet parsing/writing.
- `jspdf@2.5.2` for certificate PDF export.
- Google Fonts API for fonts selected inside Bulk Certificate Generator.

## Project structure

```text
astakula-tools/
├── assets/
│   ├── css/
│   │   ├── astakula.css
│   │   └── legal.css
│   └── js/
│       ├── theme.js
│       └── theme-core.js
├── qr/
├── json/
├── base64/
├── uuid/
├── hash/
├── image/
├── pdf/
├── gif/
├── favicon/
├── excel/
├── network/
├── social/
│   ├── carousel-splitter/
│   ├── grid-preview/
│   └── safe-zone/
├── schedule/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── certificate/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── privacy/
├── terms/
├── 404.html
├── favicon.svg
├── index.html
├── robots.txt
└── sitemap.xml
```

## SEO / AEO / GEO

Production pages use canonical URLs under `https://tools.astakula.com/`, descriptive metadata, Open Graph/Twitter metadata, structured data where appropriate, and visible explanatory/FAQ content for indexable utility pages. `robots.txt` points to the canonical sitemap.

## License

MIT
