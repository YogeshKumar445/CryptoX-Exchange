import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({
                       onLogout,
                       onOpenWallet,
                       onOpenTransactions,
                       onOpenMarket,
                       onOpenPortfolio,
                       onOpenProfile,
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
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />

                    <p className="text-white text-lg mt-5">
                        Loading dashboard...
                    </p>
                </div>
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
                            type="button"
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
            <nav className="border-b border-slate-800 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5">
                    <div>
                        <h1 className="text-2xl font-bold">
                            CryptoX Exchange
                        </h1>

                        <p className="text-sm text-slate-400 mt-1">
                            Dashboard
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onOpenProfile}
                            className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                                {getInitials(user)}
                            </div>

                            <div className="hidden sm:block">
                                <p className="font-semibold">
                                    {user
                                        ? `${user.firstName} ${user.lastName}`
                                        : "User"}
                                </p>

                                <p className="text-sm text-slate-400">
                                    {user?.email}
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500 px-4 py-2 rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold">
                        Welcome, {user?.firstName || "User"} 👋
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Here's an overview of your CryptoX account.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"
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

                <div className="mt-12">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">
                            Quick Actions
                        </h2>

                        <p className="text-slate-400 mt-2">
                            Manage your CryptoX account from one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ActionCard
                            title="Crypto Market"
                            description="Explore cryptocurrencies, current prices and buy digital assets."
                            buttonText="Explore Market"
                            onClick={onOpenMarket}
                            primary
                        />

                        <ActionCard
                            title="Manage Wallet"
                            description="Deposit or withdraw funds from your CryptoX wallet."
                            buttonText="Open Wallet"
                            onClick={onOpenWallet}
                        />

                        <ActionCard
                            title="My Portfolio"
                            description="View your crypto holdings, investment value and profit or loss."
                            buttonText="View Portfolio"
                            onClick={onOpenPortfolio}
                            primary
                        />

                        <ActionCard
                            title="Transaction History"
                            description="Review your deposits, withdrawals, purchases and sales."
                            buttonText="View Transactions"
                            onClick={onOpenTransactions}
                        />

                        <ActionCard
                            title="My Profile"
                            description="View and update your personal information and account details."
                            buttonText="Open Profile"
                            onClick={onOpenProfile}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

function ActionCard({
                        title,
                        description,
                        buttonText,
                        onClick,
                        primary = false,
                    }) {
    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7 flex flex-col min-h-[230px] hover:border-slate-700 transition">
            <h3 className="text-xl font-bold">
                {title}
            </h3>

            <p className="text-slate-400 mt-3 leading-7 flex-1">
                {description}
            </p>

            <button
                type="button"
                onClick={onClick}
                className={
                    primary
                        ? "mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition w-fit"
                        : "mt-6 border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition w-fit"
                }
            >
                {buttonText}
            </button>
        </div>
    );
}

function getInitials(user) {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
}

function errIsUnauthorized(error) {
    return (
        error ===
        "Session expired or unauthorized. Please login again."
    );
}

export default Dashboard;