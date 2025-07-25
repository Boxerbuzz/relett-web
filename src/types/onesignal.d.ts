
declare global {
  interface Window {
    OneSignal: {
      init: (config: {
        appId: string;
        safari_web_id?: string;
        notifyButton?: {
          enable: boolean;
        };
        allowLocalhostAsSecureOrigin?: boolean;
      }) => Promise<void>;
      setExternalUserId: (userId: string) => Promise<void>;
      getExternalUserId: () => Promise<string | null>;
      removeExternalUserId: () => Promise<void>;
      on: (event: string, callback: (event: any) => void) => void;
    };
  }
}

export {};
