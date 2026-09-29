# Tools Astakula

A small collection of browser-based utilities by Astakula.

Live site: https://tools.astakula.com/

## Available

- QR Generator — https://tools.astakula.com/qr/

The QR Generator currently supports URL, plain text, WhatsApp, Wi-Fi, email, phone, SMS, vCard, location, and calendar event payloads, with PNG and SVG export.

## Planned

- JSON Formatter
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
├── 404.html
├── favicon.svg
├── index.html
├── robots.txt
└── sitemap.xml
```

Where practical, processing is performed directly in the browser and user input is not uploaded to an Astakula server.

## License

MIT
