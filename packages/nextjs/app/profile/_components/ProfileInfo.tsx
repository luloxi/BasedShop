import React, { useEffect, useState } from "react";
import { Avatar, Badge, Identity, Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { PencilIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/punk-society/InputBase";
import { LoadingBars } from "~~/components/punk-society/LoadingBars";
import { TextInput } from "~~/components/punk-society/TextInput";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Adjust the import path as necessary

interface ProfileInfoProps {
  address: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ address }) => {
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { address: connectedAddress } = useAccount();

  const { data: punkProfile } = useScaffoldReadContract({
    contractName: "BasedProfile",
    functionName: "profiles",
    args: [address],
    watch: true,
  });

  const { writeContractAsync: punkProfileWriteAsync } = useScaffoldWriteContract("BasedProfile");

  const handleEditProfile = async () => {
    try {
      await punkProfileWriteAsync({
        functionName: "setProfile",
        args: [bio, email],
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
      setBio(punkProfile[0] || "");
      setEmail(punkProfile[1] || "");
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

          <Identity
            className="bg-transparent p-0 w-28 h-28"
            address={address}
            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
          >
            <Avatar className="w-28 h-28" />
          </Identity>

          {/* User Info Section */}
          <div className="flex flex-col justify-center items-center">
            {isEditing ? (
              ""
            ) : (
              <>
                <Identity
                  className="bg-transparent p-0 "
                  address={address}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                >
                  <Name className="text-2xl font-bold text-black dark:text-white">
                    <Badge />
                  </Name>
                </Identity>
                {/* <h2 className="text-2xl font-bold">{username || "Guest user"}</h2> */}
                <span>
                  {email ? (
                    <a href={`mailto:${email}`} className="text-blue-500 underline">
                      {email}
                    </a>
                  ) : (
                    ""
                  )}
                </span>
                {bio && <p className="text-base-content">{bio}</p>}
                <div className="mt-2">
                  {address === connectedAddress ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3"></div>
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
                <TextInput placeholder="Your Bio" content={bio} setContent={setBio} />
                {/* <InputBase placeholder="Your Bio" value={bio} onChange={setBio} /> */}
                <InputBase placeholder="Your Email" value={email} onChange={setEmail} />

                <a className="underline" href="https://www.base.org/names" target="_blank" rel="noopener noreferrer">
                  Change your basename and profile picture
                </a>
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
