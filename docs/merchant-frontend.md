# Merchant frontend

The merchant module is implemented against M4/M5 contracts. Live access remains
disabled: no M1 session adapter, order authentication adapter, production endpoint
URL, or fake success fallback is installed. Existing demo AuthContext is used only
for the existing navigation/layout, never as verified identity for backend requests.
Setting a browser environment flag alone cannot activate live access.

## Review locally

Use the Node version required by the repository's Vite dependency. Run `npm ci`,
then `npm run dev` from swiftdrop-frontend. On /login use the existing Merchant
quick-demo option and sign in. This is the existing demo account flow, not real auth.

- /merchant: default unavailable state; no backend requests are sent.
- /merchant?preview=approved: explicitly labelled read-only sample overview.
- /merchant/onboarding?preview=new: empty onboarding form.
- /merchant/profile?preview=pending: pending application.
- /merchant/profile?preview=rejected: rejected application and sample reason.
- /merchant/profile?preview=approved: approved profile with legal identity read-only.
- /merchant/api-keys?preview=approved: sample credential metadata; mutation disabled.
- /merchant/orders/new?preview=approved: shipment form with sample pickup address.
- /merchant/orders?preview=approved: sample order, filters and pagination.
- /merchant/orders/00000000-0000-0000-0000-000000000001?preview=approved: sample details.

Use the merchant page tabs to preserve the preview parameter. Sidebar navigation
returns to the unavailable default. Preview exists only in Vite development mode;
production builds ignore the preview parameter. All preview writes fail closed;
they never generate credentials, register businesses or create shipments. Interactive
secret reveal, rotation/revocation and submission success/error flows are covered
with isolated mocked tests, not a production fake-auth mode.

Check widths around 375, 768 and 1280 pixels. Tables scroll horizontally on small
screens, forms collapse to one column, actions wrap, and dialogs use native modal
semantics (focus containment, Escape, focus restoration). Existing cards, buttons,
status badges, dashboard layout, empty state and theme variables are reused.

## Routes and compatibility

New routes: /merchant/onboarding, /merchant/profile, /merchant/api-keys,
/merchant/orders/new, /merchant/orders, /merchant/orders/:id. /merchant/book redirects
to order creation; /merchant/parcels redirects to orders. Customer BookParcel and
parcel-store are untouched. /merchant/bulk remains the existing separate mock demo
and is labelled as such in merchant navigation. It does not call M5.

The dashboard shows only approval state, supported total count and recent canonical
orders. Revenue, success rates, trends and payment success are not fabricated.

## Integration and contracts

MerchantSessionAccess must be supplied by M1 from verified authentication. It must
agree cookie/CSRF or bearer transport and stable account identity. MerchantOrderAccess
is separately unavailable: the existing M5 contract uses a machine API key. An approved
server-side bridge or reviewed human-session order API is required for browser use.
No browser key prompt, automatic reuse of generated keys, or secret persistence exists.

Services use an isolated Axios instance, explicit base URL, bounded timeout and safe
error normalization. M4 profile absence is recognized only for the authenticated
MERCHANT_NOT_FOUND 404. Other failures never trigger mock or onboarding success.
Management mutations require readiness; generation/profile changes also require
APPROVED. Owners can list/revoke keys without approval, matching M4.

React Query is used only for profile, metadata and order reads. Each merchant page
has its own account-keyed cache scope, destroyed on account/page change. Key issuance
and rotation use direct requests with local one-time reveal state, never mutation
caches. Plaintext keys are not placed in localStorage, sessionStorage, URLs, logs,
toasts or analytics. The explicit copy action writes only to the user's clipboard;
the UI reminds them to clear it. Reveals unmount on dismissal/navigation/logout.

M5 requests use uppercase backend enums and structured addresses. Filters and paging
are sent to the service; unsupported recipient search is absent. Creation generates
one UUID idempotency key and freezes its validated payload. No POST retries happen
automatically. An explicit retry uses the same payload/key. Uncertain/conflicting/
definitively rejected outcomes cannot be retried through a new automatic attempt.
Leaving an unresolved form warns of lost in-memory context; save the non-secret
reference for reconciliation. No offline creation or persistent recipient draft exists.

M1 authentication, backend HTTP/persistence activation, gateway/CORS routing,
browser-to-M5 authorization and M2 parcel endpoints/deduplication/reconciliation
remain blockers. Backend files and Neon are outside this frontend change.

## Verification

Run `npm run build`, `npm run lint`, and `npm test`. Vitest/Testing Library tests
cover pages, approval states, schema validation, sanitized errors, contract calls,
idempotency preservation, explicit preview boundaries, secret cleanup and query-cache
non-disclosure. Tests mock network services and never contact Neon or real backends.

The standard build currently encounters three pre-existing TS6133 unused imports:
Users in AboutPage, MessageSquare in ContactPage, and Sparkles in LandingPage.
Those teammate files are intentionally untouched. To review the production bundle
without editing them, run `node node_modules/typescript/lib/tsc.js -p tsconfig.app.json
--noUnusedLocals false` followed by `node node_modules/vite/bin/vite.js build`.
This excludes only the unused-local check; the regular build result is reported
separately and is not claimed to pass.

The full created/modified file inventory is in merchant-files.md.
