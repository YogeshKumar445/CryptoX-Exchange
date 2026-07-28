import api from "./api";

export const getMyTransactions = async () => {
    const response = await api.get(
        "/transactions/me"
    );

    return response.data;
};