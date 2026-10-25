import api from "./api";

export const getMyWallet = async () => {
    const response = await api.get("/wallet/me");
    return response.data;
};

export const depositMoney = async (amount) => {
    const response = await api.post("/wallet/deposit", {
        amount,
    });

    return response.data;
};

export const withdrawMoney = async (amount, pin, code) => {
    const response = await api.post("/wallet/withdraw", {
        amount,
        pin,
        code,
    });

    return response.data;
};