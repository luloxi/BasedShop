interface Attribute {
  trait_type: string;
  value: string;
}

interface NFTMetaData {
  name: string;
  description: string;
  external_url?: string;
  image: string;
  animation_url: string;
  attributes: Attribute[];
}

const nftsMetadata: NFTMetaData[] = [
  {
    name: "Example NFT",
    description: "This is an example NFT.",
    image: "https://example.com/image.png",
    animation_url: "https://example.com/animation.mp4",
    external_url: "https://example.com",
    attributes: [
      {
        trait_type: "Example Trait",
        value: "Example Value",
      },
    ],
  },
  // Add more NFT metadata objects here as needed
];

export type { NFTMetaData };
export default nftsMetadata;
