import { JSX } from "react"
import useTransactionDetails from "./useTransactionDetails"

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

export default TransactionDetail
