import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BookmarkIcon as OutlineBookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as SolidBookmarkIcon } from "@heroicons/react/24/solid";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface BookmarkButtonProps {
  postId: bigint;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ postId }) => {
  const [bookmarkedPost, setBookmarkedPost] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useScaffoldWriteContract("BasedShop");

  const { data: isBookmarkedPost } = useScaffoldReadContract({
    contractName: "BasedShop",
    functionName: "userToArticleBookmark",
    args: [connectedAddress, postId],
    watch: true,
  });

  const { data: postBookmarks } = useScaffoldReadContract({
    contractName: "BasedShop",
    functionName: "articleToBookmarks",
    args: [postId],
    watch: true,
  });

  const handleBookmark = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    setBookmarkedPost(true); // Optimistically update the state
    setBookmarkCount(prevCount => prevCount + 1); // Optimistically update the bookmark count

    try {
      await writeContractAsync({
        functionName: "bookmarkArticle",
        args: [postId],
      });
      notification.success("Bookmarked successfully!");
    } catch (error) {
      setBookmarkedPost(false); // Revert the optimistic update if the transaction fails
      setBookmarkCount(prevCount => prevCount - 1); // Revert the bookmark count
      notification.error("Bookmarking failed, please try again.");
    }
  };

  const handleRemoveBookmark = async () => {
    setBookmarkedPost(false); // Optimistically update the state
    setBookmarkCount(prevCount => prevCount - 1); // Optimistically update the bookmark count

    try {
      await writeContractAsync({
        functionName: "removeBookmark",
        args: [postId],
      });
      notification.success("Removed bookmark successfully!");
    } catch (error) {
      console.error("Error during removing bookmark:", error);
      notification.error("Removing bookmark failed, please try again.");
      setBookmarkedPost(true); // Revert the state if the transaction fails
      setBookmarkCount(prevCount => prevCount + 1); // Revert the bookmark count
    }
  };

  useEffect(() => {
    if (isBookmarkedPost !== undefined) {
      setBookmarkedPost(isBookmarkedPost);
    }
  }, [isBookmarkedPost]);

  useEffect(() => {
    if (postBookmarks !== undefined) {
      setBookmarkCount(Number(postBookmarks));
    }
  }, [postBookmarks]);

  return (
    <div className="bookmark-button-container">
      {bookmarkedPost ? (
        <button className="icon-button" onClick={handleRemoveBookmark}>
          <SolidBookmarkIcon className="text-orange-500 bookmark-icon" />
        </button>
      ) : (
        <button className="icon-button" onClick={handleBookmark}>
          <OutlineBookmarkIcon className="bookmark-icon" />
        </button>
      )}

      <span className="bookmark-counter">{bookmarkCount}</span>
      <style jsx>{`
        .bookmark-button-container {
          display: flex;
          align-items: center;
        }
        .bookmark-button {
          font-size: 24px; /* Adjust the size of the heart icon */
          border: none;
          background: none;
          cursor: pointer;
        }
        .bookmark-counter {
          margin-left: 8px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default BookmarkButton;
