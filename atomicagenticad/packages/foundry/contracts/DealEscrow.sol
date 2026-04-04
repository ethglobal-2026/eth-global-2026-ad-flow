// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDealLifecycleManager {
    function handleDealClosed(uint256 publisherId) external;
}

contract DealEscrow {
    address public immutable ADVERTISER;
    address public immutable PUBLISHER;
    address public immutable IMPRESSION_REPORTER;
    address public immutable DEAL_LIFECYCLE_MANAGER;
    uint256 public immutable PUBLISHER_ID;
    uint256 public immutable PRICE_PER_IMPRESSION;
    uint256 public immutable TOTAL_BUDGET;
    uint256 public immutable MAX_IMPRESSIONS;

    uint256 public fundedAmount;
    uint256 public confirmedImpressions;
    uint256 public totalPaid;
    uint256 public totalRefunded;
    bool public closed;

    event DealFunded(address indexed funder, uint256 amount, uint256 fundedAmount);
    event ImpressionsRecorded(uint256 additionalImpressions, uint256 totalConfirmedImpressions);
    event PaymentReleased(address indexed publisher, uint256 amount, uint256 totalPaid);
    event DealClosed();
    event RemainingBudgetRefunded(address indexed advertiser, uint256 amount);

    error Unauthorized(address caller);
    error DealClosedError();
    error ZeroAmount();
    error InvalidImpressionReporter();
    error FundingExceedsBudget(uint256 fundedAmount, uint256 totalBudget);
    error ImpressionsExceedMaximum(uint256 confirmedImpressions, uint256 maxImpressions);
    error NoClaimableAmount();
    error DealNotClosed();
    error NothingToRefund();
    error TransferFailed();

    /// @notice Creates a new escrow for a single advertiser-publisher deal.
    /// @param advertiser_ The advertiser allowed to fund, close, and refund the deal.
    /// @param publisher_ The publisher entitled to receive earned payments.
    /// @param impressionReporter_ The permissioned reporter address allowed to confirm impressions.
    /// @param dealLifecycleManager_ The contract notified when the deal closes.
    /// @param publisherId_ The registry id for the publisher assigned to this deal.
    /// @param pricePerImpression_ The amount of native token earned per confirmed impression.
    /// @param totalBudget_ The maximum native-token budget that can be funded into this escrow.
    /// @param maxImpressions_ The maximum number of impressions that can be confirmed for this deal.
    constructor(
        address advertiser_,
        address publisher_,
        address impressionReporter_,
        address dealLifecycleManager_,
        uint256 publisherId_,
        uint256 pricePerImpression_,
        uint256 totalBudget_,
        uint256 maxImpressions_
    ) payable {
        if (impressionReporter_ == address(0)) revert InvalidImpressionReporter();

        ADVERTISER = advertiser_;
        PUBLISHER = publisher_;
        IMPRESSION_REPORTER = impressionReporter_;
        DEAL_LIFECYCLE_MANAGER = dealLifecycleManager_;
        PUBLISHER_ID = publisherId_;
        PRICE_PER_IMPRESSION = pricePerImpression_;
        TOTAL_BUDGET = totalBudget_;
        MAX_IMPRESSIONS = maxImpressions_;

        if (msg.value > totalBudget_) revert FundingExceedsBudget(msg.value, totalBudget_);
        if (msg.value > 0) {
            fundedAmount = msg.value;
            emit DealFunded(advertiser_, msg.value, msg.value);
        }
    }

    /// @notice Accepts direct native-token transfers and treats them as deal funding.
    /// @dev This forwards to {fundDeal}, so the same authorization and budget rules apply.
    receive() external payable {
        fundDeal();
    }

    /// @notice Adds native-token funding to the escrow.
    /// @dev Only the advertiser can fund the deal, and the total funded amount cannot exceed {TOTAL_BUDGET}.
    function fundDeal() public payable {
        if (msg.sender != ADVERTISER) revert Unauthorized(msg.sender);
        if (closed) revert DealClosedError();
        if (msg.value == 0) revert ZeroAmount();

        uint256 newFundedAmount = fundedAmount + msg.value;
        if (newFundedAmount > TOTAL_BUDGET) revert FundingExceedsBudget(newFundedAmount, TOTAL_BUDGET);

        fundedAmount = newFundedAmount;
        emit DealFunded(msg.sender, msg.value, newFundedAmount);
    }

    /// @notice Records newly confirmed impressions for the deal.
    /// @dev This entrypoint is reserved for the permissioned reporter address. If the updated total would exceed
    /// {MAX_IMPRESSIONS}, it is capped at that maximum.
    /// @param additionalImpressions The number of newly confirmed impressions to add.
    function recordConfirmedImpressions(uint256 additionalImpressions) external {
        if (msg.sender != IMPRESSION_REPORTER) revert Unauthorized(msg.sender);
        if (closed) revert DealClosedError();
        if (additionalImpressions == 0) revert ZeroAmount();

        uint256 newConfirmedImpressions = confirmedImpressions + additionalImpressions;
        if (newConfirmedImpressions > MAX_IMPRESSIONS) {
            newConfirmedImpressions = MAX_IMPRESSIONS;
        }

        confirmedImpressions = newConfirmedImpressions;
        emit ImpressionsRecorded(additionalImpressions, newConfirmedImpressions);
    }

    /// @notice Releases the currently claimable publisher earnings from the escrow.
    /// @dev The released amount equals earned value minus {totalPaid}, capped by the amount actually funded.
    /// @return amountReleased The amount of native token transferred to the publisher.
    function releasePayment() external returns (uint256 amountReleased) {
        uint256 earnedAmount = confirmedImpressions * PRICE_PER_IMPRESSION;
        uint256 payableAmount = earnedAmount > fundedAmount ? fundedAmount : earnedAmount;

        amountReleased = payableAmount - totalPaid;
        if (amountReleased == 0) revert NoClaimableAmount();

        totalPaid += amountReleased;

        (bool success,) = payable(PUBLISHER).call{value: amountReleased}("");
        if (!success) revert TransferFailed();

        emit PaymentReleased(PUBLISHER, amountReleased, totalPaid);
    }

    /// @notice Closes the deal to prevent further funding or impression updates.
    /// @dev Closing the deal does not transfer funds. Publisher withdrawals and advertiser refunds remain
    /// separate pull-style operations after closure.
    function closeDeal() external {
        if (msg.sender != ADVERTISER && msg.sender != PUBLISHER) revert Unauthorized(msg.sender);
        if (closed) revert DealClosedError();

        closed = true;
        if (DEAL_LIFECYCLE_MANAGER != address(0)) {
            IDealLifecycleManager(DEAL_LIFECYCLE_MANAGER).handleDealClosed(PUBLISHER_ID);
        }
        emit DealClosed();
    }

    /// @notice Refunds the advertiser-owned portion of unused budget after the deal is closed.
    /// @dev This excludes any amount still owed to the publisher and tracks {totalRefunded} so the advertiser
    /// cannot withdraw more than the refundable remainder over multiple calls.
    /// @return refundedAmount The amount of native token returned to the advertiser.
    function refundRemainingBudget() external returns (uint256 refundedAmount) {
        if (!closed) revert DealNotClosed();

        uint256 earnedAmount = confirmedImpressions * PRICE_PER_IMPRESSION;
        uint256 payableAmount = earnedAmount > fundedAmount ? fundedAmount : earnedAmount;
        uint256 refundableBudget = fundedAmount - payableAmount;

        refundedAmount = refundableBudget - totalRefunded;
        if (refundedAmount == 0) revert NothingToRefund();

        totalRefunded += refundedAmount;

        (bool success,) = payable(ADVERTISER).call{value: refundedAmount}("");
        if (!success) revert TransferFailed();

        emit RemainingBudgetRefunded(ADVERTISER, refundedAmount);
    }
}
