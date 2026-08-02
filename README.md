# geo-ready-templates

Copy-paste templates that make a website legible to AI assistants: an `llms.txt` scaffold, a set of schema.org JSON-LD blocks, and a small dependency-free validator.

Search crawlers index pages. Assistants such as ChatGPT, Claude, Gemini and Perplexity do something different: they read a handful of sources and then paraphrase them from memory. Content that is unambiguous, self-contained and machine-readable survives that round trip. Content that relies on layout, images or implication does not. These templates are the boring groundwork for the former.

## What is in here

| Path | What it is |
| --- | --- |
| `templates/llms.txt` | Annotated `llms.txt` scaffold: title, summary blockquote, grouped links with descriptions. |
| `templates/schema-org/organization.jsonld` | Organization node: the identity anchor every other node points at. |
| `templates/schema-org/faqpage.jsonld` | FAQPage with answers written to stand alone when quoted. |
| `templates/schema-org/article.jsonld` | Article with author, dates, topics and citations. |
| `templates/schema-org/service-offer.jsonld` | Service with explicit Offer tiers, prices and currency. |
| `scripts/validate-llms-txt.mjs` | Node script that checks an `llms.txt` file or URL. No dependencies. |

## How to use it

1. Copy `templates/llms.txt` to the root of your site so it is served at `https://yourdomain.com/llms.txt` as `text/plain`.
2. Replace every `[placeholder]`. Delete the sections you cannot fill in honestly; a short accurate file beats a long speculative one.
3. Paste each JSON-LD template into the matching page inside a `<script type="application/ld+json">` tag, then swap in your own values.
4. Keep the `@id` values consistent across files so the nodes link into one graph.
5. Run the validator, and check the JSON-LD with Google's Rich Results Test or the Schema.org validator.

## Validating llms.txt

```bash
node scripts/validate-llms-txt.mjs templates/llms.txt
node scripts/validate-llms-txt.mjs https://yourdomain.com/llms.txt
```

Requires Node 18 or newer. Exit code is 0 when there are no errors, 1 when there are, so it drops straight into CI.

## Conventions these templates follow

- Absolute URLs everywhere. Relative paths lose their meaning the moment content is quoted somewhere else.
- One canonical `Organization` node, referenced by `@id` from every other node instead of being repeated.
- Answers and descriptions written as complete sentences that make sense without their surrounding page.
- Explicit numbers: prices with a currency, dates in ISO 8601, markets and languages named rather than implied.
- `dateModified` kept honest. Assistants weigh freshness, and a stale date is worse than none.

## Contributing

Issues and pull requests are welcome, especially additional schema types (Person, Event, SoftwareApplication, BreadcrumbList) and validator checks. Keep the templates dependency-free and readable without tooling.

## License

MIT. Use them commercially, no attribution required.
