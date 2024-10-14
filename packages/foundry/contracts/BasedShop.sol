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

  event ArticleCreated(
    uint256 indexed articleId,
    address indexed user,
    string tokenURI,
    uint256 date
  );
  event ArticleDeleted(uint256 indexed articleId, uint256 date);
  event ArticleLiked(
    uint256 indexed articleID, address indexed user, uint256 date
  );
  event ArticleUnliked(
    uint256 indexed articleID, address indexed user, uint256 date
  );
  event ArticleCommented(
    uint256 indexed articleID,
    address indexed user,
    string text,
    uint256 index,
    uint256 date
  );
  event ArticleCommentDeleted(
    uint256 indexed articleID, address indexed user, uint256 date
  );
  event ArticleBookmarked(
    uint256 indexed articleID, address indexed user, uint256 date
  );
  event ArticleUnshared(
    uint256 indexed articleID, address indexed user, uint256 date
  );
  event UserFollowed(
    address indexed user, address indexed follower, uint256 date
  );
  event UserUnfollowed(
    address indexed user, address indexed follower, uint256 date
  );
  event FollowerRemoved(
    address indexed user, address indexed follower, uint256 date
  );

  /*//////////////////////////////////////////////////////////////
                                STATE VARIABLES
  //////////////////////////////////////////////////////////////*/

  uint256 public articleIds;
  BasedProfile public punkProfile;
  BasedArticles public basedArticles;

  mapping(uint256 => address) public articleIdToUser;
  mapping(address => uint256[]) public userArticles;

  // Likes
  mapping(uint256 article => uint256 likes) public articleToLikes;
  mapping(address user => mapping(uint256 article => bool liked)) public
    userToArticleLikes;

  // Comments
  mapping(uint256 articleId => Comment[]) public articleToComments;
  mapping(uint256 articleId => mapping(uint256 commentId => address user))
    public articleCommentToUser;

  // Bookmarked
  mapping(address user => uint256[] sharedArticles) public
    userToBookmarkedArticles;
  mapping(address user => mapping(uint256 article => uint256 index)) public
    userToBookmarkedArticleIndex;

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

  function createArticle(
    string memory _tokenURI
  ) public {
    uint256 articleId = articleIds++;
    articleIdToUser[articleId] = msg.sender;
    userArticles[msg.sender].push(articleId);

    basedArticles.mint(_tokenURI);

    emit ArticleCreated(articleId, msg.sender, _tokenURI, block.timestamp);
  }

  function deleteArticle(
    uint256 _articleId
  ) public {
    require(
      articleIdToUser[_articleId] == msg.sender, "Not the owner of the article"
    );

    basedArticles.burn(_articleId);

    emit ArticleDeleted(_articleId, block.timestamp);
  }

  function likeArticle(
    uint256 _articleID
  ) public {
    _requireArticleExists(_articleID);
    require(
      !userToArticleLikes[msg.sender][_articleID],
      "You have already liked this article"
    );
    userToArticleLikes[msg.sender][_articleID] = true;
    articleToLikes[_articleID]++;
    emit ArticleLiked(_articleID, msg.sender, block.timestamp);
  }

  function unlikeArticle(
    uint256 _articleID
  ) public {
    _requireArticleExists(_articleID);
    require(
      userToArticleLikes[msg.sender][_articleID],
      "You have not liked this article yet"
    );
    userToArticleLikes[msg.sender][_articleID] = false;
    articleToLikes[_articleID]--;
    emit ArticleUnliked(_articleID, msg.sender, block.timestamp);
  }

  function commentOnArticle(uint256 _articleID, string memory _text) public {
    _requireArticleExists(_articleID);
    // set max length at 250 characters
    require(
      bytes(_text).length <= 250, "Comment must be less than 250 characters"
    );
    uint256 commentIndex = articleToComments[_articleID].length;
    articleToComments[_articleID].push(Comment(msg.sender, _text, commentIndex));
    emit ArticleCommented(
      _articleID, msg.sender, _text, commentIndex, block.timestamp
    );
  }

  function deleteComment(uint256 _articleID, uint256 _commentID) public {
    _requireArticleExists(_articleID);
    require(
      articleCommentToUser[_articleID][_commentID] == msg.sender,
      "You can't erase what you didn't article!"
    );
    delete articleCommentToUser[_articleID][_commentID];
    delete articleToComments[_articleID][_commentID];
    emit ArticleCommentDeleted(_articleID, msg.sender, block.timestamp);
  }

  function shareArticle(
    uint256 _articleID
  ) public {
    _requireArticleExists(_articleID);
    userToBookmarkedArticles[msg.sender].push(_articleID);
    // userToBookmarkedArticleIndex[msg.sender][_articleID] =
    //   userToBookmarkedArticles[msg.sender].length - 1;
    emit ArticleBookmarked(_articleID, msg.sender, block.timestamp);
  }

  function deleteBookmarkedArticle(
    uint256 _articleID
  ) public {
    _requireArticleExists(_articleID);

    // Retrieve the index of the article to be deleted
    uint256 index = userToBookmarkedArticleIndex[msg.sender][_articleID];

    // Set the article to a default value (e.g., 0)
    userToBookmarkedArticles[msg.sender][index] = 0;

    // Delete the index entry for the deleted article
    delete userToBookmarkedArticleIndex[msg.sender][_articleID];

    // Emit the ArticleUnshared event
    emit ArticleUnshared(_articleID, msg.sender, block.timestamp);
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

  function _requireArticleExists(
    uint256 _articleID
  ) internal view {
    require(basedArticles.tokenId() >= _articleID, "Article does not exist");
  }
}
