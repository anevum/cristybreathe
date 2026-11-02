# The Kitchen — Slice A (source candidate)

**Status:** Source-only, intended for review. Not merged, deployed or connected to retailer accounts. Product design authority: [The Kitchen V1.0 in the private planning workspace](https://app.notion.com/p/40c88cc2ef14816b95ffc6b03f7ab214).

## Delivery boundary

A separate `#kitchen` route is mounted inside the existing private CristyBreathe SPA and Cloudflare Access boundary. Existing routes, entries, authentication, database migrations, deploy configuration and background jobs are unchanged.

- One-tap starter menu of five dinners from a seven-recipe curated catalog. Initial yield is six portions per dinner, adjustable to four, six, eight or ten. This is **not** confirmed household appetite.
- Ingredients and package counts are deterministic. Cross-recipe ingredients consolidate and quantities are rounded to retail-style example packages, but these are not verified store products.
- Changing Thursday's recipe or the number of portions recalculates the shopping bag and printable recipe pages from the same in-memory plan version.
- Explicit “already have” selections remove only those ingredient lines from the grocery bag, without losing ingredient quantities from recipes.
- Kitchen menu, bag, recipe Cook Mode, print edition and optional explicit Walmart **search links**. A search link is not a matched retail product or a prepared cart.
- Seven calculation/validation tests plus Chromium behavior and print-layout tests at 1440, 390 and 320 px.

## Deliberate limitations

- The starter menu is a **draft** and requires personal confirmation of allergies, dietary restrictions, food labels, serving sizes, food safety and actual food preferences before use. An unconfirmed allergy state is not “no allergies.”
- These recipes and package assumptions are initial fixtures, not professionally tested or nutritionally reviewed meal kits.
- Kitchen plans are held only in JavaScript memory and disappear on refresh; no DB schema, API or scheduled workflow is added in this increment. This is explicitly shown to the user. Nothing sends Kitchen content to an external AI model.
- No real grocery price/availability checks, pantry sync, household basics, retailer API, cart write, checkout, payments or automated purchases.
- No cookies, tokens or client credentials from a grocery retailer are accepted. Current outbound links are user-initiated Walmart searches only.
- No public family sharing or notifications. No change to Cloudflare Access policies.
- Recipe pages are intentionally text-and-CSS illustrations in this increment. Licensed final food imagery and real kitchen usability feedback remain later design quality gates.

## Architecture

- `public/kitchen-core.js`: pure deterministic recipe catalog and ingredient computation, `makePlan`, `swap`, `changeServings`, `setPantry` and `listText`. Nothing persisted or sent.
- `public/kitchen-ui.js`: an isolated in-memory view, delegates only inside its own Kitchen container. No inline event handlers or inline styles.
- `public/kitchen.css`: scoped warm organic visual language with responsive and print layouts. Print-only display modifications are gated to the Kitchen view; existing app printing remains unaffected.
- `public/index.html`: loads the two scripts **before** the existing `app.js` using `defer`, and the Kitchen stylesheet.
- `public/app.js`: adds `kitchen` navigation and a low-friction home entry, without changing the existing API or data serialization.

The existing Worker authenticates every static asset and API request before serving it. The main app remains responsible for current-account session checks. The Kitchen view does not call a new API. Existing Content Security Policy forbids inline scripts/styles and unapproved network connections; the new feature respects that boundary.

## Verification and acceptance

Run repository-native checks from the root:

```sh
npm ci
npm run build
node --check dist/worker.mjs
node --check public/app.js
npm test
```

The new `tests/kitchen.test.mjs` exercises ingredient and package consolidation, meal substitution, servings, pantry toggles, invalid/excluded ingredients and unpriced cart provenance. The new `tests/kitchen-browser.test.mjs` exercises the actual UI component, step navigation, print media, absence of inline style attributes, and mobile/desktop overflow.

Before merging or any real usage, independently run existing full CI, synthetic-account authentication/owner isolation, exact-head build, real iPhone Safari and VoiceOver acceptance, and a clinical-quality food safety/allergy review. Actual source-to-live parity, Access configuration and D1 backup are separately gated by the existing project runbook.

## Next bounded increment

Review the draft PR and its CI. After acceptance, add server-persisted owner-scoped plan revisions and optional preference confirmation **without** introducing retailer account access. Keep production and purchase changes behind separate approvals.
