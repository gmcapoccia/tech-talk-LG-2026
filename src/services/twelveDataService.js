const BASE_URL = "https://api.twelvedata.com";

const API_KEY = process.env.REACT_APP_TWELVEDATA_API_KEY;

export const getTimeSeries = async (
    symbol = "AAPL",
    interval = "1min",
    outputsize = 30
) => {
    const response = await fetch(
        `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error("Errore durante il recupero dei dati");
    }

    const data = await response.json();

    if (data.status === "error") {
        throw new Error(data.message);
    }

    return data;
};