"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BookmarkedArticles from "../_components/BookmarkedArticles";
import BoughtArticles from "../_components/BoughtArticles";
import ListedArticles from "../_components/ListedArticles";
import ProfileInfo from "../_components/ProfileInfo";
import { NextPage } from "next";
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

const ProfilePage: NextPage = () => {
  const [activeTab, setActiveTab] = useState("Bought");

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  const pathname = usePathname();
  const address = pathname.split("/").pop();

  // Ensure the address is available before rendering the component
  if (!address) {
    return <p>Inexistent address, try again...</p>;
  }

  return (
    <>
      <ProfileInfo address={address} />
      <div className="flex items-center justify-center">
        <div className="tabs-bar overflow-x-auto whitespace-nowrap flex">
          <button className={`tab ${activeTab === "Bought" ? "active" : ""}`} onClick={() => handleTabClick("Bought")}>
            Bought
          </button>
          <button className={`tab ${activeTab === "Saved" ? "active" : ""}`} onClick={() => handleTabClick("Saved")}>
            Saved
          </button>
          <button className={`tab ${activeTab === "Listed" ? "active" : ""}`} onClick={() => handleTabClick("Listed")}>
            Listed
          </button>
          <button
            className={`tab text-red-600 ${activeTab === "Activity" ? "active" : ""}`}
            onClick={() => handleTabClick("Activity")}
          >
            Activity
          </button>
        </div>
      </div>

      {activeTab === "Bought" && <BoughtArticles />}
      {activeTab === "Saved" && <BookmarkedArticles />}
      {activeTab === "Listed" && <ListedArticles />}
    </>
  );
};

export default ProfilePage;
