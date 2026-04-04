// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/DealEscrow.sol";

contract DealEscrowTest is Test {
    DealEscrow public dealEscrow;

    address internal advertiser = vm.addr(1);
    address internal publisher = vm.addr(2);
    address internal outsider = vm.addr(3);

    uint256 internal constant PRICE_PER_IMPRESSION = 10;
    uint256 internal constant TOTAL_BUDGET = 1 ether;
    uint256 internal constant MAX_IMPRESSIONS = 100_000;

    function setUp() public {
        dealEscrow = new DealEscrow(
            advertiser,
            publisher,
            PRICE_PER_IMPRESSION,
            TOTAL_BUDGET,
            MAX_IMPRESSIONS
        );

        vm.deal(advertiser, 10 ether);
        vm.deal(outsider, 1 ether);
    }

    function testAdvertiserCanFundDeal() public {
        vm.prank(advertiser);
        dealEscrow.fundDeal{value: 0.4 ether}();

        assertEq(dealEscrow.fundedAmount(), 0.4 ether);
        assertEq(address(dealEscrow).balance, 0.4 ether);
    }

    function testOnlyAdvertiserCanFundDeal() public {
        vm.prank(outsider);
        vm.expectRevert(abi.encodeWithSelector(DealEscrow.Unauthorized.selector, outsider));
        dealEscrow.fundDeal{value: 1 wei}();
    }

    function testFundingCannotExceedBudget() public {
        vm.prank(advertiser);
        vm.expectRevert(
            abi.encodeWithSelector(DealEscrow.FundingExceedsBudget.selector, TOTAL_BUDGET + 1, TOTAL_BUDGET)
        );
        dealEscrow.fundDeal{value: TOTAL_BUDGET + 1}();
    }

    function testAdvertiserCanRecordConfirmedImpressions() public {
        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(100);

        assertEq(dealEscrow.confirmedImpressions(), 100);
    }

    function testOnlyAdvertiserCanRecordImpressions() public {
        vm.prank(outsider);
        vm.expectRevert(abi.encodeWithSelector(DealEscrow.Unauthorized.selector, outsider));
        dealEscrow.recordConfirmedImpressions(100);
    }

    function testRecordingCapsAtMaxImpressions() public {
        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(MAX_IMPRESSIONS + 1);

        assertEq(dealEscrow.confirmedImpressions(), MAX_IMPRESSIONS);
    }

    function testReleasePaymentTransfersEarnedAmountToPublisher() public {
        vm.prank(advertiser);
        dealEscrow.fundDeal{value: 0.5 ether}();

        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(100);

        uint256 publisherBalanceBefore = publisher.balance;
        vm.prank(publisher);
        uint256 amountReleased = dealEscrow.releasePayment();

        assertEq(amountReleased, 1000);
        assertEq(dealEscrow.totalPaid(), 1000);
        assertEq(publisher.balance, publisherBalanceBefore + 1000);
        assertEq(address(dealEscrow).balance, 0.5 ether - 1000);
    }

    function testReleasePaymentCannotExceedFundedAmount() public {
        vm.prank(advertiser);
        dealEscrow.fundDeal{value: 1_000}();

        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(500);

        vm.prank(publisher);
        uint256 amountReleased = dealEscrow.releasePayment();

        assertEq(amountReleased, 1_000);
        assertEq(dealEscrow.totalPaid(), 1_000);
        assertEq(address(dealEscrow).balance, 0);
    }

    function testCloseDealOnlyMarksClosedWithoutSendingFunds() public {
        vm.prank(advertiser);
        dealEscrow.fundDeal{value: 10_000}();

        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(500);

        uint256 publisherBalanceBefore = publisher.balance;

        vm.prank(advertiser);
        dealEscrow.closeDeal();

        assertTrue(dealEscrow.closed());
        assertEq(dealEscrow.totalPaid(), 0);
        assertEq(publisher.balance, publisherBalanceBefore);
    }

    function testPublisherCanPullPaymentAfterClose() public {
        vm.prank(advertiser);
        dealEscrow.fundDeal{value: 10_000}();

        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(500);

        vm.prank(advertiser);
        dealEscrow.closeDeal();

        uint256 publisherBalanceBefore = publisher.balance;

        vm.prank(publisher);
        uint256 amountReleased = dealEscrow.releasePayment();

        assertEq(amountReleased, 5_000);
        assertEq(dealEscrow.totalPaid(), 5_000);
        assertEq(publisher.balance, publisherBalanceBefore + 5_000);
    }

    function testAdvertiserCanRefundRemainingBudgetAfterClose() public {
        vm.prank(advertiser);
        dealEscrow.fundDeal{value: 10_000}();

        vm.prank(advertiser);
        dealEscrow.recordConfirmedImpressions(400);

        vm.prank(advertiser);
        dealEscrow.closeDeal();

        uint256 advertiserBalanceBefore = advertiser.balance;

        vm.prank(advertiser);
        uint256 refundedAmount = dealEscrow.refundRemainingBudget();

        assertEq(refundedAmount, 6_000);
        assertEq(dealEscrow.totalRefunded(), 6_000);
        assertEq(advertiser.balance, advertiserBalanceBefore + 6_000);
        assertEq(address(dealEscrow).balance, 4_000);
    }
    
    function testCannotRefundBeforeClose() public {
        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealEscrow.DealNotClosed.selector));
        dealEscrow.refundRemainingBudget();
    }

    function testClosedDealRejectsFurtherFundingAndImpressionUpdates() public {
        vm.prank(advertiser);
        dealEscrow.closeDeal();

        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealEscrow.DealClosedError.selector));
        dealEscrow.fundDeal{value: 1 wei}();

        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealEscrow.DealClosedError.selector));
        dealEscrow.recordConfirmedImpressions(1);
    }
}
