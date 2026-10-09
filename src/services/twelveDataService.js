const BASE_URL = "https://api.twelvedata.com";

const API_KEY = process.env.REACT_APP_TWELVEDATA_API_KEY;
const cache = new Map();

const getData = async (endpoint, params) => {
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const request = fetch(
        `${BASE_URL}/${endpoint}?${new URLSearchParams({ ...params, apikey: API_KEY }).toString()}`
    ).then(async (response) => {
        const data = await response.json();

        if (!response.ok || data.status === "error") {
            throw new Error(data.message || "Errore durante il recupero dei dati");
        }

        return data;
    });

    cache.set(cacheKey, request);

    try {
        return await request;
    } catch (error) {
        cache.delete(cacheKey);
        throw error;
    }
};

export const getTimeSeries = async (
    symbol = "AAPL",
    interval = "1min",
    outputsize = 30
) => {
    return getData("time_series", { symbol, interval, outputsize });
};

