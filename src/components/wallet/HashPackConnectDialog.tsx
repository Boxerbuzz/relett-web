"use client";

import React, { useState } from "react";
import { useHashPack } from "@/contexts/HashPackContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  WalletIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import type UniversalProvider from "@walletconnect/universal-provider";
import {
  HederaProvider,
  HederaAdapter,
  HederaChainDefinition,
  hederaNamespace,
} from "@hashgraph/hedera-wallet-connect";
import { createAppKit } from "@reown/appkit";

const metadata = {
  name: "Relett",
  description: "Hedera dAppConnector Example",
  url: "http://localhost:8080", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/31002956"],
};

interface HashPackConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HashPackConnectDialog({
  isOpen,
  onClose,
}: HashPackConnectDialogProps) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [step, setStep] = useState<"connect" | "pairing" | "success">(
    "connect"
  );

  const projectId =
    import.meta.env.VITE_HEDERA_PROJECT_ID ||
    "b0ec34a6fe4eafec65a7dfbf17cc147a";

  const hederaEVMAdapter = new HederaAdapter({
    projectId,
    networks: [
      HederaChainDefinition.EVM.Mainnet,
      HederaChainDefinition.EVM.Testnet,
    ],
    namespace: "eip155",
  });

  const hederaNativeAdapter = new HederaAdapter({
    projectId,
    networks: [
      HederaChainDefinition.Native.Mainnet,
      HederaChainDefinition.Native.Testnet,
    ],
    namespace: hederaNamespace, // 'hedera' as CaipNamespace,
  });

  const handleConnect = async () => {
    if (!isInitialized) {
      console.warn("WalletConnect not initialized yet");
      return;
    }
  };

  const openHashPack = () => {};

  // Listen for successful connection
  const { wallet } = useHashPack();
  React.useEffect(() => {
    const init = async () => {
      try {
        const universalProvider = (await HederaProvider.init({
          projectId,
          metadata,
        })) as unknown as UniversalProvider;

        createAppKit({
          adapters: [hederaEVMAdapter, hederaNativeAdapter],
          //@ts-expect-error expected type error
          universalProvider,
          projectId,
          metadata,
          networks: [
            // EVM
            HederaChainDefinition.EVM.Mainnet,
            HederaChainDefinition.EVM.Testnet,
            // Native
            HederaChainDefinition.Native.Mainnet,
            HederaChainDefinition.Native.Testnet,
          ],
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize dAppConnector:", error);
      }
    };
    init();
  }, []);

  const handleClose = () => {
    onClose();
    setStep("connect");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WalletIcon size={24} />
            Connect HashPack Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your HashPack wallet to access blockchain features
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {step === "connect" && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <WalletIcon size={32} className="text-blue-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">Ready to Connect</h3>
                <p className="text-sm text-gray-600">
                  Click below to connect your HashPack wallet and start using
                  blockchain features.
                </p>
              </div>

              <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-yellow-800 font-medium">
                  Troubleshooting Steps:
                </p>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Install HashPack from the Chrome Web Store</li>
                  <li>Enable the extension in your browser</li>
                  <li>Refresh this page</li>
                  <li>Disable other wallet extensions temporarily</li>
                </ol>
                <div className="pt-2 border-t border-yellow-200">
                  <a
                    href="https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Install HashPack Extension →
                  </a>
                </div>
              </div>

              <Button onClick={handleConnect} className="w-full">
                Connect HashPack
              </Button>

              {
                <p className="text-xs text-center text-muted-foreground">
                  Check browser console for detection logs
                </p>
              }
            </>
          )}

          {step === "pairing" && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <SpinnerIcon size={32} className="text-blue-600 animate-spin" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-medium">Open HashPack</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to open HashPack and approve the
                  connection.
                </p>
                {
                  <Button onClick={openHashPack} className="w-full">
                    Open HashPack Wallet
                  </Button>
                }
                <p className="text-xs text-gray-500">
                  Connection will complete automatically once approved in
                  HashPack.
                </p>
              </div>
            </>
          )}

          {step === "success" && (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={32} className="text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-green-600">Connected!</h3>
                <p className="text-sm text-gray-600">
                  Your HashPack wallet is now connected.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
