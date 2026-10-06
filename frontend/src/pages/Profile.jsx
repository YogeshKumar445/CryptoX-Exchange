import { useEffect, useRef, useState } from "react";
import {
    getMyProfile,
    updateMyProfile,
} from "../services/userService";
import {
    setupTwoFactor,
    verifyTwoFactorSetup,
    disableTwoFactor,
} from "../services/twoFactorService";

/* ---------- Small reusable pieces ---------- */

function EyeIcon({ off }) {
    return off ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4 10 7a11.6 11.6 0 01-3.2 4.6M6.1 6.1A11.6 11.6 0 002 12c1 3 5 7 10 7a9.8 9.8 0 004.1-.9"
            />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7S3 15 2 12z"
            />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function CheckIcon({ className = "h-4 w-4" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={className}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}

function Alert({ type, children, onClose }) {
    const styles =
        type === "success"
            ? "bg-emerald-950/50 border-emerald-700 text-emerald-400"
            : "bg-red-950/40 border-red-800 text-red-400";

    return (
        <div
            role="alert"
            className={`flex items-start justify-between gap-4 border rounded-xl px-5 py-4 animate-fade-in-up ${styles}`}
        >
            <span>{children}</span>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss message"
                    className="cursor-pointer text-xl leading-none opacity-70 hover:opacity-100 transition"
                >
                    ×
                </button>
            )}
        </div>
    );
}
function OtpInput({ value, onChange, disabled = false, autoFocus = false }) {
    const inputsRef = useRef([]);
    const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

    useEffect(() => {
        if (autoFocus) {
            inputsRef.current[0]?.focus();
        }
    }, [autoFocus]);

    const focusAt = (index) => {
        const safeIndex = Math.max(0, Math.min(5, index));
        inputsRef.current[safeIndex]?.focus();
    };

    const handleChange = (index, event) => {
        let chars = event.target.value.replace(/\D/g, "");

        // Box mein pehle se digit tha, toh sirf naya wala digit lo
        if (chars.length > 1 && digits[index]) {
            chars = chars.replace(digits[index], "");
        }

        if (!chars) {
            return;
        }

        // Gap na bane, isliye digit hamesha agli khali jagah par jayega
        const position = Math.min(index, value.length);

        const next = (
            value.slice(0, position) +
            chars +
            value.slice(position + 1)
        ).slice(0, 6);

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
            .slice(0, 6);

        if (!pasted) {
            return;
        }

        onChange(pasted);
        focusAt(pasted.length);
    };

    const handleFocus = (event) => {
        event.target.select();
    };

    return (
        <div className="flex gap-2 sm:gap-3">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputsRef.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={digit}
                    disabled={disabled}
                    onChange={(event) => handleChange(index, event)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={handleFocus}
                    aria-label={`Digit ${index + 1}`}
                    className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border text-center text-xl font-mono font-semibold text-white outline-none transition bg-slate-900/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:scale-105 disabled:opacity-60 ${
                        digit
                            ? "border-emerald-500/60"
                            : "border-slate-700"
                    }`}
                />
            ))}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-[#020817] text-white">
            <div className="border-b border-slate-800/60 bg-[#0b1324]/80 px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2">
                        <div className="h-4 w-40 rounded bg-slate-800" />
                        <div className="h-3 w-24 rounded bg-slate-800" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 animate-pulse">
                <div className="h-[520px] rounded-2xl bg-[#0b1324] border border-slate-800/60" />

                <div className="space-y-6">
                    <div className="h-[340px] rounded-2xl bg-[#0b1324] border border-slate-800/60" />
                    <div className="h-[220px] rounded-2xl bg-[#0b1324] border border-slate-800/60" />
                </div>
            </div>
        </div>
    );
}

/* ---------- Main page ---------- */

function Profile({ onBack }) {
    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [twoFactorStep, setTwoFactorStep] = useState("idle");
    const [twoFactorData, setTwoFactorData] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [twoFactorError, setTwoFactorError] = useState("");
    const [twoFactorSuccess, setTwoFactorSuccess] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [copied, setCopied] = useState(false);

    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");
    const [disableError, setDisableError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [disabling, setDisabling] = useState(false);

    const loadProfile = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            setError("");

            const response = await getMyProfile();

            const user = response?.data;

            if (!user) {
                throw new Error("User profile not received.");
            }

            setProfile(user);

            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        } catch (err) {
            console.error("Profile fetch error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // Success messages 5 second baad khud hat jayein
    useEffect(() => {
        if (!success) {
            return undefined;
        }

        const timer = setTimeout(() => setSuccess(""), 5000);
        return () => clearTimeout(timer);
    }, [success]);

    useEffect(() => {
        if (!twoFactorSuccess) {
            return undefined;
        }

        const timer = setTimeout(() => setTwoFactorSuccess(""), 5000);
        return () => clearTimeout(timer);
    }, [twoFactorSuccess]);

    // Modal: Esc se band karo
    useEffect(() => {
        if (!showDisableModal) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !disabling) {
                setShowDisableModal(false);
                setDisablePassword("");
                setDisableCode("");
                setDisableError("");
                setShowPassword(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showDisableModal, disabling]);

    /* ----- Profile edit ----- */

    const handleChange = (event) => {
        const { name, value } = event.target;

        let newValue = value;

        if (name === "phone") {
            newValue = value.replace(/\D/g, "").slice(0, 10);
        }

        setFormData((previous) => ({
            ...previous,
            [name]: newValue,
        }));

        setError("");
        setSuccess("");
    };

    const handleEdit = () => {
        setEditing(true);
        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        setEditing(false);
        setError("");
        setSuccess("");

        if (profile) {
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                email: profile.email || "",
                phone: profile.phone || "",
            });
        }
    };

    const validateForm = () => {
        const firstName = formData.firstName.trim();
        const lastName = formData.lastName.trim();
        const email = formData.email.trim();
        const phone = formData.phone.trim();

        if (!firstName) {
            return "First name is required.";
        }

        if (!lastName) {
            return "Last name is required.";
        }

        if (!email) {
            return "Email is required.";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!phone) {
            return "Phone number is required.";
        }

        if (!/^\d{10}$/.test(phone)) {
            return "Phone number must contain exactly 10 digits.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
            };

            const response = await updateMyProfile(payload);

            const updatedUser = response?.data;

            if (!updatedUser) {
                throw new Error(
                    "Updated profile not received from server."
                );
            }

            setProfile(updatedUser);

            setFormData({
                firstName: updatedUser.firstName || "",
                lastName: updatedUser.lastName || "",
                email: updatedUser.email || "",
                phone: updatedUser.phone || "",
            });

            const storedUser = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            const newStoredUser = {
                ...storedUser,
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(newStoredUser)
            );

            setEditing(false);

            setSuccess(
                response?.message ||
                "Profile updated successfully."
            );
        } catch (err) {
            console.error("Profile update error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ----- 2FA enable ----- */

    const handleStartTwoFactorSetup = async () => {
        setTwoFactorError("");
        setTwoFactorSuccess("");
        setTwoFactorCode("");
        setTwoFactorStep("loading");

        try {
            const response = await setupTwoFactor();
            setTwoFactorData(response?.data);
            setTwoFactorStep("qr");
        } catch (err) {
            setTwoFactorError(
                err.response?.data?.message ||
                "Unable to start two-factor setup."
            );
            setTwoFactorStep("idle");
        }
    };

    const handleVerifyTwoFactorSetup = async (event) => {
        event.preventDefault();

        if (twoFactorCode.length !== 6) {
            return;
        }

        setTwoFactorError("");
        setTwoFactorSuccess("");

        try {
            setVerifying(true);

            const response = await verifyTwoFactorSetup(twoFactorCode);

            if (!response?.success) {
                setTwoFactorError(
                    response?.message ||
                    "Invalid or expired code. Please try again."
                );
                setTwoFactorCode("");
                return;
            }

            setTwoFactorSuccess(
                "Two-factor authentication enabled successfully."
            );
            setTwoFactorStep("idle");
            setTwoFactorCode("");
            setTwoFactorData(null);

            await loadProfile(true);
        } catch (err) {
            setTwoFactorError(
                err.response?.data?.message ||
                "Invalid or expired code. Please try again."
            );
            setTwoFactorCode("");
        } finally {
            setVerifying(false);
        }
    };

    const handleCancelTwoFactorSetup = () => {
        setTwoFactorStep("idle");
        setTwoFactorData(null);
        setTwoFactorCode("");
        setTwoFactorError("");
    };

    const handleCopySecret = async () => {
        if (!twoFactorData?.secret) {
            return;
        }

        try {
            await navigator.clipboard.writeText(twoFactorData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setTwoFactorError(
                "Unable to copy automatically. Please copy the code manually."
            );
        }
    };

    /* ----- 2FA disable ----- */

    const openDisableModal = () => {
        setTwoFactorError("");
        setTwoFactorSuccess("");
        setDisablePassword("");
        setDisableCode("");
        setDisableError("");
        setShowPassword(false);
        setShowDisableModal(true);
    };

    const closeDisableModal = () => {
        if (disabling) {
            return;
        }

        setShowDisableModal(false);
        setDisablePassword("");
        setDisableCode("");
        setDisableError("");
        setShowPassword(false);
    };

    const handleDisableTwoFactor = async (event) => {
        event.preventDefault();

        if (!disablePassword || disableCode.length !== 6) {
            return;
        }

        setDisableError("");

        try {
            setDisabling(true);

            const response = await disableTwoFactor(
                disablePassword,
                disableCode
            );

            if (!response?.success) {
                setDisableError(
                    response?.message ||
                    "Unable to disable two-factor authentication."
                );
                setDisableCode("");
                return;
            }

            setShowDisableModal(false);
            setDisablePassword("");
            setDisableCode("");
            setShowPassword(false);

            setTwoFactorSuccess(
                response?.message ||
                "Two-factor authentication disabled successfully."
            );

            await loadProfile(true);
        } catch (err) {
            setDisableError(
                err.response?.data?.message ||
                "Unable to disable two-factor authentication."
            );
            setDisableCode("");
        } finally {
            setDisabling(false);
        }
    };

    /* ----- Helpers ----- */

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = () => {
        const first = profile?.firstName?.charAt(0) || "";
        const last = profile?.lastName?.charAt(0) || "";

        return `${first}${last}`.toUpperCase() || "U";
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center px-6">
                <div className="w-full max-w-lg bg-[#0b1324] border border-slate-800/60 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold">
                        Unable to load profile
                    </h2>

                    <p className="text-red-400 mt-4">
                        {error || "Profile information is unavailable."}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadProfile()}
                        className="mt-6 cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 px-6 py-3 rounded-xl font-semibold transition"
                    >
                        Try Again
                    </button>

                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="mt-3 ml-3 cursor-pointer border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition"
                        >
                            Dashboard
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const inputClass =
        "w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition";

    const securityChecklist = [
        {
            label: "Password protected login",
            done: true,
            soon: false,
        },
        {
            label: "Two-factor authentication",
            done: Boolean(profile.twoFactorEnabled),
            soon: false,
        },
        {
            label: "Transaction PIN for buy/sell",
            done: false,
            soon: true,
        },
        {
            label: "OTP for withdrawals",
            done: false,
            soon: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in-up { animation: fadeInUp 0.35s ease-out both; }
                .animate-fade-in { animation: fadeIn 0.25s ease-out both; }
                .animate-pop-in { animation: popIn 0.25s ease-out both; }
            `}</style>

            {/* Ambient glow background */}
            <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            <nav className="relative bg-[#0b1324]/80 backdrop-blur border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/20">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                                />
                            </svg>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                CryptoX Exchange
                            </h1>

                            <p className="text-slate-500 text-sm">
                                Account Profile
                            </p>
                        </div>
                    </div>

                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="group cursor-pointer border border-slate-700 hover:bg-slate-800 hover:border-slate-600 px-5 py-3 rounded-xl font-semibold transition"
                        >
                            <span className="inline-block transition-transform group-hover:-translate-x-1">
                                ←
                            </span>{" "}
                            Dashboard
                        </button>
                    )}
                </div>
            </nav>

            <main className="relative max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8 animate-fade-in-up">
                    <h2 className="text-3xl font-bold">My Profile</h2>

                    <p className="text-slate-400 mt-2">
                        View and manage your CryptoX account information.
                    </p>
                </div>

                {success && (
                    <div className="mb-6">
                        <Alert type="success" onClose={() => setSuccess("")}>
                            {success}
                        </Alert>
                    </div>
                )}

                {error && (
                    <div className="mb-6">
                        <Alert type="error" onClose={() => setError("")}>
                            {error}
                        </Alert>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

                    {/* Left column */}
                    <div className="space-y-6 h-fit">

                        {/* Identity card */}
                        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 via-slate-700/30 to-emerald-500/30 transition duration-300 hover:from-blue-500/50 hover:to-emerald-500/50 animate-fade-in-up">
                            <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-7">

                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                                    {getInitials()}
                                </div>

                                <h3 className="text-2xl font-bold mt-6">
                                    {profile.firstName} {profile.lastName}
                                </h3>

                                <p className="text-slate-400 mt-1 break-all">
                                    {profile.email}
                                </p>

                                <div className="mt-7 pt-6 border-t border-slate-800/60 space-y-5">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Account ID
                                        </p>

                                        <p className="font-medium mt-1 font-mono">
                                            #{profile.id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Role
                                        </p>

                                        <span className="inline-flex mt-2 bg-blue-950/60 text-blue-400 border border-blue-800/60 px-3 py-1 rounded-full text-sm font-semibold">
                                            {profile.role || "USER"}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Account Status
                                        </p>

                                        <span
                                            className={`inline-flex mt-2 px-3 py-1 rounded-full border text-sm font-semibold ${
                                                profile.active
                                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                                                    : "bg-red-950/60 text-red-400 border-red-800/60"
                                            }`}
                                        >
                                            {profile.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Two-Factor Authentication
                                        </p>

                                        <span
                                            className={`inline-flex mt-2 px-3 py-1 rounded-full border text-sm font-semibold ${
                                                profile.twoFactorEnabled
                                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                                                    : "bg-slate-800/60 text-slate-400 border-slate-700"
                                            }`}
                                        >
                                            {profile.twoFactorEnabled
                                                ? "Enabled"
                                                : "Disabled"}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Member Since
                                        </p>

                                        <p className="text-slate-300 mt-1">
                                            {formatDate(profile.createdAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Last Updated
                                        </p>

                                        <p className="text-slate-300 mt-1">
                                            {formatDate(profile.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security checklist */}
                        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-500/20 via-slate-700/20 to-blue-500/20 animate-fade-in-up">
                            <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-7">
                                <h3 className="text-lg font-bold">
                                    Security Checklist
                                </h3>

                                <ul className="mt-5 space-y-3">
                                    {securityChecklist.map((item) => (
                                        <li
                                            key={item.label}
                                            className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition hover:bg-slate-800/40"
                                        >
                                            <span
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                                    item.done
                                                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400"
                                                        : "bg-slate-800/60 border-slate-700 text-slate-600"
                                                }`}
                                            >
                                                {item.done && <CheckIcon className="h-3 w-3" />}
                                            </span>

                                            <span
                                                className={`text-sm ${
                                                    item.done
                                                        ? "text-slate-200"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                {item.label}
                                            </span>

                                            {item.soon && (
                                                <span className="ml-auto rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Soon
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">

                        {/* Personal information */}
                        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/20 via-slate-700/20 to-emerald-500/20 animate-fade-in-up">
                            <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-7 md:p-9">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            Personal Information
                                        </h3>

                                        <p className="text-slate-400 mt-2">
                                            {editing
                                                ? "Update your account details below."
                                                : "Your personal account details."}
                                        </p>
                                    </div>

                                    {!editing && (
                                        <button
                                            type="button"
                                            onClick={handleEdit}
                                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 hover:-translate-y-0.5 active:translate-y-0 px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/10"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                htmlFor="firstName"
                                                className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                            >
                                                FIRST NAME
                                            </label>

                                            <input
                                                id="firstName"
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                disabled={!editing || saving}
                                                required
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="lastName"
                                                className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                            >
                                                LAST NAME
                                            </label>

                                            <input
                                                id="lastName"
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                disabled={!editing || saving}
                                                required
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                            >
                                                EMAIL ADDRESS
                                            </label>

                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={!editing || saving}
                                                required
                                                autoComplete="email"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                            >
                                                PHONE NUMBER
                                            </label>

                                            <input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={!editing || saving}
                                                required
                                                maxLength={10}
                                                inputMode="numeric"
                                                autoComplete="tel"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    {editing && (
                                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-800/60">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="cursor-pointer border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 px-7 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Two-Factor Authentication card */}
                        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-500/20 via-slate-700/20 to-blue-500/20 animate-fade-in-up">
                            <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-7 md:p-9">

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 transition ${
                                                profile.twoFactorEnabled
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-slate-800/60 border-slate-700"
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className={`h-6 w-6 ${
                                                    profile.twoFactorEnabled
                                                        ? "text-emerald-400"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold">
                                                Two-Factor Authentication
                                            </h3>

                                            <p className="text-slate-400 mt-1">
                                                Secure your account with an authenticator app.
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full border text-sm font-semibold whitespace-nowrap ${
                                            profile.twoFactorEnabled
                                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                                                : "bg-slate-800/60 text-slate-400 border-slate-700"
                                        }`}
                                    >
                                        {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                </div>

                                {twoFactorSuccess && (
                                    <div className="mt-6">
                                        <Alert
                                            type="success"
                                            onClose={() => setTwoFactorSuccess("")}
                                        >
                                            {twoFactorSuccess}
                                        </Alert>
                                    </div>
                                )}

                                {twoFactorError && (
                                    <div className="mt-6">
                                        <Alert
                                            type="error"
                                            onClose={() => setTwoFactorError("")}
                                        >
                                            {twoFactorError}
                                        </Alert>
                                    </div>
                                )}

                                {/* Idle, 2FA off */}
                                {twoFactorStep === "idle" && !profile.twoFactorEnabled && (
                                    <div className="mt-6">
                                        <p className="text-slate-400 text-sm">
                                            Add a second layer of protection. After enabling, you will need a 6-digit code from your authenticator app every time you log in.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleStartTwoFactorSetup}
                                            className="mt-5 cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 hover:-translate-y-0.5 active:translate-y-0 px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-emerald-600/10"
                                        >
                                            Enable Two-Factor Authentication
                                        </button>
                                    </div>
                                )}

                                {/* Idle, 2FA on */}
                                {twoFactorStep === "idle" && profile.twoFactorEnabled && (
                                    <div className="mt-6">
                                        <p className="text-slate-400 text-sm">
                                            Your account is protected with two-factor authentication.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={openDisableModal}
                                            className="mt-5 cursor-pointer border border-red-800 text-red-400 hover:bg-red-950/40 hover:border-red-600 px-6 py-3 rounded-xl font-semibold transition"
                                        >
                                            Disable Two-Factor Authentication
                                        </button>
                                    </div>
                                )}

                                {/* Loading */}
                                {twoFactorStep === "loading" && (
                                    <div className="mt-6 flex items-center gap-3 text-slate-400">
                                        <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin" />
                                        Generating your QR code...
                                    </div>
                                )}

                                {/* QR step */}
                                {twoFactorStep === "qr" && twoFactorData && (
                                    <div className="mt-6 animate-fade-in-up">

                                        {/* Stepper */}
                                        <div className="mb-6 flex items-center gap-3 text-sm">
                                            <span className="flex items-center gap-2 text-emerald-400">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/60 text-xs font-bold">
                                                    1
                                                </span>
                                                Scan
                                            </span>

                                            <span className="h-px w-8 bg-slate-700" />

                                            <span
                                                className={`flex items-center gap-2 ${
                                                    twoFactorCode.length > 0
                                                        ? "text-emerald-400"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                                        twoFactorCode.length > 0
                                                            ? "bg-emerald-500/20 border-emerald-500/60"
                                                            : "border-slate-700"
                                                    }`}
                                                >
                                                    2
                                                </span>
                                                Verify
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
                                            <div className="bg-white p-4 rounded-xl w-fit shadow-lg shadow-emerald-500/10 transition-transform duration-300 hover:scale-105">
                                                <img
                                                    src={twoFactorData.qrCodeImageBase64}
                                                    alt="Two-factor authentication QR code"
                                                    className="w-44 h-44"
                                                />
                                            </div>

                                            <div>
                                                <p className="text-slate-300">
                                                    1. Scan this QR code with Google Authenticator (or any TOTP app).
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="text-slate-500 text-sm">
                                                        Can't scan? Enter manually:
                                                    </span>

                                                    <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 font-mono text-sm text-slate-300 break-all">
                                                        {twoFactorData.secret}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={handleCopySecret}
                                                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                                                            copied
                                                                ? "border-emerald-600 bg-emerald-950/50 text-emerald-400"
                                                                : "border-slate-700 text-slate-300 hover:bg-slate-800"
                                                        }`}
                                                    >
                                                        {copied ? "Copied ✓" : "Copy"}
                                                    </button>
                                                </div>

                                                <form
                                                    onSubmit={handleVerifyTwoFactorSetup}
                                                    className="mt-6 space-y-4"
                                                >
                                                    <div>
                                                        <label className="block text-slate-300 mb-3 text-sm font-medium tracking-wide">
                                                            2. ENTER THE 6-DIGIT CODE FROM YOUR APP
                                                        </label>

                                                        <OtpInput
                                                            value={twoFactorCode}
                                                            onChange={setTwoFactorCode}
                                                            disabled={verifying}
                                                            autoFocus
                                                        />
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                verifying ||
                                                                twoFactorCode.length !== 6
                                                            }
                                                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition"
                                                        >
                                                            {verifying
                                                                ? "Verifying..."
                                                                : "Verify & Enable"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={handleCancelTwoFactorSetup}
                                                            disabled={verifying}
                                                            className="cursor-pointer border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Disable 2FA modal */}
            {showDisableModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="disable-2fa-title"
                >
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                        onClick={closeDisableModal}
                    />

                    <div className="relative w-full max-w-md rounded-2xl p-[1px] bg-gradient-to-br from-red-500/40 via-slate-700/30 to-blue-500/30 animate-pop-in">
                        <form
                            onSubmit={handleDisableTwoFactor}
                            className="bg-[#0b1324] rounded-2xl p-7"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3
                                        id="disable-2fa-title"
                                        className="text-xl font-bold"
                                    >
                                        Disable Two-Factor Authentication
                                    </h3>

                                    <p className="text-slate-400 text-sm mt-2">
                                        Confirm your password and enter the current code from your authenticator app.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeDisableModal}
                                    disabled={disabling}
                                    aria-label="Close"
                                    className="cursor-pointer text-2xl leading-none text-slate-500 hover:text-white transition disabled:opacity-50"
                                >
                                    ×
                                </button>
                            </div>

                            {disableError && (
                                <div className="mt-5">
                                    <Alert
                                        type="error"
                                        onClose={() => setDisableError("")}
                                    >
                                        {disableError}
                                    </Alert>
                                </div>
                            )}

                            <div className="mt-5">
                                <label
                                    htmlFor="disablePassword"
                                    className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                >
                                    PASSWORD
                                </label>

                                <div className="relative">
                                    <input
                                        id="disablePassword"
                                        type={showPassword ? "text" : "password"}
                                        value={disablePassword}
                                        onChange={(e) =>
                                            setDisablePassword(e.target.value)
                                        }
                                        autoComplete="current-password"
                                        disabled={disabling}
                                        autoFocus
                                        required
                                        className={`${inputClass} pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-white transition"
                                    >
                                        <EyeIcon off={showPassword} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="block text-slate-300 mb-3 text-sm font-medium tracking-wide">
                                    6-DIGIT CODE FROM YOUR APP
                                </label>

                                <OtpInput
                                    value={disableCode}
                                    onChange={setDisableCode}
                                    disabled={disabling}
                                />
                            </div>

                            <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDisableModal}
                                    disabled={disabling}
                                    className="cursor-pointer border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        disabling ||
                                        !disablePassword ||
                                        disableCode.length !== 6
                                    }
                                    className="cursor-pointer bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition"
                                >
                                    {disabling ? "Disabling..." : "Confirm Disable"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;