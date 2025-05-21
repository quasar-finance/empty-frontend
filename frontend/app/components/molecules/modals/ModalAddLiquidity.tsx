import { useMemo, useRef, useState } from "react";
import { Button } from "~/app/components/atoms/Button";
import BasicModal from "~/app/components/templates/BasicModal";
import IconCoins from "~/app/components/atoms/icons/IconCoins";
import Divider from "~/app/components/atoms/Divider";
import { FormProvider, useForm } from "react-hook-form";
import { Tab, TabList, Tabs } from "../../atoms/Tabs";
import AssetsStacked from "../../atoms/AssetsStacked";
import { Popover, PopoverContent, PopoverTrigger } from "../../atoms/Popover";
import MaxSlippageSwitcher from "../MaxSlippageSwitcher";
import { IconSettingsFilled } from "@tabler/icons-react";
import { twMerge } from "~/utils/twMerge";

// Mock types
interface Token {
  symbol: string;
  denom: string;
  decimals: number;
  logoURI: string;
}

interface MockPool {
  poolAddress: string;
  name: string;
  poolType: "stable" | "weighted" | "concentrated";
  assets: Token[];
  config: {
    fee: number;
  };
}

interface Props {
  pool: MockPool;
  successAction?: () => void;
  className?: string;
  classNameContainer?: string;
  WrapperComponent?: React.ElementType<{ classNames?: string; title?: string }>;
  wrapperProps?: Record<string, any>;
}

export interface DepositFormData {
  [key: string]: string;
  slipageTolerance: string;
}

const DefaultWrapperComponent = BasicModal;
const defaultWrapperProps = {
  title: "Add Liquidity",
  classNames: {
    wrapper: "max-w-xl",
    container: "p-0",
  },
};

// Mock wallet hook
const useMockWallet = () => {
  return {
    isConnected: true,
    address: "0x1234...5678",
    connect: () => console.log("Connecting wallet..."),
    disconnect: () => console.log("Disconnecting wallet..."),
  };
};

export const ModalAddLiquidity: React.FC<Props> = ({
  pool,
  successAction,
  className,
  classNameContainer,
  WrapperComponent = DefaultWrapperComponent,
  wrapperProps = {},
}) => {
  const { name } = pool;
  const [side, setSide] = useState<"double" | "single">("double");
  const [slipageTolerance, setSlipageTolerance] = useState("0.04");
  const { isConnected } = useMockWallet();
  const submitRef = useRef<{ onSubmit: (data: DepositFormData) => Promise<void> } | null>(null);
  const methods = useForm({ mode: "onChange" });
  const { errors, isSubmitting, isValid } = methods.formState;

  const changeSide = (side: "double" | "single") => {
    setSide(side);
    methods.reset();
  };

  const { isDisabled, text } = useMemo(() => {
    if (Object.keys(errors).length) return { isDisabled: true, text: "Insufficient Balance" };
    if (isValid) return { isDisabled: false, text: "Deposit & Stake" };
    return { isDisabled: true, text: "Choose Amount" };
  }, [isValid, methods.formState]);

  const onSubmit = methods.handleSubmit(async (data) => {
    console.log("Submitting form data:", {
      ...data,
      slipageTolerance: (
        Number(slipageTolerance === "auto" ? "0.05" : slipageTolerance) / 100
      ).toString(),
    });
    if (successAction) successAction();
  });

  if (WrapperComponent === BasicModal) {
    wrapperProps = {
      ...defaultWrapperProps,
      ...wrapperProps,
    };
  }

  return (
    <WrapperComponent {...wrapperProps}>
      <FormProvider {...methods}>
        <form className={twMerge("flex flex-col max-w-xl", className)} onSubmit={onSubmit}>
          <Popover>
            <PopoverTrigger>
              <Button
                color="secondary"
                className="absolute top-[10px] right-12 p-2"
                type="button"
                isIconOnly
              >
                <IconSettingsFilled className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex w-full items-center justify-between gap-2 mt-2">
                <p className="text-white/50">Max Slippage</p>
                <MaxSlippageSwitcher
                  maxSlippage={slipageTolerance}
                  setMaxSlippage={setSlipageTolerance}
                />
              </div>
            </PopoverContent>
          </Popover>
          <div className={twMerge("flex flex-col gap-5 px-4 py-5", classNameContainer)}>
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 w-full rounded-xl p-4 flex lg:items-center justify-between gap-4 lg:gap-1 flex-col lg:flex-row">
                <div className="flex items-center gap-3">
                  <AssetsStacked assets={pool.assets} />
                  <span>{name}</span>
                </div>
                {pool.poolType === "concentrated" && (
                  <div className="flex gap-2 lg:py-1 lg:px-[6px]">
                    <Tabs
                      color="orange"
                      defaultKey="double"
                      selectedKey={side}
                      onSelectionChange={(key: string) => changeSide(key as "double" | "single")}
                    >
                      <TabList className="bg-white/10 rounded-full p-1">
                        <Tab tabKey="double">Doubled Sided</Tab>
                        <Tab tabKey="single">Single Sided</Tab>
                      </TabList>
                    </Tabs>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-white/50 text-sm">Deposit Amount</p>
                <div className="flex gap-4 flex-col">
                  {/* Mock deposit form would go here */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/50 text-sm">Mock Deposit Form</p>
                    <p className="text-sm">This is where the deposit form would be</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Divider dashed />
          <div className="px-4 py-5 flex flex-col gap-4">
            {isConnected ? (
              <Button
                className="w-full text-base"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                isDisabled={isDisabled}
              >
                {text}
              </Button>
            ) : (
              <Button
                className="w-full text-base"
                size="md"
                type="button"
                onClick={() => console.log("Connect wallet clicked")}
              >
                Connect Wallet
              </Button>
            )}
            <div className="place-self-end gap-3 flex items-center justify-center text-xs text-white/50">
              <div className="flex gap-1 items-center justify-center">
                <IconCoins className="h-4 w-4" />
                <p>Fee</p>
              </div>
              <p className="text-white">{pool.config.fee * 100}%</p>
            </div>
          </div>
        </form>
      </FormProvider>
    </WrapperComponent>
  );
};
