"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingBars } from "../../components/punk-society/LoadingBars";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { data: nameToAddress } = useScaffoldReadContract({
    contractName: "BasedProfile",
    functionName: "nameToAddress",
    args: [searchQuery],
    watch: true,
  });

  const handleSearch = async () => {
    if (!searchQuery) {
      setError("Please enter an address, ENS or basename.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (searchQuery.length > 17) {
        // If the search query is longer than 17 characters, assume it's an Ethereum address
        router.push(`/profile/${searchQuery}`);
      } else if (nameToAddress && nameToAddress !== "0x0000000000000000000000000000000000000000") {
        // If the search query resolves to a non-zero address, navigate to the resolved address profile
        router.push(`/profile/${nameToAddress}`);
      } else {
        setError("Invalid address or username.");
      }
    } catch (error) {
      setError("An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <div onKeyDown={handleKeyDown}>
        <AddressInput
          value={searchQuery}
          onChange={value => setSearchQuery(value.toLowerCase())}
          placeholder="basename, ENS or address"
        />
      </div>
      <button onClick={handleSearch} disabled={loading} className="btn btn-primary px-6">
        {loading ? <LoadingBars /> : "Go"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
