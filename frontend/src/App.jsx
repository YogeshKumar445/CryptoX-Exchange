import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";

function App() {

    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [page, setPage] = useState("dashboard");

    const handleLogin = () => {
        setLoggedIn(true);
        setPage("dashboard");
    };

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setLoggedIn(false);
        setPage("dashboard");
    };

    if (!loggedIn) {

        return (
            <Login
                onLogin={handleLogin}
            />
        );
    }


    if (page === "wallet") {

        return (
            <Wallet
                onBack={() => setPage("dashboard")}
            />
        );
    }


    if (page === "transactions") {

        return (
            <Transactions
                onBack={() => setPage("dashboard")}
            />
        );
    }


    if (page === "market") {

        return (
            <Market
                onBack={() => setPage("dashboard")}
            />
        );
    }


    if (page === "portfolio") {

        return (
            <Portfolio
                onBack={() => setPage("dashboard")}
            />
        );
    }


    return (
        <Dashboard
            onLogout={handleLogout}

            onOpenWallet={() =>
                setPage("wallet")
            }

            onOpenTransactions={() =>
                setPage("transactions")
            }

            onOpenMarket={() =>
                setPage("market")
            }

            onOpenPortfolio={() =>
                setPage("portfolio")
            }
        />
    );
}

export default App;