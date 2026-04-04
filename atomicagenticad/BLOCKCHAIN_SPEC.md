# Blockchain Code Specification

## Goal

Define the smart-contract architecture for `atomicagenticad` as an onchain coordination layer for advertising campaigns executed by autonomous agents.

This document assumes the product needs to:

- let advertisers fund campaigns onchain,
- let agent operators enroll and participate,
- track approved delivery and performance proofs,
- release payments only when campaign rules are met,
- keep the protocol modular so each contract has a clear responsibility.

## Global Principles

- Solidity version: `^0.8.24`
- Use OpenZeppelin for `Ownable`, `AccessControl`, `Pausable`, `ReentrancyGuard`, and token-safe transfers.
- Prefer pull payments over push payments when possible.
- Store only critical business state onchain.
- Put heavy analytics and raw impression/click data offchain, and only anchor validated results onchain.
- Emit events for every business action needed by the frontend or indexer.

## Roles

- `ADMIN`: protocol configuration, emergency pause, allowlist management.
- `ADVERTISER`: creates and funds campaigns.
- `AGENT_OPERATOR`: registers an agent and accepts campaign work.
- `VALIDATOR_ORACLE`: submits verified campaign delivery and conversion results.
- `TREASURY`: receives protocol fees.

## Step 1 - Build `AgentRegistry.sol`

### Purpose

Register agent identities and define who is allowed to act inside the protocol.

### Main responsibilities

- Create an onchain profile for each agent.
- Link an `agentId` to an operator wallet.
- Track metadata URI for agent description, reputation snapshot, and capabilities.
- Support activation, suspension, and reactivation.

### Required storage

- `uint256 nextAgentId`
- `mapping(uint256 => Agent)`
- `mapping(address => uint256[]) agentIdsByOperator`
- `mapping(address => bool) approvedOperators`

### `Agent` struct

- `uint256 id`
- `address operator`
- `string metadataURI`
- `bool active`
- `uint64 createdAt`
- `uint64 updatedAt`

### Core functions

- `registerAgent(address operator, string calldata metadataURI)`
- `updateAgentMetadata(uint256 agentId, string calldata metadataURI)`
- `setAgentStatus(uint256 agentId, bool active)`
- `setApprovedOperator(address operator, bool approved)`
- `getAgent(uint256 agentId)`

### Events

- `AgentRegistered`
- `AgentUpdated`
- `AgentStatusChanged`
- `OperatorApprovalChanged`

### Security notes

- Only the operator or admin can update metadata.
- Only admin can approve or ban operators.
- Reject duplicate ownership edge cases if one wallet should control only one primary agent.

## Step 2 - Build `CampaignRegistry.sol`

### Purpose

Create campaign records and define campaign rules independently from funds custody.

### Main responsibilities

- Let advertisers create ad campaigns.
- Save campaign budget, targeting references, payout model, and timing.
- Track campaign lifecycle: draft, funded, live, completed, cancelled.
- Assign one or more approved agents to a campaign.

### Required storage

- `uint256 nextCampaignId`
- `mapping(uint256 => Campaign)`
- `mapping(uint256 => uint256[]) assignedAgents`

### `Campaign` struct

- `uint256 id`
- `address advertiser`
- `address paymentToken`
- `uint256 totalBudget`
- `uint256 reservedBudget`
- `uint256 spentBudget`
- `uint64 startTime`
- `uint64 endTime`
- `bytes32 campaignSpecHash`
- `PricingModel pricingModel`
- `CampaignStatus status`

### Enums

- `PricingModel`: `CPM`, `CPC`, `CPA`, `FIXED`
- `CampaignStatus`: `DRAFT`, `FUNDED`, `LIVE`, `COMPLETED`, `CANCELLED`, `DISPUTED`

### Core functions

- `createCampaign(...)`
- `updateCampaignSpec(uint256 campaignId, bytes32 campaignSpecHash)`
- `assignAgent(uint256 campaignId, uint256 agentId)`
- `removeAgent(uint256 campaignId, uint256 agentId)`
- `activateCampaign(uint256 campaignId)`
- `completeCampaign(uint256 campaignId)`
- `cancelCampaign(uint256 campaignId)`

### Events

- `CampaignCreated`
- `CampaignUpdated`
- `CampaignAgentAssigned`
- `CampaignAgentRemoved`
- `CampaignStatusChanged`

### Security notes

- Only the advertiser can modify a draft campaign.
- A live campaign can only change through narrowly scoped admin or settlement actions.
- `campaignSpecHash` should point to offchain JSON or IPFS content containing creative, targeting, KPI, and legal terms.

## Step 3 - Build `CampaignEscrow.sol`

### Purpose

Hold campaign funds and release them according to approved settlement instructions.

### Main responsibilities

- Receive campaign deposits from advertisers.
- Lock campaign budget.
- Reserve protocol fees.
- Release payouts to agents.
- Return unused funds when a campaign ends or is cancelled.

### Required storage

- `address treasury`
- `uint16 protocolFeeBps`
- `mapping(uint256 => EscrowBalance) escrowByCampaign`

### `EscrowBalance` struct

- `uint256 deposited`
- `uint256 allocated`
- `uint256 paidOut`
- `uint256 refunded`
- `uint256 feesCollected`

### Core functions

- `fundCampaign(uint256 campaignId, uint256 amount)`
- `increaseCampaignBudget(uint256 campaignId, uint256 amount)`
- `settleCampaignPayout(uint256 campaignId, address recipient, uint256 grossAmount)`
- `refundAdvertiser(uint256 campaignId, uint256 amount)`
- `closeEscrow(uint256 campaignId)`
- `setProtocolFee(uint16 protocolFeeBps)`
- `setTreasury(address treasury)`

### Events

- `CampaignFunded`
- `CampaignBudgetIncreased`
- `CampaignPayoutSettled`
- `CampaignRefunded`
- `EscrowClosed`
- `ProtocolFeeUpdated`

### Security notes

- Add `nonReentrant` to all token-transfer functions.
- Support only allowlisted ERC-20 tokens in v1, unless native ETH payments are explicitly needed.
- Settlement should only be callable by a trusted settlement contract or oracle role, not directly by arbitrary operators.

## Step 4 - Build `ProofOfDeliveryOracle.sol`

### Purpose

Anchor offchain verified campaign performance onchain.

### Main responsibilities

- Accept signed or role-gated proof submissions.
- Record aggregated performance by campaign and agent.
- Prevent duplicate settlement for the same reporting period.
- Trigger payout eligibility.

### Required storage

- `mapping(bytes32 => bool) processedProofs`
- `mapping(uint256 => mapping(uint256 => DeliveryTotals)) deliveryByCampaignAndAgent`

### `DeliveryTotals` struct

- `uint256 impressions`
- `uint256 clicks`
- `uint256 conversions`
- `uint256 payoutEarned`
- `uint64 lastUpdatedAt`

### Core functions

- `submitProof(uint256 campaignId, uint256 agentId, bytes32 proofHash, DeliveryPayload calldata payload)`
- `batchSubmitProofs(...)`
- `invalidateProof(bytes32 proofHash)`
- `getDeliveryTotals(uint256 campaignId, uint256 agentId)`

### Events

- `ProofSubmitted`
- `ProofInvalidated`
- `DeliveryTotalsUpdated`

### Security notes

- Restrict submissions to `VALIDATOR_ORACLE` role in v1.
- Include reporting window and nonce in each proof to stop replay attacks.
- Keep raw proof files offchain; store only hash and normalized totals onchain.

## Step 5 - Build `SettlementManager.sol`

### Purpose

Convert validated campaign results into final payout instructions.

### Main responsibilities

- Read campaign rules from `CampaignRegistry`.
- Read verified totals from `ProofOfDeliveryOracle`.
- Calculate what each agent is owed.
- Call `CampaignEscrow` to release payments.
- Mark campaign periods as settled.

### Required storage

- `mapping(uint256 => mapping(bytes32 => bool)) settledPeriods`

### Core functions

- `settleAgentPeriod(uint256 campaignId, uint256 agentId, bytes32 periodId)`
- `settleCampaignBatch(uint256 campaignId, uint256[] calldata agentIds, bytes32 periodId)`
- `previewPayout(uint256 campaignId, uint256 agentId, bytes32 periodId)`

### Calculation rules

- `CPM`: payout based on validated impressions per 1,000 units.
- `CPC`: payout based on validated clicks.
- `CPA`: payout based on validated conversions.
- `FIXED`: payout based on milestone approval or campaign completion.

### Events

- `PeriodSettled`
- `AgentPaid`

### Security notes

- Never allow settlement above the funded and available escrow balance.
- A period must be settled exactly once.
- Add pausable emergency stop.

## Step 6 - Build `DisputeManager.sol`

### Purpose

Handle disagreements about delivery data, invalid traffic, or blocked payouts.

### Main responsibilities

- Open a dispute on a campaign or settlement period.
- Freeze related payouts while the dispute is active.
- Allow admin or arbitrator resolution.
- Record the final outcome for auditability.

### Required storage

- `uint256 nextDisputeId`
- `mapping(uint256 => Dispute)`

### `Dispute` struct

- `uint256 id`
- `uint256 campaignId`
- `uint256 agentId`
- `bytes32 periodId`
- `address openedBy`
- `string evidenceURI`
- `DisputeStatus status`
- `uint64 openedAt`
- `uint64 resolvedAt`

### Enums

- `DisputeStatus`: `OPEN`, `UNDER_REVIEW`, `RESOLVED_ADVERTISER`, `RESOLVED_AGENT`, `REJECTED`

### Core functions

- `openDispute(...)`
- `updateDisputeStatus(uint256 disputeId, DisputeStatus status)`
- `resolveDispute(uint256 disputeId, bool releaseFundsToAgent)`

### Events

- `DisputeOpened`
- `DisputeStatusChanged`
- `DisputeResolved`

### Security notes

- Only involved parties or admin can open a dispute.
- Resolution should be role-protected.
- Settlement contract must check dispute status before paying.

## Step 7 - Build `ProtocolTreasury.sol`

### Purpose

Receive protocol fees and manage approved withdrawals.

### Main responsibilities

- Collect fees from escrow settlements.
- Allow controlled withdrawals.
- Optionally support revenue split across multiple treasury recipients.

### Core functions

- `withdraw(address token, address to, uint256 amount)`
- `setFeeRecipient(address recipient, bool approved)`

### Events

- `TreasuryWithdrawal`
- `FeeRecipientUpdated`

### Security notes

- Use multisig ownership in production.
- Keep this contract intentionally simple.

## Recommended Deployment Order

1. Deploy `AgentRegistry.sol`
2. Deploy `CampaignRegistry.sol`
3. Deploy `ProtocolTreasury.sol`
4. Deploy `CampaignEscrow.sol`
5. Deploy `ProofOfDeliveryOracle.sol`
6. Deploy `SettlementManager.sol`
7. Deploy `DisputeManager.sol`
8. Grant roles and wire contract addresses together

## Contract Dependencies

- `CampaignRegistry` depends on `AgentRegistry`
- `CampaignEscrow` depends on `CampaignRegistry` and `ProtocolTreasury`
- `ProofOfDeliveryOracle` depends on `CampaignRegistry` and `AgentRegistry`
- `SettlementManager` depends on `CampaignRegistry`, `CampaignEscrow`, and `ProofOfDeliveryOracle`
- `DisputeManager` depends on `CampaignRegistry` and `SettlementManager`

## Minimum Test Plan

- Campaign creation and funding
- Agent assignment and removal
- Oracle proof submission and replay protection
- Correct payout calculation per pricing model
- Partial settlement then final settlement
- Refund flow after cancellation
- Dispute opening and payout freeze
- Pause and admin recovery flows
- Unauthorized caller reverts

## Suggested Next Solidity Deliverables

1. Replace `YourContract.sol` with the first production contract: `AgentRegistry.sol`
2. Create interface files for cross-contract calls
3. Add Foundry tests for each contract before moving to the next step
4. Add a deployment script that wires all roles and constructor dependencies

## Open Product Questions

- Which payment assets are allowed in v1: one stablecoin, multiple ERC-20s, or ETH?
- Are agents paid individually, through teams, or through revenue-sharing splits?
- Who acts as the oracle or validator in production?
- Is dispute resolution centralized in v1 or DAO-governed later?
- Does the product need NFT receipts, campaign badges, or agent reputation tokens?

