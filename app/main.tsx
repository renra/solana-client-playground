import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { JSX, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const endpoint = clusterApiUrl("devnet");

const useAccountInfo = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  return useQuery({
    queryKey: ['account-info', publicKey],
    queryFn: async () => {
      if(connection && publicKey) {
        return connection.getAccountInfo(publicKey)
      }
    },
    enabled: !!connection && !!publicKey
  })
}

const MainInner = () : JSX.Element => {
  const accountInfo = useAccountInfo()

  return (
    <>
      { accountInfo.isLoading &&
          <div>...</div>
      }

      { accountInfo.data &&
          <div>Your balance is {accountInfo.data.lamports / LAMPORTS_PER_SOL} SOL</div>
      }
    </>
  )
}

const Main = () : JSX.Element => {
  const wallets = useMemo(() => [], [])

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <WalletModalProvider>
            <WalletMultiButton />

            <MainInner />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <Main />
);
