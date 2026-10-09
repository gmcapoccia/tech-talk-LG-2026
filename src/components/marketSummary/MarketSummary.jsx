import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { FaApple, FaMicrosoft } from "react-icons/fa";
import { SiNvidia, SiTesla } from "react-icons/si";
import { getTimeSeries } from "../../services/twelveDataService";
import "./MarketSummary.scss";

const companies = [
    { symbol: "AAPL", name: "Apple Inc.", icon: FaApple },
    { symbol: "MSFT", name: "Microsoft Corporation", icon: FaMicrosoft },
    { symbol: "NVDA", name: "NVIDIA Corporation", icon: SiNvidia },
    { symbol: "TSLA", name: "Tesla, Inc.", icon: SiTesla }
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");
const formatMarketCap = (value) => value ? `$${Number(value).toLocaleString("en-US")}` : "N/D";

const MarketSummary = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sort, setSort] = useState({ key: "symbol", direction: "asc" });

    useEffect(() => {
        const loadMarketData = async () => {
            try {
                const response = await getTimeSeries(companies.map((company) => company.symbol).join(","), "1day", 30);
                const rows = companies.map((company) => {
                    const series = response[company.symbol] || response.data?.[company.symbol] || {};
                    const trend = (series.values || []).map((item) => ({
                        date: item.datetime,
                        price: Number(item.close),
                        volume: Number(item.volume || 0)
                    })).reverse();
                    const current = trend[trend.length - 1] || {};
                    const previous = trend[trend.length - 2] || current;
                    const changePercent = previous.price
                        ? ((current.price - previous.price) / previous.price) * 100
                        : 0;

                    return {
                        ...company,
                        price: current.price || 0,
                        changePercent,
                        volume: current.volume || 0,
                        marketCap: null,
                        trend
                    };
                });
                setData(rows);
            } catch (err) {
                setError(err.message || "Dati di mercato non disponibili");
            } finally {
                setLoading(false);
            }
        };

        loadMarketData();
    }, []);

    const sortedData = useMemo(() => [...data].sort((first, second) => {
        const firstValue = first[sort.key] ?? "";
        const secondValue = second[sort.key] ?? "";
        const comparison = typeof firstValue === "string"
            ? firstValue.localeCompare(secondValue)
            : firstValue - secondValue;
        return sort.direction === "asc" ? comparison : -comparison;
    }), [data, sort]);

    const changeSort = (key) => setSort((previousSort) => ({
        key,
        direction: previousSort.key === key && previousSort.direction === "asc" ? "desc" : "asc"
    }));

    const heading = (label, key) => <button className="summary-sort" onClick={() => changeSort(key)}>{label}{sort.key === key && <span>{sort.direction === "asc" ? " ↑" : " ↓"}</span>}</button>;

    return <section className="market-summary">
        <div className="market-summary-heading">
            <div><h2>Market overview</h2><p>Quotazioni reali · trend giornaliero ultimo mese</p></div>
        </div>
        <div className="market-summary-table-container">
            <table className="market-summary-table">
                <thead><tr><th>{heading("Symbol", "symbol")}</th><th>{heading("Name", "name")}</th><th>{heading("Price", "price")}</th><th>{heading("Change %", "changePercent")}</th><th>{heading("Volume", "volume")}</th><th>{heading("Market Cap", "marketCap")}</th><th>Trend (1m)</th></tr></thead>
                <tbody>
                    {loading && <tr><td colSpan="7" className="summary-status">Caricamento dati di mercato...</td></tr>}
                    {!loading && error && <tr><td colSpan="7" className="summary-status summary-error">{error}</td></tr>}
                    {sortedData.map((item) => {
                        const Icon = item.icon;
                        const positive = item.changePercent >= 0;
                        return <tr key={item.symbol}>
                            <td><span className="company-symbol"><Icon />{item.symbol}</span></td><td>{item.name}</td><td className="summary-price">${item.price.toFixed(2)}</td>
                            <td><span className={`summary-change ${positive ? "positive" : "negative"}`}>{positive ? "+" : ""}{item.changePercent.toFixed(2)}%</span></td>
                            <td>{formatNumber(item.volume)}</td><td>{formatMarketCap(item.marketCap)}</td>
                            <td className="trend-cell"><ResponsiveContainer width="100%" height={42}><AreaChart data={item.trend}><Area type="monotone" dataKey="price" stroke={positive ? "#34d399" : "#fb7185"} fill="none" strokeWidth={2} isAnimationActive={false} /></AreaChart></ResponsiveContainer></td>
                        </tr>;
                    })}
                </tbody>
            </table>
        </div>
        <p className="market-cap-note">Price, Change % e Volume derivano dall'ultima chiusura giornaliera. Market Cap non è incluso nel piano gratuito.</p>
    </section>;
};

export default MarketSummary;
