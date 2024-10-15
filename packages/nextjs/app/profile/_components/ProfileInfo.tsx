import React, { useEffect, useState } from "react";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { useAccount } from "wagmi";
import { PencilIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/punk-society/InputBase";
import { LoadingBars } from "~~/components/punk-society/LoadingBars";
import { TextInput } from "~~/components/punk-society/TextInput";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Adjust the import path as necessary

interface ProfileInfoProps {
  address: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ address }) => {
  const defaultProfilePicture = "/guest-profile.jpg";

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [loadingProfile, setLoadingProfile] = useState(true);

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

  const { data: punkProfile } = useScaffoldReadContract({
    contractName: "BasedProfile",
    functionName: "profiles",
    args: [address],
    watch: true,
  });

  const { writeContractAsync: punkProfileWriteAsync } = useScaffoldWriteContract("BasedProfile");

  const handleEditProfile = async () => {
    try {
      // Check if the current profile picture is the default one
      if (profilePicture === defaultProfilePicture) {
        // Unset the current profile picture before editing the profile
        setProfilePicture("");
      }

      await punkProfileWriteAsync({
        functionName: "setProfile",
        args: [username, bio, profilePicture, email],
      });

      notification.success("Profile Edited Successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error during editing profile:", error);

      // Log the error and notify the user
      notification.error("Editing profile, please try again.");
    }
  };

  useEffect(() => {
    if (!isEditing && punkProfile) {
      setUsername(punkProfile[0] || "");
      setBio(punkProfile[1] || "");
      setProfilePicture(punkProfile[2] ? punkProfile[2] : defaultProfilePicture);
      setEmail(punkProfile[3] || "");
      setLoadingProfile(false);
    }
  }, [punkProfile, isEditing]);

  // Ensure the address is available before rendering the component
  if (!address) {
    return <p>Inexistent address, try again...</p>;
  }

  return (
    <div>
      {/* User Profile Section */}
      {loadingProfile ? (
        <div className="relative flex flex-col md:flex-row justify-between items-center bg-base-100 p-6 rounded-lg shadow-md w-full my-2">
          <div className="flex items-center justify-center w-full">
            <LoadingBars />
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col md:flex-row justify-between items-center bg-base-100 p-6 rounded-lg shadow-md w-full my-2">
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
              ""
            ) : (
              <>
                <h2 className="text-2xl font-bold">{username || "Guest user"}</h2>
                <span>
                  {email ? (
                    <a href={`mailto:${email}`} className="text-blue-500 underline">
                      {email}
                    </a>
                  ) : (
                    "no email provided"
                  )}
                </span>
                {bio && <p className="text-base-content">{bio}</p>}
                <div className="mt-2">
                  {address === connectedAddress ? (
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
          {/* User Bio */}
          {isEditing ? (
            <div className="flex flex-col justify-center items-center flex-grow text-center gap-3 md:mx-auto mt-4 md:mt-0">
              <>
                <InputBase placeholder="Your Name" value={username} onChange={setUsername} />
                <TextInput placeholder="Your Bio" content={bio} setContent={setBio} />
                {/* <InputBase placeholder="Your Bio" value={bio} onChange={setBio} /> */}
                <InputBase placeholder="Your Email" value={email} onChange={setEmail} />
              </>
            </div>
          ) : (
            <></>
          )}
          {/* Edit/Cancel Button */}
          {address === connectedAddress && (
            <>
              {isEditing ? (
                <button className="absolute top-4 right-4 btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
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
  );
};

export default ProfileInfo;
