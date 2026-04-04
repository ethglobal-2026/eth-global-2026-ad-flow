// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DeployHelpers.s.sol";
import "../contracts/AdvertiserRegistry.sol";

contract DeployAdvertiserRegistry is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        new AdvertiserRegistry(deployer);
    }
}
