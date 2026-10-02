import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";

function App() {
    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [page, setPage] = useState("dashboard");
    const [authView, setAuthView] = useState("login");

    const handleLogin = () => {
        setLoggedIn(true);
        setPage("dashboard");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setLoggedIn(false);
        setAuthView("login");
        setPage("dashboard");
    };

    if (!loggedIn) {
        if (authView === "register") {
            return (
                <Register
                    onGoToLogin={() => setAuthView("login")}
                />
            );
        }

        return (
            <Login
                onLogin={handleLogin}
                onGoToRegister={() => setAuthView("register")}
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

    if (page === "profile") {
        return (
            <Profile
                onBack={() => setPage("dashboard")}
            />
        );
    }

    return (
        <Dashboard
            onLogout={handleLogout}
            onOpenWallet={() => setPage("wallet")}
            onOpenTransactions={() => setPage("transactions")}
            onOpenMarket={() => setPage("market")}
            onOpenPortfolio={() => setPage("portfolio")}
            onOpenProfile={() => setPage("profile")}
        />
    );
}

export default App;