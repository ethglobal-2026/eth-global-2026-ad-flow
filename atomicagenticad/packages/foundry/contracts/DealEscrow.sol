// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DealEscrow {
    address public immutable advertiser;
    address public immutable publisher;
    uint256 public immutable pricePerImpression;
    uint256 public immutable totalBudget;
    uint256 public immutable maxImpressions;

    constructor(
        address advertiser_,
        address publisher_,
        uint256 pricePerImpression_,
        uint256 totalBudget_,
        uint256 maxImpressions_
    ) {
        advertiser = advertiser_;
        publisher = publisher_;
        pricePerImpression = pricePerImpression_;
        totalBudget = totalBudget_;
        maxImpressions = maxImpressions_;
    }
}
