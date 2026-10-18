import { useEffect, useMemo, useState } from "react";
import { getAllCoins } from "../services/coinService";
import { buyCoin, sellCoin } from "../services/portfolioService";
import { getPinStatus } from "../services/pinService";
import TradePinStep from "../components/TradePinStep";

function StepDots({ step }) {
    const steps = [
        { key: "amount", label: "Amount" },
        { key: "pin", label: "PIN" },
    ];

    const activeIndex = step === "amount" ? 0 : 1;

    return (
        <div className="mt-6 flex items-center gap-3 text-sm">
            {steps.map((item, index) => {
                const reached = index <= activeIndex;

                return (
                    <div key={item.key} className="flex items-center gap-3">
                        <span
                            className={`flex items-center gap-2 ${
                                reached ? "text-emerald-400" : "text-slate-500"
                            }`}
                        >
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                    reached
                                        ? "border-emerald-500/60 bg-emerald-500/20"
                                        : "border-slate-700"
                                }`}
                            >
                                {index + 1}
                            </span>
                            {item.label}
                        </span>

                        {index === 0 && (
                            <span className="h-px w-8 bg-slate-700" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function Market({ onBack, onOpenPortfolio }) {
    const [coins, setCoins] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedCoin, setSelectedCoin] = useState(null);
    const [tradeType, setTradeType] = useState(null);
    const [quantity, setQuantity] = useState("");

    const [step, setStep] = useState("amount");
    const [pin, setPin] = useState("");
    const [pinLocked, setPinLocked] = useState(false);
    const [hasPin, setHasPin] = useState(null);

    const [tradeLoading, setTradeLoading] = useState(false);
    const [tradeMessage, setTradeMessage] = useState("");
    const [tradeError, setTradeError] = useState("");

    const fetchCoins = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            setError("");

            const response = await getAllCoins();

            setCoins(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Coins fetch error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load the crypto market."
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
        fetchCoins();
        loadPinStatus();
    }, []);

    // Esc dabane par popup band
    useEffect(() => {
        if (!selectedCoin) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !tradeLoading) {
                setSelectedCoin(null);
                setTradeType(null);
                setQuantity("");
                setPin("");
                setStep("amount");
                setTradeError("");
                setTradeMessage("");
                setPinLocked(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedCoin, tradeLoading]);

    const filteredCoins = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return coins;
        }

        return coins.filter((coin) => {
            const name = coin.name?.toLowerCase() || "";
            const symbol = coin.symbol?.toLowerCase() || "";

            return (
                name.includes(query) ||
                symbol.includes(query)
            );
        });
    }, [coins, search]);

    const formatPrice = (price) => {
        if (price === null || price === undefined) {
            return "-";
        }

        const value = Number(price);

        if (!Number.isFinite(value)) {
            return "-";
        }

        if (value === 0) {
            return "$0.00";
        }

        if (value < 0.00000001) {
            return `$${value.toFixed(12)}`;
        }

        if (value < 0.01) {
            return `$${value.toFixed(8)}`;
        }

        if (value < 1) {
            return `$${value.toFixed(6)}`;
        }

        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const openTrade = (coin, type) => {
        setSelectedCoin(coin);
        setTradeType(type);
        setQuantity("");
        setPin("");
        setStep("amount");
        setPinLocked(false);
        setTradeMessage("");
        setTradeError("");
    };

    const closeTrade = () => {
        if (tradeLoading) {
            return;
        }

        setSelectedCoin(null);
        setTradeType(null);
        setQuantity("");
        setPin("");
        setStep("amount");
        setPinLocked(false);
        setTradeMessage("");
        setTradeError("");
    };

    const handleQuantityChange = (event) => {
        const value = event.target.value;

        if (value === "" || /^\d*\.?\d{0,8}$/.test(value)) {
            setQuantity(value);
            setTradeError("");
        }
    };

    const numericQuantity = useMemo(() => {
        const value = Number(quantity);

        if (!Number.isFinite(value) || value <= 0) {
            return 0;
        }

        return value;
    }, [quantity]);

    const totalTradeValue = useMemo(() => {
        if (!selectedCoin || numericQuantity <= 0) {
            return 0;
        }

        const price = Number(selectedCoin.currentPrice);

        if (!Number.isFinite(price)) {
            return 0;
        }

        return numericQuantity * price;
    }, [numericQuantity, selectedCoin]);

    const isValidQuantity =
        numericQuantity >= 0.00000001;

    const handleQuickQuantity = (value) => {
        setQuantity(value);
        setTradeError("");
    };

    // Step 1 -> Step 2
    const handleContinue = (event) => {
        event.preventDefault();

        if (!selectedCoin) {
            return;
        }

        if (!isValidQuantity) {
            setTradeError(
                "Enter a quantity of at least 0.00000001."
            );
            return;
        }

        const price = Number(selectedCoin.currentPrice);

        if (!Number.isFinite(price) || price <= 0) {
            setTradeError(
                "This coin currently has an invalid market price."
            );
            return;
        }

        setTradeError("");
        setPin("");
        setStep("pin");
    };

    // Step 2: PIN ke saath trade
    const handleConfirmTrade = async () => {
        if (!selectedCoin || pin.length !== 4) {
            return;
        }

        try {
            setTradeLoading(true);
            setTradeError("");

            let response;

            if (tradeType === "buy") {
                response = await buyCoin(
                    selectedCoin.id,
                    numericQuantity,
                    pin
                );
            } else {
                response = await sellCoin({
                    coinId: selectedCoin.id,
                    quantity: numericQuantity,
                    pin,
                });
            }

            setTradeMessage(
                typeof response === "string" && response
                    ? response
                    : tradeType === "buy"
                        ? "Purchase completed successfully."
                        : "Sale completed successfully."
            );

            setPin("");
            setStep("success");

            await fetchCoins(true);
        } catch (err) {
            console.error("Trade error:", err);

            const status = err.response?.status;
            const message = err.response?.data?.message;

            setPin("");

            if (status === 401) {
                setTradeError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            if (status === 423) {
                setPinLocked(true);
                setTradeError(
                    message ||
                    "Transaction PIN is locked. Please try again later."
                );
                return;
            }

            if (message && /not set/i.test(message)) {
                setHasPin(false);
                setTradeError(message);
                return;
            }

            // PIN se jude errors PIN screen par hi dikhao
            if (message && /pin/i.test(message)) {
                setTradeError(message);
                return;
            }

            // Baaki errors (balance, quantity...) amount screen par dikhao
            setStep("amount");
            setTradeError(
                message ||
                (tradeType === "buy"
                    ? "Unable to complete the purchase."
                    : "Unable to complete the sale.")
            );
        } finally {
            setTradeLoading(false);
        }
    };

    const isBuy = tradeType === "buy";

    return (
        <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">

            <style>{`
                @keyframes mkFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes mkPopIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes mkCheck {
                    0% { transform: scale(0.4); opacity: 0; }
                    70% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .mk-fade-in { animation: mkFadeIn 0.25s ease-out both; }
                .mk-pop-in { animation: mkPopIn 0.25s ease-out both; }
                .mk-check { animation: mkCheck 0.45s ease-out both; }
            `}</style>

            {/* Ambient glow background */}
            <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            <nav className="sticky top-0 z-30 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                            CryptoX Exchange
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Crypto Market
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {onOpenPortfolio && (
                            <button
                                type="button"
                                onClick={onOpenPortfolio}
                                className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-2.5 font-semibold transition hover:from-blue-500 hover:to-emerald-400 active:scale-[0.98]"
                            >
                                My Portfolio
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onBack}
                            className="cursor-pointer rounded-xl border border-slate-700 px-5 py-2.5 font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
                        >
                            ← Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Crypto Market
                        </h2>

                        <p className="mt-3 max-w-xl text-slate-400">
                            Explore cryptocurrencies and buy or sell
                            assets using your CryptoX wallet.
                        </p>
                    </div>

                    <div className="w-full md:w-96">
                        <label
                            htmlFor="coinSearch"
                            className="mb-2 block text-sm font-medium text-slate-400"
                        >
                            Search market
                        </label>

                        <div className="relative">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>

                            <input
                                id="coinSearch"
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search Bitcoin, BTC..."
                                autoComplete="off"
                                className="w-full rounded-xl border border-slate-700 bg-[#0f172a] py-3 pl-12 pr-11 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-xl text-slate-500 transition hover:text-white"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />

                        <p className="mt-5 text-slate-400">
                            Loading crypto market...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-7">
                        <h3 className="font-semibold text-red-400">
                            Market unavailable
                        </h3>

                        <p className="mt-2 text-sm text-red-300">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => fetchCoins()}
                            className="mt-5 cursor-pointer rounded-lg bg-red-500/20 px-5 py-2.5 font-medium text-red-300 transition hover:bg-red-500/30"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && filteredCoins.length > 0 && (
                    <>
                        <div className="mt-8 flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                {filteredCoins.length}{" "}
                                {filteredCoins.length === 1
                                    ? "asset"
                                    : "assets"}
                            </p>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredCoins.map((coin) => (
                                <div
                                    key={coin.id}
                                    className="group rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-700/20 to-emerald-500/20 p-[1px] transition duration-200 hover:-translate-y-1 hover:from-blue-500/40 hover:to-emerald-500/40 hover:shadow-2xl hover:shadow-black/30"
                                >
                                    <div className="h-full rounded-2xl bg-[#0f172a] p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-4">
                                                {coin.imageUrl ? (
                                                    <img
                                                        src={coin.imageUrl}
                                                        alt={coin.name}
                                                        className="h-12 w-12 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold">
                                                        {coin.symbol
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                            "C"}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <h3 className="truncate text-lg font-semibold">
                                                        {coin.name}
                                                    </h3>

                                                    <p className="mt-0.5 text-sm font-medium uppercase text-slate-400">
                                                        {coin.symbol}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <p className="text-sm text-slate-400">
                                                Current Price
                                            </p>

                                            <p className="mt-2 break-words text-3xl font-bold tracking-tight">
                                                {formatPrice(
                                                    coin.currentPrice
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-7 grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openTrade(
                                                        coin,
                                                        "buy"
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl bg-emerald-600 py-3 font-semibold transition hover:bg-emerald-500 active:scale-[0.98]"
                                            >
                                                Buy
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openTrade(
                                                        coin,
                                                        "sell"
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl bg-red-600 py-3 font-semibold transition hover:bg-red-500 active:scale-[0.98]"
                                            >
                                                Sell
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && !error && filteredCoins.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-slate-800 bg-[#0f172a] px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                            ⌕
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                            No coins found
                        </h3>

                        <p className="mt-2 text-slate-400">
                            Try searching with a different name or
                            symbol.
                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="mt-5 cursor-pointer text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Trade modal */}
            {selectedCoin && (
                <div
                    className="mk-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeTrade();
                        }
                    }}
                >
                    <div
                        className={`mk-pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-gradient-to-br p-[1px] ${
                            isBuy
                                ? "from-emerald-500/50 via-slate-700/40 to-blue-500/40"
                                : "from-red-500/50 via-slate-700/40 to-blue-500/40"
                        }`}
                    >
                        <div className="rounded-2xl bg-[#0f172a] p-6 md:p-8">

                            {/* Header */}
                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <p
                                        className={`text-sm font-semibold uppercase tracking-wide ${
                                            isBuy
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {isBuy
                                            ? "Buy Asset"
                                            : "Sell Asset"}
                                    </p>

                                    <div className="mt-4 flex items-center gap-4">
                                        {selectedCoin.imageUrl ? (
                                            <img
                                                src={selectedCoin.imageUrl}
                                                alt={selectedCoin.name}
                                                className="h-12 w-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-bold">
                                                {selectedCoin.symbol
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                    "C"}
                                            </div>
                                        )}

                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {selectedCoin.name}
                                            </h2>

                                            <p className="mt-0.5 uppercase text-slate-400">
                                                {selectedCoin.symbol}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeTrade}
                                    disabled={tradeLoading}
                                    aria-label="Close"
                                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed"
                                >
                                    ×
                                </button>
                            </div>

                            {step !== "success" && (
                                <StepDots step={step} />
                            )}

                            {/* Step 1: Amount */}
                            {step === "amount" && (
                                <form
                                    onSubmit={handleContinue}
                                    className="mt-7"
                                >
                                    <div className="rounded-2xl border border-slate-700/70 bg-slate-800/80 p-5">
                                        <p className="text-sm text-slate-400">
                                            Current Price
                                        </p>

                                        <p className="mt-2 text-2xl font-bold">
                                            {formatPrice(
                                                selectedCoin.currentPrice
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-7 flex items-center justify-between">
                                        <label
                                            htmlFor="quantity"
                                            className="font-medium text-slate-300"
                                        >
                                            Quantity
                                        </label>

                                        <span className="text-xs uppercase text-slate-500">
                                            {selectedCoin.symbol}
                                        </span>
                                    </div>

                                    <div className="relative mt-2">
                                        <input
                                            id="quantity"
                                            type="text"
                                            inputMode="decimal"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            placeholder="0.00000000"
                                            autoComplete="off"
                                            required
                                            autoFocus
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-4 pr-20 text-lg outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold uppercase text-slate-400">
                                            {selectedCoin.symbol}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Minimum quantity: 0.00000001
                                    </p>

                                    <div className="mt-4 grid grid-cols-4 gap-2">
                                        {[
                                            "0.0001",
                                            "0.001",
                                            "0.01",
                                            "0.1",
                                        ].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() =>
                                                    handleQuickQuantity(
                                                        value
                                                    )
                                                }
                                                className={`cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition ${
                                                    quantity === value
                                                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                                                        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500 hover:text-white"
                                                }`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-7 border-t border-slate-700 pt-6">
                                        <div className="flex items-start justify-between gap-5">
                                            <div>
                                                <p className="text-slate-400">
                                                    {isBuy
                                                        ? "Estimated Cost"
                                                        : "Estimated Proceeds"}
                                                </p>

                                                {numericQuantity > 0 && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {quantity}{" "}
                                                        {selectedCoin.symbol?.toUpperCase()}
                                                    </p>
                                                )}
                                            </div>

                                            <p className="break-all text-right text-xl font-bold">
                                                {formatPrice(
                                                    totalTradeValue
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {tradeError && (
                                        <div
                                            role="alert"
                                            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                                        >
                                            <p className="text-sm text-red-400">
                                                {tradeError}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!isValidQuantity}
                                        className={`mt-6 flex w-full cursor-pointer items-center justify-center rounded-xl py-4 text-lg font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
                                            isBuy
                                                ? "bg-emerald-600 hover:bg-emerald-500"
                                                : "bg-red-600 hover:bg-red-500"
                                        }`}
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
                                        type={tradeType}
                                        coin={selectedCoin}
                                        quantityText={quantity}
                                        totalText={formatPrice(
                                            totalTradeValue
                                        )}
                                        pin={pin}
                                        onPinChange={setPin}
                                        hasPin={hasPin}
                                        loading={tradeLoading}
                                        error={tradeError}
                                        locked={pinLocked}
                                        onBack={() => {
                                            setStep("amount");
                                            setPin("");
                                            setTradeError("");
                                        }}
                                        onConfirm={handleConfirmTrade}
                                    />
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {step === "success" && (
                                <div className="mt-8 flex flex-col items-center text-center">
                                    <div className="mk-check flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/15 text-emerald-400">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="h-10 w-10"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>

                                    <h3 className="mt-6 text-2xl font-bold">
                                        {tradeMessage}
                                    </h3>

                                    <p className="mt-2 text-slate-400">
                                        {isBuy ? "Bought" : "Sold"}{" "}
                                        {quantity}{" "}
                                        <span className="uppercase">
                                            {selectedCoin.symbol}
                                        </span>{" "}
                                        for about{" "}
                                        {formatPrice(totalTradeValue)}.
                                    </p>

                                    <div
                                        className={`mt-8 grid w-full gap-3 ${
                                            onOpenPortfolio
                                                ? "grid-cols-2"
                                                : "grid-cols-1"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={closeTrade}
                                            className="cursor-pointer rounded-xl border border-slate-700 py-4 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                        >
                                            Done
                                        </button>

                                        {onOpenPortfolio && (
                                            <button
                                                type="button"
                                                onClick={onOpenPortfolio}
                                                className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 py-4 font-semibold transition hover:from-blue-500 hover:to-emerald-400"
                                            >
                                                View Portfolio
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Market;