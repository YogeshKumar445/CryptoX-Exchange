import { useState } from "react";
import api from "../services/api";

function Login({ onLogin, onGoToRegister }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            console.log("Login response:", response.data);

            const userData = response.data?.data;

            if (!userData) {
                throw new Error(
                    "User data not received from server."
                );
            }

            if (!userData.token) {
                throw new Error(
                    "JWT token not received from server."
                );
            }

            // Save JWT
            localStorage.setItem(
                "token",
                userData.token
            );

            // Store only required user information
            const user = {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: userData.role,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            // Tell App.jsx authentication succeeded
            onLogin();

        } catch (error) {
            console.error("Login error:", error);

            // Remove stale auth data
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

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">

            <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl p-10 shadow-xl">

                {/* Header */}
                <div className="text-center mb-10">

                    <h1 className="text-4xl font-bold text-white">
                        Welcome Back
                    </h1>

                    <p className="text-slate-400 mt-3 text-lg">
                        Login to CryptoX Exchange
                    </p>

                </div>

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Email */}
                    <div>

                        <label
                            htmlFor="email"
                            className="block text-white mb-2 text-lg"
                        >
                            Email
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
                                bg-slate-800
                                border
                                border-slate-700
                                text-white
                                placeholder-slate-400
                                rounded-xl
                                px-5
                                py-4
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                transition
                            "
                        />

                    </div>

                    {/* Password */}
                    <div>

                        <label
                            htmlFor="password"
                            className="block text-white mb-2 text-lg"
                        >
                            Password
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
                                bg-slate-800
                                border
                                border-slate-700
                                text-white
                                placeholder-slate-400
                                rounded-xl
                                px-5
                                py-4
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                transition
                            "
                        />

                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:bg-blue-800
                            disabled:cursor-not-allowed
                            text-white
                            font-semibold
                            text-lg
                            py-4
                            rounded-xl
                            transition
                        "
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">

                        <p className="text-red-400 text-center">
                            {error}
                        </p>

                    </div>
                )}

                {/* Register Link */}
                <div className="mt-8 text-center">

                    <p className="text-slate-400">
                        Don't have an account?{" "}

                        <button
                            type="button"
                            onClick={onGoToRegister}
                            className="
                                text-blue-400
                                hover:text-blue-300
                                font-semibold
                                transition
                            "
                        >
                            Create Account
                        </button>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;