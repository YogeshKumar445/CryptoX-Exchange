import { useState } from "react";
import { registerUser } from "../services/authService";

function Register({ onGoToLogin }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registrationSuccessful, setRegistrationSuccessful] =
        useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        // Phone field: only digits
        if (name === "phone" && !/^\d*$/.test(value)) {
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setMessage("");
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await registerUser(formData);

            console.log(
                "Register response:",
                response
            );

            setMessage(
                response?.message ||
                "Account created successfully!"
            );

            setRegistrationSuccessful(true);

            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                phone: "",
            });

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setRegistrationSuccessful(false);

            if (error.response) {
                setError(
                    error.response.data?.message ||
                    "Registration failed."
                );
            } else if (error.request) {
                setError(
                    "Unable to connect to the server. Please check the backend."
                );
            } else {
                setError(
                    error.message ||
                    "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020817] px-4 py-10">

            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0f172a] p-10 shadow-xl">

                {/* Header */}
                <div className="text-center">

                    <h1 className="text-4xl font-bold text-white">
                        Create Account
                    </h1>

                    <p className="mt-3 text-lg text-slate-400">
                        Join CryptoX Exchange
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >

                    {/* First + Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* First Name */}
                        <div>

                            <label
                                htmlFor="firstName"
                                className="mb-2 block text-sm text-slate-300"
                            >
                                First Name
                            </label>

                            <input
                                id="firstName"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                placeholder="Yogesh"
                                autoComplete="given-name"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-800
                                    px-4
                                    py-3
                                    text-white
                                    placeholder-slate-400
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/20
                                    transition
                                "
                            />

                        </div>

                        {/* Last Name */}
                        <div>

                            <label
                                htmlFor="lastName"
                                className="mb-2 block text-sm text-slate-300"
                            >
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                placeholder="Kumar"
                                autoComplete="family-name"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-800
                                    px-4
                                    py-3
                                    text-white
                                    placeholder-slate-400
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/20
                                    transition
                                "
                            />

                        </div>

                    </div>

                    {/* Email */}
                    <div>

                        <label
                            htmlFor="registerEmail"
                            className="mb-2 block text-sm text-slate-300"
                        >
                            Email
                        </label>

                        <input
                            id="registerEmail"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="yogesh@example.com"
                            autoComplete="email"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-3
                                text-white
                                placeholder-slate-400
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                transition
                            "
                        />

                    </div>

                    {/* Phone */}
                    <div>

                        <label
                            htmlFor="phone"
                            className="mb-2 block text-sm text-slate-300"
                        >
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            maxLength={10}
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="9876543210"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-3
                                text-white
                                placeholder-slate-400
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                transition
                            "
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Enter a valid 10-digit Indian mobile number.
                        </p>

                    </div>

                    {/* Password */}
                    <div>

                        <label
                            htmlFor="registerPassword"
                            className="mb-2 block text-sm text-slate-300"
                        >
                            Password
                        </label>

                        <input
                            id="registerPassword"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-3
                                text-white
                                placeholder-slate-400
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                transition
                            "
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Minimum 8 characters with at least one
                            letter and one number.
                        </p>

                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-xl
                            bg-blue-600
                            py-3
                            text-lg
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:bg-blue-800
                        "
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                {/* Success */}
                {message && (
                    <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">

                        <p className="text-center text-green-400">
                            {message}
                        </p>

                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">

                        <p className="text-center text-red-400">
                            {error}
                        </p>

                    </div>
                )}

                {/* After successful registration */}
                {registrationSuccessful && (
                    <button
                        type="button"
                        onClick={onGoToLogin}
                        className="
                            mt-5
                            w-full
                            rounded-xl
                            border
                            border-blue-500
                            py-3
                            font-semibold
                            text-blue-400
                            hover:bg-blue-500/10
                            transition
                        "
                    >
                        Continue to Login
                    </button>
                )}

                {/* Login link */}
                <div className="mt-8 text-center">

                    <p className="text-slate-400">
                        Already have an account?{" "}

                        <button
                            type="button"
                            onClick={onGoToLogin}
                            className="
                                font-semibold
                                text-blue-400
                                hover:text-blue-300
                                transition
                            "
                        >
                            Login
                        </button>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;