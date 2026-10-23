import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { FaApple, FaMicrosoft } from "react-icons/fa";
import { SiNvidia, SiTesla } from "react-icons/si";
import { generateMockTimeSeries } from "../../services/mockMarketData";
import "./MarketSummary.scss";

const companies = [
  { symbol: "AAPL", name: "Apple Inc.", icon: FaApple },
  { symbol: "MSFT", name: "Microsoft Corporation", icon: FaMicrosoft },
  { symbol: "NVDA", name: "NVIDIA Corporation", icon: SiNvidia },
  { symbol: "TSLA", name: "Tesla, Inc.", icon: SiTesla },
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

const MarketSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ key: "symbol", direction: "asc" });

  useEffect(() => {
    try {
      const mockRows = generateMockTimeSeries(4).map((item, index) => ({
        ...item,
        icon: companies[index % companies.length].icon,
        trend: item.trend.map((t) => ({
          date: t.datetime,
          price: t.price,
          volume: t.volume,
        })),
      }));
      setData(mockRows);
      setError(null);
    } catch (err) {
      setError("Dati di mercato non disponibili");
    } finally {
      setLoading(false);
    }
  }, []);

  const sortedData = useMemo(
    () =>
      [...data].sort((first, second) => {
        const firstValue = first[sort.key] ?? "";
        const secondValue = second[sort.key] ?? "";
        const comparison =
          typeof firstValue === "string"
            ? firstValue.localeCompare(secondValue)
            : firstValue - secondValue;
        return sort.direction === "asc" ? comparison : -comparison;
      }),
    [data, sort],
  );

  const changeSort = (key) =>
    setSort((previousSort) => ({
      key,
      direction:
        previousSort.key === key && previousSort.direction === "asc"
          ? "desc"
          : "asc",
    }));

  const heading = (label, key) => (
    <button className="summary-sort" onClick={() => changeSort(key)}>
      {label}
      {sort.key === key && (
        <span>{sort.direction === "asc" ? " ↑" : " ↓"}</span>
      )}
    </button>
  );

  return (
    <section className="market-summary">
      <div className="market-summary-heading">
        <div>
          <h2>Market overview</h2>
          <p>Real-time quotes · daily trend last month</p>
        </div>
      </div>
      <div className="market-summary-table-container">
        <table className="market-summary-table">
          <thead>
            <tr>
              <th>{heading("Symbol", "symbol")}</th>
              <th>{heading("Name", "name")}</th>
              <th>{heading("Price", "price")}</th>
              <th>{heading("Change %", "changePercent")}</th>
              <th>{heading("Volume", "volume")}</th>
              <th>Trend (1m)</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="summary-status">
                  Loading market data...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan="6" className="summary-status summary-error">
                  {error}
                </td>
              </tr>
            )}
            {sortedData.map((item) => {
              const Icon = item.icon;
              const positive = item.changePercent >= 0;
              return (
                <tr key={item.symbol}>
                  <td>
                    <span className="company-symbol">
                      <Icon />
                      {item.symbol}
                    </span>
                  </td>
                  <td>{item.name}</td>
                  <td className="summary-price">${item.price.toFixed(2)}</td>
                  <td>
                    <span
                      className={`summary-change ${positive ? "positive" : "negative"}`}
                    >
                      {positive ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td>{formatNumber(item.volume)}</td>
                  <td className="trend-cell">
                    <ResponsiveContainer width="100%" height={42}>
                      <AreaChart
                        data={item.trend}
                        margin={{
                          top: 2,
                          right: 0,
                          left: 0,
                          bottom: 2,
                        }}
                      >
                        <YAxis domain={["dataMin", "dataMax"]} hide />
                        <Area
                          type="linear"
                          dataKey="price"
                          stroke={positive ? "#34d399" : "#fb7185"}
                          fill="none"
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MarketSummary;