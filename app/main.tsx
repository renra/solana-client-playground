import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { JSX, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
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


// const { value: balance } = await rpc.getBalance(wallet).send();
// console.log(`Balance: ${Number(balance) / LAMPORTS_PER_SOL} SOL`);

// const useBalance = (walletAddress: string | undefined) => {
//   return useQuery({
//     queryKey: ['balance', walletAddress],
//     queryFn: async () => {
//       const wallet = address(walletAddress ?? '');
//       return (await rpc.getBalance(wallet).send()).value
//     },
//     enabled: walletAddress !== undefined && walletAddress !== ''
//   })
// }

const MainInner = () : JSX.Element => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)
  // const balance = useBalance(walletAddress)

  // balance.isLoading
      // { balance.isLoading && <div>...</div> }

      // { balance.data &&  
      //     <div>
      //       Your balance is {`${Number(balance.data) / LAMPORTS_PER_SOL} SOL`}
      //     </div>
      // }

  return (
    <div>
      Hello!
    </div>
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
