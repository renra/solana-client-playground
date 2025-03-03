import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { JSX, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clusterApiUrl, PublicKey, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "@solana/wallet-adapter-react-ui/styles.css";

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

const useRecentSignatures = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  return useQuery({
    queryKey: ['account-signatures', publicKey],
    queryFn: async () => {
      if(connection && publicKey) {
        return connection.getSignaturesForAddress(publicKey)
      }
    },
    enabled: !!connection && !!publicKey
  })
}

const useTransactionDetails = (signature: string | undefined) => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  return useQuery({
    queryKey: ['transaction-details', signature],
    queryFn: async () => {
      if(connection && publicKey && signature) {
        return connection.getParsedTransaction(signature)
      }
    },
    enabled: !!connection && !!publicKey && !!signature
  })
}

const MainInner = () : JSX.Element => {
  const accountInfo = useAccountInfo()
  const recentSignatures = useRecentSignatures()

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [programId, setProgramId] = useState(defaultSmartContractProgramId)

  const [parsedMsg, setParsedMsg] = useState<any>(defaultMsg)
  const [stringifiedMsg, setStringifiedMsg] = useState<string | undefined>(JSON.stringify(parsedMsg))

  console.log(recentSignatures.data)

  const sendTx = async (smartContractProgramId: string, msg: string) => {
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
        data: Buffer.from(msg)
      });

      transaction.add(instruction);

      const signature = await sendTransaction(transaction, connection);
      alert(signature)
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
          <>
            <div>
              <input placeholder='Program Id' type='text' value={programId} onChange={(e) => { setProgramId(e.target.value) }}/>
            </div>

            <div>
              <textarea 
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

const TransactionDetail = ({ signature } : { signature : string } ) : JSX.Element => {
  const detail = useTransactionDetails(signature)

  return (
    <div>
      <h2>
        Transaction detail of {signature}
      </h2>

      { detail.isLoading && <div>...</div> }
      { detail.data && <div>{JSON.stringify(detail.data)}</div> }

    </div>
  )
}

const RecentTransactions = () : JSX.Element => {
  const recentTransactions = useRecentSignatures()
  const [chosenTransaction, setChosenTransaction] = useState<string | undefined>(undefined)

  return (
    <div>
      { chosenTransaction && <TransactionDetail signature={chosenTransaction} /> }

      <h2>
        Recent transactions
      </h2>

      { recentTransactions.isLoading && <div>...</div> }
      { recentTransactions.data && 
          <div>
            {
              recentTransactions.data.map((t) => {
                return (
                  <div key={t.signature}>
                    { t.signature } <button onClick={ () => { setChosenTransaction(t.signature) } }>Show detail</button>
                  </div>
                )
              })
            }
          </div> 
      }
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
