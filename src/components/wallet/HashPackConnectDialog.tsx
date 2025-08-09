"use client";

import React, { useState } from "react";
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
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

const metadata = {
  name: "PropertyToken",
  description: "Property Tokenization Platform",
  url: window.location.origin,
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
  const [dAppConnector, setDAppConnector] = React.useState<DAppConnector | null>(null);
  const [step, setStep] = useState<"connect" | "pairing" | "success">(
    "connect"
  );

  const projectId =
    import.meta.env.VITE_HEDERA_PROJECT_ID ||
    "b0ec34a6fe4eafec65a7dfbf17cc147a";

  const handleConnect = async () => {
    if (!dAppConnector) {
      console.warn("DAppConnector not initialized yet");
      return;
    }
    
    try {
      setStep("pairing");
      
      const session = await dAppConnector.connect((uri: string) => {
        console.log('WalletConnect URI:', uri);
      });
      
      if (session) {
        setStep("success");
        toast({
          title: "Success",
          description: "Wallet connected successfully!",
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setStep("connect");
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const openHashPack = () => {
    // Try to open HashPack extension or app
    const hashpackUrl = "https://www.hashpack.app/";
    window.open(hashpackUrl, "_blank");
  };

  // Initialize DAppConnector
  React.useEffect(() => {
    const init = async () => {
      try {
        const connector = new DAppConnector(
          metadata,
          LedgerId.TESTNET,
          projectId,
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged]
        );

        await connector.init();
        setDAppConnector(connector);
        setIsInitialized(true);
        console.log("DAppConnector initialized successfully");
      } catch (error) {
        console.error("Failed to initialize DAppConnector:", error);
        toast({
          title: "Initialization Failed",
          description: "Failed to initialize wallet connector",
          variant: "destructive",
        });
      }
    };
    init();
  }, [projectId]);

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
