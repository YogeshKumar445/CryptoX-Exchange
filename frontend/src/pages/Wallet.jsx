import { useEffect, useState } from "react";
import {
    depositMoney,
    getMyWallet,
    withdrawMoney,
} from "../services/walletService";

function Wallet({ onBack }) {

    const [wallet, setWallet] = useState(null);

    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");

    const [loading, setLoading] = useState(true);
    const [depositLoading, setDepositLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==============================
    // Fetch Wallet
    // ==============================

    const fetchWallet = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getMyWallet();

            console.log("Wallet response:", response);

            setWallet(response.data);

        } catch (error) {

            console.error(
                "Wallet fetch error:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Unable to load wallet."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchWallet();

    }, []);


    // ==============================
    // Deposit
    // ==============================

    const handleDeposit = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");

        const amount = Number(depositAmount);

        if (!Number.isFinite(amount) || amount <= 0) {

            setError(
                "Please enter a valid deposit amount."
            );

            return;
        }

        try {

            setDepositLoading(true);

            const response =
                await depositMoney(amount);

            console.log(
                "Deposit response:",
                response
            );

            setWallet(response.data);

            setMessage(
                response.message ||
                "Amount deposited successfully."
            );

            setDepositAmount("");

        } catch (error) {

            console.error(
                "Deposit error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Deposit failed. Please try again."
            );

        } finally {

            setDepositLoading(false);

        }
    };


    // ==============================
    // Withdraw
    // ==============================

    const handleWithdraw = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");

        const amount = Number(withdrawAmount);

        if (!Number.isFinite(amount) || amount <= 0) {

            setError(
                "Please enter a valid withdrawal amount."
            );

            return;
        }

        const currentBalance =
            Number(wallet?.balance ?? 0);

        if (amount > currentBalance) {

            setError(
                "Insufficient wallet balance."
            );

            return;
        }

        try {

            setWithdrawLoading(true);

            const response =
                await withdrawMoney(amount);

            console.log(
                "Withdraw response:",
                response
            );

            setWallet(response.data);

            setMessage(
                response.message ||
                "Amount withdrawn successfully."
            );

            setWithdrawAmount("");

        } catch (error) {

            console.error(
                "Withdraw error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Withdrawal failed. Please try again."
            );

        } finally {

            setWithdrawLoading(false);

        }
    };


    // ==============================
    // Loading
    // ==============================

    if (loading) {

        return (

            <div className="min-h-screen bg-[#020817] flex items-center justify-center">

                <p className="text-xl text-white">
                    Loading wallet...
                </p>

            </div>

        );

    }


    // ==============================
    // UI
    // ==============================

    return (

        <div className="min-h-screen bg-[#020817] text-white">

            {/* Navbar */}

            <nav className="border-b border-slate-800 bg-[#0f172a]">

                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold">
                            CryptoX Exchange
                        </h1>

                        <p className="text-sm text-slate-400">
                            Wallet
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onBack}
                        className="
                            rounded-lg
                            border
                            border-slate-700
                            px-4
                            py-2
                            text-slate-300
                            hover:bg-slate-800
                            hover:text-white
                            transition
                        "
                    >
                        ← Dashboard
                    </button>

                </div>

            </nav>


            {/* Main */}

            <main className="max-w-7xl mx-auto px-6 py-10">


                {/* Heading */}

                <div className="mb-8">

                    <h2 className="text-3xl font-bold">
                        My Wallet
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Manage your CryptoX wallet balance.
                    </p>

                </div>


                {/* Balance */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-800
                        bg-[#0f172a]
                        p-8
                        mb-8
                    "
                >

                    <p className="text-slate-400">
                        Available Balance
                    </p>

                    <h3 className="mt-3 text-5xl font-bold">

                        ${Number(
                        wallet?.balance ?? 0
                    ).toLocaleString(
                        "en-US",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }
                    )}

                    </h3>


                    <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-500">

                        <p>
                            Wallet ID:{" "}
                            <span className="text-slate-300">
                                {wallet?.id ?? "-"}
                            </span>
                        </p>

                        <p>
                            User ID:{" "}
                            <span className="text-slate-300">
                                {wallet?.userId ?? "-"}
                            </span>
                        </p>

                    </div>

                </div>


                {/* Success */}

                {message && (

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-green-500/30
                            bg-green-500/10
                            px-5
                            py-4
                        "
                    >

                        <p className="text-green-400">
                            {message}
                        </p>

                    </div>

                )}


                {/* Error */}

                {error && (

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-red-500/30
                            bg-red-500/10
                            px-5
                            py-4
                        "
                    >

                        <p className="text-red-400">
                            {error}
                        </p>

                    </div>

                )}


                {/* Deposit + Withdraw */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                    {/* Deposit */}

                    <div
                        className="
                            rounded-2xl
                            border
                            border-slate-800
                            bg-[#0f172a]
                            p-7
                        "
                    >

                        <h3 className="text-2xl font-bold">
                            Deposit
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Add funds to your CryptoX wallet.
                        </p>


                        <form
                            onSubmit={handleDeposit}
                            className="mt-6 space-y-5"
                        >

                            <div>

                                <label
                                    htmlFor="depositAmount"
                                    className="mb-2 block text-sm text-slate-300"
                                >
                                    Amount
                                </label>


                                <input
                                    id="depositAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={depositAmount}
                                    onChange={(event) =>
                                        setDepositAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="100.00"
                                    required
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-700
                                        bg-slate-800
                                        px-4
                                        py-3
                                        text-white
                                        placeholder-slate-500
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-500/20
                                    "
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={depositLoading}
                                className="
                                    w-full
                                    rounded-xl
                                    bg-green-600
                                    py-3
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >

                                {depositLoading
                                    ? "Depositing..."
                                    : "Deposit Funds"}

                            </button>

                        </form>

                    </div>


                    {/* Withdraw */}

                    <div
                        className="
                            rounded-2xl
                            border
                            border-slate-800
                            bg-[#0f172a]
                            p-7
                        "
                    >

                        <h3 className="text-2xl font-bold">
                            Withdraw
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Withdraw funds from your wallet.
                        </p>


                        <form
                            onSubmit={handleWithdraw}
                            className="mt-6 space-y-5"
                        >

                            <div>

                                <label
                                    htmlFor="withdrawAmount"
                                    className="mb-2 block text-sm text-slate-300"
                                >
                                    Amount
                                </label>


                                <input
                                    id="withdrawAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={withdrawAmount}
                                    onChange={(event) =>
                                        setWithdrawAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="50.00"
                                    required
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-700
                                        bg-slate-800
                                        px-4
                                        py-3
                                        text-white
                                        placeholder-slate-500
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-500/20
                                    "
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={withdrawLoading}
                                className="
                                    w-full
                                    rounded-xl
                                    bg-red-600
                                    py-3
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >

                                {withdrawLoading
                                    ? "Withdrawing..."
                                    : "Withdraw Funds"}

                            </button>

                        </form>

                    </div>

                </div>

            </main>

        </div>

    );
}

export default Wallet;