import { useEffect, useRef } from "react";

function DigitInput({
                        value,
                        onChange,
                        length = 6,
                        mask = false,
                        disabled = false,
                        autoFocus = false,
                        focusKey = 0,
                        onComplete,
                        label = "Digit",
                    }) {
    const inputsRef = useRef([]);
    const digits = Array.from({ length }, (_, i) => value[i] || "");

    // Mount par (autoFocus) ya focusKey badalne par, agar boxes khali hain toh pehle box par focus
    useEffect(() => {
        if (disabled) {
            return;
        }

        if (value.length === 0 && (autoFocus || focusKey)) {
            inputsRef.current[0]?.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusKey, disabled]);

    const focusAt = (index) => {
        const safeIndex = Math.max(0, Math.min(length - 1, index));
        inputsRef.current[safeIndex]?.focus();
    };

    const update = (next) => {
        onChange(next);

        if (next.length === length && onComplete) {
            onComplete();
        }
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

        update(next);
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

        update(pasted);
        focusAt(pasted.length);
    };

    return (
        <div className="flex gap-2 sm:gap-3">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputsRef.current[index] = element;
                    }}
                    type={mask ? "password" : "text"}
                    inputMode="numeric"
                    autoComplete={mask ? "off" : "one-time-code"}
                    value={digit}
                    disabled={disabled}
                    onChange={(event) => handleChange(index, event)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={(event) => event.target.select()}
                    aria-label={`${label} ${index + 1}`}
                    className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border text-center text-xl font-mono font-semibold text-white outline-none transition bg-slate-900/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        digit
                            ? "border-emerald-500/60"
                            : "border-slate-700"
                    }`}
                />
            ))}
        </div>
    );
}

export default DigitInput;