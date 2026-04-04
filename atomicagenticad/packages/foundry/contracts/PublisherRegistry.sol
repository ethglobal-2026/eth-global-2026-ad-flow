// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract PublisherRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct PublisherProfile {
        uint256 id;
        string ensName;
        uint256 pricePerImpression;
        string metadataURI;
        bool active;
        bool available;
        uint64 createdAt;
        uint64 updatedAt;
    }

    uint256 public nextPublisherId = 1;

    mapping(uint256 publisherId => PublisherProfile publisher) private publishers;
    mapping(uint256 publisherId => address account) private publisherAccounts;
    mapping(address account => uint256) public publisherIdByAccount;

    event PublisherListingCreated(
        uint256 indexed publisherId,
        address indexed publisher,
        string ensName,
        uint256 pricePerImpression,
        string metadataURI
    );
    event PublisherListingUpdated(
        uint256 indexed publisherId,
        address indexed publisher,
        string ensName,
        uint256 pricePerImpression,
        string metadataURI
    );
    event PublisherStatusChanged(uint256 indexed publisherId, bool active);
    event PublisherAvailabilityChanged(uint256 indexed publisherId, bool available);

    error PublisherNotFound(uint256 publisherId);
    error NotPublisherAccountOrAdmin(uint256 publisherId, address caller);
    error InvalidAccount();
    error AccountAlreadyRegistered(address account, uint256 publisherId);
    error InvalidPricePerImpression();

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAccount();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function createPublisherListing(
        string calldata ensName,
        uint256 pricePerImpression,
        string calldata metadataURI
    ) external returns (uint256 publisherId) {
        if (publisherIdByAccount[msg.sender] != 0) {
            revert AccountAlreadyRegistered(msg.sender, publisherIdByAccount[msg.sender]);
        }
        if (pricePerImpression == 0) revert InvalidPricePerImpression();

        publisherId = nextPublisherId++;
        uint64 timestamp = uint64(block.timestamp);

        publishers[publisherId] = PublisherProfile({
            id: publisherId,
            ensName: ensName,
            pricePerImpression: pricePerImpression,
            metadataURI: metadataURI,
            active: true,
            available: true,
            createdAt: timestamp,
            updatedAt: timestamp
        });
        publisherAccounts[publisherId] = msg.sender;
        publisherIdByAccount[msg.sender] = publisherId;

        emit PublisherListingCreated(publisherId, msg.sender, ensName, pricePerImpression, metadataURI);
    }

    function updatePublisherListing(
        uint256 publisherId,
        string calldata ensName,
        uint256 pricePerImpression,
        string calldata metadataURI
    ) external {
        PublisherProfile storage publisher = _getExistingPublisher(publisherId);

        if (!_canManagePublisher(publisherId)) revert NotPublisherAccountOrAdmin(publisherId, msg.sender);
        if (pricePerImpression == 0) revert InvalidPricePerImpression();

        publisher.ensName = ensName;
        publisher.pricePerImpression = pricePerImpression;
        publisher.metadataURI = metadataURI;
        publisher.updatedAt = uint64(block.timestamp);

        emit PublisherListingUpdated(
            publisherId,
            publisherAccounts[publisherId],
            ensName,
            pricePerImpression,
            metadataURI
        );
    }

    function setPublisherStatus(uint256 publisherId, bool active) external {
        PublisherProfile storage publisher = _getExistingPublisher(publisherId);

        if (!_canManagePublisher(publisherId)) revert NotPublisherAccountOrAdmin(publisherId, msg.sender);

        publisher.active = active;
        publisher.updatedAt = uint64(block.timestamp);

        emit PublisherStatusChanged(publisherId, active);
    }

    function setPublisherAvailability(uint256 publisherId, bool available) external {
        PublisherProfile storage publisher = _getExistingPublisher(publisherId);

        // TODO: Should be done by the deal making contract
        if (!_canManagePublisher(publisherId)) revert NotPublisherAccountOrAdmin(publisherId, msg.sender);

        publisher.available = available;
        publisher.updatedAt = uint64(block.timestamp);

        emit PublisherAvailabilityChanged(publisherId, available);
    }

    function getPublisher(uint256 publisherId) external view returns (PublisherProfile memory) {
        return _getExistingPublisher(publisherId);
    }

    function getPublisherAccount(uint256 publisherId) external view returns (address) {
        _getExistingPublisher(publisherId);
        return publisherAccounts[publisherId];
    }

    function isAvailablePublisher(uint256 publisherId) external view returns (bool) {
        PublisherProfile storage publisher = _getExistingPublisher(publisherId);
        return publisher.active && publisher.available;
    }

    function _canManagePublisher(uint256 publisherId) internal view returns (bool) {
        return msg.sender == publisherAccounts[publisherId] || hasRole(ADMIN_ROLE, msg.sender);
    }

    function _getExistingPublisher(uint256 publisherId) internal view returns (PublisherProfile storage publisher) {
        publisher = publishers[publisherId];
        if (publisher.id == 0) revert PublisherNotFound(publisherId);
    }
}
