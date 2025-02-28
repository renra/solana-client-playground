import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { JSX, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { clusterApiUrl, PublicKey, Transaction, TransactionInstruction, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "@solana/wallet-adapter-react-ui/styles.css";

const smartContractProgramId = '3YnxQPUGkyjcN3umsiNKpxMgYEoJRGZPQ7VTLsJUojJ7';

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
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const sendTx = async () => {
    if(!publicKey || !connection) {
      console.error('Wallet not connected')
      return
    }

    try {
      const programId = new PublicKey(smartContractProgramId);
      const programDataAccount = new PublicKey(publicKey);
      const transaction = new Transaction();

      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: programDataAccount,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId,
      });

      transaction.add(instruction);

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction Signature:", signature);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }

  return (
    <>
      { accountInfo.isLoading &&
          <div>...</div>
      }

      { accountInfo.data &&
          <div>Your balance is {accountInfo.data.lamports / LAMPORTS_PER_SOL} SOL</div>
      }

      { connection && publicKey && 
          <button onClick={() => { sendTx() }}>
            Send a Tx
          </button>
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
