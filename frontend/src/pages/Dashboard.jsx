import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({
                       onLogout,
                       onOpenWallet,
                       onOpenTransactions,
                       onOpenMarket,
                       onOpenPortfolio,
                   }) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/dashboard");

                console.log("Dashboard response:", response.data);

                // Supports both:
                // { walletBalance: ... }
                // and { success: true, data: { walletBalance: ... } }
                const dashboardData =
                    response.data?.data ?? response.data;

                setDashboard(dashboardData);
            } catch (err) {
                console.error("Dashboard error:", err);

                if (err.response?.status === 401) {
                    setError(
                        "Session expired or unauthorized. Please login again."
                    );
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load dashboard."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const formatCurrency = (value) => {
        const number = Number(value ?? 0);

        if (!Number.isFinite(number)) {
            return "$0.00";
        }

        // Tiny crypto values need more precision.
        if (number !== 0 && Math.abs(number) < 0.01) {
            return `$${number.toFixed(8)}`;
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (onLogout) {
            onLogout();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center">
                <p className="text-white text-xl">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 text-center">
                    <p className="text-red-400">
                        {error}
                    </p>

                    {errIsUnauthorized(error) && (
                        <button
                            onClick={handleLogout}
                            className="mt-5 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white font-semibold transition"
                        >
                            Login Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const cards = [
        {
            title: "Wallet Balance",
            value: formatCurrency(dashboard?.walletBalance),
        },
        {
            title: "Portfolio Value",
            value: formatCurrency(dashboard?.portfolioValue),
        },
        {
            title: "Total Investment",
            value: formatCurrency(dashboard?.totalInvestment),
        },
        {
            title: "Profit / Loss",
            value: formatCurrency(dashboard?.totalProfitLoss),
        },
        {
            title: "Coins Owned",
            value: dashboard?.coinsOwned ?? 0,
        },
        {
            title: "Transactions",
            value: dashboard?.totalTransactions ?? 0,
        },
    ];

    return (
        <div className="min-h-screen bg-[#020817] text-white">

            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

                    <h1 className="text-2xl font-bold">
                        CryptoX Exchange
                    </h1>

                    <div className="flex items-center gap-6">

                        <div className="text-right">
                            <p className="font-semibold">
                                {user
                                    ? `${user.firstName} ${user.lastName}`
                                    : "User"}
                            </p>

                            <p className="text-sm text-slate-400">
                                {user?.email}
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="
                                border
                                border-red-500/40
                                text-red-400
                                hover:bg-red-500/10
                                hover:border-red-500
                                px-4
                                py-2
                                rounded-lg
                                transition
                            "
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Welcome */}
                <div className="mb-10">

                    <h2 className="text-3xl font-bold">
                        Welcome, {user?.firstName || "User"} 👋
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Here's an overview of your CryptoX account.
                    </p>

                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="
                                bg-[#0f172a]
                                border
                                border-slate-800
                                rounded-2xl
                                p-6
                                hover:border-slate-700
                                transition
                            "
                        >
                            <p className="text-slate-400">
                                {card.title}
                            </p>

                            <h3 className="text-3xl font-bold mt-3 break-words">
                                {card.value}
                            </h3>
                        </div>
                    ))}

                </div>

                {/* Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

                    {/* Market */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7">

                        <h3 className="text-xl font-bold">
                            Crypto Market
                        </h3>

                        <p className="text-slate-400 mt-3">
                            Explore cryptocurrencies and their current prices.
                        </p>

                        <button
                            onClick={onOpenMarket}
                            className="
                                mt-6
                                bg-blue-600
                                hover:bg-blue-700
                                px-6
                                py-3
                                rounded-xl
                                font-semibold
                                transition
                            "
                        >
                            Explore Market
                        </button>

                    </div>

                    {/* Wallet */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7">

                        <h3 className="text-xl font-bold">
                            Manage Wallet
                        </h3>

                        <p className="text-slate-400 mt-3">
                            Deposit or withdraw funds from your CryptoX wallet.
                        </p>

                        <button
                            onClick={onOpenWallet}
                            className="
                                mt-6
                                border
                                border-slate-700
                                hover:bg-slate-800
                                px-6
                                py-3
                                rounded-xl
                                font-semibold
                                transition
                            "
                        >
                            Open Wallet
                        </button>

                    </div>

                    {/* Transactions */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7">

                        <h3 className="text-xl font-bold">
                            Transaction History
                        </h3>

                        <p className="text-slate-400 mt-3">
                            Review deposits, withdrawals, purchases and sales.
                        </p>

                        <button
                            onClick={onOpenTransactions}
                            className="
                                mt-6
                                border
                                border-slate-700
                                hover:bg-slate-800
                                px-6
                                py-3
                                rounded-xl
                                font-semibold
                                transition
                            "
                        >
                            View Transactions
                        </button>

                    </div>

                    {/* Portfolio */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7">

                        <h3 className="text-xl font-bold">
                            My Portfolio
                        </h3>

                        <p className="text-slate-400 mt-3">
                            View your crypto holdings, investment value and profit or loss.
                        </p>

                        <button
                            onClick={onOpenPortfolio}
                            className="
                                mt-6
                                bg-blue-600
                                hover:bg-blue-700
                                px-6
                                py-3
                                rounded-xl
                                font-semibold
                                transition
                            "
                        >
                            View Portfolio
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

function errIsUnauthorized(error) {
    return (
        error ===
        "Session expired or unauthorized. Please login again."
    );
}

export default Dashboard;