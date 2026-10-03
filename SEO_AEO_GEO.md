# Astakula Tools — SEO, AEO & GEO Implementation

Audit date: 2026-10-03
Production domain: https://tools.astakula.com/
Parent brand: Astakula
Developer / creator entity: Ariyo Ardiwardana

## A. Audit findings

- Architecture: static HTML/CSS/JavaScript deployed as a GitHub Pages-style site with a custom `CNAME`; no application framework, server renderer, hydration layer, API route, account system, or project database is present in the repository.
- Routing: directory-based static routes with trailing slashes (`/qr/`, `/json/`, etc.). Each public tool already has its own `index.html` landing page and canonical URL.
- Rendering: page copy and tool shells are static HTML; tool interaction is client-side JavaScript. Shared theme behavior is centralized in `assets/js/theme.js`.
- Existing metadata: canonical URLs, titles, descriptions, Open Graph, Twitter metadata, robots meta tags, `robots.txt`, `sitemap.xml`, and a noindex 404 already existed. Tool metadata was also overwritten at runtime by the shared theme script, which created inconsistent `Tools Astakula` / `Astakula Tools` naming and keyword-heavy titles.
- Existing structured data: the homepage had WebSite/CollectionPage JSON-LD and the shared theme script injected WebPage/BreadcrumbList/WebApplication schema for tools. Creator identity and visible FAQ/direct-answer content were not represented consistently.
- Existing internal links: the homepage already linked to every public tool. Individual tools did not consistently link to relevant sibling tools or legal/privacy pages.
- AEO/GEO gap: tool pages described functionality but did not consistently provide a direct definition, concise how-to steps, common use cases, visible FAQ, related-tool links, or an explicit creator/brand relationship.
- Privacy gap: several pages made local-processing statements, but there was no central public Privacy Policy explaining the exception for DNS Inspector, shared theme localStorage, or third-party browser-library delivery.
- Performance: there is no framework/hydration overhead. Existing third-party libraries are loaded only on the tools that use them. No new SEO dependency or analytics package was required.
- 404: `404.html` already carries `noindex` and links back to the tool directory.
- Live HTTP/HTTPS/www redirect behavior could not be conclusively tested from the repository-only audit and must be verified at the DNS/hosting layer.

## B. Changes implemented

- `assets/js/theme.js`
  - preserved the existing visual/theme implementation through `theme-core.js`;
  - normalized final tool titles, descriptions, author, canonical, Open Graph, and Twitter metadata;
  - added creator entity `Ariyo Ardiwardana` and parent organization `Astakula` to structured data;
  - expanded tool structured data with WebPage, BreadcrumbList, WebApplication, and FAQPage;
  - added concise visible AEO sections: direct answer, how to use, common use cases, FAQ, and related tools;
  - normalized visible brand naming to `Astakula Tools`;
  - added Privacy Policy / Terms links to shared footers;
  - uses native browser APIs only; no new package.
- `assets/js/theme-core.js`
  - immutable copy of the previous shared theme implementation so visual behavior and dark-mode compatibility remain intact while SEO/AEO/GEO logic is separated.
- `index.html`
  - changed homepage title to `Astakula Tools — Simple Online Utilities`;
  - replaced marketing-style metadata with concrete descriptions;
  - added `Ariyo Ardiwardana` as creator/author entity;
  - clarified the `Astakula → Astakula Tools → individual tools` relationship;
  - retained the full tool directory and added factual About copy and static legal links.
- `privacy/index.html`
  - added a source-grounded Privacy Policy.
- `terms/index.html`
  - added Terms of Service without invented jurisdiction, credentials, reviews, ratings, or statistics.
- `sitemap.xml`
  - refreshed all public canonical URLs and added Privacy / Terms routes.
- `SEO_AEO_GEO.md`
  - documents the audit, implementation, page map, structured data, privacy verification, and measurement recommendations.

## C. Page SEO map

| Page | Primary intent | Final title | H1 topic | Schema | Canonical | Index |
|---|---|---|---|---|---|---|
| `/` | browser utility directory | Astakula Tools — Simple Online Utilities | useful online tools | WebSite, CollectionPage, Organization, Person | `/` | index |
| `/qr/` | QR code generator | QR Code Generator — Astakula Tools | make a QR code | WebPage, BreadcrumbList, WebApplication, FAQPage | `/qr/` | index |
| `/json/` | JSON formatter | JSON Formatter — Astakula Tools | work with JSON | WebPage, BreadcrumbList, WebApplication, FAQPage | `/json/` | index |
| `/base64/` | Base64 encoder/decoder | Base64 Encoder & Decoder — Astakula Tools | encode/decode Base64 | WebPage, BreadcrumbList, WebApplication, FAQPage | `/base64/` | index |
| `/uuid/` | UUID generator | UUID Generator — Astakula Tools | generate UUIDs | WebPage, BreadcrumbList, WebApplication, FAQPage | `/uuid/` | index |
| `/hash/` | hash generator/checksum | Hash Generator — Astakula Tools | generate a hash | WebPage, BreadcrumbList, WebApplication, FAQPage | `/hash/` | index |
| `/image/` | image utility suite | Image Tools — Astakula Tools | image processing | WebPage, BreadcrumbList, WebApplication, FAQPage | `/image/` | index |
| `/pdf/` | PDF page tools | PDF Tools — Astakula Tools | PDF page operations | WebPage, BreadcrumbList, WebApplication, FAQPage | `/pdf/` | index |
| `/gif/` | GIF maker | GIF Maker — Astakula Tools | images to GIF | WebPage, BreadcrumbList, WebApplication, FAQPage | `/gif/` | index |
| `/favicon/` | favicon generator | Favicon Generator — Astakula Tools | favicon package | WebPage, BreadcrumbList, WebApplication, FAQPage | `/favicon/` | index |
| `/excel/` | spreadsheet utilities | Excel Tools — Astakula Tools | spreadsheet data | WebPage, BreadcrumbList, WebApplication, FAQPage | `/excel/` | index |
| `/network/` | subnet/network utilities | Network Tools — Astakula Tools | network calculations | WebPage, BreadcrumbList, WebApplication, FAQPage | `/network/` | index |
| `/privacy/` | privacy information | Privacy Policy — Astakula Tools | Privacy Policy | WebPage, Organization, Person | `/privacy/` | index |
| `/terms/` | terms of service | Terms of Service — Astakula Tools | Terms of Service | WebPage, Organization, Person | `/terms/` | index |
| `404.html` | error page | Page not found — Tools Astakula | nothing here | none | none | noindex |

## D. Structured data

Homepage:
- Organization (`Astakula`)
- Person (`Ariyo Ardiwardana`)
- WebSite (`Astakula Tools`)
- CollectionPage + ItemList of the 11 public tools

Tool pages:
- Organization
- Person
- WebPage
- BreadcrumbList
- WebApplication
- FAQPage, matching the visible FAQ generated on the page

Legal pages:
- Organization
- Person
- WebPage

No aggregate rating, review, offer, fake author credential, fake statistic, or testimonial schema is used.

## E. Technical SEO status

- robots.txt: pass — public crawling allowed, sitemap declared.
- sitemap.xml: pass — canonical production URLs only; no API/auth/query/private routes.
- canonical: pass — homepage and tool pages self-canonical; legal pages self-canonical.
- metadata: pass — concise titles/descriptions, robots, OG, Twitter, author.
- semantic HTML: existing main/header/footer/section/article structure retained; AEO content uses headings, lists, details/summary, and nav.
- internal links: homepage reaches every tool; each tool receives related-tool links; footers link to Privacy and Terms.
- 404: pass — custom noindex 404 exists.
- rendering: static site with client-side interactivity; no hydration overhead.
- lazy/image considerations: generated previews are user-created runtime content; no new decorative image payload was added for SEO.
- dependencies: no new library was introduced.

## F. AEO implementation

Every tool now receives:
- a question-style `What is...` / `What can...` heading;
- a concise 1–3 sentence direct answer;
- three practical usage steps;
- common use cases;
- three implementation-specific FAQs;
- related-tool links.

Answers deliberately describe current capabilities and limitations rather than broad marketing claims.

## G. GEO implementation

Entity relationship used consistently:

`Astakula → Astakula Tools → individual WebApplication pages`

Creator relationship:

`Ariyo Ardiwardana → creator of Astakula Tools and individual tool WebApplication entries`

Machine-readable identifiers are kept stable across homepage and tool schema:
- `https://astakula.com/#organization`
- `https://tools.astakula.com/#ariyo-ardiwardana`
- `https://tools.astakula.com/#website`

The visible homepage About section states the same relationship in plain language, avoiding hidden or crawler-only claims.

## H. Privacy verification

| Tool / feature | Processing location | Data sent externally? | App storage? | External dependency / API |
|---|---|---|---|---|
| QR Generator | browser | tool input: no Astakula backend | none identified | qrcode-generator + UI assets from jsDelivr |
| JSON Formatter | browser | no | none identified | UI assets from jsDelivr |
| Base64 | browser | no | none identified | UI assets from jsDelivr |
| UUID Generator | browser | no | none identified | UI assets from jsDelivr |
| Hash Generator | browser | no | none identified | UI assets from jsDelivr |
| Image Tools | browser | no | none identified | UI assets from jsDelivr; native browser image APIs |
| PDF Tools | browser | no | none identified | pdf-lib + UI assets from jsDelivr |
| GIF Maker | browser | no | none identified | gifenc + UI assets from jsDelivr |
| Favicon Generator | browser | no | none identified | JSZip + UI assets from jsDelivr |
| Excel Tools | browser | no | none identified | SheetJS/xlsx + JSZip + UI assets from jsDelivr |
| Network calculations | browser | no | no history/database identified | UI assets from jsDelivr |
| DNS Inspector | browser + Cloudflare DoH | yes: requested domain and record type to Cloudflare | no history/database identified | `cloudflare-dns.com/dns-query` |
| Theme preference | browser | no | `localStorage` theme value | native browser storage |

No analytics or advertising tracking service was identified in the audited repository.

## I. Remaining recommendations

Repository work cannot by itself complete the following external configuration tasks:

1. Verify the production property in Google Search Console and Bing Webmaster Tools, then submit `https://tools.astakula.com/sitemap.xml`.
2. Confirm at the DNS/hosting layer that HTTP permanently redirects to HTTPS and that any unintended `www.tools.astakula.com` hostname either redirects to the canonical host or is not published.
3. Monitor Search Console indexing/CWV data after deployment before making performance changes based on assumptions.
4. If analytics is later required, define consent/privacy requirements before adding a tracking provider and update the Privacy Policy accordingly.
5. Re-audit privacy statements whenever a tool begins using an external API, server-side processing, authentication, persistent storage, or analytics.
