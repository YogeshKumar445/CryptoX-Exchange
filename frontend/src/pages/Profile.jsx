import { useEffect, useState } from "react";
import {
    getMyProfile,
    updateMyProfile,
} from "../services/userService";
import {
    setupTwoFactor,
    verifyTwoFactorSetup,
} from "../services/twoFactorService";

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

    const loadProfile = async () => {
        try {
            setLoading(true);
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

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const handleStartTwoFactorSetup = async () => {
        setTwoFactorError("");
        setTwoFactorSuccess("");
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

        setTwoFactorError("");
        setTwoFactorSuccess("");

        try {
            await verifyTwoFactorSetup(twoFactorCode);

            setTwoFactorSuccess(
                "Two-factor authentication enabled successfully."
            );
            setTwoFactorStep("idle");
            setTwoFactorCode("");
            setTwoFactorData(null);

            await loadProfile();
        } catch (err) {
            setTwoFactorError(
                err.response?.data?.message ||
                "Invalid or expired code. Please try again."
            );
        }
    };

    const handleCancelTwoFactorSetup = () => {
        setTwoFactorStep("idle");
        setTwoFactorData(null);
        setTwoFactorCode("");
        setTwoFactorError("");
    };

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
        return (
            <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto" />

                    <p className="text-slate-400 mt-5">
                        Loading your profile...
                    </p>
                </div>
            </div>
        );
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
                        onClick={loadProfile}
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

    return (
        <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">

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
                            className="cursor-pointer border border-slate-700 hover:bg-slate-800 px-5 py-3 rounded-xl font-semibold transition"
                        >
                            ← Dashboard
                        </button>
                    )}
                </div>
            </nav>

            <main className="relative max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">
                        My Profile
                    </h2>

                    <p className="text-slate-400 mt-2">
                        View and manage your CryptoX account information.
                    </p>
                </div>

                {success && (
                    <div className="mb-6 bg-emerald-950/50 border border-emerald-700 text-emerald-400 rounded-xl px-5 py-4">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 rounded-xl px-5 py-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

                    {/* Left: Identity card */}
                    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 via-slate-700/30 to-emerald-500/30 h-fit">
                        <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-7">

                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
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

                    {/* Right: Personal information + 2FA */}
                    <div className="space-y-6">

                        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/20 via-slate-700/20 to-emerald-500/20">
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
                                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/10"
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
                                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
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
                                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
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
                                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
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
                                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
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
                        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-500/20 via-slate-700/20 to-blue-500/20">
                            <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-7 md:p-9">

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-6 w-6 text-emerald-400"
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
                                    <div className="mt-6 bg-emerald-950/50 border border-emerald-700 text-emerald-400 rounded-xl px-5 py-4">
                                        {twoFactorSuccess}
                                    </div>
                                )}

                                {twoFactorError && (
                                    <div className="mt-6 bg-red-950/40 border border-red-800 text-red-400 rounded-xl px-5 py-4">
                                        {twoFactorError}
                                    </div>
                                )}

                                {twoFactorStep === "idle" && !profile.twoFactorEnabled && (
                                    <button
                                        type="button"
                                        onClick={handleStartTwoFactorSetup}
                                        className="mt-6 cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-emerald-600/10"
                                    >
                                        Enable Two-Factor Authentication
                                    </button>
                                )}

                                {twoFactorStep === "idle" && profile.twoFactorEnabled && (
                                    <p className="mt-6 text-slate-400 text-sm">
                                        Your account is protected with two-factor authentication.
                                    </p>
                                )}

                                {twoFactorStep === "loading" && (
                                    <p className="mt-6 text-slate-400">
                                        Generating your QR code...
                                    </p>
                                )}

                                {twoFactorStep === "qr" && twoFactorData && (
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
                                        <div className="bg-white p-4 rounded-xl w-fit">
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

                                            <p className="text-slate-500 text-sm mt-2 break-all">
                                                Can't scan it? Enter this code manually:{" "}
                                                <span className="text-slate-300 font-mono">
                                                    {twoFactorData.secret}
                                                </span>
                                            </p>

                                            <form
                                                onSubmit={handleVerifyTwoFactorSetup}
                                                className="mt-5 space-y-4"
                                            >
                                                <div>
                                                    <label
                                                        htmlFor="twoFactorCode"
                                                        className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                                    >
                                                        2. ENTER THE 6-DIGIT CODE FROM YOUR APP
                                                    </label>

                                                    <input
                                                        id="twoFactorCode"
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                        value={twoFactorCode}
                                                        onChange={(e) =>
                                                            setTwoFactorCode(
                                                                e.target.value.replace(/\D/g, "")
                                                            )
                                                        }
                                                        placeholder="000000"
                                                        required
                                                        className="w-full max-w-xs bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-center text-xl tracking-[0.4em] font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                                    />
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={twoFactorCode.length !== 6}
                                                        className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition"
                                                    >
                                                        Verify & Enable
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleCancelTwoFactorSetup}
                                                        className="cursor-pointer border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;