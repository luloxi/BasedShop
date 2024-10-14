import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { uploadToPinata } from "~~/utils/pinata-upload";
import { notification } from "~~/utils/scaffold-eth";

// Import the Pinata upload function

interface MintingFormProps {
  price: string;
  amount: string;
  yourJSON: object;
  resetForm: () => void;
  onPostCreated: () => void;
}

export const MintingButtons: React.FC<MintingFormProps> = ({ price, amount, yourJSON, resetForm, onPostCreated }) => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useScaffoldWriteContract("BasedShop");

  const [loading, setLoading] = useState(false);

  const uploadToIPFS = async () => {
    const notificationId = notification.loading("Uploading to Pinata...");
    try {
      const file = new Blob([JSON.stringify(yourJSON)], { type: "application/json" });
      const fileName = "PunkPostMetadata.json"; // Provide a desired file name
      const modifiedFile = new File([file], fileName, { lastModified: Date.now() });
      const uploadedItem = await uploadToPinata(modifiedFile);
      notification.remove(notificationId);
      notification.success("Metadata uploaded to Pinata");

      return uploadedItem.IpfsHash;
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to upload to Pinata");
      throw error;
    }
  };

  const handleCreatePost = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    setLoading(true);

    try {
      const ipfsPath = await uploadToIPFS();

      // Convert price from ether to wei
      const priceInWei = parseEther(price.toString());

      const contractResponse = await writeContractAsync({
        functionName: "createArticle",
        args: [ipfsPath, priceInWei, BigInt(amount.toString())],
      });

      if (contractResponse) {
        notification.success("Posted successfully!");
      }
      resetForm();
      onPostCreated();
    } catch (error) {
      console.error("Error during posting:", error);
      notification.error("Posting failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-6 gap-3">
      <div className="flex items-center">
        <button className="cool-button" disabled={loading} onClick={handleCreatePost}>
          Publish article
        </button>
      </div>
    </div>
  );
};
