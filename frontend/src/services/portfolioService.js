import api from "./api";

export const getMyPortfolio = async () => {
    const response = await api.get("/portfolio/me");

    return response.data;
};

export const buyCoin = async (coinId, quantity, pin) => {
    const response = await api.post("/portfolio/buy", {
        coinId,
        quantity,
        pin,
    });

    return response.data;
};

export const sellCoin = async ({ coinId, quantity, pin }) => {
    const response = await api.post("/portfolio/sell", {
        coinId,
        quantity,
        pin,
    });

    return response.data;
};