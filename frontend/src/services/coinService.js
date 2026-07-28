import api from "./api";

export const getAllCoins = async () => {
    const response = await api.get("/coins");
    return response.data;
};

export const getCoinBySymbol = async (symbol) => {
    const response = await api.get(
        `/coins/${encodeURIComponent(symbol)}`
    );

    return response.data;
};

export const syncCoins = async () => {
    const response = await api.post("/coins/sync");
    return response.data;
};