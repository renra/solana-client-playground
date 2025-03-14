import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JSX, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { sendAndConfirmTransaction, clusterApiUrl, PublicKey, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "@solana/wallet-adapter-react-ui/styles.css";
import useAccountInfo from './useAccountInfo';
import RecentTransactions from './RecentTransactions';
import useRecentSignatures from './useRecentSignatures';

const defaultSmartContractProgramId = '3YnxQPUGkyjcN3umsiNKpxMgYEoJRGZPQ7VTLsJUojJ7';
const defaultMsg = { ping: {} }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const endpoint = clusterApiUrl("devnet");

const MainInner = () : JSX.Element => {
  const accountInfo = useAccountInfo()

  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const [programId, setProgramId] = useState(defaultSmartContractProgramId)

  const { refetch : refetchSignatures } = useRecentSignatures()

  const [parsedMsg, setParsedMsg] = useState<any>(defaultMsg)
  const [stringifiedMsg, setStringifiedMsg] = useState<string | undefined>(JSON.stringify(parsedMsg))

  const sendTx = async (smartContractProgramId: string, msg: string) => {
    if(!publicKey || !connection || !signTransaction) {
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
            isSigner: true,
            isWritable: false,
          },
        ],
        programId,
        data: Buffer.from(msg)
      });

      transaction.add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      // const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
        preflightCommitment: 'confirmed'
      })

      alert(`The signature of your new transaction is ${signature}`)
      refetchSignatures()
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
          <>
            <div>
              <input style={{ minWidth: '360px' }} placeholder='Program Id' type='text' value={programId} onChange={(e) => { setProgramId(e.target.value) }}/>
            </div>

            <div>
              <textarea 
                style={{ minWidth: '360px' }}
                placeholder='Type msg' 
                value={stringifiedMsg}
                onChange={
                  (e) => {  
                    setStringifiedMsg(e.target.value)

                    try {
                      setParsedMsg(JSON.parse(e.target.value))
                    } catch (_) {
                      setParsedMsg(undefined)
                    }
                  }
                }
              />
            </div>

            <div>
              <button disabled={parsedMsg === undefined} onClick={() => { if(stringifiedMsg) { sendTx(programId, stringifiedMsg) } }}>
                Send a Tx
              </button>
            </div>

            <RecentTransactions />
          </>
      }
    </>
  )
}

const Main = () : JSX.Element => {
  const wallets = useMemo(() => [], [])

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
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
