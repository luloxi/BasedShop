"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BookmarkButton from "./BookmarkButton";
import CommentSection from "./CommentSection";
// import LikeButton from "./LikedButton";
// import { ProfileAddress } from "./ProfileAddress";
import {
  // BookmarkIcon,
  // ChatBubbleLeftIcon,
  MagnifyingGlassPlusIcon,
  ShareIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// import { ChatBubbleLeftIcon as ChatBubbleLeftSolidIcon } from "@heroicons/react/24/solid";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

export interface Post extends Partial<NFTMetaData> {
  nftAddress?: string;
  postId?: number;
  uri: string;
  user: string;
  date?: string;
}

export const PostCard = ({ post }: { post: Post }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);

  const { data: profileInfo } = useScaffoldReadContract({
    contractName: "BasedProfile",
    functionName: "profiles",
    args: [post.user],
    watch: true,
  });

  const defaultProfilePicture = "/guest-profile.jpg";

  const profilePicture = profileInfo && profileInfo[2] ? profileInfo[2] : defaultProfilePicture;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // const toggleCommentSection = () => {
  //   setShowCommentSection(!showCommentSection);
  // };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post!",
          text: post.description ?? "No description available.",
          url: window.location.href,
        });
        console.log("Content shared successfully");
      } catch (error) {
        console.error("Error sharing content:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        notification.success("URL copied to clipboard");
      } catch (error) {
        notification.error("Error copying URL to clipboard");
      }
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleDateString(); // Format the date as needed
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`card-compact bg-base-300 w-[100%] relative group rounded-lg`}>
        <div className="flex  p-3 items-center justify-between">
          <h2 className="text-xl font-bold">{post.name}</h2>
          <div className="flex flex-row justify-center items-center gap-3">
            <p className="my-0 text-sm">{post.date ? formatDate(Number(post.date)) : "No date available"}</p>
            <Link href={`/profile/${post.user}`} passHref>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  backgroundImage: `url(${profilePicture})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </Link>
          </div>
        </div>
        <div className="flex flex-row items-center mx-2">
          {/* Image Section */}
          {post.image && post.image !== "https://ipfs.io/ipfs/" && (
            <div className="relative w-1/3 h-auto overflow-hidden">
              <figure className="relative w-full h-full">
                <Image
                  src={post.image || "/path/to/default/image.png"}
                  alt="NFT Image"
                  className="w-full h-auto rounded-lg object-cover"
                  layout="responsive"
                  width={800} // Adjust this to the desired fullscreen width
                  height={800} // Adjust this to maintain the aspect ratio of the image
                />
                <button
                  className="absolute bottom-2 right-2 bg-base-200 p-2 rounded-full shadow-lg"
                  onClick={handleOpenModal}
                >
                  <MagnifyingGlassPlusIcon className="inline-block h-7 w-7" />
                </button>
              </figure>
            </div>
          )}
          <div className="flex flex-col justify-center w-2/3 pl-4">
            <p className="my-0 text-lg">{post.description ?? "No description available."}</p>
          </div>
        </div>

        <div className="card-body space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Your component JSX here */}
            <div className="flex flex-row justify-center items-center gap-3">
              {" "}
              <button onClick={handleShare} className="icon-button">
                <ShareIcon className="repost-icon " />
              </button>
              <BookmarkButton postId={BigInt(post.postId || 0)} />
            </div>

            {/* <div className="flex items-center gap-3">
              <LikeButton postId={BigInt(post.postId || 0)} />
              <button onClick={toggleCommentSection} className="icon-button">
                {showCommentSection ? (
                  <ChatBubbleLeftSolidIcon className="comment-icon text-blue-600" />
                ) : (
                  <ChatBubbleLeftIcon className="comment-icon" />
                )}
              </button>
            </div> */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white">Buy</button>
              <button className="p-2 rounded-full bg-red-600 text-white">
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {showCommentSection && <CommentSection postId={BigInt(post.postId || 0)} />}
        </div>

        {/* Modal for fullscreen image */}
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <Image
              src={post.image || "/path/to/default/image.png"}
              alt="NFT Image"
              className="w-full h-auto rounded-lg object-cover"
              layout="responsive"
              width={800} // Adjust this to the desired fullscreen width
              height={800} // Adjust this to maintain the aspect ratio of the image
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

// Modal Component
export const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div
        ref={modalRef}
        className="relative rounded-lg p-4 max-h-screen overflow-y-auto"
        style={{ maxHeight: "100vh" }}
      >
        <button className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full" onClick={onClose}>
          <XMarkIcon className="inline-block h-7 w-7" />
        </button>
        {children}
      </div>
    </div>
  );
};
