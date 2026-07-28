export const formatCryptoQuantity = (quantity, maxDecimals = 8) => {
    if (
        quantity === null ||
        quantity === undefined ||
        quantity === ""
    ) {
        return "0";
    }

    const value = Number(quantity);

    if (!Number.isFinite(value)) {
        return "0";
    }

    return value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
        useGrouping: false,
    });
};

export const formatCurrency = (amount, maxDecimals = 8) => {
    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return "$0.00";
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "$0.00";
    }

    if (Math.abs(value) >= 0.01 || value === 0) {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: maxDecimals,
        useGrouping: false,
    })}`;
};

export const formatPrice = (price) => {
    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "$0.00";
    }

    const value = Number(price);

    if (!Number.isFinite(value)) {
        return "$0.00";
    }

    if (Math.abs(value) >= 1) {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
        useGrouping: false,
    })}`;
};

export const formatTransactionDate = (date) => {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};