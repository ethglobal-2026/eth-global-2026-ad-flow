// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DeployHelpers.s.sol";
import "../contracts/DealFactory.sol";

contract DeployDealFactory is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        address advertiserRegistry = vm.envAddress("ADVERTISER_REGISTRY_ADDRESS");
        address publisherRegistry = vm.envAddress("PUBLISHER_REGISTRY_ADDRESS");

        new DealFactory(advertiserRegistry, publisherRegistry);
    }
}
