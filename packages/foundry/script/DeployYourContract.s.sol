//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { BasedArticles } from "../contracts/BasedArticles.sol";
import { BasedProfile } from "../contracts/BasedProfile.sol";
import { BasedShop } from "../contracts/BasedShop.sol";
import "./DeployHelpers.s.sol";

contract DeployYourContract is ScaffoldETHDeploy {
  uint256 LOCAL_CHAIN_ID = 31337;

  BasedArticles basedArticles;
  BasedProfile punkProfile;
  BasedShop basedShop;

  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    // Deploying just to get the ABI from the frontend
    basedArticles = new BasedArticles();
    console.logString(
      string.concat(
        "BasedArticles deployed at: ", vm.toString(address(basedArticles))
      )
    );

    punkProfile = new BasedProfile();
    console.logString(
      string.concat(
        "BasedProfile deployed at: ", vm.toString(address(punkProfile))
      )
    );

    basedShop = new BasedShop(address(punkProfile), address(basedArticles));
    console.logString(
      string.concat("BasedShop deployed at: ", vm.toString(address(basedShop)))
    );

    basedArticles.transferOwnership(address(basedShop));
    console.logString(
      string.concat(
        "BasedArticles ownership transferred to: ",
        vm.toString(address(basedShop))
      )
    );

    if (block.chainid == LOCAL_CHAIN_ID) { }
  }
}
