import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"

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

export default useTransactionDetails
