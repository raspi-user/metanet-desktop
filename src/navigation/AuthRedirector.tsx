import { useContext, useEffect } from "react"
import { useHistory } from "react-router"
import { WalletContext } from "../WalletContext"

// -----
// AuthRedirector: Handles auto-login redirect when snapshot has loaded
// -----
const AuthRedirector: React.FC<{ snapshotLoaded: boolean }> = ({ snapshotLoaded }) => {
    const history = useHistory()
    const { managers } = useContext(WalletContext)

    useEffect(() => {
        if (
            managers.walletManager &&
            snapshotLoaded &&
            (managers.walletManager as any).authenticated
        ) {
            history.push('/dashboard/apps')
        }
    }, [managers.walletManager, snapshotLoaded, history])

    return null
}