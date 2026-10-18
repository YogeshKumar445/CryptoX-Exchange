import api from "./api";

export const getPinStatus = async () => {
    const response = await api.get("/pin/status");
    return response.data;
};

export const setTransactionPin = async (password, pin) => {
    const response = await api.post("/pin/set", { password, pin });
    return response.data;
};