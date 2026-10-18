import { useEffect, useRef } from "react";

function PinInput({
                      value,
                      onChange,
                      length = 4,
                      disabled = false,
                      refocusKey,
                  }) {
    const inputsRef = useRef([]);
    const digits = Array.from({ length }, (_, i) => value[i] || "");

    // PIN khali ho (galat PIN ke baad) toh pehle box par focus wapas aaye
    useEffect(() => {
        if (!disabled && value.length === 0) {
            inputsRef.current[0]?.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refocusKey, disabled]);

    const focusAt = (index) => {
        const safeIndex = Math.max(0, Math.min(length - 1, index));
        inputsRef.current[safeIndex]?.focus();
    };

    const handleChange = (index, event) => {
        let chars = event.target.value.replace(/\D/g, "");

        if (chars.length > 1 && digits[index]) {
            chars = chars.replace(digits[index], "");
        }

        if (!chars) {
            return;
        }

        const position = Math.min(index, value.length);

        const next = (
            value.slice(0, position) +
            chars +
            value.slice(position + 1)
        ).slice(0, length);

        onChange(next);
        focusAt(position + chars.length);
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            event.preventDefault();

            if (digits[index]) {
                onChange(value.slice(0, index) + value.slice(index + 1));
            } else if (index > 0) {
                onChange(value.slice(0, index - 1) + value.slice(index));
                focusAt(index - 1);
            }
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            focusAt(index - 1);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            focusAt(index + 1);
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        if (!pasted) {
            return;
        }

        onChange(pasted);
        focusAt(pasted.length);
    };

    return (
        <div className="flex justify-center gap-3">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputsRef.current[index] = element;
                    }}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={digit}
                    disabled={disabled}
                    onChange={(event) => handleChange(index, event)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={(event) => event.target.select()}
                    aria-label={`PIN digit ${index + 1}`}
                    className={`h-14 w-12 sm:h-16 sm:w-14 rounded-xl border text-center text-2xl font-mono font-semibold text-white outline-none transition bg-slate-900/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        digit
                            ? "border-emerald-500/60"
                            : "border-slate-700"
                    }`}
                />
            ))}
        </div>
    );
}

function ShieldIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
            />
        </svg>
    );
}

function TradePinStep({
                          type,
                          coin,
                          quantityText,
                          totalText,
                          pin,
                          onPinChange,
                          hasPin,
                          loading,
                          error,
                          locked,
                          onBack,
                          onConfirm,
                      }) {
    const isBuy = type === "buy";
    const blocked = locked || hasPin === false;
    const canSubmit = pin.length === 4 && !loading && !blocked;

    const handleSubmit = (event) => {
        event.preventDefault();

        if (canSubmit) {
            onConfirm();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="tps-fade-up">
            <style>{`
                @keyframes tpsFadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes tpsShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-6px); }
                    80% { transform: translateX(6px); }
                }
                .tps-fade-up { animation: tpsFadeUp 0.3s ease-out both; }
                .tps-shake { animation: tpsShake 0.4s ease-in-out both; }
            `}</style>

            {/* Order summary */}
            <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {coin?.imageUrl ? (
                            <img
                                src={coin.imageUrl}
                                alt={coin.name}
                                className="h-10 w-10 shrink-0 rounded-full"
                            />
                        ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                                {coin?.symbol?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                        )}

                        <div className="min-w-0">
                            <p className="text-sm text-slate-400">
                                {isBuy ? "You are buying" : "You are selling"}
                            </p>

                            <p className="truncate font-semibold">
                                {quantityText}{" "}
                                <span className="uppercase">
                                    {coin?.symbol}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-slate-400">
                            {isBuy ? "Total cost" : "You receive"}
                        </p>

                        <p className="font-bold">{totalText}</p>
                    </div>
                </div>
            </div>

            {/* Heading */}
            <div className="mt-7 flex flex-col items-center text-center">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                        blocked
                            ? "border-red-500/40 bg-red-500/10 text-red-400"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    }`}
                >
                    <ShieldIcon />
                </div>

                <h3 className="mt-4 text-xl font-bold">
                    Enter your Transaction PIN
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                    Confirm this {isBuy ? "purchase" : "sale"} with your 4-digit PIN.
                </p>
            </div>

            {hasPin === false && (
                <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                    You have not set a Transaction PIN yet. Go to{" "}
                    <span className="font-semibold">
                        Profile → Transaction PIN
                    </span>{" "}
                    to set one, then come back.
                </div>
            )}

            {/* PIN boxes */}
            <div
                key={error || "no-error"}
                className={`mt-6 ${error ? "tps-shake" : ""}`}
            >
                <PinInput
                    value={pin}
                    onChange={onPinChange}
                    disabled={loading || blocked}
                    refocusKey={error}
                />
            </div>

            {error && (
                <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400"
                >
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="mt-7 grid grid-cols-[auto_1fr] gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="cursor-pointer rounded-xl border border-slate-700 px-6 py-4 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Back
                </button>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`cursor-pointer rounded-xl py-4 text-lg font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
                        isBuy
                            ? "bg-emerald-600 hover:bg-emerald-500"
                            : "bg-red-600 hover:bg-red-500"
                    }`}
                >
                    {loading
                        ? "Processing..."
                        : isBuy
                            ? "Confirm Buy"
                            : "Confirm Sell"}
                </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
                5 wrong attempts will lock your PIN for 15 minutes.
            </p>
        </form>
    );
}

export default TradePinStep;