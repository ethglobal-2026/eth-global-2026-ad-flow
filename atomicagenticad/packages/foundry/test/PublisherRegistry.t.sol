// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/PublisherRegistry.sol";

contract PublisherRegistryTest is Test {
    PublisherRegistry public publisherRegistry;

    address internal admin = vm.addr(1);
    address internal publisher = vm.addr(2);
    address internal anotherPublisher = vm.addr(3);
    address internal outsider = vm.addr(4);

    function setUp() public {
        publisherRegistry = new PublisherRegistry(admin);
    }

    function testAdminRolesOnDeployment() public view {
        assertTrue(publisherRegistry.hasRole(publisherRegistry.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(publisherRegistry.hasRole(publisherRegistry.ADMIN_ROLE(), admin));
        assertEq(publisherRegistry.nextPublisherId(), 1);
    }

    function testCreatePublisherListingIsPermissionless() public {
        vm.prank(anotherPublisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("permissionless.eth", 10, "ipfs://publisher-1");

        assertEq(publisherId, 1);
        assertEq(publisherRegistry.publisherIdByAccount(anotherPublisher), publisherId);
    }

    function testCreatePublisherListingStoresPublisherDataAndCallerOwnership() public {
        vm.prank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");
        PublisherRegistry.PublisherProfile memory profile = publisherRegistry.getPublisher(publisherId);

        assertEq(profile.id, 1);
        assertEq(profile.ensName, "publisher.eth");
        assertEq(profile.pricePerImpression, 10);
        assertEq(profile.metadataURI, "ipfs://publisher-1");
        assertTrue(profile.active);
        assertTrue(profile.available);
        assertEq(profile.createdAt, block.timestamp);
        assertEq(profile.updatedAt, block.timestamp);
        assertEq(publisherRegistry.getPublisherAccount(publisherId), publisher);
        assertEq(publisherRegistry.publisherIdByAccount(publisher), publisherId);
        assertEq(publisherRegistry.nextPublisherId(), 2);
    }

    function testPublisherCanUpdateOwnListing() public {
        vm.prank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");

        vm.warp(block.timestamp + 1 days);
        vm.prank(publisher);
        publisherRegistry.updatePublisherListing(publisherId, "publisher-v2.eth", 25, "ipfs://publisher-2");

        PublisherRegistry.PublisherProfile memory profile = publisherRegistry.getPublisher(publisherId);
        assertEq(profile.ensName, "publisher-v2.eth");
        assertEq(profile.pricePerImpression, 25);
        assertEq(profile.metadataURI, "ipfs://publisher-2");
        assertEq(profile.updatedAt, block.timestamp);
    }

    function testAdminCanUpdatePublisherStatus() public {
        vm.prank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");

        vm.warp(block.timestamp + 1);
        vm.prank(admin);
        publisherRegistry.setPublisherStatus(publisherId, false);

        PublisherRegistry.PublisherProfile memory profile = publisherRegistry.getPublisher(publisherId);
        assertFalse(profile.active);
        assertEq(profile.updatedAt, block.timestamp);
    }

    function testPublisherCanUpdateAvailability() public {
        vm.prank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");

        vm.warp(block.timestamp + 1);
        vm.prank(publisher);
        publisherRegistry.setPublisherAvailability(publisherId, false);

        PublisherRegistry.PublisherProfile memory profile = publisherRegistry.getPublisher(publisherId);
        assertFalse(profile.available);
        assertEq(profile.updatedAt, block.timestamp);
    }

    function testIsAvailablePublisherRequiresActiveAndAvailableListing() public {
        vm.prank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");

        assertTrue(publisherRegistry.isAvailablePublisher(publisherId));

        vm.prank(publisher);
        publisherRegistry.setPublisherAvailability(publisherId, false);
        assertFalse(publisherRegistry.isAvailablePublisher(publisherId));

        vm.prank(publisher);
        publisherRegistry.setPublisherAvailability(publisherId, true);
        assertTrue(publisherRegistry.isAvailablePublisher(publisherId));

        vm.prank(admin);
        publisherRegistry.setPublisherStatus(publisherId, false);
        assertFalse(publisherRegistry.isAvailablePublisher(publisherId));
    }

    function testUnauthorizedUserCannotManagePublisherListing() public {
        vm.prank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");

        vm.prank(outsider);
        vm.expectRevert(
            abi.encodeWithSelector(PublisherRegistry.NotPublisherAccountOrAdmin.selector, publisherId, outsider)
        );
        publisherRegistry.updatePublisherListing(publisherId, "publisher-v2.eth", 25, "ipfs://publisher-2");
    }

    function testPublisherCannotCreateTwoListings() public {
        vm.startPrank(publisher);
        uint256 publisherId = publisherRegistry.createPublisherListing("publisher.eth", 10, "ipfs://publisher-1");
        vm.expectRevert(
            abi.encodeWithSelector(PublisherRegistry.AccountAlreadyRegistered.selector, publisher, publisherId)
        );
        publisherRegistry.createPublisherListing("publisher-v2.eth", 20, "ipfs://publisher-2");
        vm.stopPrank();
    }

    function testCreatePublisherListingRequiresNonZeroPrice() public {
        vm.prank(publisher);
        vm.expectRevert(abi.encodeWithSelector(PublisherRegistry.InvalidPricePerImpression.selector));
        publisherRegistry.createPublisherListing("publisher.eth", 0, "ipfs://publisher-1");
    }

    function testMissingPublisherReverts() public {
        vm.expectRevert(abi.encodeWithSelector(PublisherRegistry.PublisherNotFound.selector, 999));
        publisherRegistry.getPublisher(999);
    }
}
