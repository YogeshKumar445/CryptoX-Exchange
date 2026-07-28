import { useEffect, useState } from "react";
import { getMyTransactions } from "../services/transactionService";

import {
    formatCryptoQuantity,
    formatCurrency,
    formatPrice,
    formatTransactionDate,
} from "../utils/formatters";

function Transactions({ onBack }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMyTransactions();

                console.log(
                    "Transactions response:",
                    response
                );

                const data = Array.isArray(response)
                    ? response
                    : response?.data || [];

                setTransactions(data);

            } catch (err) {

                console.error(
                    "Transaction error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load transactions."
                );

            } finally {
                setLoading(false);
            }
        };

        loadTransactions();

    }, []);

    const getTypeClasses = (type) => {

        switch (type) {

            case "DEPOSIT":
                return `
                    text-green-400
                    border-green-700
                    bg-green-950/30
                `;

            case "WITHDRAW":
                return `
                    text-red-400
                    border-red-700
                    bg-red-950/30
                `;

            case "BUY":
                return `
                    text-blue-400
                    border-blue-700
                    bg-blue-950/30
                `;

            case "SELL":
                return `
                    text-orange-400
                    border-orange-700
                    bg-orange-950/30
                `;

            default:
                return `
                    text-slate-300
                    border-slate-700
                    bg-slate-800
                `;
        }
    };

    if (loading) {
        return (
            <div className="
                min-h-screen
                bg-[#020817]
                flex
                items-center
                justify-center
            ">
                <p className="text-white text-xl">
                    Loading transactions...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white">

            {/* Navbar */}

            <nav className="
                bg-[#0f172a]
                border-b
                border-slate-800
            ">

                <div className="
                    max-w-7xl
                    mx-auto
                    px-6
                    py-5
                    flex
                    justify-between
                    items-center
                ">

                    <div>

                        <h1 className="text-2xl font-bold">
                            CryptoX Exchange
                        </h1>

                        <p className="text-slate-400 mt-1">
                            Transaction History
                        </p>

                    </div>

                    <button
                        onClick={onBack}
                        className="
                            border
                            border-slate-700
                            hover:bg-slate-800
                            px-5
                            py-3
                            rounded-xl
                            transition
                        "
                    >
                        ← Dashboard
                    </button>

                </div>

            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">

                <div className="mb-10">

                    <h2 className="text-3xl font-bold">
                        Transaction History
                    </h2>

                    <p className="text-slate-400 mt-2">
                        View your wallet and cryptocurrency transactions.
                    </p>

                </div>

                {error && (

                    <div className="
                        border
                        border-red-700
                        bg-red-950/30
                        text-red-400
                        rounded-xl
                        p-5
                    ">
                        {error}
                    </div>

                )}

                {!error && transactions.length === 0 && (

                    <div className="
                        bg-[#0f172a]
                        border
                        border-slate-800
                        rounded-2xl
                        p-12
                        text-center
                    ">

                        <h3 className="text-xl font-semibold">
                            No transactions yet
                        </h3>

                        <p className="text-slate-400 mt-2">
                            Your deposits, withdrawals, purchases and sales will appear here.
                        </p>

                    </div>

                )}

                {!error && transactions.length > 0 && (

                    <div className="
                        bg-[#0f172a]
                        border
                        border-slate-800
                        rounded-2xl
                        overflow-x-auto
                    ">

                        <table className="w-full min-w-[1000px]">

                            <thead>

                            <tr className="
                                    border-b
                                    border-slate-800
                                    text-left
                                    text-slate-400
                                ">

                                <th className="px-6 py-5">
                                    ID
                                </th>

                                <th className="px-6 py-5">
                                    Type
                                </th>

                                <th className="px-6 py-5">
                                    Asset
                                </th>

                                <th className="px-6 py-5">
                                    Quantity
                                </th>

                                <th className="px-6 py-5">
                                    Price
                                </th>

                                <th className="px-6 py-5">
                                    Amount
                                </th>

                                <th className="px-6 py-5">
                                    Date
                                </th>

                            </tr>

                            </thead>

                            <tbody>

                            {transactions.map(
                                (transaction) => {

                                    const cryptoTransaction =
                                        transaction.type === "BUY" ||
                                        transaction.type === "SELL";

                                    return (

                                        <tr
                                            key={transaction.id}
                                            className="
                                                    border-b
                                                    border-slate-800
                                                    last:border-b-0
                                                    hover:bg-slate-800/30
                                                    transition
                                                "
                                        >

                                            {/* ID */}

                                            <td className="
                                                    px-6
                                                    py-6
                                                    text-slate-400
                                                ">
                                                #{transaction.id}
                                            </td>

                                            {/* Type */}

                                            <td className="px-6 py-6">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            border
                                                            text-sm
                                                            font-medium
                                                            ${getTypeClasses(
                                                            transaction.type
                                                        )}
                                                        `}
                                                    >
                                                        {transaction.type}
                                                    </span>

                                            </td>

                                            {/* Asset */}

                                            <td className="px-6 py-6">

                                                {cryptoTransaction ? (

                                                    <div className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        ">

                                                        {transaction.imageUrl && (

                                                            <img
                                                                src={
                                                                    transaction.imageUrl
                                                                }
                                                                alt={
                                                                    transaction.coinName
                                                                }
                                                                className="
                                                                        w-9
                                                                        h-9
                                                                    "
                                                            />

                                                        )}

                                                        <div>

                                                            <p className="font-semibold">
                                                                {transaction.coinName ||
                                                                    transaction.symbol}
                                                            </p>

                                                            <p className="
                                                                    text-sm
                                                                    text-slate-400
                                                                    uppercase
                                                                ">
                                                                {transaction.symbol}
                                                            </p>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <span className="text-slate-400">
                                                            Wallet
                                                        </span>

                                                )}

                                            </td>

                                            {/* Quantity */}

                                            <td className="px-6 py-6">

                                                {cryptoTransaction &&
                                                transaction.quantity != null ? (

                                                    <div>

                                                        <p className="font-medium">
                                                            {formatCryptoQuantity(
                                                                transaction.quantity
                                                            )}
                                                        </p>

                                                        <p className="
                                                                text-xs
                                                                text-slate-500
                                                                uppercase
                                                                mt-1
                                                            ">
                                                            {transaction.symbol}
                                                        </p>

                                                    </div>

                                                ) : (
                                                    <span className="text-slate-500">
                                                            —
                                                        </span>
                                                )}

                                            </td>

                                            {/* Price */}

                                            <td className="px-6 py-6">

                                                {cryptoTransaction &&
                                                transaction.price != null
                                                    ? formatPrice(
                                                        transaction.price
                                                    )
                                                    : (
                                                        <span className="text-slate-500">
                                                                —
                                                            </span>
                                                    )}

                                            </td>

                                            {/* Amount */}

                                            <td className="
                                                    px-6
                                                    py-6
                                                    font-semibold
                                                ">
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </td>

                                            {/* Date */}

                                            <td className="
                                                    px-6
                                                    py-6
                                                    text-slate-400
                                                    whitespace-nowrap
                                                ">
                                                {formatTransactionDate(
                                                    transaction.createdAt
                                                )}
                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </main>

        </div>
    );
}

export default Transactions;