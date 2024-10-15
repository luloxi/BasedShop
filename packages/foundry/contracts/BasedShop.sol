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
    uint256 date,
    uint256 price,
    uint256 amount
  );
  event ArticleBought(
    uint256 indexed articleId,
    address indexed buyer,
    address indexed seller,
    uint256 price,
    uint256 date
  );

  event ArticlePriceUpdated(
    uint256 indexed articleId, uint256 oldPrice, uint256 newPrice
  );

  event ArticleAmountUpdated(
    uint256 indexed articleId, uint256 oldAmount, uint256 newAmount
  );
  event ArticleDeleted(uint256 indexed articleId, uint256 date);

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
  event RemoveBookmark(
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

  // Article details
  mapping(uint256 => uint256) public articlePrices;
  mapping(uint256 => uint256) public articleAmounts;
  mapping(uint256 => mapping(address => bool)) public articleBuyers;

  // Comments
  mapping(uint256 articleId => Comment[]) public articleToComments;
  mapping(uint256 articleId => mapping(uint256 commentId => address user))
    public articleCommentToUser;

  // Bookmarked
  mapping(address user => mapping(uint256 article => bool)) public
    userToArticleBookmark;
  mapping(uint256 article => uint256 bookmarks) public articleToBookmarks;
  mapping(address user => uint256[] bookmarkedArticles) public
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
    string memory _tokenURI,
    uint256 _price,
    uint256 _amount
  ) public {
    uint256 articleId = articleIds++;
    articleIdToUser[articleId] = msg.sender;
    userArticles[msg.sender].push(articleId);

    articlePrices[articleId] = _price;
    articleAmounts[articleId] = _amount;

    basedArticles.mint(_tokenURI);

    emit ArticleCreated(
      articleId, msg.sender, _tokenURI, block.timestamp, _price, _amount
    );
  }

  function buyArticle(
    uint256 _articleId
  ) public payable {
    require(articleAmounts[_articleId] > 0, "Article is sold out");
    uint256 price = articlePrices[_articleId];
    require(msg.value >= price, "Not enough ETH sent");

    address seller = articleIdToUser[_articleId];
    require(seller != address(0), "Invalid seller address");

    // Transfer the ETH to the seller
    (bool success,) = seller.call{ value: msg.value }("");
    require(success, "Transfer failed");

    // Decrease the amount of the article by one
    articleAmounts[_articleId]--;

    // Record the buyer
    articleBuyers[_articleId][msg.sender] = true;

    emit ArticleBought(_articleId, msg.sender, seller, price, block.timestamp);
  }

  function updateArticlePrice(uint256 _articleId, uint256 _newPrice) public {
    require(
      articleIdToUser[_articleId] == msg.sender, "Not the owner of the article"
    );

    uint256 oldPrice = articlePrices[_articleId];
    articlePrices[_articleId] = _newPrice;

    emit ArticlePriceUpdated(_articleId, oldPrice, _newPrice);
  }

  function updateArticleAmount(uint256 _articleId, uint256 _newAmount) public {
    require(
      articleIdToUser[_articleId] == msg.sender, "Not the owner of the article"
    );

    uint256 oldAmount = articleAmounts[_articleId];
    articleAmounts[_articleId] = _newAmount;

    emit ArticleAmountUpdated(_articleId, oldAmount, _newAmount);
  }

  function deleteArticle(
    uint256 _articleId
  ) public {
    require(
      articleIdToUser[_articleId] == msg.sender, "Not the owner of the article"
    );

    basedArticles.burn(_articleId);

    // Remove the price and amount data
    delete articlePrices[_articleId];
    delete articleAmounts[_articleId];

    // Remove the articleId to user mapping
    delete articleIdToUser[_articleId];

    emit ArticleDeleted(_articleId, block.timestamp);
  }

  function commentOnArticle(uint256 _articleId, string memory _text) public {
    require(
      articleBuyers[_articleId][msg.sender],
      "You must buy the article to comment on it"
    );
    _requireArticleExists(_articleId);
    // set max length at 250 characters
    require(
      bytes(_text).length <= 250, "Comment must be less than 250 characters"
    );
    uint256 commentIndex = articleToComments[_articleId].length;
    articleToComments[_articleId].push(Comment(msg.sender, _text, commentIndex));
    emit ArticleCommented(
      _articleId, msg.sender, _text, commentIndex, block.timestamp
    );
  }

  function deleteComment(uint256 _articleId, uint256 _commentID) public {
    _requireArticleExists(_articleId);
    require(
      articleCommentToUser[_articleId][_commentID] == msg.sender,
      "You can't erase what you didn't article!"
    );
    delete articleCommentToUser[_articleId][_commentID];
    delete articleToComments[_articleId][_commentID];
    emit ArticleCommentDeleted(_articleId, msg.sender, block.timestamp);
  }

  // Function to bookmark an article
  function bookmarkArticle(
    uint256 _articleId
  ) external {
    _requireArticleExists(_articleId);
    require(
      !userToArticleBookmark[msg.sender][_articleId],
      "Article already bookmarked"
    );

    userToArticleBookmark[msg.sender][_articleId] = true;
    articleToBookmarks[_articleId] += 1;

    userToBookmarkedArticles[msg.sender].push(_articleId);
    userToBookmarkedArticleIndex[msg.sender][_articleId] =
      userToBookmarkedArticles[msg.sender].length - 1;

    emit ArticleBookmarked(_articleId, msg.sender, block.timestamp);
  }

  function removeBookmark(
    uint256 _articleId
  ) public {
    _requireArticleExists(_articleId);

    require(
      userToArticleBookmark[msg.sender][_articleId], "Article not bookmarked"
    );

    userToArticleBookmark[msg.sender][_articleId] = false;
    articleToBookmarks[_articleId] -= 1;

    uint256 index = userToBookmarkedArticleIndex[msg.sender][_articleId];
    uint256 lastArticleId = userToBookmarkedArticles[msg.sender][userToBookmarkedArticles[msg
      .sender].length - 1];

    userToBookmarkedArticles[msg.sender][index] = lastArticleId;
    userToBookmarkedArticleIndex[msg.sender][lastArticleId] = index;

    userToBookmarkedArticles[msg.sender].pop();
    delete userToBookmarkedArticleIndex[msg.sender][_articleId];

    // Emit the ArticleUnshared event
    emit RemoveBookmark(_articleId, msg.sender, block.timestamp);
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
    uint256 _articleId
  ) internal view {
    require(basedArticles.tokenId() >= _articleId, "Article does not exist");
  }
}
