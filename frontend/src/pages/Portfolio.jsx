import { useEffect, useState } from "react";
import {
    getMyPortfolio,
    sellCoin,
} from "../services/portfolioService";

import {
    formatCryptoQuantity,
    formatCurrency,
    formatPrice,
} from "../utils/formatters";

function Portfolio({ onBack }) {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedCoin, setSelectedCoin] = useState(null);
    const [quantity, setQuantity] = useState("");

    const [selling, setSelling] = useState(false);
    const [sellError, setSellError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadPortfolio = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyPortfolio();

            console.log("Portfolio response:", response);

            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            setPortfolio(data);
        } catch (err) {
            console.error("Portfolio error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load portfolio."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortfolio();
    }, []);

    const totalInvestment = portfolio.reduce(
        (total, item) =>
            total + Number(item.totalInvestment || 0),
        0
    );

    const currentValue = portfolio.reduce(
        (total, item) =>
            total + Number(item.currentValue || 0),
        0
    );

    const totalProfitLoss = portfolio.reduce(
        (total, item) =>
            total + Number(item.profitOrLoss || 0),
        0
    );

    const openSellModal = (coin) => {
        setSelectedCoin(coin);
        setQuantity("");
        setSellError("");
        setSuccessMessage("");
    };

    const closeSellModal = () => {
        if (selling) {
            return;
        }

        setSelectedCoin(null);
        setQuantity("");
        setSellError("");
    };

    const handleSellAll = () => {
        if (!selectedCoin) {
            return;
        }

        setQuantity(
            formatCryptoQuantity(selectedCoin.quantity)
        );
    };

    const handleSell = async () => {
        if (!selectedCoin) {
            return;
        }

        const quantityNumber = Number(quantity);
        const availableQuantity = Number(
            selectedCoin.quantity
        );

        if (
            !Number.isFinite(quantityNumber) ||
            quantityNumber <= 0
        ) {
            setSellError(
                "Please enter a valid quantity greater than zero."
            );
            return;
        }

        if (quantityNumber > availableQuantity) {
            setSellError(
                `You only have ${formatCryptoQuantity(
                    availableQuantity
                )} ${selectedCoin.symbol}.`
            );
            return;
        }

        try {
            setSelling(true);
            setSellError("");

            await sellCoin({
                coinId: selectedCoin.coinId,
                quantity: quantityNumber,
            });

            setSelectedCoin(null);
            setQuantity("");

            setSuccessMessage(
                `${formatCryptoQuantity(
                    quantityNumber
                )} ${selectedCoin.symbol} sold successfully.`
            );

            await loadPortfolio();
        } catch (err) {
            console.error("Sell error:", err);

            setSellError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSelling(false);
        }
    };

    const estimatedAmount =
        selectedCoin && quantity
            ? Number(quantity) *
            Number(selectedCoin.currentPrice || 0)
            : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center">
                <p className="text-white text-xl">
                    Loading portfolio...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white">

            {/* Navbar */}

            <nav className="bg-[#0f172a] border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            CryptoX Exchange
                        </h1>

                        <p className="text-slate-400 mt-1">
                            My Portfolio
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
                        My Portfolio
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Track your cryptocurrency holdings and performance.
                    </p>

                </div>

                {successMessage && (
                    <div className="
                        mb-8
                        border
                        border-green-700
                        bg-green-950/30
                        text-green-400
                        rounded-xl
                        px-5
                        py-4
                    ">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="
                        mb-8
                        border
                        border-red-700
                        bg-red-950/30
                        text-red-400
                        rounded-xl
                        px-5
                        py-4
                    ">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    <SummaryCard
                        title="Total Investment"
                        value={formatCurrency(totalInvestment)}
                    />

                    <SummaryCard
                        title="Current Value"
                        value={formatCurrency(currentValue)}
                    />

                    <SummaryCard
                        title="Profit / Loss"
                        value={`${totalProfitLoss >= 0 ? "+" : ""}${formatCurrency(
                            totalProfitLoss
                        )}`}
                        valueClass={
                            totalProfitLoss >= 0
                                ? "text-green-400"
                                : "text-red-400"
                        }
                    />

                </div>

                {/* Portfolio */}

                {portfolio.length === 0 ? (

                    <div className="
                        bg-[#0f172a]
                        border
                        border-slate-800
                        rounded-2xl
                        p-12
                        text-center
                    ">

                        <h3 className="text-xl font-semibold">
                            Your portfolio is empty
                        </h3>

                        <p className="text-slate-400 mt-2">
                            Buy cryptocurrency from the market to start your portfolio.
                        </p>

                    </div>

                ) : (

                    <div className="
                        bg-[#0f172a]
                        border
                        border-slate-800
                        rounded-2xl
                        overflow-x-auto
                    ">

                        <table className="w-full min-w-[1100px]">

                            <thead>

                            <tr className="
                                    border-b
                                    border-slate-800
                                    text-slate-400
                                    text-left
                                ">

                                <th className="px-6 py-5">
                                    Asset
                                </th>

                                <th className="px-6 py-5">
                                    Quantity
                                </th>

                                <th className="px-6 py-5">
                                    Avg. Buy Price
                                </th>

                                <th className="px-6 py-5">
                                    Current Price
                                </th>

                                <th className="px-6 py-5">
                                    Investment
                                </th>

                                <th className="px-6 py-5">
                                    Current Value
                                </th>

                                <th className="px-6 py-5">
                                    Profit / Loss
                                </th>

                                <th className="px-6 py-5">
                                    Action
                                </th>

                            </tr>

                            </thead>

                            <tbody>

                            {portfolio.map((item) => {

                                const profitLoss =
                                    Number(item.profitOrLoss || 0);

                                return (
                                    <tr
                                        key={item.coinId}
                                        className="
                                                border-b
                                                border-slate-800
                                                last:border-b-0
                                                hover:bg-slate-800/30
                                                transition
                                            "
                                    >

                                        {/* Asset */}

                                        <td className="px-6 py-6">

                                            <div className="flex items-center gap-3">

                                                {item.imageUrl && (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.coinName}
                                                        className="w-10 h-10"
                                                    />
                                                )}

                                                <div>

                                                    <p className="font-semibold">
                                                        {item.coinName}
                                                    </p>

                                                    <p className="text-sm text-slate-400 uppercase">
                                                        {item.symbol}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Quantity */}

                                        <td className="px-6 py-6">

                                            <p className="font-medium">
                                                {formatCryptoQuantity(
                                                    item.quantity
                                                )}
                                            </p>

                                            <p className="text-xs text-slate-500 uppercase mt-1">
                                                {item.symbol}
                                            </p>

                                        </td>

                                        <td className="px-6 py-6">
                                            {formatPrice(
                                                item.averageBuyPrice
                                            )}
                                        </td>

                                        <td className="px-6 py-6">
                                            {formatPrice(
                                                item.currentPrice
                                            )}
                                        </td>

                                        <td className="px-6 py-6">
                                            {formatCurrency(
                                                item.totalInvestment
                                            )}
                                        </td>

                                        <td className="px-6 py-6">
                                            {formatCurrency(
                                                item.currentValue
                                            )}
                                        </td>

                                        <td
                                            className={`
                                                    px-6
                                                    py-6
                                                    font-semibold
                                                    ${
                                                profitLoss >= 0
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }
                                                `}
                                        >
                                            {profitLoss >= 0
                                                ? "+"
                                                : ""}

                                            {formatCurrency(
                                                profitLoss
                                            )}
                                        </td>

                                        <td className="px-6 py-6">

                                            <button
                                                onClick={() =>
                                                    openSellModal(item)
                                                }
                                                className="
                                                        bg-red-600
                                                        hover:bg-red-700
                                                        px-5
                                                        py-2.5
                                                        rounded-lg
                                                        font-semibold
                                                        transition
                                                    "
                                            >
                                                Sell
                                            </button>

                                        </td>

                                    </tr>
                                );
                            })}

                            </tbody>

                        </table>

                    </div>
                )}

            </main>

            {/* Sell Modal */}

            {selectedCoin && (

                <div className="
                    fixed
                    inset-0
                    bg-black/70
                    flex
                    items-center
                    justify-center
                    px-4
                    z-50
                ">

                    <div className="
                        w-full
                        max-w-lg
                        bg-[#0f172a]
                        border
                        border-slate-700
                        rounded-2xl
                        p-7
                        shadow-2xl
                    ">

                        <div className="flex justify-between items-start">

                            <div>

                                <p className="text-slate-400 text-sm">
                                    SELL
                                </p>

                                <div className="flex items-center gap-3 mt-3">

                                    {selectedCoin.imageUrl && (
                                        <img
                                            src={selectedCoin.imageUrl}
                                            alt={selectedCoin.coinName}
                                            className="w-11 h-11"
                                        />
                                    )}

                                    <div>

                                        <h3 className="text-2xl font-bold">
                                            {selectedCoin.coinName}
                                        </h3>

                                        <p className="text-slate-400 uppercase">
                                            {selectedCoin.symbol}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <button
                                onClick={closeSellModal}
                                className="
                                    text-slate-400
                                    hover:text-white
                                    text-3xl
                                "
                            >
                                ×
                            </button>

                        </div>

                        {/* Price */}

                        <div className="
                            mt-8
                            bg-slate-800
                            rounded-xl
                            p-5
                        ">

                            <p className="text-slate-400">
                                Current Price
                            </p>

                            <p className="text-2xl font-bold mt-2">
                                {formatPrice(
                                    selectedCoin.currentPrice
                                )}
                            </p>

                        </div>

                        {/* Quantity */}

                        <div className="mt-7">

                            <div className="flex justify-between mb-3">

                                <label>
                                    Quantity
                                </label>

                                <span className="text-slate-400">

                                    Available:{" "}

                                    <span className="text-white font-semibold">
                                        {formatCryptoQuantity(
                                            selectedCoin.quantity
                                        )}{" "}
                                        {selectedCoin.symbol}
                                    </span>

                                </span>

                            </div>

                            <input
                                type="number"
                                step="0.00000001"
                                min="0"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    setSellError("");
                                }}
                                placeholder="0.00000000"
                                className="
                                    w-full
                                    bg-slate-800
                                    border
                                    border-slate-700
                                    rounded-xl
                                    px-5
                                    py-4
                                    text-white
                                    outline-none
                                    focus:border-blue-500
                                "
                            />

                            <div className="text-right mt-3">

                                <button
                                    type="button"
                                    onClick={handleSellAll}
                                    className="
                                        text-blue-400
                                        hover:text-blue-300
                                        font-medium
                                    "
                                >
                                    Sell All
                                </button>

                            </div>

                        </div>

                        {/* Estimated Amount */}

                        <div className="
                            mt-6
                            border-t
                            border-slate-700
                            pt-5
                            flex
                            justify-between
                            items-center
                        ">

                            <span className="text-slate-400">
                                Estimated Amount
                            </span>

                            <span className="text-xl font-bold">
                                {formatCurrency(
                                    estimatedAmount
                                )}
                            </span>

                        </div>

                        {sellError && (

                            <div className="
                                mt-5
                                border
                                border-red-700
                                bg-red-950/30
                                text-red-400
                                rounded-xl
                                p-4
                            ">
                                {sellError}
                            </div>

                        )}

                        <button
                            onClick={handleSell}
                            disabled={selling}
                            className="
                                mt-6
                                w-full
                                bg-red-600
                                hover:bg-red-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                py-4
                                rounded-xl
                                text-lg
                                font-bold
                                transition
                            "
                        >
                            {selling
                                ? "Selling..."
                                : "Confirm Sell"}
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

function SummaryCard({
                         title,
                         value,
                         valueClass = "text-white",
                     }) {
    return (
        <div className="
            bg-[#0f172a]
            border
            border-slate-800
            rounded-2xl
            p-6
        ">

            <p className="text-slate-400">
                {title}
            </p>

            <h3
                className={`
                    text-3xl
                    font-bold
                    mt-4
                    ${valueClass}
                `}
            >
                {value}
            </h3>

        </div>
    );
}

export default Portfolio;