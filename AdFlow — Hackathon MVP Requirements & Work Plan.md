# AdFlow — Hackathon MVP: Detailed Requirements & Work Plan

**Team:** 4–5 balanced full-stack developers
**Chain:** Arc (EVM / Solidity)  
**Agent stack:** Anthropic Claude (tool use)
**Time constraint:** 36 hours
**Date:** April 2026

---

## Part 1: Gaps, Implicit Assumptions & Decisions Needed

Before diving into requirements, here are the things your document leaves implicit or unresolved. Each one has a recommended resolution for hackathon scope.

### 1.1 Identity & Auth

**Gap:** "Both parties onboard with just an email" — but what does the session look like? Is there a dashboard? Do they stay logged in?

**Recommendation:** Use Dynamic for email-to-wallet onboarding (this is required for the Dynamic prize anyway). Dynamic handles embedded wallet creation behind the scenes. The user signs in with email, Dynamic creates/recovers an embedded wallet, and your app never exposes seed phrases or wallet UX. Session = JWT from Dynamic, persisted in browser.

### 1.2 What is a "Listing"?

**Gap:** The document says "a publisher provides their site URL and a floor price" and "an agent analyzes the site and creates a listing." But what exactly does a listing contain? What's stored on-chain vs. off-chain?

**Recommendation — Listing object:**

| Field | Source | Storage |
|---|---|---|
| `publisher_id` (wallet address) | Dynamic | On-chain (registry contract) |
| `site_url` | Publisher input | Off-chain (DB) |
| `site_summary` | Agent-generated from URL crawl | Off-chain (DB) |
| `categories` / `tags` | Agent-generated | Off-chain (DB), indexed for search |
| `audience_description` | Agent-generated | Off-chain (DB) |
| `floor_price_cpm` (in USDC) | Publisher input | On-chain (registry contract) |
| `content_policies` | Publisher input (assisted by agent) | Off-chain (DB) |
| `ad_slot_spec` (dimensions, position) | Publisher input | Off-chain (DB) |
| `status` (available / occupied) | Derived from contract state | On-chain |
| `ENS name` (optional) | Publisher registers | On-chain (ENS) |

Only the financial primitives (price, status, wallet) need to be on-chain. Everything descriptive lives in a database and is queried by agents.

### 1.3 What is an "Order"?

**Gap:** "Advertiser placing an order, specifying impressions, budget" — but what does the order lifecycle look like? What states can it be in?

**Recommendation — Order states:**

```
CREATED → CREATIVE_PENDING → CREATIVE_SUBMITTED → UNDER_REVIEW → APPROVED → FUNDED (escrow locked) → LIVE → COMPLETED
                                                       ↓
                                                   REJECTED (advertiser revises creative)
```

For the hackathon, the happy path is enough: CREATED → CREATIVE_SUBMITTED → APPROVED → FUNDED → LIVE → COMPLETED. Skip REJECTED for now (mention it in the presentation as a designed feature).

### 1.4 What Does "Verification" Actually Do at Hackathon Scope?

**Gap:** "AdFlow Verification → Publisher and advertisers initiate their agreement and do due diligence on both ends." This is vague. What checks happen, and who triggers them?

**Recommendation — Two verification steps, both via Claude:**

1. **Intent verification (automatic, on order creation):** The advertiser agent checks that the publisher's site category matches the advertiser's target audience. The publisher agent checks that the advertiser's industry and product don't violate the publisher's content policies. Both are classification calls to Claude — fast, cheap, no generation needed. If both pass → order proceeds. If either fails → order is rejected with a reason.

2. **Creative verification (on creative upload):** The publisher agent reviews the uploaded image/banner against the publisher's content policies and style preferences. This is a vision + classification call to Claude. Pass → creative approved, escrow funded. Fail → reason returned, advertiser can re-upload.

### 1.5 Escrow & Payment Streaming Mechanics

**Gap:** The document says "payment streams to the publisher as impressions are delivered" and mentions 1,000-impression batches. But for the hackathon (no Chainlink CRE, no real CDN), who triggers the payment release?

**Recommendation:** For the hackathon demo, use a **manual/simulated trigger**. The dashboard has a "Simulate 1,000 Impressions" button (or an auto-incrementing timer). Each trigger calls a backend endpoint that calls the smart contract's `releasePayment()` function, which releases the next 1,000-impression batch from escrow to the publisher. This shows the streaming payment pattern without needing real ad serving infrastructure.

**Smart contract design (minimal):**

- `createDeal(publisherAddress, totalImpressions, cpmPrice)` — locks USDC in escrow
- `reportImpressions(dealId, newCount)` — called by the AdFlow backend (simulating the oracle); releases proportional payment
- `completeDeal(dealId)` — releases any remaining funds when all impressions are served
- `refund(dealId)` — returns unspent escrow to advertiser (stretch goal: dispute flow)

### 1.6 Ad Loading — Recommendation on Demo Approach

You asked for help evaluating the best option. Here's my recommendation:

**Go with the hybrid approach.** Here's why:

- **Real embed on a demo page** gives you a WOW factor moment in the presentation: "Here's a real website. Watch — the ad just changed because a new advertiser just won the slot." Judges love live demos.
- **Simulated/accelerated impression counting** keeps the scope sane. You don't need real traffic; you just need the smart contract to respond to impression reports.

**How it works practically:**
- You build one static demo page (e.g., a fake coffee blog) that includes an AdFlow `<script>` tag.
- The script fetches the current active creative from your backend API (not a real CDN — just your API serving the image URL).
- Each page load = 1 impression logged in your backend DB.
- A "turbo mode" button in the AdFlow dashboard simulates 1,000 impressions at once for the demo, triggering the smart contract payment release.

This is maybe 2–3 hours of extra work vs. pure simulation, but it makes the demo dramatically more compelling.

### 1.7 What Blockchain Data Actually Needs to Be On-Chain?

**Gap:** The document mentions a registry and escrow but doesn't specify which contracts are needed.

**Recommendation — Two contracts for the hackathon:**

1. **PublisherRegistry.sol** — Stores publisher wallet addresses, floor CPM prices, and slot availability. Minimal: `register(cpm)`, `updatePrice(cpm)`, `getPublisher(address)`.

2. **AdDeal.sol** (or a factory pattern) — Handles escrow and streaming payments. Created per deal. Holds USDC, releases in batches based on reported impressions.

**Out of scope for hackathon:** Staking, dispute resolution, slashing. Mention these in the pitch deck as designed features.

### 1.8 ENS Integration

**Gap:** ENS is listed as a prize target but the user flows don't mention it.

**Recommendation:** Each publisher can optionally register an ENS name (e.g., `coffeegeek.adflow.eth`) that resolves to their listing metadata. The advertiser agent can discover publishers by querying ENS. This is lightweight to implement (a few resolver calls) and directly targets the ENS prize. Assign it as a stretch goal to whoever finishes their core work first.

### 1.9 Frontend Scope

**Gap:** No mention of what the UI looks like. Is it one app with two views, or two separate apps?

**Recommendation:** One Next.js app with role-based views:

- **Publisher dashboard:** Onboarding flow → listing management → active deals → earnings
- **Advertiser dashboard:** Onboarding flow → discovery/search → order placement → creative upload → campaign status
- **Shared:** Login/signup (Dynamic), deal status view

### 1.10 Database & Backend

**Gap:** No mention of backend infrastructure.

**Recommendation:** Keep it minimal:

- **Backend:** Node.js/Express or Next.js API routes
- **Database:** PostgreSQL (Supabase for speed) or even SQLite for hackathon
- **What's stored:** Listings metadata, order state, creative assets (URLs), impression counts, agent conversation logs
- **What's NOT stored (lives on-chain):** Escrow state, payment releases, publisher registration

---

## Part 2: Detailed Requirements Per User Flow

### Flow 1: Publisher Onboarding & Listing Creation

**Trigger:** Publisher lands on AdFlow, clicks "I'm a Publisher."

**Steps:**
1. Publisher enters email → Dynamic creates embedded wallet (no crypto UX exposed).
2. Publisher enters their site URL.
3. AdFlow's publisher agent (Claude) crawls the URL, analyzes content, and generates: site summary (2–3 sentences), category tags (e.g., "specialty coffee", "espresso equipment", "product reviews"), estimated audience profile, and suggested ad slot dimensions.
4. Publisher reviews the agent's analysis, edits if needed.
5. Publisher sets: floor CPM price (in USD — converted to USDC behind the scenes), content policies (checkboxes + free text: "no gambling", "no adult", "no competitors", custom rules), and ad slot specification (dimensions, placement description like "sidebar 300x250").
6. Publisher confirms → agent creates listing: writes to PublisherRegistry contract (wallet, CPM) and stores metadata in DB.
7. Publisher sees their dashboard with listing status = "Live — awaiting advertisers."

**Acceptance criteria:**
- A publisher can go from zero to live listing in under 3 minutes.
- The agent's site analysis is accurate enough to be useful (not garbage tags).
- The listing appears in search results for advertisers immediately.

---

### Flow 2: Advertiser Onboarding

**Trigger:** Advertiser lands on AdFlow, clicks "I'm an Advertiser."

**Steps:**
1. Advertiser enters email → Dynamic creates embedded wallet.
2. Advertiser provides: company/product name, industry/category, target audience description (free text), budget range, and any exclusion criteria (e.g., "no sites under 1,000 monthly visitors").
3. AdFlow's advertiser agent (Claude) summarizes their profile and confirms understanding.
4. Advertiser reviews and confirms → profile stored in DB.
5. Advertiser is taken to the discovery dashboard.

**Acceptance criteria:**
- Onboarding completes in under 2 minutes.
- The agent captures enough context to do meaningful matching later.

---

### Flow 3: Advertiser Discovery

**Trigger:** Advertiser is on their dashboard, wants to find publishers.

**Steps:**
1. Advertiser can either: browse all available listings (with filters: category, price range, audience type), OR type a natural language query to the agent (e.g., "Find me English-language sites about specialty coffee with CPM under $10").
2. The agent searches the listings DB, scores relevance, and returns ranked results with: site name/URL, site summary, category tags, audience profile, floor CPM, and a "match score" explaining why this site is a good fit.
3. Advertiser can click into a listing to see full details.
4. Advertiser selects a publisher → proceeds to order placement.

**Acceptance criteria:**
- Natural language search returns relevant results (not random).
- Agent explains its reasoning for match quality.
- Available vs. occupied slots are clearly indicated.

---

### Flow 4: Advertiser Places an Order

**Trigger:** Advertiser selects a publisher from discovery and clicks "Buy Ad Space."

**Steps:**
1. Advertiser specifies: number of impressions to purchase (e.g., 50,000), and maximum budget (calculated automatically from impressions × CPM, displayed to user).
2. **Intent verification fires automatically:**
   - Advertiser agent checks: does this publisher's audience match what I'm looking for?
   - Publisher agent checks: does this advertiser's industry/product comply with my content policies?
   - Both checks are Claude classification calls. Results shown to advertiser (e.g., "Match confirmed: this site's espresso enthusiast audience aligns with your premium coffee equipment product").
   - If either check fails → order blocked, reason shown, advertiser can pick a different publisher.
3. If both checks pass → order created in DB with status CREATIVE_PENDING.
4. Advertiser is prompted to upload their creative.

**Acceptance criteria:**
- Verification happens in under 5 seconds.
- Rejection reasons are clear and actionable.
- Budget calculation is transparent (impressions × CPM = total).

---

### Flow 5: Creative Upload & Review

**Trigger:** Order is in CREATIVE_PENDING state, advertiser uploads their ad banner.

**Steps:**
1. Advertiser uploads an image file (accepted formats: PNG, JPG, GIF; accepted dimensions: must match the publisher's ad slot spec).
2. Optionally provides: headline text, destination URL (where the ad links to).
3. **Creative verification fires automatically:**
   - Publisher agent (Claude with vision) reviews the image against the publisher's content policies and style preferences.
   - Checks: Is the content appropriate? Does it violate any stated policies? Is it the right dimensions?
   - Result: APPROVED or REJECTED with reason.
4. If approved → order status moves to APPROVED → escrow step.
5. If rejected → reason displayed, advertiser can re-upload.

**Acceptance criteria:**
- Creative review completes in under 10 seconds.
- Vision-based review catches obvious policy violations (e.g., adult content on a family-friendly site).
- Re-upload flow is smooth (no need to re-enter order details).

---

### Flow 6: Escrow Payment

**Trigger:** Creative is approved, order is in APPROVED state.

**Steps:**
1. System calculates total cost: impressions × CPM price.
2. Advertiser sees a confirmation screen: "Lock $X USDC in escrow for 50,000 impressions on [site name]."
3. Advertiser confirms → backend calls `createDeal()` on the AdDeal smart contract.
4. USDC is transferred from the advertiser's embedded wallet to the escrow contract.
5. Order status moves to FUNDED → then immediately to LIVE.
6. Publisher is notified: "New campaign live on your site."

**Acceptance criteria:**
- USDC transfer happens without the user seeing any crypto wallet popups (Dynamic handles signing).
- Escrow is verifiable on-chain.
- If the advertiser has insufficient USDC balance, show a clear error and a way to fund their wallet.

**Open question for your team:** How does the advertiser get USDC into their embedded wallet for the demo? Options: (a) pre-fund demo wallets with testnet USDC, (b) include a faucet button in the UI, (c) use Arc testnet with free tokens. Recommend option (c) — least friction.

---

### Flow 7: Ad Loading (Hybrid Demo)

**Trigger:** Deal is LIVE.

**Steps:**
1. The ad creative URL is stored in the backend, associated with the publisher's active deal.
2. A demo publisher page (static HTML page simulating a blog) includes the AdFlow `<script>` tag.
3. The script calls the AdFlow API: `GET /api/ad?publisher={id}` → returns the active creative URL and click-through link.
4. The script renders the ad banner on the page.
5. Each script call logs an impression in the backend DB.
6. In the demo, a "Turbo: Simulate 1K Impressions" button on the AdFlow dashboard bulk-inserts impression records and calls the smart contract.

**Acceptance criteria:**
- The demo page renders a real ad banner served by the AdFlow API.
- Refreshing the page shows the ad loading live.
- The dashboard impression counter updates in real-time (or near-real-time via polling).

---

### Flow 8: Stream-Based Settlement

**Trigger:** Impression count crosses a 1,000-impression threshold.

**Steps:**
1. Backend detects that the impression count for a deal has crossed the next 1K threshold.
2. Backend calls `reportImpressions(dealId, currentCount)` on the smart contract.
3. Smart contract calculates payment owed: `(currentCount - lastPaidCount) / 1000 * cpmPrice`.
4. Smart contract transfers that amount of USDC from escrow to publisher's wallet.
5. Both dashboards update: advertiser sees remaining budget decreasing, publisher sees earnings increasing.
6. When all impressions are consumed → deal status moves to COMPLETED, slot becomes available again.

**Acceptance criteria:**
- Payments release in correct amounts (exact math: impressions × CPM / 1000).
- Publisher balance updates visibly on their dashboard.
- When deal completes, the publisher's listing shows as "Available" again in the marketplace.

---

## Part 3: Work Breakdown & Team Allocation

Below is a division of work across 5 workstreams. With a balanced full-stack team of 4–5, each person owns one workstream. If you're 4, combine workstreams D and E (one person handles both the demo page and integration testing).

### Person A — Smart Contracts & Blockchain

**Scope:** Everything on-chain.

**Deliverables:**
- `PublisherRegistry.sol` — register publisher, store CPM, toggle availability
- `AdDeal.sol` — escrow creation, impression reporting, streaming USDC release, deal completion
- Deploy scripts for Arc testnet
- USDC testnet token setup (mock ERC-20 or Arc testnet USDC)
- Contract ABIs and addresses exported for frontend consumption

**Skills needed:** Solidity, Hardhat/Foundry, EVM concepts, ERC-20 token interactions.

**Time estimate:** ~12–14 hours (contracts are straightforward, most time goes to testing edge cases).

**Stretch goals:** ENS name registration for publishers, basic dispute/refund function.

---

### Person B — AI Agents & Backend Logic

**Scope:** All Claude integrations, agent logic, and core backend API.

**Deliverables:**
- Publisher agent: site analysis (crawl URL, extract content, generate summary/tags/audience profile via Claude)
- Advertiser agent: natural language search, relevance scoring, match explanation
- Intent verification: two-sided compatibility check (classification calls)
- Creative verification: vision-based content policy check (Claude with image input)
- API endpoints: `POST /listing`, `GET /listings/search`, `POST /order`, `POST /creative`, `GET /ad`
- Database schema and setup (Supabase or SQLite)

**Skills needed:** Node.js/TypeScript, Anthropic API (Claude tool use + vision), REST API design, basic DB.

**Time estimate:** ~14–16 hours (agent quality is where the demo shines — invest time here).

**Stretch goals:** Agent conversation memory (multi-turn negotiation), publisher agent personality tuning.

---

### Person C — Frontend (Publisher Side)

**Scope:** Publisher-facing UI and Dynamic wallet integration.

**Deliverables:**
- Login/signup with Dynamic (email-to-wallet)
- Publisher onboarding wizard: URL input → agent analysis display → pricing/policy configuration → confirm
- Publisher dashboard: listing status, active deals, earnings tracker (real-time USDC balance from chain), impression counter
- Dynamic SDK integration (wallet creation, transaction signing, balance display)
- Responsive design (judges will see this on a projector — make it look good)

**Skills needed:** React/Next.js, Dynamic SDK, wagmi/viem (for reading chain state), UI/UX sense.

**Time estimate:** ~14–16 hours.

**Stretch goals:** Notification when a new deal goes live, earnings chart over time.

---

### Person D — Frontend (Advertiser Side)

**Scope:** Advertiser-facing UI.

**Deliverables:**
- Advertiser onboarding wizard: profile setup → agent confirmation
- Discovery page: browse listings with filters + natural language search bar (agent-powered)
- Order flow: select publisher → specify impressions/budget → see verification result → upload creative → see review result → confirm escrow
- Campaign dashboard: active campaigns, impression progress, budget remaining, payment stream visualization
- Creative upload component (image upload with dimension validation)

**Skills needed:** React/Next.js, file upload handling, UI/UX sense, state management.

**Time estimate:** ~14–16 hours.

**Stretch goals:** Side-by-side publisher comparison view, campaign history.

---

### Person E — Demo Page, Integration & Presentation

**Scope:** The demo publisher site, end-to-end integration testing, and pitch prep.

**Deliverables:**
- Static demo page (fake coffee blog or similar) with AdFlow `<script>` embed
- The `<script>` itself: fetches active creative from API, renders it, logs impressions
- "Turbo mode" simulation endpoint and UI button
- End-to-end flow testing: onboard publisher → onboard advertiser → discover → order → upload → verify → escrow → serve ad → stream payment → complete
- Bug triage and integration fixes in the final 6–8 hours
- Pitch deck / demo script preparation

**Skills needed:** HTML/JS, API integration, testing mindset, presentation skills.

**Time estimate:** ~10–12 hours of building, ~4–6 hours of integration testing and pitch prep.

**Stretch goals:** Record a backup demo video (in case live demo fails), ENS integration.

---

## Part 4: Suggested Timeline (36 Hours)

| Phase | Hours | Focus |
|---|---|---|
| **Setup** | 0–2 | Repo setup, project scaffolding, DB init, contract boilerplate, Dynamic account setup, agree on API contracts between frontend and backend |
| **Core build** | 2–20 | Everyone builds their workstream in parallel. Person B (agents/backend) is the bottleneck — frontend needs API endpoints to integrate against. Recommendation: Person B publishes mock API responses by hour 4 so frontend can build against them. |
| **Integration** | 20–28 | Connect frontend ↔ backend ↔ contracts. Person E leads integration testing. Fix bugs. This phase always takes longer than you think. |
| **Polish & demo prep** | 28–34 | UI polish, demo script rehearsal, edge case handling, backup demo video recording |
| **Buffer** | 34–36 | Final fixes, deployment, submission |

---

## Part 5: Key Risks & Mitigations

**Risk 1: Dynamic SDK integration is fiddly.** Embedded wallets + transaction signing can have unexpected edge cases. **Mitigation:** Person C starts Dynamic integration in hour 0, not hour 10. Get a basic "sign in with email, see wallet address" working before building anything else.

**Risk 2: Agent quality is underwhelming.** If the site analysis returns generic/wrong tags, the demo falls flat. **Mitigation:** Person B should hardcode a few "golden" publisher profiles (e.g., CoffeeGeek) with manually curated data as fallbacks, so the demo always looks good even if the agent has an off moment.

**Risk 3: Smart contract bugs block the demo.** A single escrow bug can break the whole payment flow. **Mitigation:** Person A writes comprehensive unit tests (Foundry or Hardhat tests) and deploys to testnet by hour 12, giving 20+ hours for integration.

**Risk 4: End-to-end flow has too many steps for a live demo.** 8 user flows × 2 roles = a lot of clicking on stage. **Mitigation:** Pre-populate most of the state before the demo. Show the full flow in the pitch deck, then do a live demo of the most impressive part only (e.g., advertiser searches → agent matches → escrow locks → ad appears on the demo site → payment streams).

**Risk 5: USDC on testnet.** Make sure Arc testnet has a USDC faucet or deploy your own mock USDC ERC-20. Person A should validate this in hour 0–1.

---

## Part 6: What's Explicitly Out of Scope (For Alignment)

To avoid scope creep, the team should agree that these are **not** being built during the hackathon:

- Chainlink CRE / oracle integration (simulated)
- Real CDN ad serving (use API-served images instead)
- Staking and slashing mechanics (mention in pitch only)
- Dispute resolution / Kleros integration (mention in pitch only)
- Multi-chain deployment (Arc only)
- Real bot detection / fraud filtering (mention in pitch only)
- Publisher analytics dashboard (basic impression counter is enough)
- Mobile responsive design (desktop-only is fine for demo)
- ENS integration (stretch goal, not core)
- Multiple ad slots per publisher (one slot per publisher for MVP)
- Auction mechanism (first-come-first-served at floor price)
