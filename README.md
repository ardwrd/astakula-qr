# Tools Astakula

A small collection of browser-based utilities by Astakula.

Live site: https://tools.astakula.com/

## Available

- QR Generator — https://tools.astakula.com/qr/
- JSON Formatter — https://tools.astakula.com/json/

The QR Generator supports URL, plain text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, location, and calendar event payloads, with PNG and SVG export.

The JSON Formatter supports formatting, minifying, validation, copy, download, drag-and-drop `.json` files, and 2/4-space indentation. Processing happens locally in the browser.

## Planned

- Base64
- UUID Generator
- Hash Generator
- Image Tools
- PDF Tools
- GIF Maker

## Structure

```text
astakula-tools/
├── assets/
│   └── css/
│       ├── tokens.css
│       ├── base.css
│       └── components.css
├── qr/
│   ├── index.html
│   ├── style.css
│   └── js/
├── json/
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
