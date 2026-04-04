# Minimal Blockchain Specification

## Goal

Build a minimal onchain marketplace where:

- a publisher can create a listing from their EOA,
- an advertiser must create a profile before interacting,
- a dedicated escrow contract is deployed for each deal,
- funds are released as impressions are confirmed,
- Chainlink CRE confirms delivery,
- ENS is used to register publisher identity and pricing metadata.

## Design Principles

- Keep v1 small and composable.
- Use EOAs directly instead of abstract agent/operator layers.
- Deploy one escrow per deal instead of storing every deal in one large contract.
- Keep impression verification offchain and only settle verified results onchain.
- Use ENS for readable publisher identity.

## Step 1 - `PublisherRegistry.sol`

### Purpose

Let any publisher EOA create and manage a public publisher listing.

### Main responsibilities

- Register one publisher profile per EOA.
- Store the publisher ENS name.
- Store the publisher asking price for impressions.
- Store whether the publisher is currently available to accept new deals.
- Let the publisher update their listing.
- Let the protocol read publisher data before a deal is created.

### Suggested storage

- `uint256 nextPublisherId`
- `mapping(uint256 => PublisherProfile) publishers`
- `mapping(address => uint256) publisherIdByAccount`

### `PublisherProfile` struct

- `uint256 id`
- `address publisher`
- `string ensName`
- `uint256 pricePerImpression`
- `string metadataURI`
- `bool active`
- `bool available`

### Core functions

- `createPublisherListing(string calldata ensName, uint256 pricePerImpression, string calldata metadataURI)`
- `updatePublisherListing(uint256 publisherId, string calldata ensName, uint256 pricePerImpression, string calldata metadataURI)`
- `setPublisherStatus(uint256 publisherId, bool active)`
- `setPublisherAvailability(uint256 publisherId, bool available)`
- `getPublisher(uint256 publisherId)`

### Rules

- The publisher is always `msg.sender`.
- Listing creation is permissionless in v1.
- One EOA can have only one publisher listing in v1.
- Only the publisher can edit their own listing.
- Admin moderation can still disable a listing if needed.
- A deal can only be created if the publisher listing is both `active` and `available`.
- `active` is for moderation and protocol-level enablement; `available` is for marketplace readiness.
- ENS name should be stored as data in v1; later it can be verified against ENS records onchain.

## Step 2 - `AdvertiserRegistry.sol`

### Purpose

Require advertisers to create a profile before starting a deal with a publisher.

### Main responsibilities

- Register advertiser identity.
- Store advertiser billing or business metadata.
- Gate deal creation so only registered advertisers can open a new escrow.

### Suggested storage

- `uint256 nextAdvertiserId`
- `mapping(uint256 => AdvertiserProfile) advertisers`
- `mapping(address => uint256) advertiserIdByAccount`

### `AdvertiserProfile` struct

- `uint256 id`
- `address advertiser`
- `string name`
- `string metadataURI`
- `bool active`

### Core functions

- `createAdvertiserProfile(string calldata name, string calldata metadataURI)`
- `updateAdvertiserProfile(uint256 advertiserId, string calldata name, string calldata metadataURI)`
- `setAdvertiserStatus(uint256 advertiserId, bool active)`
- `getAdvertiser(uint256 advertiserId)`

### Rules

- The advertiser is always `msg.sender`.
- A deal cannot be created unless the advertiser profile exists and is active.

## Step 3 - `DealFactory.sol`

### Purpose

Create one escrow contract per advertiser-publisher deal.

### Main responsibilities

- Validate that the advertiser is registered.
- Validate that the publisher listing exists, is active, and is available.
- Deploy a fresh escrow contract for the new deal.
- Record the deal address for indexing and frontend discovery.
- Create deals that are funded and settled in the chain's native token in v1.

### Suggested storage

- `uint256 nextDealId`
- `mapping(uint256 => address) escrowByDealId`

### Core functions

- `createDeal(uint256 publisherId, uint256 totalBudget, uint256 maxImpressions)`
- `getDealEscrow(uint256 dealId)`

### Rules

- `msg.sender` must be a registered advertiser.
- The publisher address comes from `PublisherRegistry`.
- The selected publisher must be active and available for new deals.
- The escrow is initialized with publisher price and deal terms at creation time.
- Deal funding and payouts use the native token of the chain.

## Step 4 - `DealEscrow.sol`

### Purpose

Hold the advertiser’s funds and pay the publisher as impressions are confirmed.

### Main responsibilities

- Receive and lock deal funding.
- Track total confirmed impressions.
- Calculate how much the publisher has earned.
- Release payments incrementally.
- Refund unused funds when the deal ends.

### Suggested storage

- `address advertiser`
- `address publisher`
- `uint256 pricePerImpression`
- `uint256 totalBudget`
- `uint256 maxImpressions`
- `uint256 confirmedImpressions`
- `uint256 totalPaid`
- `bool closed`

### Core functions

- `fundDeal(uint256 amount)`
- `recordConfirmedImpressions(uint256 additionalImpressions)`
- `releasePayment()`
- `closeDeal()`
- `refundRemainingBudget()`

### Payment logic

- Earned amount = `confirmedImpressions * pricePerImpression`
- Claimable amount = `earned amount - totalPaid`
- The escrow must never pay above the funded amount.

### Rules

- The advertiser funds the contract.
- The publisher receives payments from the contract.
- In v1, funding and payout use the native token instead of an ERC-20.
- Impression confirmation should not come from arbitrary users.

## Step 5 - Chainlink CRE Integration

### Purpose

Use Chainlink CRE to confirm impression delivery and trigger payment release.

### Main responsibilities

- Receive verified impression confirmation from Chainlink CRE.
- Pass confirmed impression counts to the escrow.
- Trigger or authorize payment release after confirmation.

### Integration shape

- Chainlink CRE acts as the trusted confirmation layer.
- Once impressions are confirmed, the escrow updates `confirmedImpressions`.
- After that, the escrow can release the newly earned funds to the publisher.

### Minimal contract approach

This can be implemented in one of two ways:

1. `DealEscrow` directly accepts updates from a Chainlink-authorized address.
2. A separate `ImpressionOracle.sol` receives Chainlink CRE callbacks and forwards approved updates to `DealEscrow`.

For v1, the second option is cleaner because it separates fund custody from delivery confirmation.

## Step 6 - ENS Support

### Purpose

Attach readable publisher identity to the marketplace.

### Main responsibilities

- Store the publisher ENS name in the publisher listing.
- Expose publisher pricing alongside ENS identity.
- Let the frontend display publisher name and domain in a human-readable format.

### Minimal v1 approach

- Save `ensName` in `PublisherRegistry`.
- Save `pricePerImpression` in the same listing.
- Treat ENS as declarative metadata first.

### Future upgrade

Later, the protocol can verify that:

- the publisher controls the ENS name,
- the ENS name resolves to the publisher EOA,
- pricing or metadata can be anchored through ENS text records.

## Minimal Contract Set

1. `PublisherRegistry.sol`
2. `AdvertiserRegistry.sol`
3. `DealFactory.sol`
4. `DealEscrow.sol`
5. `ImpressionOracle.sol` or direct Chainlink CRE integration inside escrow

## Recommended Build Order

1. Build `PublisherRegistry.sol`
2. Build `AdvertiserRegistry.sol`
3. Build `DealEscrow.sol`
4. Build `DealFactory.sol`
5. Add Chainlink CRE confirmation flow
6. Add ENS-facing reads and validation helpers

## Core User Flow

1. A publisher EOA creates a publisher listing with ENS name and price per impression.
2. An advertiser EOA creates an advertiser profile.
3. The advertiser selects a publisher and opens a deal.
4. The factory deploys a new escrow contract for that deal.
5. The advertiser funds the escrow.
6. Impressions happen offchain.
7. Chainlink CRE confirms impressions.
8. The escrow releases the appropriate payment to the publisher.
9. Any unused funds are returned to the advertiser when the deal closes.

## Open Questions

- Will v1 use ETH, a stablecoin, or both for deal funding?
- Should payments be pushed automatically after confirmation or pulled by the publisher?
- Should the publisher be allowed to update pricing after a deal exists, or should each deal snapshot the price permanently?
- Will ENS be optional or mandatory for publisher listings?
- Should Chainlink CRE update the escrow continuously or in reporting batches?
