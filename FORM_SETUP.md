# Inquiry form setup

The site's 26 quote forms use the same field contract and work in two modes:

1. On Vercel, `/api/quote` sends the request through Resend.
2. On a static host or before Resend is configured, the form preserves the completed brief and offers explicit Email, WhatsApp, and copy-to-clipboard actions.

With JavaScript unavailable, the browser can still send the five required text fields as a standard URL-encoded request when Resend is configured. The API returns a small noindex HTML confirmation or recovery page for this route instead of exposing raw JSON. Optional artwork is delivered only through the enhanced JavaScript flow; a file input cannot be transferred through the basic URL-encoded fallback.

Browser field-length limits mirror the API limits, including 120 characters for name and destination, 180 for email, 80 for phone and quantity, 160 for dimensions, and 3,000 for project details. Resend delivery is bounded by a 10-second server timeout, while the browser switches to the direct-contact fallback after 18 seconds. Identical normalized submissions use the same SHA-256 idempotency key so a network retry does not create a second email during the provider's deduplication window. A provider success response is accepted only when it contains valid JSON and a non-empty email ID; malformed success responses become a generic delivery failure instead of an unhandled server error.

Every quote form requires a delivery country or region (`country`) and includes an optional target in-hand date (`targetDate`). The enhanced request stops after 18 seconds; timeout, network, DNS, 404, validation, and server-delivery failures all expose the same Email, WhatsApp, and copy routes. The first recovery action receives keyboard focus. Those routes include the entered country and target date so the purchasing brief remains complete. If automatic clipboard access is unavailable, the page reveals a labelled, read-only textarea and selects the full brief for manual copying.

Attachment size, format, and local read failures use the same recovery panel instead of leaving the visitor at a text-only error. Browsers cannot transfer a selected attachment into another app, so the panel names the affected file when available and explains that the visitor must add it again before sending by Email or WhatsApp. Every form also tells visitors before submission to use those channels for larger files or unsupported source formats.

The frontend also retains first-visit attribution in session storage and includes the landing page, referrer, standard UTM fields, discovery channel, and discovery source with a submitted inquiry. Known ChatGPT, Perplexity, Copilot, Claude, Gemini, and You.com referrals are classified as `ai-search`; ordinary search, referral, campaign, and direct visits remain separate. This connects discovery to actual quote requests without enabling an advertising cookie. The privacy notice describes this behavior.

## Vercel environment variables

Add these values in the Vercel project under **Settings → Environment Variables**:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key |
| `QUOTE_TO_EMAIL` | Inbox that receives quote requests |
| `QUOTE_FROM_EMAIL` | Verified sender, including optional display name |

Example values are listed in `.env.example`. Do not commit real API keys.

## Sender domain

Verify the sender domain in Resend before using a `@glorystarpacking.com` address. Add the DNS records Resend provides to the active DNS provider. Keep the existing Namecheap email-forwarding MX and SPF records unless the mail service is intentionally changed.

## Attachments

The website accepts PDF, JPG/JPEG, PNG, and WebP files up to 3 MB. The API validates the filename extension, declared MIME type, Base64 payload, decoded file size, and file-signature bytes before forwarding an attachment. Renaming an unsupported file to an allowed extension is therefore not sufficient to pass validation.

Accepted files are sent through Resend as email attachments. The 3 MB limit leaves room for Base64 encoding inside Vercel's Function request limit. Quote API responses use `Cache-Control: no-store` so inquiry details are not intentionally cached by browsers or intermediaries.

## Deployment scope

- `.vercelignore` uses an allowlist so only public HTML, assets, the API, and required site/config files are included in the deployment.
- `robots.txt` disallows `/api/`; the quote endpoint is not a search landing page.
- `vercel.json` keeps `trailingSlash` set to `false`, matching the canonical `.html` URL format.

## Test checklist

Run `node scripts/test-quote-api.mjs` for the repeatable server-side regression checks, then complete the following real-delivery checks on a Vercel preview:

Run `node scripts/test-service-health.mjs` for the health endpoint regression, and run `node scripts/audit-production-services.mjs` after deployment. The production audit exits non-zero until all three Resend environment variables are present.

- Submit valid inquiries from the homepage, product catalog, one box page, and one label page.
- Confirm a submission without an attachment succeeds.
- Confirm a submission with each supported attachment type succeeds.
- Confirm delivery country is required and appears in the received email.
- Confirm the optional target in-hand date is preserved when entered and may be left blank.
- Confirm the email arrives and Reply goes to the visitor.
- Confirm a file over 3 MB produces the recovery panel, preserves the brief, focuses Email, and explains how to attach the file manually.
- Confirm a mismatched extension/MIME type, malformed Base64 payload, and incorrect file signature are rejected.
- Confirm the hidden honeypot field silently rejects bots.
- Confirm the email fallback opens with the full brief when the API is unavailable.
- Deny clipboard permission and confirm the copy action reveals and selects the full brief in a read-only textarea.
