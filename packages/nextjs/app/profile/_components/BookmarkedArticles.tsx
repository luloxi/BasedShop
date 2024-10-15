"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ErrorComponent } from "../../../components/punk-society/ErrorComponent";
import { LoadingBars } from "../../../components/punk-society/LoadingBars";
import { NewsFeed } from "./_bookmarked/NewsFeed";
import { NextPage } from "next";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

export interface Post extends Partial<NFTMetaData> {
  listingId?: number;
  nftAddress?: string;
  postId?: number;
  uri: string;
  user: string;
  price: string;
  amount: string;
  date?: string;
}

const ListerArticles: NextPage = () => {
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(true);
  const [page, setPage] = useState(1); // Start from page 1 to get the last post first

  const observer = useRef<IntersectionObserver | null>(null);

  const pathname = usePathname();
  const address = pathname.split("/").pop();

  const {
    data: createEvents,
    // isLoading: createIsLoadingEvents,
    error: createErrorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "BasedShop",
    eventName: "ArticleCreated",
    fromBlock: 0n,
    watch: true,
  });

  const fetchArticles = useCallback(
    async (page: number) => {
      if (!createEvents) return;

      setLoadingMore(true);
      try {
        // Calculate the start and end indices for the current page
        const start = (page - 1) * 8;
        const end = page * 8;
        const eventsToFetch = createEvents.slice(start, end);

        const articlesUpdate: Post[] = [];

        for (const event of eventsToFetch) {
          try {
            const { args } = event;
            const user = args?.user;
            const tokenURI = args?.tokenURI;
            const date = args?.date;
            const price = args?.price;
            const amount = args?.amount;

            if (args?.user !== address) continue;
            if (!tokenURI) continue;

            const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
            const nftMetadata: NFTMetaData = await getMetadataFromIPFS(ipfsHash);

            // Temporary fix for V1
            // Check if the image attribute is valid and does not point to [object Object]
            if (nftMetadata.image === "https://ipfs.io/ipfs/[object Object]") {
              console.warn(`Skipping post with invalid image URL: ${nftMetadata.image}`);
              continue;
            }

            articlesUpdate.push({
              postId: parseInt(event.args?.articleId?.toString() ?? "0"),
              uri: tokenURI,
              user: user || "",
              date: date?.toString() || "",
              price: price?.toString() || "",
              amount: amount?.toString() || "",
              ...nftMetadata,
            });
          } catch (e) {
            notification.error("Error fetching articles");
            console.error(e);
          }
        }

        setArticles(prevArticles => [...prevArticles, ...articlesUpdate]);
      } catch (error) {
        notification.error("Failed to load articles");
      } finally {
        setLoadingMore(false);
      }
    },
    [createEvents, address],
  );

  useEffect(() => {
    setLoading(true);
    fetchArticles(page).finally(() => setLoading(false));
  }, [page, fetchArticles]);

  const lastPostElementRef = useCallback(
    (node: any) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore],
  );

  // Ensure the address is available before rendering the component
  if (!address) {
    return <p>Inexistent address, try again...</p>;
  }

  if (createErrorReadingEvents) {
    return <ErrorComponent message={createErrorReadingEvents?.message || "Error loading events"} />;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {loading && page === 1 ? (
          <LoadingBars />
        ) : articles.length === 0 ? (
          <p>This user has no articles</p>
        ) : (
          <NewsFeed articles={articles} />
        )}
        <div ref={lastPostElementRef}></div>
        {page !== 1 && loadingMore && <LoadingBars />}
      </div>
    </>
  );
};

export default ListerArticles;
