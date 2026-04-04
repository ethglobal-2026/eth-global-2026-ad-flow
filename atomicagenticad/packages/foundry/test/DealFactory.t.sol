// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/AdvertiserRegistry.sol";
import "../contracts/DealEscrow.sol";
import "../contracts/DealFactory.sol";
import "../contracts/PublisherRegistry.sol";

contract DealFactoryTest is Test {
    AdvertiserRegistry public advertiserRegistry;
    PublisherRegistry public publisherRegistry;
    DealFactory public dealFactory;

    address internal admin = vm.addr(1);
    address internal advertiser = vm.addr(2);
    address internal publisher = vm.addr(3);
    address internal outsider = vm.addr(4);
    address internal deployer = vm.addr(5);

    uint256 internal advertiserId;
    uint256 internal publisherId;

    function setUp() public {
        advertiserRegistry = new AdvertiserRegistry(admin);
        publisherRegistry = new PublisherRegistry(admin);
        vm.prank(deployer);
        dealFactory = new DealFactory(address(advertiserRegistry), address(publisherRegistry));
        bytes32 dealManagerRole = publisherRegistry.DEAL_MANAGER_ROLE();
        vm.prank(admin);
        publisherRegistry.grantRole(dealManagerRole, address(dealFactory));

        vm.prank(advertiser);
        advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");
        vm.deal(advertiser, 10 ether);

        vm.prank(publisher);
        publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");
    }

    function testCreateDealDeploysEscrowAndStoresTerms() public {
        vm.prank(advertiser);
        (uint256 dealId, address escrowAddress) = dealFactory.createDeal(publisherId, 1_000, 100);

        assertEq(dealId, 1);
        assertEq(dealFactory.nextDealId(), 2);
        assertEq(dealFactory.getDealEscrow(dealId), escrowAddress);
        assertEq(dealFactory.escrowByDealId(dealId), escrowAddress);

        DealEscrow escrow = DealEscrow(payable(escrowAddress));
        assertEq(escrow.ADVERTISER(), advertiser);
        assertEq(escrow.PUBLISHER(), publisher);
        assertEq(dealFactory.AUTHORIZED_REPORTER(), deployer);
        assertEq(escrow.IMPRESSION_REPORTER(), deployer);
        assertEq(escrow.DEAL_LIFECYCLE_MANAGER(), address(dealFactory));
        assertEq(escrow.PUBLISHER_ID(), publisherId);
        assertEq(escrow.PRICE_PER_IMPRESSION(), 10);
        assertEq(escrow.TOTAL_BUDGET(), 1_000);
        assertEq(escrow.MAX_IMPRESSIONS(), 100);
        assertFalse(publisherRegistry.isAvailablePublisher(publisherId));
    }

    function testCreateDealCanFundEscrowInSameTransaction() public {
        vm.prank(advertiser);
        (, address escrowAddress) = dealFactory.createDeal{value: 600}(publisherId, 1_000, 100);

        DealEscrow escrow = DealEscrow(payable(escrowAddress));
        assertEq(escrow.fundedAmount(), 600);
        assertEq(address(escrow).balance, 600);
    }

    function testCreateDealRevertsWhenInitialFundingExceedsBudget() public {
        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealEscrow.FundingExceedsBudget.selector, 1_001, 1_000));
        dealFactory.createDeal{value: 1_001}(publisherId, 1_000, 100);
    }

    function testClosingDealMakesPublisherAvailableAgain() public {
        vm.prank(advertiser);
        (, address escrowAddress) = dealFactory.createDeal(publisherId, 1_000, 100);

        assertFalse(publisherRegistry.isAvailablePublisher(publisherId));

        vm.prank(advertiser);
        DealEscrow(payable(escrowAddress)).closeDeal();

        assertTrue(publisherRegistry.isAvailablePublisher(publisherId));
    }

    function testCreateDealRequiresRegisteredAdvertiser() public {
        vm.prank(outsider);
        vm.expectRevert(abi.encodeWithSelector(DealFactory.AdvertiserNotActive.selector, outsider));
        dealFactory.createDeal(publisherId, 1_000, 100);
    }

    function testCreateDealRequiresActiveAdvertiser() public {
        vm.prank(admin);
        advertiserRegistry.setAdvertiserStatus(advertiserId, false);

        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealFactory.AdvertiserNotActive.selector, advertiser));
        dealFactory.createDeal(publisherId, 1_000, 100);
    }

    function testCreateDealRequiresAvailablePublisher() public {
        vm.prank(publisher);
        publisherRegistry.setPublisherAvailability(publisherId, false);

        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealFactory.PublisherNotAvailable.selector, publisherId));
        dealFactory.createDeal(publisherId, 1_000, 100);
    }

    function testCreateDealRequiresActivePublisher() public {
        vm.prank(admin);
        publisherRegistry.setPublisherStatus(publisherId, false);

        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealFactory.PublisherNotAvailable.selector, publisherId));
        dealFactory.createDeal(publisherId, 1_000, 100);
    }

    function testCreateDealRequiresExistingPublisher() public {
        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(PublisherRegistry.PublisherNotFound.selector, 999));
        dealFactory.createDeal(999, 1_000, 100);
    }

    function testCreateDealRequiresNonZeroBudget() public {
        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealFactory.InvalidBudget.selector));
        dealFactory.createDeal(publisherId, 0, 100);
    }

    function testCreateDealRequiresNonZeroImpressions() public {
        vm.prank(advertiser);
        vm.expectRevert(abi.encodeWithSelector(DealFactory.InvalidMaxImpressions.selector));
        dealFactory.createDeal(publisherId, 1_000, 0);
    }
}
