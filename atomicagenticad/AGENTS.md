# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project Overview

**This project is AdFlow** — an agent-powered ad marketplace for the open web. Publishers list their sites, advertisers find them via AI agents, and payments stream on-chain via escrow contracts with delivery confirmed by a permissioned reporting layer.

The codebase is built on Scaffold-ETH 2 (SE-2), a starter kit for Ethereum dApps. It comes in **two flavors** based on the Solidity framework:

- **Hardhat flavor**: Uses `packages/hardhat` with hardhat-deploy plugin
- **Foundry flavor**: Uses `packages/foundry` with Forge scripts

Both flavors share the same frontend package:

- **packages/nextjs**: React frontend (Next.js App Router, not Pages Router, RainbowKit, Wagmi, Viem, TypeScript, Tailwind CSS with DaisyUI)

### Detecting Which Flavor You're Using

Check which package exists in the repository:

- If `packages/hardhat` exists → **Hardhat flavor** (follow Hardhat instructions)
- If `packages/foundry` exists → **Foundry flavor** (follow Foundry instructions)

## Common Commands

Commands work the same for both flavors unless noted otherwise:

```bash
# Development workflow (run each in separate terminal)
yarn chain          # Start local blockchain (Hardhat or Anvil)
yarn deploy         # Deploy contracts to local network
yarn start          # Start Next.js frontend at http://localhost:3000

# Code quality
yarn lint           # Lint both packages
yarn format         # Format both packages

# Building
yarn next:build     # Build frontend
yarn compile        # Compile Solidity contracts

# Contract verification (works for both)
yarn verify --network <network>

# Account management (works for both)
yarn generate            # Generate new deployer account
yarn account:import      # Import existing private key
yarn account             # View current account info

# Deploy to live network
yarn deploy --network <network>   # e.g., sepolia, mainnet, base

yarn vercel:yolo --prod # for deployment of frontend
```

## Architecture

### Smart Contract Development

#### Hardhat Flavor

- Contracts: `packages/hardhat/contracts/`
- Deployment scripts: `packages/hardhat/deploy/` (uses hardhat-deploy plugin)
- Tests: `packages/hardhat/test/`
- Config: `packages/hardhat/hardhat.config.ts`
- Deploying specific contract:
  - If the deploy script has:
    ```typescript
    // In packages/hardhat/deploy/01_deploy_my_contract.ts
    deployMyContract.tags = ["MyContract"];
    ```
  - `yarn deploy --tags MyContract`

#### Foundry Flavor

- Contracts: `packages/foundry/contracts/`
- Deployment scripts: `packages/foundry/script/` (uses custom deployment strategy)
  - Example: `packages/foundry/script/Deploy.s.sol` and `packages/foundry/script/DeployYourContract.s.sol`
- Tests: `packages/foundry/test/`
- Config: `packages/foundry/foundry.toml`
- Deploying a specific contract:
  - Create a separate deployment script and run `yarn deploy --file DeployYourContract.s.sol`

#### Both Flavors

- After `yarn deploy`, ABIs are auto-generated to `packages/nextjs/contracts/deployedContracts.ts`

### Frontend Contract Interaction

**Correct interact hook names (use these):**

- `useScaffoldReadContract` - NOT ~~useScaffoldContractRead~~
- `useScaffoldWriteContract` - NOT ~~useScaffoldContractWrite~~

Contract data is read from two files in `packages/nextjs/contracts/`:

- `deployedContracts.ts`: Auto-generated from deployments
- `externalContracts.ts`: Manually added external contracts

#### Reading Contract Data

```typescript
const { data: totalCounter } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "userGreetingCounter",
  args: ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"],
});
```

#### Writing to Contracts

```typescript
const { writeContractAsync, isPending } = useScaffoldWriteContract({
  contractName: "YourContract",
});

await writeContractAsync({
  functionName: "setGreeting",
  args: [newGreeting],
  value: parseEther("0.01"), // for payable functions
});
```

#### Reading Events

```typescript
const { data: events, isLoading } = useScaffoldEventHistory({
  contractName: "YourContract",
  eventName: "GreetingChange",
  watch: true,
  fromBlock: 31231n,
  blockData: true,
});
```

SE-2 also provides other hooks to interact with blockchain data: `useScaffoldWatchContractEvent`, `useScaffoldEventHistory`, `useDeployedContractInfo`, `useScaffoldContract`, `useTransactor`.

**IMPORTANT: Always use hooks from `packages/nextjs/hooks/scaffold-eth` for contract interactions. Always refer to the hook names as they exist in the codebase.**

### UI Components

**Always use `@scaffold-ui/components` library for web3 UI components:**

- `Address`: Display ETH addresses with ENS resolution, blockie avatars, and explorer links
- `AddressInput`: Input field with address validation and ENS resolution
- `Balance`: Show ETH balance in ether and USD
- `EtherInput`: Number input with ETH/USD conversion toggle
- `IntegerInput`: Integer-only input with wei conversion

### Notifications & Error Handling

Use `notification` from `~~/utils/scaffold-eth` for success/error/warning feedback and `getParsedError` for readable error messages.

### Styling

**Use DaisyUI classes** for building frontend components.

```tsx
// ✅ Good - using DaisyUI classes
<button className="btn btn-primary">Connect</button>
<div className="card bg-base-100 shadow-xl">...</div>

// ❌ Avoid - raw Tailwind when DaisyUI has a component
<button className="px-4 py-2 bg-blue-500 text-white rounded">Connect</button>
```

### Configure Target Network before deploying to testnet / mainnet.

#### Hardhat

Add networks in `packages/hardhat/hardhat.config.ts` if not present.

#### Foundry

Add RPC endpoints in `packages/foundry/foundry.toml` if not present.

#### NextJs

Add networks in `packages/nextjs/scaffold.config.ts` if not present. This file also contains configuration for polling interval, API keys. Remember to decrease the polling interval for L2 chains.

## Code Style Guide

### Identifiers

| Style            | Category                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `UpperCamelCase` | class / interface / type / enum / decorator / type parameters / component functions in TSX / JSXElement type parameter |
| `lowerCamelCase` | variable / parameter / function / property / module alias                                                              |
| `CONSTANT_CASE`  | constant / enum / global variables                                                                                     |
| `snake_case`     | for hardhat deploy files and foundry script files                                                                      |

### Import Paths

Use the `~~` path alias for imports in the nextjs package:

```tsx
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
```

### Creating Pages

```tsx
import type { NextPage } from "next";

const Home: NextPage = () => {
  return <div>Home</div>;
};

export default Home;
```

### TypeScript Conventions

- Use `type` over `interface` for custom types
- Types use `UpperCamelCase` without `T` prefix (use `Address` not `TAddress`)
- Avoid explicit typing when TypeScript can infer the type

### Comments

Make comments that add information. Avoid redundant JSDoc for simple functions.

## Documentation

Use **Context7 MCP** tools to fetch up-to-date documentation for any library (Wagmi, Viem, RainbowKit, DaisyUI, Hardhat, Next.js, etc.). Context7 is configured as an MCP server and provides access to indexed documentation with code examples.

---

## AdFlow UI & Theme

The app uses a custom DaisyUI dark theme called **adflow** (navy/teal palette). It is applied globally via `data-theme="adflow"` on the `<html>` element in `app/layout.tsx`. Do not add a separate ThemeProvider or toggle — AdFlow always uses this single dark theme.

### AdFlow Pages

All product pages live under `packages/nextjs/app/` and follow this route structure:

| Route | Page |
|---|---|
| `/` | Landing |
| `/publisher/onboard` | Publisher onboarding (3-step) |
| `/publisher/dashboard` | Publisher earnings dashboard |
| `/publisher/wallet` | Publisher wallet & payment history |
| `/advertiser/onboard` | Advertiser account (2-step: email, then wallet + profile) |
| `/advertiser/dashboard` | Advertiser hub: campaigns list, launch new, shortcuts to discovery / settings / wallet |
| `/advertiser/settings` | Read-only account & wallet details (session-scoped) |
| `/advertiser/campaign/new` | Create a campaign (brief, budget, impressions, creative filename) |
| `/advertiser/discovery` | AI-powered publisher discovery |
| `/advertiser/transaction` | Order review & escrow funding |
| `/advertiser/campaign` | Live campaign dashboard |
| `/advertiser/wallet` | Advertiser wallet & transaction history |

### Shared AdFlow Components

Reusable components live at `packages/nextjs/components/adflow/`:

| Component | Purpose |
|---|---|
| `Topbar` | Context-aware navigation bar (variant prop: `landing`, `onboarding`, `publisher`, `advertiser`) |
| `Stepper` | Multi-step form progress (uses DaisyUI `steps`) |
| `AgentLoader` | Animated terminal log with completion callback |
| `WalletModal` | Escrow confirmation modal with notifications |

When adding a new page, always use the correct `Topbar` variant so navigation stays consistent.

### Styling Rules

- **DaisyUI component classes** for buttons, cards, badges, tables, forms, progress: `btn btn-primary`, `card bg-base-100`, `badge badge-success`, `table`, `progress progress-primary`, etc.
- **Tailwind utilities** for layout, spacing, and colors: `flex`, `gap-4`, `text-primary`, `bg-base-200`, `text-base-content/60`
- **Never write custom CSS files** — if you think you need one, use Tailwind utilities instead
- **Never use inline `style={{}}` props** when a Tailwind class exists

#### DaisyUI color tokens for AdFlow theme

| Token | Value | Use for |
|---|---|---|
| `bg-base-200` | `#0f1729` navy | Page backgrounds |
| `bg-base-100` | `#1a2540` navy-light | Cards, panels |
| `bg-base-300` | `#243056` navy-mid | Borders, subtle backgrounds |
| `text-base-content` | `#e2e8f0` | Primary text |
| `text-base-content/60` | 60% opacity | Dimmed/secondary text |
| `text-primary` | `#00d4aa` teal | Accent text, values, highlights |
| `text-info` | `#4a9eff` | Blue accent |
| `text-warning` | `#ff8c42` | Orange (escrow, caution) |
| `text-error` | `#ff4757` | Red (errors, negative amounts) |

---

## Backend / API Routes

There is **no separate backend server**. All server-side logic lives as Next.js Route Handlers (Vercel serverless functions) inside `packages/nextjs/app/api/`.

`yarn start` runs everything — frontend and API routes together on `localhost:3000`. No second terminal needed.

## Database

The app uses **PostgreSQL** with **Drizzle ORM** in the `packages/nextjs` package.

### Stack

- Database connection is provided through a single `POSTGRES_URL` environment variable
- Drizzle config lives at `packages/nextjs/drizzle.config.ts`
- Database schema lives under `packages/nextjs/services/database/config/`
- Repository functions live under `packages/nextjs/services/database/repositories/`
- SQL migrations live under `packages/nextjs/services/database/migrations/` (includes `0005_advertiser_campaign_publishers.sql` for `advertiser_campaigns.selected_publisher_ids` jsonb)

### Conventions

- Use the same `POSTGRES_URL` pattern for local development and production
- **Local persistence:** from repo root run `yarn db:up` (Docker Postgres), set `POSTGRES_URL` in `packages/nextjs/.env.local` to `postgresql://postgres:postgres@127.0.0.1:5432/adflow`, then `yarn db:migrate`
- Do not hardcode database credentials or connection strings in source files (the Docker Compose defaults are dev-only)
- Keep database access server-side only: Route Handlers, Server Components, Server Actions, or scripts
- Prefer adding repository functions instead of querying Drizzle tables directly from many call sites
- Treat the current schema and seed data as provisional scaffolding unless product requirements specify otherwise

### Drizzle Workflow

```bash
yarn db:up                  # optional: start local Postgres (docker compose)
yarn drizzle-kit generate   # create migration SQL from schema changes (needs POSTGRES_URL)
yarn db:migrate             # apply migrations (from repo root — needs POSTGRES_URL)
yarn db:seed
yarn db:wipe
yarn db:down                # stop local Postgres container
```

If `drizzle-kit` commands need a connection string, provide `POSTGRES_URL` in the shell environment or in local deployment environment configuration.

### Creating a New API Route

```
packages/nextjs/app/api/<route-name>/route.ts
```

Every route file must export named HTTP method functions (`GET`, `POST`, etc.):

```typescript
// packages/nextjs/app/api/my-feature/route.ts
import { NextRequest, NextResponse } from "next/server";

// ✅ Export your response type so the frontend can import it
export type MyFeatureResponse = {
  result: string;
};

export async function POST(request: NextRequest) {
  try {
    return await handle(request);
  } catch (err) {
    console.error("[my-feature]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handle(request: NextRequest) {
  const { input } = await request.json();

  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const result: MyFeatureResponse = { result: "..." };
  return NextResponse.json(result);
}
```

**Rules:**
- Always wrap in a top-level `try/catch` that catches unexpected errors and returns a JSON `{ error }` response — never let an unhandled exception crash to a blank 500
- Always validate the request body before using it
- Export your response type from the route file (see [Type Sharing](#type-sharing-between-routes-and-frontend) below)
- Log errors with a `[route-name]` prefix so they're easy to find in the terminal: `console.error("[my-feature]", err)`

### Existing Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/analyze-site` | `POST` | Analyzes a publisher's website using Claude. Body: `{ url: string }`. Returns `SiteAnalysis`. |
| `/api/publishers` | `GET`, `POST` | Publisher listings. `GET` returns all rows. `POST` creates a publisher from onboarding: body type `CreatePublisherRequest` (email, `siteUrl`, analysis fields, `floorPricePer1kUsd`, `adFormat`, category tag arrays; optional `walletAddress`). Returns `CreatePublisherResponse` (201) or `{ error }`. |
| `/api/publishers/[id]` | `GET` | Returns one publisher by UUID or 404. |
| `/api/advertisers` | `GET`, `POST` | Advertiser accounts (profile + wallet). `GET` returns all rows. `POST` body `CreateAdvertiserRequest` (`email`, `walletAddress`, `displayName`; optional `companyName`, `about`). Returns `CreateAdvertiserResponse` (201) or `{ error }` (409 duplicate email or wallet). |
| `/api/advertisers/[id]` | `GET` | Returns one advertiser by UUID or 404. |
| `/api/advertisers/[id]/campaigns` | `GET`, `POST` | Campaigns for that advertiser. `POST` body `CreateAdvertiserCampaignRequest` (`productDescription`, `targetAudience`, `budgetUsdc`, `targetImpressions`, **`selectedPublisherIds`** non-empty UUID array, max 24; optional `creativeFileName`). Returns `CreateAdvertiserCampaignResponse` (201). After the wizard, the client stores `AdvertiserCheckoutSession` in `sessionStorage` under `adflow_advertiser_checkout` for `/advertiser/transaction`. |
| `/api/publishers/[id]/dashboard` | `GET` | Publisher dashboard payload: full `publisher` row, `campaigns[]`, and computed `stats` (revenue, impressions, escrow estimate). |

---

## Claude / AI Integration

The Anthropic SDK (`@anthropic-ai/sdk`) is installed in `packages/nextjs`. Use it in API routes only — never in client components (the API key is server-side only).

### Setup

The SDK reads `ANTHROPIC_API_KEY` from the environment automatically:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // picks up ANTHROPIC_API_KEY automatically
```

### Model to Use

**Always use `claude-opus-4-6`** unless there is a specific reason to use a different model.

```typescript
const message = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "..." }],
});
```

### Getting Text from a Response

```typescript
const message = await client.messages.create({ ... });

// response.content is an array — narrow by type before accessing .text
const text = message.content[0].type === "text" ? message.content[0].text : null;
```

### Requesting JSON from Claude

When you need Claude to return structured data, instruct it in the system prompt **and** strip markdown fences from the response before parsing. Claude sometimes wraps JSON in ` ```json ``` ` even when told not to:

```typescript
const message = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 512,
  system: "Always respond with valid JSON only — no markdown, no extra text.",
  messages: [{ role: "user", content: "Return { name: string, score: number } for ..." }],
});

const text = message.content[0].type === "text" ? message.content[0].text : "";

// Always strip markdown fences before parsing
const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
const data = JSON.parse(json); // ✅ safe
```

### Error Handling for Claude Calls

Use `Anthropic.APIError` to surface readable error messages:

```typescript
import Anthropic from "@anthropic-ai/sdk";

try {
  const message = await client.messages.create({ ... });
  // ...
} catch (err) {
  if (err instanceof Anthropic.AuthenticationError) {
    // ANTHROPIC_API_KEY is missing or invalid
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return NextResponse.json({ error: "AI service busy, try again" }, { status: 429 });
  }
  if (err instanceof Anthropic.APIError) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  throw err; // re-throw unexpected errors to the outer catch
}
```

### Real Example: `analyze-site` Route

See `packages/nextjs/app/api/analyze-site/route.ts` for a complete, working example showing:
- Top-level try/catch
- Optional site fetching before the Claude call
- Stripping markdown fences
- Exporting the response type

---

## Type Sharing Between Routes and Frontend

**Always export response types from the route file.** The frontend imports them directly — no need to duplicate type definitions, which would cause merge conflicts.

```typescript
// packages/nextjs/app/api/analyze-site/route.ts
export type SiteAnalysis = {       // ← exported from the route
  category: string;
  qualityScore: number;
  // ...
};

export async function POST(...) { ... }
```

```typescript
// packages/nextjs/app/publisher/onboard/page.tsx
import type { SiteAnalysis } from "~~/app/api/analyze-site/route"; // ← imported in the page

const [analysis, setAnalysis] = useState<SiteAnalysis | null>(null);
```

**Why this matters for parallel development:** If two developers define the same type in two different files, merging will create conflicts. Exporting from the route and importing everywhere else means there is exactly one definition.

---

## Calling API Routes from the Frontend

### Basic Pattern

```typescript
"use client";

import { notification } from "~~/utils/scaffold-eth";
import type { MyFeatureResponse } from "~~/app/api/my-feature/route";

const [loading, setLoading] = useState(false);
const [result, setResult] = useState<MyFeatureResponse | null>(null);

const callApi = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/my-feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "value" }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Request failed");
    }

    const data: MyFeatureResponse = await res.json();
    setResult(data);
    notification.success("Done!");
  } catch (err) {
    notification.error(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setLoading(false);
  }
};
```

### Parallel API Call + UI Animation Pattern

When showing an animated agent log while waiting for an API response (like the site analysis), run them in parallel and transition when both are ready:

```typescript
const pendingResult = useRef<MyFeatureResponse | null>(null);
const [animDone, setAnimDone] = useState(false);
const [result, setResult] = useState<MyFeatureResponse | null>(null);

const handleStart = () => {
  setAnimDone(false);
  pendingResult.current = null;

  // API call runs in background — don't await here
  fetch("/api/my-feature", { method: "POST", body: JSON.stringify({ input }) ... })
    .then(r => r.json())
    .then(data => { pendingResult.current = data; })
    .catch(() => notification.error("Failed"));
};

// Called by AgentLoader when animation completes
const handleAnimationComplete = () => {
  if (pendingResult.current) {
    setResult(pendingResult.current);          // API already returned
  } else {
    const poll = setInterval(() => {           // Wait for API
      if (pendingResult.current) {
        clearInterval(poll);
        setResult(pendingResult.current);
      }
    }, 300);
  }
};
```

### Using `notification` for Feedback

Always use `notification` from `~~/utils/scaffold-eth` — never `alert()`, `console.log()`, or custom toast implementations.

```typescript
import { notification } from "~~/utils/scaffold-eth";

notification.success("Listing published!");
notification.error("Site analysis failed. Check your API key.");
notification.info("Analysis complete.");
notification.loading("Processing...");
notification.warning("Low escrow balance.");
```

---

## Environment Variables

### Required Variables

Copy `.env.example` to `.env.local` and fill in values. `.env.local` is gitignored — never commit API keys.

```bash
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

| Variable | Required for | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | All AI/agent features | console.anthropic.com |
| `POSTGRES_URL` | Database access from Next.js and Drizzle scripts | Your Postgres or Neon project |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Live network RPC | dashboard.alchemyapi.io |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | Wallet connect | cloud.walletconnect.com |

### Server-side vs Client-side Variables

| Prefix | Accessible from | Use for |
|---|---|---|
| *(none)* e.g. `ANTHROPIC_API_KEY` | Server only (API routes) | Secret API keys — never expose to browser |
| `NEXT_PUBLIC_` e.g. `NEXT_PUBLIC_ALCHEMY_API_KEY` | Server + browser | Public config safe to expose |

**Never prefix secret keys with `NEXT_PUBLIC_`** — they would be bundled into the client JavaScript and visible to anyone.

### Security Rules

- **Never commit `.env.local`** — it is gitignored for this reason
- **Never commit `.env`** with real keys — `.env` is tracked by git
- **Never log API keys** or include them in error messages
- If a key is accidentally committed: rotate it immediately at the provider's dashboard, then remove it from git history

---

## Parallel Development & Conflict Prevention

Multiple developers work on this repo simultaneously. Follow these rules to avoid merge conflicts.

### File Ownership — Who Touches What

| Area | Owner convention |
|---|---|
| `app/api/<route>/route.ts` | One developer per route — don't edit someone else's route file |
| `app/publisher/*` | Publisher flow developer |
| `app/advertiser/*` | Advertiser flow developer |
| `components/adflow/*` | Shared — discuss before changing; changes affect all pages |
| `packages/foundry/contracts/*` | Smart contract developer |
| `styles/globals.css`, `app/layout.tsx` | Coordinate before changing — affects everything |
| `scaffold.config.ts` | Coordinate before changing — affects all Web3 connections |

### Types — One Source of Truth

- Route response types: export from `route.ts`, import everywhere else
- Shared domain types (e.g. `Publisher`, `Campaign`): **import from** `packages/nextjs/types/adflow.ts` — that file defines `Publisher` as `InferSelectModel<typeof publishers>` (so client code never imports the DB client) and adds cross-page helpers (e.g. `PublisherSessionSummary`). Repositories may re-export `Publisher` from there. **Do not redefine** domain types in components or pages
- Request bodies for APIs: export a `*Request` type from the same `route.ts` as the handler (e.g. `CreatePublisherRequest` on `/api/publishers`)
- Never copy-paste a type — always import it

### Adding a New API Route

1. Create `packages/nextjs/app/api/<your-feature>/route.ts`
2. Export your response type from that file
3. Add an entry to the **Existing Routes** table in this file
4. Do not modify other existing route files

### Adding a New Page

1. Create the file at the correct path (see route table above)
2. Use the `Topbar` component with the correct `variant` prop
3. Use DaisyUI + Tailwind for all styling — no new CSS files
4. If you need a new shared component, add it to `components/adflow/` and document it in this file

### Changing Shared Components (`components/adflow/`)

Changes to shared components affect every page. Before changing:
1. Check which pages use the component with a codebase search
2. Test all affected pages after the change
3. Keep the component's props interface backward-compatible, or update all call sites in the same commit

### Merging Checklist

Before opening a PR:
- [ ] `yarn next:check-types` passes with no errors
- [ ] `yarn next:build` succeeds
- [ ] `yarn lint` passes (or warnings only, no errors)
- [ ] No new `.env` files with real keys committed
- [ ] No new custom CSS files — styling is DaisyUI + Tailwind only
- [ ] Response types exported from route files, not duplicated in frontend files
- [ ] New routes documented in the **Existing Routes** table above

---

## Skills & Agents Index

IMPORTANT: Prefer retrieval-led reasoning over pre-trained knowledge. Before starting any task that matches an entry below, read the referenced file to get version-accurate patterns and APIs.

**Skills** (read `.agents/skills/<name>/SKILL.md` before implementing):

- **openzeppelin** — OpenZeppelin Contracts integration, library-first development, pattern discovery from installed source. Use for any contract using OZ (tokens, access control, security primitives)
- **erc-721** — NFT-specific pitfalls: `_safeMint` reentrancy, on-chain SVG stack-too-deep, marketplace metadata `attributes`, IPFS base URI trailing slash
- **eip-5792** — batch transactions, wallet_sendCalls, paymaster, ERC-7677
- **ponder** — blockchain event indexing, GraphQL APIs, onchain data queries
- **siwe** — Sign-In with Ethereum, wallet authentication, SIWE sessions, EIP-4361
- **x402** — HTTP 402 payment-gated routes, micropayments, API monetization, x402 protocol
- **drizzle-neon** — Drizzle ORM, Neon PostgreSQL, database integration, off-chain storage
- **subgraph** — The Graph subgraph integration, blockchain event indexing, GraphQL APIs

**Agents** (in `.agents/agents/`):

- **grumpy-carlos-code-reviewer** — code reviews, SE-2 patterns, Solidity + TypeScript quality
