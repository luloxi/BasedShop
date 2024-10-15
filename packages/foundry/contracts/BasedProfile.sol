// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/*//////////////////////////////////////////////////////////////
                                STRUCTS
//////////////////////////////////////////////////////////////*/

struct Profile {
  string bio;
  string email;
}

using Strings for string;

contract BasedProfile {
  /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
  //////////////////////////////////////////////////////////////*/

  mapping(address => Profile) public profiles;
  mapping(string => address) public nameToAddress;

  /*//////////////////////////////////////////////////////////////
                          EXTERNAL FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function setProfile(string memory _bio, string memory _email) public {
    if (
      bytes(_email).length != 0
        && keccak256(bytes(_email))
          != keccak256(bytes(profiles[msg.sender].email))
    ) {
      require(_isValidEmail(_email));
      profiles[msg.sender].email = _email;
    }
    profiles[msg.sender].bio = _bio;
  }

  /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function _isValidEmail(
    string memory email
  ) internal pure returns (bool) {
    bytes memory emailBytes = bytes(email);
    bool hasAtSymbol = false;
    bool hasDotAfterAt = false;

    for (uint256 i = 0; i < emailBytes.length; i++) {
      if (emailBytes[i] == "@") {
        hasAtSymbol = true;
      } else if (hasAtSymbol && emailBytes[i] == ".") {
        hasDotAfterAt = true;
      }
    }

    return hasAtSymbol && hasDotAfterAt;
  }
}
