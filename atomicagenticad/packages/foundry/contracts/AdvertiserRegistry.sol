// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract AdvertiserRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct AdvertiserProfile {
        uint256 id;
        string name;
        string metadataURI;
        bool active;
        uint64 createdAt;
        uint64 updatedAt;
    }

    uint256 public nextAdvertiserId = 1;

    mapping(uint256 advertiserId => AdvertiserProfile advertiser) private advertisers;
    mapping(uint256 advertiserId => address account) private advertiserAccounts;
    mapping(address account => uint256) public advertiserIdByAccount;

    event AdvertiserProfileCreated(
        uint256 indexed advertiserId,
        address indexed advertiser,
        string name,
        string metadataURI
    );
    event AdvertiserProfileUpdated(
        uint256 indexed advertiserId,
        address indexed advertiser,
        string name,
        string metadataURI
    );
    event AdvertiserStatusChanged(uint256 indexed advertiserId, bool active);

    error AdvertiserNotFound(uint256 advertiserId);
    error NotAdvertiserAccountOrAdmin(uint256 advertiserId, address caller);
    error InvalidAccount();
    error AccountAlreadyRegistered(address account, uint256 advertiserId);

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAccount();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function createAdvertiserProfile(
        string calldata name,
        string calldata metadataURI
    ) external returns (uint256 advertiserId) {
        if (advertiserIdByAccount[msg.sender] != 0) {
            revert AccountAlreadyRegistered(msg.sender, advertiserIdByAccount[msg.sender]);
        }

        advertiserId = nextAdvertiserId++;
        uint64 timestamp = uint64(block.timestamp);

        advertisers[advertiserId] = AdvertiserProfile({
            id: advertiserId,
            name: name,
            metadataURI: metadataURI,
            active: true,
            createdAt: timestamp,
            updatedAt: timestamp
        });
        advertiserAccounts[advertiserId] = msg.sender;
        advertiserIdByAccount[msg.sender] = advertiserId;

        emit AdvertiserProfileCreated(advertiserId, msg.sender, name, metadataURI);
    }

    function updateAdvertiserProfile(
        uint256 advertiserId,
        string calldata name,
        string calldata metadataURI
    ) external {
        AdvertiserProfile storage advertiser = _getExistingAdvertiser(advertiserId);

        if (!_canManageAdvertiser(advertiserId)) revert NotAdvertiserAccountOrAdmin(advertiserId, msg.sender);

        advertiser.name = name;
        advertiser.metadataURI = metadataURI;
        advertiser.updatedAt = uint64(block.timestamp);

        emit AdvertiserProfileUpdated(advertiserId, advertiserAccounts[advertiserId], name, metadataURI);
    }

    function setAdvertiserStatus(uint256 advertiserId, bool active) external {
        AdvertiserProfile storage advertiser = _getExistingAdvertiser(advertiserId);

        if (!_canManageAdvertiser(advertiserId)) revert NotAdvertiserAccountOrAdmin(advertiserId, msg.sender);

        advertiser.active = active;
        advertiser.updatedAt = uint64(block.timestamp);

        emit AdvertiserStatusChanged(advertiserId, active);
    }

    function getAdvertiser(uint256 advertiserId) external view returns (AdvertiserProfile memory) {
        return _getExistingAdvertiser(advertiserId);
    }

    function getAdvertiserAccount(uint256 advertiserId) external view returns (address) {
        _getExistingAdvertiser(advertiserId);
        return advertiserAccounts[advertiserId];
    }

    function isActiveAdvertiser(address account) external view returns (bool) {
        uint256 advertiserId = advertiserIdByAccount[account];
        if (advertiserId == 0) {
            return false;
        }

        return advertisers[advertiserId].active;
    }

    function _canManageAdvertiser(uint256 advertiserId) internal view returns (bool) {
        return msg.sender == advertiserAccounts[advertiserId] || hasRole(ADMIN_ROLE, msg.sender);
    }

    function _getExistingAdvertiser(
        uint256 advertiserId
    ) internal view returns (AdvertiserProfile storage advertiser) {
        advertiser = advertisers[advertiserId];
        if (advertiser.id == 0) revert AdvertiserNotFound(advertiserId);
    }
}
