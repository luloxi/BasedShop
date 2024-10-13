//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { PunkPosts } from "../contracts/PunkPosts.sol";
import { PunkProfile } from "../contracts/PunkProfile.sol";
import { BasedShop } from "../contracts/BasedShop.sol";
import "./DeployHelpers.s.sol";

contract DeployYourContract is ScaffoldETHDeploy {
  uint256 LOCAL_CHAIN_ID = 31337;

  PunkPosts punkPosts;
  PunkProfile punkProfile;
  BasedShop basedShop;

  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    // Deploying just to get the ABI from the frontend
    punkPosts = new PunkPosts();
    console.logString(
      string.concat("PunkPosts deployed at: ", vm.toString(address(punkPosts)))
    );

    punkProfile = new PunkProfile();
    console.logString(
      string.concat(
        "PunkProfile deployed at: ", vm.toString(address(punkProfile))
      )
    );

    basedShop = new BasedShop(address(punkProfile), address(punkPosts));
    console.logString(
      string.concat("BasedShop deployed at: ", vm.toString(address(basedShop)))
    );

    punkPosts.transferOwnership(address(basedShop));
    console.logString(
      string.concat(
        "PunkPosts ownership transferred to: ", vm.toString(address(basedShop))
      )
    );

    if (block.chainid == LOCAL_CHAIN_ID) { }
  }
}
