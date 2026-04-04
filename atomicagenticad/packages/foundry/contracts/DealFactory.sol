// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AdvertiserRegistry} from "./AdvertiserRegistry.sol";
import {DealEscrow} from "./DealEscrow.sol";
import {PublisherRegistry} from "./PublisherRegistry.sol";

contract DealFactory {
    AdvertiserRegistry public immutable ADVERTISER_REGISTRY;
    PublisherRegistry public immutable PUBLISHER_REGISTRY;

    uint256 public nextDealId = 1;

    mapping(uint256 dealId => address escrow) public escrowByDealId;

    event DealCreated(
        uint256 indexed dealId,
        uint256 indexed publisherId,
        uint256 indexed advertiserId,
        address advertiser,
        address publisher,
        address escrow,
        uint256 totalBudget,
        uint256 maxImpressions,
        uint256 pricePerImpression
    );

    error InvalidRegistry();
    error InvalidBudget();
    error InvalidMaxImpressions();
    error AdvertiserNotActive(address advertiser);
    error PublisherNotAvailable(uint256 publisherId);

    constructor(address advertiserRegistry_, address publisherRegistry_) {
        if (advertiserRegistry_ == address(0) || publisherRegistry_ == address(0)) {
            revert InvalidRegistry();
        }

        ADVERTISER_REGISTRY = AdvertiserRegistry(advertiserRegistry_);
        PUBLISHER_REGISTRY = PublisherRegistry(publisherRegistry_);
    }

    function createDeal(
        uint256 publisherId,
        uint256 totalBudget,
        uint256 maxImpressions
    ) external returns (uint256 dealId, address escrow) {
        if (!ADVERTISER_REGISTRY.isActiveAdvertiser(msg.sender)) revert AdvertiserNotActive(msg.sender);
        if (totalBudget == 0) revert InvalidBudget();
        if (maxImpressions == 0) revert InvalidMaxImpressions();
        if (!PUBLISHER_REGISTRY.isAvailablePublisher(publisherId)) revert PublisherNotAvailable(publisherId);

        PublisherRegistry.PublisherProfile memory publisherProfile = PUBLISHER_REGISTRY.getPublisher(publisherId);
        address publisher = PUBLISHER_REGISTRY.getPublisherAccount(publisherId);
        uint256 advertiserId = ADVERTISER_REGISTRY.advertiserIdByAccount(msg.sender);

        dealId = nextDealId++;
        escrow = address(
            new DealEscrow(
                msg.sender,
                publisher,
                publisherProfile.pricePerImpression,
                totalBudget,
                maxImpressions
            )
        );

        escrowByDealId[dealId] = escrow;

        emit DealCreated(
            dealId,
            publisherId,
            advertiserId,
            msg.sender,
            publisher,
            escrow,
            totalBudget,
            maxImpressions,
            publisherProfile.pricePerImpression
        );
    }

    function getDealEscrow(uint256 dealId) external view returns (address) {
        return escrowByDealId[dealId];
    }
}
