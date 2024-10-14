// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/*//////////////////////////////////////////////////////////////
                                STRUCTS
//////////////////////////////////////////////////////////////*/

struct Profile {
  string username;
  string bio;
  string imageURL;
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

  function setProfile(
    string memory _username,
    string memory _bio,
    string memory _imageURL,
    string memory _email
  ) public {
    if (
      keccak256(bytes(_username))
        != keccak256(bytes(profiles[msg.sender].username))
    ) {
      setUsername(_username);
    }
    if (
      bytes(_email).length != 0
        && keccak256(bytes(_email))
          != keccak256(bytes(profiles[msg.sender].email))
    ) {
      require(_isValidEmail(_email));
      profiles[msg.sender].email = _email;
    }
    profiles[msg.sender].bio = _bio;
    profiles[msg.sender].imageURL = _imageURL;
  }

  // We keep this a separate function in case someone just wants to change username
  // and save some gas
  function setUsername(
    string memory _username
  ) public {
    string memory futureUsername = _rulesForUsernameCharacters(_username);

    require(
      nameToAddress[_rulesForUsernameCharacters(_username)] == address(0),
      "Username already taken"
    );

    if (
      keccak256(bytes(profiles[msg.sender].username))
        != keccak256(bytes(futureUsername))
    ) {
      delete nameToAddress[profiles[msg.sender].username];
    }
    profiles[msg.sender].username = futureUsername;

    nameToAddress[futureUsername] = msg.sender;
  }

  /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function _rulesForUsernameCharacters(
    string memory input
  ) internal pure returns (string memory) {
    bytes memory inputBytes = bytes(input);
    if (inputBytes.length < 3 || inputBytes.length > 17) {
      revert("Invalid username length: must be between 3 and 17 characters");
    }

    bytes memory verifiedString = new bytes(inputBytes.length);
    bool lastCharacterWasPeriod = false;

    for (uint256 i = 0; i < inputBytes.length; i++) {
      bytes1 character = inputBytes[i];

      // Convert uppercase letters to lowercase
      if (character >= 0x41 && character <= 0x5A) {
        // A-Z
        character = bytes1(uint8(character) + 32);
      }

      // Check for valid characters
      if (
        (character >= 0x61 && character <= 0x7A) // a-z
          || (character >= 0x30 && character <= 0x39) // 0-9
          || character == 0x5F // _
          || character == 0x2E // .
      ) {
        // Check for consecutive periods
        if (character == 0x2E) {
          // .
          if (lastCharacterWasPeriod) {
            revert("Invalid username: consecutive periods are not allowed");
          }
          lastCharacterWasPeriod = true;
        } else {
          lastCharacterWasPeriod = false;
        }
        verifiedString[i] = character;
      } else {
        revert("Invalid character in username");
      }
    }

    return string(verifiedString);
  }

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