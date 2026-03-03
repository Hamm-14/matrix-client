import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as sdk from "matrix-js-sdk";
import { MatrixClient, ClientEvent } from "matrix-js-sdk";
import type { Creds } from "../App";

interface MatrixContextType {
  client: MatrixClient | null;
  isSyncing: boolean;
  syncError: Error | null;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

interface MatrixProviderProps {
  children: ReactNode;
  credentials: Creds;
}

export const MatrixProvider: React.FC<MatrixProviderProps> = ({
  children,
  credentials,
}) => {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<Error | null>(null);

  useEffect(() => {
    const matrixClient = sdk.createClient({
      baseUrl: credentials.baseUrl,
      userId: credentials.userId,
      accessToken: credentials.accessToken,
      deviceId: credentials.deviceId,
    });

    const onSync = (state: string) => {
      if (state === "PREPARED") {
        setIsSyncing(false);
      } else if (state === "ERROR") {
        setSyncError(new Error("Failed to sync with Matrix Homeserver"));
      }
    };

    matrixClient.on(ClientEvent.Sync, onSync);

    matrixClient.startClient({ initialSyncLimit: 10 });

    setClient(matrixClient);

    return () => {
      matrixClient.stopClient();
      matrixClient.removeListener(ClientEvent.Sync, onSync);
    };
  }, [credentials.baseUrl, credentials.userId, credentials.accessToken]);

  const value = {
    client,
    isSyncing,
    syncError,
  };

  return (
    <MatrixContext.Provider value={value}>
      {isSyncing ? (
        <div className="matrix-loader">Initializing Matrix Connection...</div>
      ) : (
        children
      )}
    </MatrixContext.Provider>
  );
};

export const useMatrix = (): MatrixContextType => {
  const context = useContext(MatrixContext);
  if (context === undefined) {
    throw new Error("useMatrix must be used within a MatrixProvider");
  }
  return context;
};
