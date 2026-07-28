import { useEffect, useState } from "react";
import {
    getMyProfile,
    updateMyProfile,
} from "../services/userService";

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
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />

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
                <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold">
                        Unable to load profile
                    </h2>

                    <p className="text-red-400 mt-4">
                        {error || "Profile information is unavailable."}
                    </p>

                    <button
                        type="button"
                        onClick={loadProfile}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
                    >
                        Try Again
                    </button>

                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="mt-3 ml-3 border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition"
                        >
                            Dashboard
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white">
            <nav className="bg-[#0f172a] border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            CryptoX Exchange
                        </h1>

                        <p className="text-slate-400 mt-1">
                            Account Profile
                        </p>
                    </div>

                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="border border-slate-700 hover:bg-slate-800 px-5 py-3 rounded-xl font-semibold transition"
                        >
                            ← Dashboard
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
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
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7 h-fit">
                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
                            {getInitials()}
                        </div>

                        <h3 className="text-2xl font-bold mt-6">
                            {profile.firstName} {profile.lastName}
                        </h3>

                        <p className="text-slate-400 mt-1 break-all">
                            {profile.email}
                        </p>

                        <div className="mt-7 pt-6 border-t border-slate-800 space-y-5">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Account ID
                                </p>

                                <p className="font-medium mt-1">
                                    #{profile.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Role
                                </p>

                                <span className="inline-flex mt-2 bg-blue-950 text-blue-400 border border-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
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
                                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                            : "bg-red-950 text-red-400 border-red-800"
                                    }`}
                                >
                                    {profile.active
                                        ? "Active"
                                        : "Inactive"}
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

                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7 md:p-9">
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
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
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
                                        className="block text-slate-300 mb-2"
                                    >
                                        First Name
                                    </label>

                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={!editing || saving}
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-slate-300 mb-2"
                                    >
                                        Last Name
                                    </label>

                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={!editing || saving}
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-slate-300 mb-2"
                                    >
                                        Email Address
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-slate-300 mb-2"
                                    >
                                        Phone Number
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition"
                                    />
                                </div>
                            </div>

                            {editing && (
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-blue-600 hover:bg-blue-700 px-7 py-3 rounded-xl font-semibold transition disabled:bg-blue-900 disabled:cursor-not-allowed"
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
            </main>
        </div>
    );
}

export default Profile;