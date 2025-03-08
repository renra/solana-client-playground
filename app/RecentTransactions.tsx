import { JSX, useState } from "react"
import useRecentSignatures from "./useRecentSignatures"
import TransactionDetail from "./TransactionDetail"

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

export default RecentTransactions
