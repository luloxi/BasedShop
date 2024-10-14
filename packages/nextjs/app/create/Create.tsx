"use client";

import { useEffect, useState } from "react";
import { ImageUploader } from "./_components/ImageUploader";
import { MintingButtons } from "./_components/MintingButtons";
import { TextInput } from "./_components/TextInput";
import generateTokenURI from "./_components/generateTokenURI";
import { InputBase } from "~~/components/scaffold-eth";

// import type { NextPage } from "next";

const Create = ({ onClose }: { onClose: any }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [urlError, setUrlError] = useState("");
  const [yourJSON, setYourJSON] = useState<object>({});
  const [uploadedImageIpfsPath, setUploadedImageIpfsPath] = useState(""); // NEW: For image IPFS path

  const resetForm = () => {
    setYourJSON({});
    setUploadedImageIpfsPath("");
    setDescription("");
  };

  const handlePostCreated = () => {
    resetForm();
    onClose();
    window.location.reload();
  };

  const validateUrl = (url: string) => {
    const pattern = /^(https?:\/\/)/;
    return pattern.test(url);
  };

  const handleUrlChange = (url: string) => {
    setExternalUrl(url);
    if (!validateUrl(url)) {
      setUrlError("URL must start with http:// or https://");
    } else {
      setUrlError("");
    }
  };

  useEffect(() => {
    const generateTokenURIString = () => {
      const fullImageUrl = `https://ipfs.io/ipfs/${uploadedImageIpfsPath}`;
      const tokenURI = generateTokenURI(name, description, fullImageUrl, externalUrl);
      setYourJSON(JSON.parse(atob(tokenURI.split(",")[1])));
    };

    generateTokenURIString();
  }, [name, externalUrl, description, uploadedImageIpfsPath]);

  return (
    <>
      <div className="w-full  md:w-2/3 md:mx-auto rounded-lg px-0">
        {/* <div className="flex  flex-col md:flex-row items-start flex-grow"> */}
        <div className="w-full px-10 bg-base-100 rounded-lg py-4 ">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="text-2xl font-bold ">Enter article details</h3>
          </div>

          {/* Metadata and Attributes Forms */}
          <div className="flex flex-col gap-3 md:flex-row items-center justify-center space-x-4 mb-4">
            <div className="flex-shrink-0">
              <ImageUploader
                image={uploadedImageIpfsPath}
                setUploadedImageIpfsPath={setUploadedImageIpfsPath} // NEW: Set the uploaded image IPFS path here
              />
            </div>
            <div className="flex flex-col gap-3 text-left flex-shrink-0  w-full">
              <InputBase placeholder="Article name" value={name} onChange={setName} />
              <TextInput description={description} setDescription={setDescription} />
              <InputBase placeholder="URL for your article (https://)" value={externalUrl} onChange={handleUrlChange} />
              {externalUrl && urlError && <span className="text-red-500 text-sm">{urlError}</span>}
              <div className="flex flex-row gap-3">
                <div className="w-1/2">
                  <InputBase placeholder="Price in ETH" value={price} onChange={setPrice} />
                </div>
                <div className="w-1/2">
                  <InputBase placeholder="Amount" value={amount} onChange={setAmount} />
                </div>
              </div>
            </div>
          </div>

          {/* JSON Viewer */}
          {/* <JSONViewer yourJSON={yourJSON} setYourJSON={setYourJSON} /> */}

          <MintingButtons
            price={price}
            amount={amount}
            yourJSON={yourJSON}
            resetForm={resetForm}
            onPostCreated={handlePostCreated}
          />
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default Create;
