"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ErrorComponent } from "../../../components/punk-society/ErrorComponent";
import { LoadingBars } from "../../../components/punk-society/LoadingBars";
import { NewsFeed } from "../../../components/punk-society/NewsFeed";
import ProfilePictureUpload from "../_components/ProfilePictureUpload";
import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

export interface Post extends Partial<NFTMetaData> {
  listingId?: number;
  uri: string;
  user: string;
  date?: string;
}

const defaultProfilePicture = "/guest-profile.jpg";

const ProfilePage: NextPage = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(true);
  const [page, setPage] = useState(1); // Start from page 1 to get the last post first
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("Listed");

  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID ? process.env.NEXT_PUBLIC_CDP_PROJECT_ID : "";
  const { address: connectedAddress } = useAccount();

  const onrampBuyUrl = getOnrampBuyUrl({
    projectId,
    addresses: connectedAddress ? { [connectedAddress]: ["base"] } : {},
    // assets: ["ETH", "USDC"],
    assets: ["ETH"],
    // presetFiatAmount: 20,
    // fiatCurrency: "USD",
  });

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  const observer = useRef<IntersectionObserver | null>(null);

  const pathname = usePathname();
  const address = pathname.split("/").pop();

  const { data: punkProfile } = useScaffoldReadContract({
    contractName: "BasedProfile",
    functionName: "profiles",
    args: [address],
    watch: true,
  });

  const { writeContractAsync: punkProfileWriteAsync } = useScaffoldWriteContract("BasedProfile");

  const {
    data: createEvents,
    // isLoading: createIsLoadingEvents,
    error: createErrorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "BasedShop",
    eventName: "PostCreated",
    fromBlock: 0n,
    watch: true,
  });

  const handleEditProfile = async () => {
    try {
      // Check if the current profile picture is the default one
      if (profilePicture === defaultProfilePicture) {
        // Unset the current profile picture before editing the profile
        setProfilePicture("");
      }

      await punkProfileWriteAsync({
        functionName: "setProfile",
        args: [username, bio, profilePicture],
      });

      notification.success("Profile Edited Successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error during editing profile:", error);

      // Log the error and notify the user
      notification.error("Editing profile, please try again.");
    }
  };

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
              listingId: undefined,
              uri: tokenURI,
              user: user || "",
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

  useEffect(() => {
    if (!isEditing && punkProfile) {
      setUsername(punkProfile[0] || "");
      setBio(punkProfile[1] || "");
      setProfilePicture(punkProfile[2] ? punkProfile[2] : defaultProfilePicture);
      setLoadingProfile(false);
    }
  }, [punkProfile, isEditing]);

  // Ensure the address is available before rendering the component
  if (!address) {
    return <p>Inexistent address, try again...</p>;
  }

  if (loading && page === 1) {
    return <LoadingBars />;
  }

  if (createErrorReadingEvents) {
    return <ErrorComponent message={createErrorReadingEvents?.message || "Error loading events"} />;
  }

  return (
    <>
      <div className="flex flex-col items-center">
        {/* User Profile Section */}
        {loadingProfile ? (
          <div className="relative flex flex-col md:flex-row justify-between items-center bg-base-100 p-6 rounded-lg shadow-md w-full m-2">
            <div className="flex items-center justify-center w-full h-full">
              <LoadingBars />
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col md:flex-row justify-between items-center bg-base-100 p-6 rounded-lg shadow-md w-full m-2">
            {/* Profile Picture */}
            <div className="avatar ">
              <ProfilePictureUpload
                isEditing={isEditing}
                profilePicture={profilePicture}
                setProfilePicture={setProfilePicture}
              />
            </div>
            {/* User Info Section */}
            <div className="flex flex-col justify-center items-center">
              {isEditing ? (
                <InputBase placeholder="Your Name" value={username} onChange={setUsername} />
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{username || "Guest user"}</h2>

                  {bio && <p className="text-base-content">{bio}</p>}

                  <div className="mt-2">
                    {address == connectedAddress ? (
                      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        <div>
                          <RainbowKitCustomConnectButton />
                        </div>
                        <div className="bg-base-200 rounded-lg">
                          <FundButton fundingUrl={onrampBuyUrl} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-base-content">
                        <Address address={address} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* Div to align info in the center */}
            <div></div>
            {/* User Bio */}{" "}
            {isEditing ? (
              <div className="flex-grow text-center md:mx-auto mt-4 md:mt-0">
                <>
                  <InputBase placeholder="Your Bio" value={bio} onChange={setBio} />
                </>
              </div>
            ) : (
              <></>
            )}
            {/* Edit/Cancel Button */}
            {address === connectedAddress && (
              <>
                {isEditing ? (
                  <button
                    className="absolute top-4 right-4 btn btn-secondary btn-sm"
                    onClick={() => setIsEditing(false)}
                  >
                    X Cancel
                  </button>
                ) : (
                  <button className="absolute top-4 right-4 btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                    <PencilIcon className="h-5 w-5" />
                    Edit
                  </button>
                )}
                {isEditing && (
                  <div className="mt-2 flex items-center gap-2">
                    <button className="cool-button" onClick={handleEditProfile}>
                      Save changes
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {/* {loading && <LoadingBars />} */}

      <div className="flex flex-col items-center justify-center">
        <div className="tabs-bar ">
          <button className={`tab  ${activeTab === "Listed" ? "active" : ""}`} onClick={() => handleTabClick("Listed")}>
            Listed
          </button>
          <button
            className={`tab text-red-600 ${activeTab === "Bought" ? "active" : ""}`}
            onClick={() => handleTabClick("Bought")}
          >
            Bought
          </button>
          <button
            className={`tab text-red-600 ${activeTab === "Activity" ? "active" : ""}`}
            onClick={() => handleTabClick("Activity")}
          >
            Activity
          </button>
          <button
            className={`tab text-red-600 ${activeTab === "Revenue" ? "active" : ""}`}
            onClick={() => handleTabClick("Revenue")}
          >
            Revenue
          </button>
        </div>
        <NewsFeed articles={articles} />
        <div ref={lastPostElementRef}></div>
        {loadingMore && <LoadingBars />}
      </div>
    </>
  );
};

export default ProfilePage;
