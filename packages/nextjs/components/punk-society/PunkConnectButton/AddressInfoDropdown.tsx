import { useRef, useState } from "react";
import Link from "next/link";
import { NetworkOptions } from "./NetworkOptions";
import { FundButton } from "@coinbase/onchainkit/fund";
import { Avatar, Badge, Identity, Name } from "@coinbase/onchainkit/identity";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import {
  ArrowDownLeftIcon,
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({ address, blockExplorerAddressLink }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const { address: connectedAddress } = useAccount();
  const checkSumAddress = getAddress(address);

  const [addressCopied, setAddressCopied] = useState(false);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  const openPopupWindow = (url: string | URL | undefined) => {
    window.open(url, "popup", "width=800,height=600");
  };

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        {/* <summary
          tabIndex={0}
          className="btn btn-secondary bg-base-200 btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 !h-auto"
        > */}
        <summary
          tabIndex={0}
          className="btn btn-secondary bg-base-300 hover:bg-base-300 btn-sm shadow-md dropdown-toggle gap-0 !h-auto"
        >
          <Identity
            className="rounded-lg bg-base-300 p-0 "
            address={address}
            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
          >
            <Avatar />
            <Name className="text-black dark:text-white">
              <Badge />
            </Name>
          </Identity>
        </summary>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
        >
          <NetworkOptions hidden={!selectingNetwork} />
          <li className={selectingNetwork ? "hidden" : ""}>
            <div className="btn-sm !rounded-xl flex gap-3 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-500">
              <UserIcon className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0" aria-hidden="true" />
              {/* <Link href={blockExplorerAddressLink} rel="noopener noreferrer" className="whitespace-nowrap"> */}
              <Link href={`/profile/${connectedAddress}`} passHref>
                Go to Profile
              </Link>
            </div>
          </li>
          <FundButton text="Add funds" className="py-1 px-3.5 gap-1 text-md rounded-xl justify-start font-normal" />
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item btn-sm !rounded-xl bg-[#4f46e5] hover:bg-[#4338CA] active:bg-[#4338CA] flex gap-3 py-3"
              type="button"
              onClick={() => openPopupWindow("https://wallet.coinbase.com/es-ES/receive")}
            >
              <ArrowDownLeftIcon className="h-6 w-4 ml-2 sm:ml-0 text-white" />
              <span className="text-white">Receive funds</span>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item btn-sm !rounded-xl bg-[#4f46e5] hover:bg-[#4338CA] active:bg-[#4338CA] flex gap-3 py-3"
              type="button"
              onClick={() => openPopupWindow("https://wallet.coinbase.com/es-ES/send")}
            >
              <ArrowUpRightIcon className="h-6 w-4 ml-2 sm:ml-0 text-white" />
              <span className="text-white">Send funds</span>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item btn-sm !rounded-xl bg-[#4f46e5] hover:bg-[#4338CA] active:bg-[#4338CA] flex gap-3 py-3"
              type="button"
              onClick={() => openPopupWindow("https://wallet.coinbase.com/es-ES/swap")}
            >
              <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0 text-white" />
              <span className="text-white">Convert funds</span>
            </button>
          </li>

          <li className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="btn-sm !rounded-xl flex gap-3 py-3">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
                <span className=" whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              <CopyToClipboard
                text={checkSumAddress}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="btn-sm !rounded-xl flex gap-3 py-3">
                  <DocumentDuplicateIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className=" whitespace-nowrap">Copy address</span>
                </div>
              </CopyToClipboard>
            )}
          </li>

          <li className={selectingNetwork ? "hidden" : ""}>
            <button className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
              <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <a
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="whitespace-nowrap"
              >
                View on Block Explorer
              </a>
            </button>
          </li>
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
