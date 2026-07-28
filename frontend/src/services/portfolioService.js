import api from "./api";

export const getMyPortfolio = async () => {
    const response = await api.get("/portfolio/me");

    return response.data;
};

export const buyCoin = async (coinId, quantity) => {
    const response = await api.post(
        "/portfolio/buy",
        {
            coinId,
            quantity,
        }
    );

    return response.data;
};

export const sellCoin = async (data) => {
    const response = await api.post(
        "/portfolio/sell",
        data
    );

    return response.data;
};