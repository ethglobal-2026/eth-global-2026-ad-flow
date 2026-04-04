//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DeployHelpers.s.sol";
import {AdvertiserRegistry} from "../contracts/AdvertiserRegistry.sol";
import {DealFactory} from "../contracts/DealFactory.sol";
import {PublisherRegistry} from "../contracts/PublisherRegistry.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        AdvertiserRegistry advertiserRegistry = new AdvertiserRegistry(deployer);
        PublisherRegistry publisherRegistry = new PublisherRegistry(deployer);
        DealFactory dealFactory = new DealFactory(address(advertiserRegistry), address(publisherRegistry));
        publisherRegistry.grantRole(publisherRegistry.DEAL_MANAGER_ROLE(), address(dealFactory));

        deployments.push(Deployment({name: "AdvertiserRegistry", addr: address(advertiserRegistry)}));
        deployments.push(Deployment({name: "PublisherRegistry", addr: address(publisherRegistry)}));
        deployments.push(Deployment({name: "DealFactory", addr: address(dealFactory)}));
    }
}
