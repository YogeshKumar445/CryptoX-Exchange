import api from "./api";

export const setupTwoFactor = async () => {
    const response = await api.post("/auth/2fa/setup");
    return response.data;
};

export const verifyTwoFactorSetup = async (code) => {
    const response = await api.post("/auth/2fa/verify", { code });
    return response.data;
};