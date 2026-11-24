# Publishing and synchronization

The user wants the local checkout, GitHub, Vercel and Cloudflare Pages to use the same committed website version. Read `PUBLISH_WORKFLOW.md` and `CLOUDFLARE_DEPLOYMENT.md` before publishing.

- Use GitHub `main` as the shared source. Fetch before editing, reconcile incoming commits without overwriting local work, and commit only the changes within the authorized task.
- Preserve the Vercel project, GitHub integration, domain bindings and environment variables alongside Cloudflare Pages.
- Pushing `main` triggers the existing Vercel integration and `.github/workflows/cloudflare-pages.yml`. Do not claim both deployments succeeded until their actual statuses are verified.
- Never put local Wrangler OAuth tokens or refresh tokens in GitHub. Continuous deployment uses a dedicated encrypted Cloudflare API token with Pages permissions for the intended account.
- Run the appropriate validations in the publish workflow. The Cloudflare workflow verifies `/api/health` reports the exact pushed commit and configured email delivery.
- Local uncommitted changes are not published. Changes made directly on GitHub must be pulled into the local checkout before further editing.
- If a platform is suspended, credentials are missing or domain cutover is incomplete, report that explicitly. A successful Pages preview does not prove the original domain is working.
