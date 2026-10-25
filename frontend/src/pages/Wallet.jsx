import { useEffect, useState } from "react";
import {
    depositMoney,
    getMyWallet,
    withdrawMoney,
} from "../services/walletService";
import { getMyProfile } from "../services/userService";
import { getPinStatus } from "../services/pinService";
import DigitInput from "../components/DigitInput";

const formatUsd = (value) =>
    Number(value ?? 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const extractMessage = (err, fallback) => {
    const body = err.response?.data;

    // Validation errors: { message: "Validation Failed", data: { field: "msg" } }
    if (body?.data && typeof body.data === "object") {
        const first = Object.values(body.data)[0];

        if (first) {
            return String(first);
        }
    }

    return body?.message || fallback;
};

function StatusChip({ label, state, okText, badText }) {
    const styles =
        state === true
            ? "border-emerald-800/60 bg-emerald-950/60 text-emerald-400"
            : state === false
                ? "border-amber-700/60 bg-amber-950/40 text-amber-300"
                : "border-slate-700 bg-slate-800/60 text-slate-400";

    const text =
        state === null ? "Checking..." : state ? okText : badText;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
        >
            <span className="text-slate-400">{label}:</span>
            {text}
        </span>
    );
}

function Wallet({ onBack }) {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [depositLoading, setDepositLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);
    const [hasPin, setHasPin] = useState(null);

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [wStep, setWStep] = useState("verify");
    const [pin, setPin] = useState("");
    const [code, setCode] = useState("");
    const [wLoading, setWLoading] = useState(false);
    const [wError, setWError] = useState("");
    const [wLocked, setWLocked] = useState(false);
    const [pinFocus, setPinFocus] = useState(0);
    const [codeFocus, setCodeFocus] = useState(0);
    const [withdrawnAmount, setWithdrawnAmount] = useState(0);

    /* ----- Data loading ----- */

    const fetchWallet = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await getMyWallet();

            setWallet(response.data);
        } catch (err) {
            console.error("Wallet fetch error:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load wallet."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const loadSecurityStatus = async () => {
        const [profileResult, pinResult] = await Promise.allSettled([
            getMyProfile(),
            getPinStatus(),
        ]);

        if (profileResult.status === "fulfilled") {
            setTwoFactorEnabled(
                Boolean(profileResult.value?.data?.twoFactorEnabled)
            );
        }

        if (pinResult.status === "fulfilled") {
            setHasPin(
                Boolean(pinResult.value?.data?.hasTransactionPin)
            );
        }
    };

    useEffect(() => {
        fetchWallet();
        loadSecurityStatus();
    }, []);

    // Success message 5 second baad khud hat jaye
    useEffect(() => {
        if (!message) {
            return undefined;
        }

        const timer = setTimeout(() => setMessage(""), 5000);
        return () => clearTimeout(timer);
    }, [message]);

    // Withdraw popup: Esc se band karo
    useEffect(() => {
        if (!showWithdrawModal) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !wLoading) {
                closeWithdrawModal();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showWithdrawModal, wLoading]);

    /* ----- Deposit ----- */

    const handleDeposit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const amount = Number(depositAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Please enter a valid deposit amount.");
            return;
        }

        try {
            setDepositLoading(true);

            const response = await depositMoney(amount);

            setWallet(response.data);
            setMessage(
                response.message || "Amount deposited successfully."
            );
            setDepositAmount("");
        } catch (err) {
            console.error("Deposit error:", err);

            setError(
                extractMessage(err, "Deposit failed. Please try again.")
            );
        } finally {
            setDepositLoading(false);
        }
    };

    /* ----- Withdraw ----- */

    const resetWithdrawModal = () => {
        setShowWithdrawModal(false);
        setWStep("verify");
        setPin("");
        setCode("");
        setWError("");
        setWLocked(false);
    };

    const closeWithdrawModal = () => {
        if (wLoading) {
            return;
        }

        resetWithdrawModal();
    };

    const handleMaxWithdraw = () => {
        const balance = Number(wallet?.balance ?? 0);
        const max = Math.floor(balance * 100) / 100;

        setWithdrawAmount(max > 0 ? max.toFixed(2) : "");
        setError("");
    };

    // Step 1: amount check karke popup kholo
    const handleOpenWithdraw = (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const amount = Number(withdrawAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Please enter a valid withdrawal amount.");
            return;
        }

        if (amount > Number(wallet?.balance ?? 0)) {
            setError("Insufficient wallet balance.");
            return;
        }

        setPin("");
        setCode("");
        setWError("");
        setWLocked(false);
        setWStep("verify");
        setShowWithdrawModal(true);
    };

    const wBlocked =
        wLocked || twoFactorEnabled === false || hasPin === false;

    const canConfirm =
        pin.length === 4 && code.length === 6 && !wLoading && !wBlocked;

    // Step 2: PIN + code ke saath withdraw
    const handleConfirmWithdraw = async (event) => {
        event.preventDefault();

        if (!canConfirm) {
            return;
        }

        const amount = Number(withdrawAmount);

        try {
            setWLoading(true);
            setWError("");

            const response = await withdrawMoney(amount, pin, code);

            if (response?.data) {
                setWallet(response.data);
            }

            setWithdrawnAmount(amount);
            setWithdrawAmount("");
            setPin("");
            setCode("");
            setWStep("success");
        } catch (err) {
            console.error("Withdraw error:", err);

            const status = err.response?.status;
            const text = extractMessage(
                err,
                "Withdrawal failed. Please try again."
            );

            if (status === 401) {
                setWError("Your session has expired. Please login again.");
                return;
            }

            if (status === 423) {
                setWLocked(true);
                setWError(text);
                setPin("");
                setCode("");
                return;
            }

            if (/two-factor/i.test(text)) {
                setTwoFactorEnabled(false);
                setWError(text);
                return;
            }

            if (/not set/i.test(text)) {
                setHasPin(false);
                setWError(text);
                return;
            }

            if (/insufficient/i.test(text)) {
                resetWithdrawModal();
                setError(text);
                fetchWallet(true);
                return;
            }

            if (/authenticator|code/i.test(text)) {
                setWError(text);
                setCode("");
                setCodeFocus((value) => value + 1);
                return;
            }

            if (/pin/i.test(text)) {
                setWError(text);
                setPin("");
                setPinFocus((value) => value + 1);
                return;
            }

            setWError(text);
        } finally {
            setWLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

    /* ----- Loading ----- */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />

                    <p className="mt-5 text-slate-400">
                        Loading wallet...
                    </p>
                </div>
            </div>
        );
    }

    /* ----- UI ----- */

    return (
        <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">

            <style>{`
                @keyframes wlFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes wlPopIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes wlFadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes wlCheck {
                    0% { transform: scale(0.4); opacity: 0; }
                    70% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .wl-fade-in { animation: wlFadeIn 0.25s ease-out both; }
                .wl-pop-in { animation: wlPopIn 0.25s ease-out both; }
                .wl-fade-up { animation: wlFadeUp 0.35s ease-out both; }
                .wl-check { animation: wlCheck 0.45s ease-out both; }
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

                        <p className="mt-1 text-sm text-slate-400">
                            Wallet
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onBack}
                        className="cursor-pointer rounded-xl border border-slate-700 px-5 py-2.5 text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                    >
                        ← Dashboard
                    </button>
                </div>
            </nav>

            <main className="relative mx-auto max-w-7xl px-6 py-10">

                <div className="wl-fade-up mb-8">
                    <h2 className="text-3xl font-bold">My Wallet</h2>

                    <p className="mt-2 text-slate-400">
                        Manage your CryptoX wallet balance.
                    </p>
                </div>

                {/* Balance */}
                <div className="wl-fade-up mb-8 rounded-2xl bg-gradient-to-br from-blue-500/30 via-slate-700/30 to-emerald-500/30 p-[1px]">
                    <div className="rounded-2xl bg-[#0f172a] p-8">
                        <p className="text-slate-400">
                            Available Balance
                        </p>

                        <h3 className="mt-3 break-all bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-5xl font-bold text-transparent">
                            {formatUsd(wallet?.balance)}
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
                </div>

                {message && (
                    <div
                        role="alert"
                        className="wl-fade-up mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-700 bg-emerald-950/40 px-5 py-4 text-emerald-400"
                    >
                        <span>{message}</span>

                        <button
                            type="button"
                            onClick={() => setMessage("")}
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
                        className="wl-fade-up mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-800 bg-red-950/40 px-5 py-4 text-red-400"
                    >
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss message"
                            className="cursor-pointer text-xl leading-none opacity-70 transition hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Deposit + Withdraw */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Deposit */}
                    <div className="wl-fade-up rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-700/20 to-blue-500/20 p-[1px]">
                        <div className="h-full rounded-2xl bg-[#0f172a] p-7">
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
                                        Amount (USD)
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
                                        className={inputClass}
                                    />

                                    <div className="mt-3 grid grid-cols-4 gap-2">
                                        {["100", "500", "1000", "5000"].map(
                                            (value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() =>
                                                        setDepositAmount(value)
                                                    }
                                                    className={`cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition ${
                                                        depositAmount === value
                                                            ? "border-emerald-500 bg-emerald-500/10 text-white"
                                                            : "border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500 hover:text-white"
                                                    }`}
                                                >
                                                    ${value}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={depositLoading}
                                    className="w-full cursor-pointer rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {depositLoading
                                        ? "Depositing..."
                                        : "Deposit Funds"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Withdraw */}
                    <div className="wl-fade-up rounded-2xl bg-gradient-to-br from-red-500/20 via-slate-700/20 to-blue-500/20 p-[1px]">
                        <div className="h-full rounded-2xl bg-[#0f172a] p-7">
                            <h3 className="text-2xl font-bold">
                                Withdraw
                            </h3>

                            <p className="mt-2 text-sm text-slate-400">
                                Withdrawals need your Transaction PIN and a
                                code from your authenticator app.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <StatusChip
                                    label="2FA"
                                    state={twoFactorEnabled}
                                    okText="Enabled"
                                    badText="Required"
                                />

                                <StatusChip
                                    label="PIN"
                                    state={hasPin}
                                    okText="Set"
                                    badText="Not set"
                                />
                            </div>

                            <form
                                onSubmit={handleOpenWithdraw}
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="withdrawAmount"
                                            className="text-sm text-slate-300"
                                        >
                                            Amount (USD)
                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleMaxWithdraw}
                                            className="cursor-pointer text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                                        >
                                            Max
                                        </button>
                                    </div>

                                    <input
                                        id="withdrawAmount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={withdrawAmount}
                                        onChange={(event) => {
                                            setWithdrawAmount(
                                                event.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="50.00"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full cursor-pointer rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500"
                                >
                                    Continue
                                </button>

                                <p className="text-center text-xs text-slate-500">
                                    You will confirm with your PIN and
                                    authenticator code in the next step.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Withdraw modal */}
            {showWithdrawModal && (
                <div
                    className="wl-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="withdraw-title"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeWithdrawModal();
                        }
                    }}
                >
                    <div className="wl-pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-gradient-to-br from-red-500/50 via-slate-700/40 to-blue-500/40 p-[1px]">
                        <div className="rounded-2xl bg-[#0f172a] p-6 md:p-8">

                            {wStep === "verify" && (
                                <form onSubmit={handleConfirmWithdraw}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-wide text-red-400">
                                                Withdraw Funds
                                            </p>

                                            <h3
                                                id="withdraw-title"
                                                className="mt-2 text-2xl font-bold"
                                            >
                                                Confirm withdrawal
                                            </h3>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={closeWithdrawModal}
                                            disabled={wLoading}
                                            aria-label="Close"
                                            className="cursor-pointer text-3xl leading-none text-slate-400 transition hover:text-white disabled:cursor-not-allowed"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-800/60 p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-slate-400">
                                                You withdraw
                                            </span>

                                            <span className="text-2xl font-bold">
                                                {formatUsd(withdrawAmount)}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-700 pt-3 text-sm">
                                            <span className="text-slate-400">
                                                Balance after
                                            </span>

                                            <span className="font-semibold">
                                                {formatUsd(
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            wallet?.balance ?? 0
                                                        ) -
                                                        Number(
                                                            withdrawAmount || 0
                                                        )
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {twoFactorEnabled === false && (
                                        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                                            Withdrawals need two-factor
                                            authentication. Enable it from{" "}
                                            <span className="font-semibold">
                                                Dashboard → Profile →
                                                Two-Factor Authentication
                                            </span>
                                            , then come back.
                                        </div>
                                    )}

                                    {hasPin === false && (
                                        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                                            You have not set a Transaction PIN
                                            yet. Set one from{" "}
                                            <span className="font-semibold">
                                                Dashboard → Profile →
                                                Transaction PIN
                                            </span>
                                            , then come back.
                                        </div>
                                    )}

                                    {/* PIN */}
                                    <div className="mt-6">
                                        <label className="mb-3 block text-sm font-medium tracking-wide text-slate-300">
                                            TRANSACTION PIN
                                        </label>

                                        <DigitInput
                                            value={pin}
                                            onChange={(value) => {
                                                setPin(value);
                                                setWError("");
                                            }}
                                            length={4}
                                            mask
                                            label="PIN digit"
                                            autoFocus
                                            focusKey={pinFocus}
                                            disabled={wLoading || wBlocked}
                                            onComplete={() =>
                                                setCodeFocus(
                                                    (value) => value + 1
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Authenticator code */}
                                    <div className="mt-6">
                                        <label className="mb-3 block text-sm font-medium tracking-wide text-slate-300">
                                            AUTHENTICATOR CODE (6 DIGITS)
                                        </label>

                                        <DigitInput
                                            value={code}
                                            onChange={(value) => {
                                                setCode(value);
                                                setWError("");
                                            }}
                                            length={6}
                                            label="Code digit"
                                            focusKey={codeFocus}
                                            disabled={wLoading || wBlocked}
                                        />

                                        <p className="mt-2 text-xs text-slate-500">
                                            Open Google Authenticator and enter
                                            the current code for CryptoX
                                            Exchange. It changes every 30
                                            seconds.
                                        </p>
                                    </div>

                                    {wError && (
                                        <div
                                            role="alert"
                                            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
                                        >
                                            {wError}
                                        </div>
                                    )}

                                    <div className="mt-7 grid grid-cols-[auto_1fr] gap-3">
                                        <button
                                            type="button"
                                            onClick={closeWithdrawModal}
                                            disabled={wLoading}
                                            className="cursor-pointer rounded-xl border border-slate-700 px-6 py-4 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={!canConfirm}
                                            className="cursor-pointer rounded-xl bg-red-600 py-4 text-lg font-semibold text-white transition hover:bg-red-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {wLoading
                                                ? "Processing..."
                                                : "Confirm Withdrawal"}
                                        </button>
                                    </div>

                                    <p className="mt-4 text-center text-xs text-slate-500">
                                        5 wrong codes or PINs will lock them
                                        for 15 minutes.
                                    </p>
                                </form>
                            )}

                            {wStep === "success" && (
                                <div className="flex flex-col items-center py-4 text-center">
                                    <div className="wl-check flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/15 text-emerald-400">
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
                                        Withdrawal successful
                                    </h3>

                                    <p className="mt-2 text-slate-400">
                                        {formatUsd(withdrawnAmount)} was
                                        withdrawn from your wallet.
                                    </p>

                                    <p className="mt-4 text-sm text-slate-500">
                                        New balance
                                    </p>

                                    <p className="text-2xl font-bold">
                                        {formatUsd(wallet?.balance)}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={resetWithdrawModal}
                                        className="mt-8 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 py-4 font-semibold transition hover:from-blue-500 hover:to-emerald-400"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Wallet;