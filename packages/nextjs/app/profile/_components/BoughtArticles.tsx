"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ErrorComponent } from "../../../components/punk-society/ErrorComponent";
import { LoadingBars } from "../../../components/punk-society/LoadingBars";
import { NewsFeed } from "./_bought/NewsFeed";
import { NextPage } from "next";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
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

const BoughtArticles: NextPage = () => {
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

  const {
    data: boughtEvents,
    // isLoading: createIsLoadingEvents,
    // error: boughtErrorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "BasedShop",
    eventName: "ArticleBought",
    fromBlock: 0n,
    watch: true,
  });

  const fetchArticles = useCallback(
    async (page: number) => {
      if (!createEvents || !boughtEvents) return;

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
            const amount = args?.amount;

            if (!tokenURI) continue;

            // Find the corresponding ArticleBought event
            const boughtEvent = boughtEvents.find(
              boughtEvent => boughtEvent.args?.articleId === args?.articleId && boughtEvent.args?.buyer === address,
            );

            if (!boughtEvent) continue;

            const boughtPrice = boughtEvent.args?.price;
            const boughtDate = boughtEvent.args?.date;

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
              user: user || "",
              uri: tokenURI,
              price: boughtPrice?.toString() || "",
              date: boughtDate?.toString(),
              amount: amount?.toString() || "",
              ...nftMetadata,
            });
          } catch (error) {
            console.error("Error processing event:", error);
          }
        }

        setArticles(prevArticles => [...prevArticles, ...articlesUpdate]);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    [createEvents, boughtEvents, address],
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
        ) : !loading && articles.length === 0 ? (
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

export default BoughtArticles;
