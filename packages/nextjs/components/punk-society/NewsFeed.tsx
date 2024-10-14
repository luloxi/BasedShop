import React from "react";
import { Post } from "../../app/explore/Explore";
import { PostCard } from "./PostCard";

type NewsFeedProps = {
  articles: Post[];
};

export const NewsFeed: React.FC<NewsFeedProps> = ({ articles }) => {
  const isGrid = false;

  return (
    <div className="mt-4 md:flex md:justify-center md:items-center md:px-6 md:border-x-2 dark:border-white border-black">
      <div
        className={`${
          isGrid
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:my-2"
            : "flex flex-col gap-3 w-[100%] md:w-[500px]"
        }`}
      >
        {articles.map(post => (
          <PostCard post={post} key={post.uri} />
        ))}
      </div>
    </div>
  );
};
