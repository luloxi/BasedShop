// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { BasedProfile } from "./BasedProfile.sol";
import { BasedArticles } from "./BasedArticles.sol";
// import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
// import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

struct Comment {
  address user;
  string text;
  uint256 index;
}

contract BasedShop {
  /*//////////////////////////////////////////////////////////////
                                    EVENTS
  //////////////////////////////////////////////////////////////*/

  event PostCreated(
    uint256 indexed postId,
    address indexed user,
    string tokenURI,
    uint256 timestamp
  );
  event PostDeleted(uint256 indexed postId, uint256 timestamp);
  event PostLiked(
    uint256 indexed postID, address indexed user, uint256 timestamp
  );
  event PostUnliked(
    uint256 indexed postID, address indexed user, uint256 timestamp
  );
  event PostCommented(
    uint256 indexed postID,
    address indexed user,
    string text,
    uint256 index,
    uint256 timestamp
  );
  event PostCommentDeleted(
    uint256 indexed postID, address indexed user, uint256 timestamp
  );
  event PostShared(
    uint256 indexed postID, address indexed user, uint256 timestamp
  );
  event PostUnshared(
    uint256 indexed postID, address indexed user, uint256 timestamp
  );
  event UserFollowed(
    address indexed user, address indexed follower, uint256 timestamp
  );
  event UserUnfollowed(
    address indexed user, address indexed follower, uint256 timestamp
  );
  event FollowerRemoved(
    address indexed user, address indexed follower, uint256 timestamp
  );

  /*//////////////////////////////////////////////////////////////
                                STATE VARIABLES
  //////////////////////////////////////////////////////////////*/

  uint256 public postIds;
  BasedProfile public punkProfile;
  BasedArticles public basedArticles;

  mapping(uint256 => address) public postIdToUser;
  mapping(address => uint256[]) public userArticles;

  // Likes
  mapping(uint256 post => uint256 likes) public postToLikes;
  mapping(address user => mapping(uint256 post => bool liked)) public
    userToPostLikes;

  // Comments
  mapping(uint256 postId => Comment[]) public postToComments;
  mapping(uint256 postId => mapping(uint256 commentId => address user)) public
    postCommentToUser;

  // Shared
  mapping(address user => uint256[] sharedArticles) public userToSharedArticles;
  mapping(address user => mapping(uint256 post => uint256 index)) public
    userToSharedPostIndex;

  // Following and Followers
  mapping(address user => mapping(address follower => bool isFollowing)) public
    userToFollowing;
  mapping(address user => mapping(address follower => bool isFollower)) public
    userToFollowers;

  /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR FUNCTION
  //////////////////////////////////////////////////////////////*/

  constructor(address _punkProfile, address _basedArticles) {
    punkProfile = BasedProfile(_punkProfile);
    basedArticles = BasedArticles(_basedArticles);
  }

  /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
   //////////////////////////////////////////////////////////////*/

  function createPost(
    string memory _tokenURI
  ) public {
    uint256 postId = postIds++;
    postIdToUser[postId] = msg.sender;
    userArticles[msg.sender].push(postId);

    basedArticles.mint(_tokenURI);

    emit PostCreated(postId, msg.sender, _tokenURI, block.timestamp);
  }

  function deletePost(
    uint256 _postId
  ) public {
    require(postIdToUser[_postId] == msg.sender, "Not the owner of the post");

    basedArticles.burn(_postId);

    emit PostDeleted(_postId, block.timestamp);
  }

  function likePost(
    uint256 _postID
  ) public {
    _requirePostExists(_postID);
    require(
      !userToPostLikes[msg.sender][_postID], "You have already liked this post"
    );
    userToPostLikes[msg.sender][_postID] = true;
    postToLikes[_postID]++;
    emit PostLiked(_postID, msg.sender, block.timestamp);
  }

  function unlikePost(
    uint256 _postID
  ) public {
    _requirePostExists(_postID);
    require(
      userToPostLikes[msg.sender][_postID], "You have not liked this post yet"
    );
    userToPostLikes[msg.sender][_postID] = false;
    postToLikes[_postID]--;
    emit PostUnliked(_postID, msg.sender, block.timestamp);
  }

  function commentOnPost(uint256 _postID, string memory _text) public {
    _requirePostExists(_postID);
    // set max length at 250 characters
    require(
      bytes(_text).length <= 250, "Comment must be less than 250 characters"
    );
    uint256 commentIndex = postToComments[_postID].length;
    postToComments[_postID].push(Comment(msg.sender, _text, commentIndex));
    emit PostCommented(
      _postID, msg.sender, _text, commentIndex, block.timestamp
    );
  }

  function deleteComment(uint256 _postID, uint256 _commentID) public {
    _requirePostExists(_postID);
    require(
      postCommentToUser[_postID][_commentID] == msg.sender,
      "You can't erase what you didn't post!"
    );
    delete postCommentToUser[_postID][_commentID];
    delete postToComments[_postID][_commentID];
    emit PostCommentDeleted(_postID, msg.sender, block.timestamp);
  }

  function sharePost(
    uint256 _postID
  ) public {
    _requirePostExists(_postID);
    userToSharedArticles[msg.sender].push(_postID);
    // userToSharedPostIndex[msg.sender][_postID] =
    //   userToSharedArticles[msg.sender].length - 1;
    emit PostShared(_postID, msg.sender, block.timestamp);
  }

  function deleteSharedPost(
    uint256 _postID
  ) public {
    _requirePostExists(_postID);

    // Retrieve the index of the post to be deleted
    uint256 index = userToSharedPostIndex[msg.sender][_postID];

    // Set the post to a default value (e.g., 0)
    userToSharedArticles[msg.sender][index] = 0;

    // Delete the index entry for the deleted post
    delete userToSharedPostIndex[msg.sender][_postID];

    // Emit the PostUnshared event
    emit PostUnshared(_postID, msg.sender, block.timestamp);
  }

  function followUser(
    address _userAddress
  ) public {
    require(_userAddress != msg.sender, "Cannot follow yourself");
    require(
      !userToFollowing[msg.sender][_userAddress], "Already following this user"
    );

    userToFollowing[msg.sender][_userAddress] = true;
    userToFollowers[_userAddress][msg.sender] = true;
    emit UserFollowed(_userAddress, msg.sender, block.timestamp);
  }

  function unfollowUser(
    address _userAddress
  ) public {
    require(
      userToFollowing[msg.sender][_userAddress], "Not following this user"
    );

    userToFollowing[msg.sender][_userAddress] = false;
    userToFollowers[_userAddress][msg.sender] = false;
    emit UserUnfollowed(_userAddress, msg.sender, block.timestamp);
  }

  function removeFollower(
    address _followerAddress
  ) public {
    require(userToFollowers[msg.sender][_followerAddress], "Not a follower");

    userToFollowers[msg.sender][_followerAddress] = false;
    userToFollowing[_followerAddress][msg.sender] = false;
    emit FollowerRemoved(msg.sender, _followerAddress, block.timestamp);
  }

  /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function _requirePostExists(
    uint256 _postID
  ) internal view {
    require(basedArticles.tokenId() >= _postID, "Post does not exist");
  }
}
