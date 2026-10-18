import { useEffect, useState } from "react";
import {
    getMyPortfolio,
    sellCoin,
} from "../services/portfolioService";
import { getPinStatus } from "../services/pinService";
import TradePinStep from "../components/TradePinStep";

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

    const [step, setStep] = useState("amount");
    const [pin, setPin] = useState("");
    const [pinLocked, setPinLocked] = useState(false);
    const [hasPin, setHasPin] = useState(null);

    const [selling, setSelling] = useState(false);
    const [sellError, setSellError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadPortfolio = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            setError("");

            const response = await getMyPortfolio();

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

    const loadPinStatus = async () => {
        try {
            const response = await getPinStatus();
            setHasPin(Boolean(response?.data?.hasTransactionPin));
        } catch (err) {
            // Status na mile toh trade block nahi karenge, backend khud check karega
            console.error("PIN status fetch error:", err);
        }
    };

    useEffect(() => {
        loadPortfolio();
        loadPinStatus();
    }, []);

    // Success message 6 second baad khud hat jaye
    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }

        const timer = setTimeout(() => setSuccessMessage(""), 6000);
        return () => clearTimeout(timer);
    }, [successMessage]);

    // Esc dabane par popup band
    useEffect(() => {
        if (!selectedCoin) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !selling) {
                setSelectedCoin(null);
                setQuantity("");
                setPin("");
                setStep("amount");
                setSellError("");
                setPinLocked(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedCoin, selling]);

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
        setPin("");
        setStep("amount");
        setPinLocked(false);
        setSellError("");
        setSuccessMessage("");
    };

    const closeSellModal = () => {
        if (selling) {
            return;
        }

        setSelectedCoin(null);
        setQuantity("");
        setPin("");
        setStep("amount");
        setPinLocked(false);
        setSellError("");
    };

    const handleSellAll = () => {
        if (!selectedCoin) {
            return;
        }

        setQuantity(
            formatCryptoQuantity(selectedCoin.quantity)
        );
        setSellError("");
    };

    // Step 1 -> Step 2
    const handleContinue = (event) => {
        event.preventDefault();

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

        setSellError("");
        setPin("");
        setStep("pin");
    };

    // Step 2: PIN ke saath sell
    const handleConfirmSell = async () => {
        if (!selectedCoin || pin.length !== 4) {
            return;
        }

        const quantityNumber = Number(quantity);
        const soldSymbol = selectedCoin.symbol;

        try {
            setSelling(true);
            setSellError("");

            await sellCoin({
                coinId: selectedCoin.coinId,
                quantity: quantityNumber,
                pin,
            });

            setSelectedCoin(null);
            setQuantity("");
            setPin("");
            setStep("amount");
            setPinLocked(false);

            setSuccessMessage(
                `${formatCryptoQuantity(
                    quantityNumber
                )} ${soldSymbol} sold successfully.`
            );

            await loadPortfolio(true);
        } catch (err) {
            console.error("Sell error:", err);

            const status = err.response?.status;
            const message = err.response?.data?.message;

            setPin("");

            if (status === 401) {
                setSellError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            if (status === 423) {
                setPinLocked(true);
                setSellError(
                    message ||
                    "Transaction PIN is locked. Please try again later."
                );
                return;
            }

            if (message && /not set/i.test(message)) {
                setHasPin(false);
                setSellError(message);
                return;
            }

            // PIN se jude errors PIN screen par hi dikhao
            if (message && /pin/i.test(message)) {
                setSellError(message);
                return;
            }

            // Baaki errors amount screen par dikhao
            setStep("amount");
            setSellError(
                message ||
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
            <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />

                    <p className="mt-5 text-slate-400">
                        Loading portfolio...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">

            <style>{`
                @keyframes pfFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pfPopIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes pfFadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pf-fade-in { animation: pfFadeIn 0.25s ease-out both; }
                .pf-pop-in { animation: pfPopIn 0.25s ease-out both; }
                .pf-fade-up { animation: pfFadeUp 0.35s ease-out both; }
            `}</style>

            {/* Ambient glow background */}
            <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Navbar */}
            <nav className="relative border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-2xl font-bold text-transparent">
                            CryptoX Exchange
                        </h1>

                        <p className="mt-1 text-slate-400">
                            My Portfolio
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onBack}
                        className="cursor-pointer rounded-xl border border-slate-700 px-5 py-3 transition hover:border-slate-600 hover:bg-slate-800"
                    >
                        ← Dashboard
                    </button>
                </div>
            </nav>

            <main className="relative mx-auto max-w-7xl px-6 py-10">

                <div className="pf-fade-up mb-10">
                    <h2 className="text-3xl font-bold">
                        My Portfolio
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Track your cryptocurrency holdings and performance.
                    </p>
                </div>

                {successMessage && (
                    <div
                        role="alert"
                        className="pf-fade-up mb-8 flex items-start justify-between gap-4 rounded-xl border border-emerald-700 bg-emerald-950/40 px-5 py-4 text-emerald-400"
                    >
                        <span>{successMessage}</span>

                        <button
                            type="button"
                            onClick={() => setSuccessMessage("")}
                            aria-label="Dismiss message"
                            className="cursor-pointer text-xl leading-none opacity-70 transition hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-8 rounded-xl border border-red-700 bg-red-950/30 px-5 py-4 text-red-400"
                    >
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                    <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                            ◎
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                            Your portfolio is empty
                        </h3>

                        <p className="mt-2 text-slate-400">
                            Buy cryptocurrency from the market to start your portfolio.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-700/20 to-emerald-500/20 p-[1px]">
                        <div className="overflow-x-auto rounded-2xl bg-[#0f172a]">
                            <table className="w-full min-w-[1100px]">
                                <thead>
                                <tr className="border-b border-slate-800 text-left text-slate-400">
                                    <th className="px-6 py-5">Asset</th>
                                    <th className="px-6 py-5">Quantity</th>
                                    <th className="px-6 py-5">Avg. Buy Price</th>
                                    <th className="px-6 py-5">Current Price</th>
                                    <th className="px-6 py-5">Investment</th>
                                    <th className="px-6 py-5">Current Value</th>
                                    <th className="px-6 py-5">Profit / Loss</th>
                                    <th className="px-6 py-5">Action</th>
                                </tr>
                                </thead>

                                <tbody>
                                {portfolio.map((item) => {
                                    const profitLoss =
                                        Number(item.profitOrLoss || 0);

                                    return (
                                        <tr
                                            key={item.coinId}
                                            className="border-b border-slate-800 transition last:border-b-0 hover:bg-slate-800/30"
                                        >
                                            {/* Asset */}
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    {item.imageUrl && (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.coinName}
                                                            className="h-10 w-10 rounded-full"
                                                        />
                                                    )}

                                                    <div>
                                                        <p className="font-semibold">
                                                            {item.coinName}
                                                        </p>

                                                        <p className="text-sm uppercase text-slate-400">
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

                                                <p className="mt-1 text-xs uppercase text-slate-500">
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
                                                className={`px-6 py-6 font-semibold ${
                                                    profitLoss >= 0
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {profitLoss >= 0 ? "+" : ""}
                                                {formatCurrency(profitLoss)}
                                            </td>

                                            <td className="px-6 py-6">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openSellModal(item)
                                                    }
                                                    className="cursor-pointer rounded-lg bg-red-600 px-5 py-2.5 font-semibold transition hover:bg-red-500 active:scale-[0.97]"
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
                    </div>
                )}
            </main>

            {/* Sell Modal */}
            {selectedCoin && (
                <div
                    className="pf-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeSellModal();
                        }
                    }}
                >
                    <div className="pf-pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-gradient-to-br from-red-500/50 via-slate-700/40 to-blue-500/40 p-[1px]">
                        <div className="rounded-2xl bg-[#0f172a] p-7">

                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-red-400">
                                        Sell Asset
                                    </p>

                                    <div className="mt-3 flex items-center gap-3">
                                        {selectedCoin.imageUrl && (
                                            <img
                                                src={selectedCoin.imageUrl}
                                                alt={selectedCoin.coinName}
                                                className="h-11 w-11 rounded-full"
                                            />
                                        )}

                                        <div>
                                            <h3 className="text-2xl font-bold">
                                                {selectedCoin.coinName}
                                            </h3>

                                            <p className="uppercase text-slate-400">
                                                {selectedCoin.symbol}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeSellModal}
                                    disabled={selling}
                                    aria-label="Close"
                                    className="cursor-pointer text-3xl leading-none text-slate-400 transition hover:text-white disabled:cursor-not-allowed"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Step dots */}
                            <div className="mt-6 flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-2 text-emerald-400">
                                    <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                            "border-emerald-500/60 bg-emerald-500/20"
                                        }`}
                                    >
                                        1
                                    </span>
                                    Amount
                                </span>

                                <span className="h-px w-8 bg-slate-700" />

                                <span
                                    className={`flex items-center gap-2 ${
                                        step === "pin"
                                            ? "text-emerald-400"
                                            : "text-slate-500"
                                    }`}
                                >
                                    <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                            step === "pin"
                                                ? "border-emerald-500/60 bg-emerald-500/20"
                                                : "border-slate-700"
                                        }`}
                                    >
                                        2
                                    </span>
                                    PIN
                                </span>
                            </div>

                            {/* Step 1: Amount */}
                            {step === "amount" && (
                                <form
                                    onSubmit={handleContinue}
                                    className="mt-7"
                                >
                                    <div className="rounded-xl bg-slate-800 p-5">
                                        <p className="text-slate-400">
                                            Current Price
                                        </p>

                                        <p className="mt-2 text-2xl font-bold">
                                            {formatPrice(
                                                selectedCoin.currentPrice
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-7">
                                        <div className="mb-3 flex justify-between">
                                            <label htmlFor="sellQuantity">
                                                Quantity
                                            </label>

                                            <span className="text-slate-400">
                                                Available:{" "}
                                                <span className="font-semibold text-white">
                                                    {formatCryptoQuantity(
                                                        selectedCoin.quantity
                                                    )}{" "}
                                                    {selectedCoin.symbol}
                                                </span>
                                            </span>
                                        </div>

                                        <input
                                            id="sellQuantity"
                                            type="number"
                                            step="0.00000001"
                                            min="0"
                                            value={quantity}
                                            onChange={(e) => {
                                                setQuantity(e.target.value);
                                                setSellError("");
                                            }}
                                            placeholder="0.00000000"
                                            autoFocus
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />

                                        <div className="mt-3 text-right">
                                            <button
                                                type="button"
                                                onClick={handleSellAll}
                                                className="cursor-pointer font-medium text-emerald-400 transition hover:text-emerald-300"
                                            >
                                                Sell All
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-5">
                                        <span className="text-slate-400">
                                            Estimated Proceeds
                                        </span>

                                        <span className="text-xl font-bold">
                                            {formatCurrency(
                                                estimatedAmount
                                            )}
                                        </span>
                                    </div>

                                    {sellError && (
                                        <div
                                            role="alert"
                                            className="mt-5 rounded-xl border border-red-700 bg-red-950/30 p-4 text-red-400"
                                        >
                                            {sellError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!quantity}
                                        className="mt-6 w-full cursor-pointer rounded-xl bg-red-600 py-4 text-lg font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Continue
                                    </button>

                                    <p className="mt-4 text-center text-xs text-slate-500">
                                        You will confirm with your Transaction PIN in the next step.
                                    </p>
                                </form>
                            )}

                            {/* Step 2: PIN */}
                            {step === "pin" && (
                                <div className="mt-7">
                                    <TradePinStep
                                        type="sell"
                                        coin={{
                                            name: selectedCoin.coinName,
                                            symbol: selectedCoin.symbol,
                                            imageUrl: selectedCoin.imageUrl,
                                        }}
                                        quantityText={quantity}
                                        totalText={formatCurrency(
                                            estimatedAmount
                                        )}
                                        pin={pin}
                                        onPinChange={setPin}
                                        hasPin={hasPin}
                                        loading={selling}
                                        error={sellError}
                                        locked={pinLocked}
                                        onBack={() => {
                                            setStep("amount");
                                            setPin("");
                                            setSellError("");
                                        }}
                                        onConfirm={handleConfirmSell}
                                    />
                                </div>
                            )}
                        </div>
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
        <div className="pf-fade-up rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-700/20 to-emerald-500/20 p-[1px] transition duration-200 hover:-translate-y-0.5 hover:from-blue-500/40 hover:to-emerald-500/40">
            <div className="h-full rounded-2xl bg-[#0f172a] p-6">
                <p className="text-slate-400">{title}</p>

                <h3
                    className={`mt-4 break-words text-3xl font-bold ${valueClass}`}
                >
                    {value}
                </h3>
            </div>
        </div>
    );
}

export default Portfolio;