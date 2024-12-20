import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { Address } from "viem";
import { useDisconnect } from "wagmi";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { LanguageIcon } from "@heroicons/react/24/solid";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({ blockExplorerAddressLink }: AddressInfoDropdownProps) => {
  const [selectingNetwork, setSelectingNetwork] = useState(false);

  const { disconnect } = useDisconnect();

  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary
          tabIndex={0}
          className="flex items-center justify-center hover:cursor-pointer p-2 shadow-none bg-transparent border-0 btn-sm  dropdown-toggle gap-0 !h-auto"
        >
          <Cog6ToothIcon className="h-5 w-5 ml-2 sm:ml-0" />
        </summary>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
        >
          <NetworkOptions hidden={!selectingNetwork} />

          <li className={selectingNetwork ? "hidden" : ""}>
            <label
              htmlFor="qrcode-modal"
              className="text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-500 btn-sm !rounded-xl flex gap-3 py-3"
            >
              <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">View your address</span>
            </label>
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
                <ArrowsRightLeftIcon className="h-4 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <div className={selectingNetwork ? "hidden" : "flex items-center justify-center"}>
            <SwitchTheme />
          </div>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label htmlFor="switch-language-modal" className="btn-sm !rounded-xl flex gap-3 py-3">
              <LanguageIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">Switch languages</span>
            </label>
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

          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-red-600 dark:text-red-500 btn-sm !rounded-xl flex gap-3 py-3"
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
