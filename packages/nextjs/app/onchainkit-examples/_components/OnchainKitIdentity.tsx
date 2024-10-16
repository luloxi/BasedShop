import { Address as Addr, Avatar, Badge, Identity, Name } from "@coinbase/onchainkit/identity";

export const OnchainKitIdentity = () => {
  return (
    <Identity
      address="0xc120E5D1643a2eB946e21a942d787A299839EBFA"
      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
    >
      <Avatar />
      <Name>
        <Badge />
      </Name>
      <Addr />
    </Identity>
  );
};
