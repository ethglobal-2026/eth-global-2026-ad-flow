// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DeployHelpers.s.sol";
import "../contracts/PublisherRegistry.sol";

contract DeployPublisherRegistry is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        new PublisherRegistry(deployer);
    }
}
