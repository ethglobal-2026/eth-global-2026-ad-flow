//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DeployHelpers.s.sol";
import {DeployAdvertiserRegistry} from "./DeployAdvertiserRegistry.s.sol";
import {DeployPublisherRegistry} from "./DeployPublisherRegistry.s.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        DeployAdvertiserRegistry deployAdvertiserRegistry = new DeployAdvertiserRegistry();
        deployAdvertiserRegistry.run();

        DeployPublisherRegistry deployPublisherRegistry = new DeployPublisherRegistry();
        deployPublisherRegistry.run();
    }
}
