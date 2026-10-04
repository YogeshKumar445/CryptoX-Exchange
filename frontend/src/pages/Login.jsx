import { useState } from "react";
import api from "../services/api";

function Login({ onLogin, onGoToRegister }) {
    const [step, setStep] = useState("credentials"); // "credentials" | "otp"

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [otpCode, setOtpCode] = useState("");
    const [tempToken, setTempToken] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const finishLogin = (userData) => {
        localStorage.setItem("token", userData.token);

        const user = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
        };

        localStorage.setItem("user", JSON.stringify(user));

        onLogin();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            const userData = response.data?.data;

            if (!userData) {
                throw new Error(
                    "User data not received from server."
                );
            }

            if (userData.tempToken) {
                setTempToken(userData.tempToken);
                setStep("otp");
                setLoading(false);
                return;
            }

            if (!userData.token) {
                throw new Error(
                    "JWT token not received from server."
                );
            }

            finishLogin(userData);

        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (error.response) {
                setError(
                    error.response.data?.message ||
                    "Invalid email or password."
                );
            } else if (error.request) {
                setError(
                    "Unable to connect to the server. Please check the backend."
                );
            } else {
                setError(
                    error.message ||
                    "Login failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/2fa/login-verify", {
                tempToken: tempToken,
                code: otpCode,
            });

            const userData = response.data?.data;

            if (!userData || !userData.token) {
                throw new Error(
                    "Verification failed. Please try again."
                );
            }

            finishLogin(userData);

        } catch (error) {
            if (error.response) {
                setError(
                    error.response.data?.message ||
                    "Invalid or expired code."
                );
            } else if (error.request) {
                setError(
                    "Unable to connect to the server. Please check the backend."
                );
            } else {
                setError(
                    error.message ||
                    "Verification failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const backToCredentials = () => {
        setStep("credentials");
        setOtpCode("");
        setTempToken("");
        setError("");
    };

    return (
        <div className="min-h-screen bg-[#020817] relative overflow-hidden flex items-center justify-center px-4">

            {/* Ambient glow background */}
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative w-full max-w-lg">

                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/40 via-slate-700/40 to-emerald-500/40 shadow-2xl">

                    <div className="bg-[#0b1324] border border-slate-800/60 rounded-2xl p-10">

                        {/* Logo / Header */}
                        <div className="text-center mb-10">

                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/20">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="h-7 w-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9.5 12.5l1.8 1.8L15 10"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                {step === "credentials" ? "Welcome Back" : "Verify Your Identity"}
                            </h1>

                            <p className="text-slate-400 mt-2">
                                {step === "credentials"
                                    ? "Login to CryptoX Exchange"
                                    : "Enter the code from your authenticator app"}
                            </p>

                        </div>

                        {step === "credentials" && (
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                    >
                                        EMAIL
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="yogesh@example.com"
                                        autoComplete="email"
                                        required
                                        className="
                                            w-full
                                            bg-slate-900/80
                                            border
                                            border-slate-700
                                            text-white
                                            placeholder-slate-500
                                            rounded-xl
                                            px-5
                                            py-4
                                            outline-none
                                            focus:border-emerald-500
                                            focus:ring-2
                                            focus:ring-emerald-500/20
                                            transition
                                        "
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-slate-300 mb-2 text-sm font-medium tracking-wide"
                                    >
                                        PASSWORD
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="
                                            w-full
                                            bg-slate-900/80
                                            border
                                            border-slate-700
                                            text-white
                                            placeholder-slate-500
                                            rounded-xl
                                            px-5
                                            py-4
                                            outline-none
                                            focus:border-emerald-500
                                            focus:ring-2
                                            focus:ring-emerald-500/20
                                            transition
                                        "
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        w-full cursor-pointer
                                        bg-gradient-to-r from-blue-600 to-emerald-500
                                        hover:from-blue-500 hover:to-emerald-400
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        text-white
                                        font-semibold
                                        text-lg
                                        py-4
                                        rounded-xl
                                        shadow-lg shadow-blue-600/20
                                        transition
                                    "
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>

                            </form>
                        )}

                        {step === "otp" && (
                            <form
                                onSubmit={handleOtpSubmit}
                                className="space-y-6"
                            >

                                <div className="flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-8 w-8 text-emerald-400"
                                        >
                                            <rect x="3" y="11" width="18" height="10" rx="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="otp"
                                        className="block text-slate-300 mb-2 text-sm font-medium tracking-wide text-center"
                                    >
                                        6-DIGIT AUTHENTICATION CODE
                                    </label>

                                    <input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) =>
                                            setOtpCode(
                                                e.target.value.replace(/\D/g, "")
                                            )
                                        }
                                        placeholder="000000"
                                        autoComplete="one-time-code"
                                        required
                                        className="
                                            w-full
                                            bg-slate-900/80
                                            border
                                            border-slate-700
                                            text-white
                                            placeholder-slate-600
                                            rounded-xl
                                            px-5
                                            py-4
                                            text-center
                                            text-2xl
                                            tracking-[0.5em]
                                            font-mono
                                            outline-none
                                            focus:border-emerald-500
                                            focus:ring-2
                                            focus:ring-emerald-500/20
                                            transition
                                        "
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otpCode.length !== 6}
                                    className="
                                        w-full cursor-pointer
                                        bg-gradient-to-r from-blue-600 to-emerald-500
                                        hover:from-blue-500 hover:to-emerald-400
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        text-white
                                        font-semibold
                                        text-lg
                                        py-4
                                        rounded-xl
                                        shadow-lg shadow-blue-600/20
                                        transition
                                    "
                                >
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </button>

                                <button
                                    type="button"
                                    onClick={backToCredentials}
                                    className="
                                        w-full cursor-pointer
                                        text-slate-400
                                        hover:text-slate-200
                                        text-sm
                                        transition
                                    "
                                >
                                    &larr; Back to login
                                </button>

                            </form>
                        )}

                        {error && (
                            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                                <p className="text-red-400 text-center text-sm">
                                    {error}
                                </p>
                            </div>
                        )}

                        {step === "credentials" && (
                            <div className="mt-8 text-center">
                                <p className="text-slate-400">
                                    Don't have an account?{" "}

                                    <button
                                        type="button"
                                        onClick={onGoToRegister}
                                        className="
                                            cursor-pointer
                                            text-emerald-400
                                            hover:text-emerald-300
                                            font-semibold
                                            transition
                                        "
                                    >
                                        Create Account
                                    </button>
                                </p>
                            </div>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;