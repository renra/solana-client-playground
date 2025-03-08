import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"

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

export default useAccountInfo
