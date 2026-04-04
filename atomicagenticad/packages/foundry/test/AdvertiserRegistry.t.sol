// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/AdvertiserRegistry.sol";

contract AdvertiserRegistryTest is Test {
    AdvertiserRegistry public advertiserRegistry;

    address internal admin = vm.addr(1);
    address internal advertiser = vm.addr(2);
    address internal anotherAdvertiser = vm.addr(3);
    address internal outsider = vm.addr(4);

    function setUp() public {
        advertiserRegistry = new AdvertiserRegistry(admin);
    }

    function testAdminRolesOnDeployment() public view {
        assertTrue(advertiserRegistry.hasRole(advertiserRegistry.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(advertiserRegistry.hasRole(advertiserRegistry.ADMIN_ROLE(), admin));
        assertEq(advertiserRegistry.nextAdvertiserId(), 1);
    }

    function testCreateAdvertiserProfileIsPermissionless() public {
        vm.prank(anotherAdvertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Permissionless Labs", "ipfs://advertiser-1");

        assertEq(advertiserId, 1);
        assertEq(advertiserRegistry.advertiserIdByAccount(anotherAdvertiser), advertiserId);
    }

    function testCreateAdvertiserProfileStoresAdvertiserDataAndCallerOwnership() public {
        vm.prank(advertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");
        AdvertiserRegistry.AdvertiserProfile memory profile = advertiserRegistry.getAdvertiser(advertiserId);

        assertEq(profile.id, 1);
        assertEq(profile.name, "Acme Ads");
        assertEq(profile.metadataURI, "ipfs://advertiser-1");
        assertTrue(profile.active);
        assertEq(profile.createdAt, block.timestamp);
        assertEq(profile.updatedAt, block.timestamp);
        assertEq(advertiserRegistry.getAdvertiserAccount(advertiserId), advertiser);
        assertEq(advertiserRegistry.advertiserIdByAccount(advertiser), advertiserId);
        assertEq(advertiserRegistry.nextAdvertiserId(), 2);
    }

    function testAdvertiserCanUpdateOwnProfile() public {
        vm.prank(advertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");

        vm.warp(block.timestamp + 1 days);
        vm.prank(advertiser);
        advertiserRegistry.updateAdvertiserProfile(advertiserId, "Acme Ads v2", "ipfs://advertiser-2");

        AdvertiserRegistry.AdvertiserProfile memory profile = advertiserRegistry.getAdvertiser(advertiserId);
        assertEq(profile.name, "Acme Ads v2");
        assertEq(profile.metadataURI, "ipfs://advertiser-2");
        assertEq(profile.updatedAt, block.timestamp);
    }

    function testAdminCanUpdateAdvertiserStatus() public {
        vm.prank(advertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");

        vm.warp(block.timestamp + 1);
        vm.prank(admin);
        advertiserRegistry.setAdvertiserStatus(advertiserId, false);

        AdvertiserRegistry.AdvertiserProfile memory profile = advertiserRegistry.getAdvertiser(advertiserId);
        assertFalse(profile.active);
        assertEq(profile.updatedAt, block.timestamp);
    }

    function testUnauthorizedUserCannotManageAdvertiserProfile() public {
        vm.prank(advertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");

        vm.prank(outsider);
        vm.expectRevert(
            abi.encodeWithSelector(AdvertiserRegistry.NotAdvertiserAccountOrAdmin.selector, advertiserId, outsider)
        );
        advertiserRegistry.updateAdvertiserProfile(advertiserId, "Acme Ads v2", "ipfs://advertiser-2");
    }

    function testAdvertiserCannotCreateTwoProfiles() public {
        vm.startPrank(advertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");
        vm.expectRevert(
            abi.encodeWithSelector(AdvertiserRegistry.AccountAlreadyRegistered.selector, advertiser, advertiserId)
        );
        advertiserRegistry.createAdvertiserProfile("Acme Ads v2", "ipfs://advertiser-2");
        vm.stopPrank();
    }

    function testMissingAdvertiserReverts() public {
        vm.expectRevert(abi.encodeWithSelector(AdvertiserRegistry.AdvertiserNotFound.selector, 999));
        advertiserRegistry.getAdvertiser(999);
    }

    function testIsActiveAdvertiserRequiresExistingAndActiveProfile() public {
        assertFalse(advertiserRegistry.isActiveAdvertiser(advertiser));

        vm.prank(advertiser);
        uint256 advertiserId = advertiserRegistry.createAdvertiserProfile("Acme Ads", "ipfs://advertiser-1");

        assertTrue(advertiserRegistry.isActiveAdvertiser(advertiser));

        vm.prank(admin);
        advertiserRegistry.setAdvertiserStatus(advertiserId, false);

        assertFalse(advertiserRegistry.isActiveAdvertiser(advertiser));
    }
}
