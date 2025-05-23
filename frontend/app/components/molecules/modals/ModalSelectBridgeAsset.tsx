import { useAccount, useBalances } from "@cosmi/react";
import type { Currency } from "@towerfi/types";
import { useCallback, useState } from "react";

import Input from "~/app/components/atoms/Input";
import BasicModal from "~/app/components/templates/BasicModal";
import { useModal } from "~/app/providers/ModalProvider";
import { convertMicroDenomToDenom } from "~/utils/intl";
import TruncateText from "../../atoms/TruncateText";
import { useUserBalances } from "~/app/hooks/useUserBalances";
import { Button } from "../../atoms/Button";
import { twMerge } from "~/utils/twMerge";
import Divider from "../../atoms/Divider";

type ModalSelectBridgeAssetProps = {
  assets: Currency[];
  onSelectAsset: (asset: Currency) => void;
  onClose: () => void;
};

const ModalSelectBridgeAsset: React.FC<ModalSelectBridgeAssetProps> = ({
  onSelectAsset,
  onClose,
  assets,
}) => {
  const { hideModal } = useModal();
  const [search, setSearch] = useState("");
  const [filteredTokens, setFilteredTokens] = useState(assets);
  const { data: balances } = useUserBalances({ assets });
  const [selectingAction, setSelectingAction] = useState("network");

  const getBalance = useCallback(
    (denom: string) => {
      return balances?.find((balance) => balance.denom === denom)?.amount;
    },
    [balances],
  );

  const getNumericBalance = (denom: string, decimals: number) => {
    const balance = getBalance(denom);
    return balance ? convertMicroDenomToDenom(balance, decimals) : 0;
  };

  const searchToken = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilteredTokens(
      assets
        .filter((token) => {
          return (
            token.symbol.toLowerCase().includes(e.target.value.toLowerCase()) ||
            token.denom.toLowerCase().includes(e.target.value.toLowerCase())
          );
        })
        .sort(
          (a, b) => getNumericBalance(b.denom, b.decimals) - getNumericBalance(a.denom, a.decimals),
        ),
    );
  };

  return (
    <BasicModal
      title="Select Asset"
      classNames={{ wrapper: "overflow-hidden", container: "flex flex-col p-0" }}
      onClose={onClose}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs">Network</p>
          <Button
            color="tertiary"
            className={twMerge(
              "bg-white/10 border-2 border-transparent justify-start p-1 text-base",
              {
                "border-white/30 bg-white/20": selectingAction === "network",
              },
            )}
            onClick={() => setSelectingAction("network")}
          >
            <img
              src="https://osmosis.zone/assets/icons/osmo-logo-icon.svg"
              alt="evm"
              className="h-[26px] w-[26px]"
            />
            <p className="text-sm">Osmosis</p>
          </Button>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs">Asset</p>
          <Button
            color="tertiary"
            className={twMerge(
              "bg-white/10 border-2 border-transparent justify-start p-1 text-base",
              {
                "border-white/30 bg-white/20": selectingAction === "asset",
              },
            )}
            onClick={() => setSelectingAction("asset")}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/2048px-Bitcoin.svg.png"
              alt="evm"
              className="h-[26px] w-[26px]"
            />
            <p className="text-sm">Bitcoin</p>
          </Button>
        </div>
      </div>
      <Divider dashed />
      <div className="w-full relative p-4">
        <div className="w-full sticky top-0 bg-gradient-to-b from-70% from-transparent to-tw-gray-950/80 pb-4 backdrop-blur-sm ">
          <Input
            placeholder="Search by Name, Symbol or Address"
            isSearch
            fullWidth
            classNames={{ wrapperClassName: "bg-tw-gray-925 py-1" }}
            onChange={searchToken}
            value={search}
          />
        </div>
        <div className="flex flex-col gap-2  overflow-scroll scrollbar-none h-[25rem] ">
          {filteredTokens.map((token, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 justify-between hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => [hideModal(), onSelectAsset(token)]}
            >
              <div className="flex gap-3 items-center">
                <img src={token.logoURI} alt={token.symbol} className="h-8 w-8" />
                <div className="flex flex-col min-w-0 gap-1">
                  <p>{token.symbol}</p>
                  <TruncateText text={token.denom} className="text-sm text-white/50" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p>{convertMicroDenomToDenom(getBalance(token.denom), token.decimals)}</p>
                <p className="text-sm text-white/50">$0</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BasicModal>
  );
};

export default ModalSelectBridgeAsset;
