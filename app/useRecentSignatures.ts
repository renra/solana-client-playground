import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"

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

export default useRecentSignatures
