import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { address, createSolanaClient, LAMPORTS_PER_SOL } from 'gill';
import { JSX, useState } from 'react';
import { createRoot } from 'react-dom/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const { rpc } = createSolanaClient({
  urlOrMoniker: "devnet", // or `mainnet`, `localnet`, etc
});

// const { value: balance } = await rpc.getBalance(wallet).send();
// console.log(`Balance: ${Number(balance) / LAMPORTS_PER_SOL} SOL`);

const useBalance = (walletAddress: string | undefined) => {
  return useQuery({
    queryKey: ['balance', walletAddress],
    queryFn: async () => {
      const wallet = address(walletAddress ?? '');
      return (await rpc.getBalance(wallet).send()).value
    },
    enabled: walletAddress !== undefined && walletAddress !== ''
  })
}

const MainInner = () : JSX.Element => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)
  const balance = useBalance(walletAddress)

  balance.isLoading

  return (
    <div>
      <div>
        <input type="text" placeholder="Wallet address" onChange={(e) => { setWalletAddress(e.target.value == '' ? undefined : e.target.value) }} value={walletAddress || ''} />
      </div>

      { balance.isLoading && <div>...</div> }

      { balance.data &&  
          <div>
            Your balance is {`${Number(balance.data) / LAMPORTS_PER_SOL} SOL`}
          </div>
      }
    </div>
  )
}

const Main = () : JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <MainInner />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <Main />
);
