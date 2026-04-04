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

    uint256 internal advertiserId;
    uint256 internal publisherId;

    function setUp() public {
        advertiserRegistry = new AdvertiserRegistry(admin);
        publisherRegistry = new PublisherRegistry(admin);
        dealFactory = new DealFactory(address(advertiserRegistry), address(publisherRegistry));

        vm.prank(advertiser);
        advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");

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

        DealEscrow escrow = DealEscrow(escrowAddress);
        assertEq(escrow.advertiser(), advertiser);
        assertEq(escrow.publisher(), publisher);
        assertEq(escrow.pricePerImpression(), 10);
        assertEq(escrow.totalBudget(), 1_000);
        assertEq(escrow.maxImpressions(), 100);
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
