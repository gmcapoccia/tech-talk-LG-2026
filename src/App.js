import { useEffect, useState } from "react";
import { getTimeSeries } from "./services/twelveDataService";
import Header from "./components/header/Header";
import Section from "./components/section/Section";
import { useFPS } from "./hooks/useFPS";
import { useMemory } from "./hooks/useMemory";
import "./App.scss";
import SystemMetrics from "./components/systemMetrics/SystemMetrics";
import MarketSummary from "./components/marketSummary/MarketSummary";
import { useCpuLoad } from "./hooks/useCPULoad";

const AVAILABLE_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA"];

const createBenchmarkDataset = (sourceData, datasetSize) => {
  if (!sourceData.length) return [];

  return Array.from({ length: datasetSize }, (_, index) => {
    const sourceItem = sourceData[index % sourceData.length];

    const assignedSymbol = AVAILABLE_SYMBOLS[index % AVAILABLE_SYMBOLS.length];

    return {
      ...sourceItem,
      symbol: assignedSymbol,
      id: `${sourceItem.datetime}-${assignedSymbol}-${index}`,
    };
  });
};

function App() {
  const [data, setData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datasetSize, setDatasetSize] = useState(100);
  const [updateRate, setUpdateRate] = useState(10);
  const [logs, setLogs] = useState([]);
  const fps = useFPS();
  const memory = useMemory();
  const cpuLoad = useCpuLoad(datasetSize, updateRate, fps);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTimeSeries("AAPL", "1min", 30);
        setSourceData(response.values ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setData(createBenchmarkDataset(sourceData, datasetSize));
  }, [sourceData, datasetSize]);

  useEffect(() => {
    const intervalMs = 1000 / updateRate;
    let lastLogTime = Date.now();

    const interval = setInterval(() => {
      setData((prevData) => {
        if (prevData.length === 0) return prevData;

        const randomIndex = Math.floor(Math.random() * prevData.length);
        const updated = [...prevData];
        const currentItem = updated[randomIndex];

        const currentClose = parseFloat(currentItem.close) || 0;
        const newClose = (currentClose + (Math.random() - 0.5)).toFixed(2);
        const oldClose = currentClose.toFixed(2);

        const diff = parseFloat(newClose) - parseFloat(oldClose);

        const symbol = currentItem.symbol || "AAPL";

        updated[randomIndex] = {
          ...currentItem,
          close: newClose,
          lastUpdated: Date.now(),
          flashDirection: diff > 0 ? "up" : diff < 0 ? "down" : null,
        };

        const now = Date.now();
        if (now - lastLogTime > 150) {
          lastLogTime = now;
          const timeString =
            new Date().toTimeString().split(" ")[0] +
            "." +
            String(new Date().getMilliseconds()).padStart(3, "0").slice(0, 2);
          const percentage =
            parseFloat(oldClose) !== 0
              ? ((diff / parseFloat(oldClose)) * 100).toFixed(2)
              : "0.00";

          const newLog = {
            id: `${now}-${Math.random()}`,
            time: timeString,
            symbol: symbol,
            oldPrice: oldClose,
            newPrice: newClose,
            change: percentage,
            isPositive: diff > 0,
            isNegative: diff < 0,
          };

          setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 5)]);
        }

        return updated;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [updateRate]);

  return (
    <div className="App">
      <Header
        datasetSize={datasetSize}
        setDatasetSize={setDatasetSize}
        updateRate={updateRate}
        setUpdateRate={setUpdateRate}
      />
      <Section fps={fps} cpuLoad={cpuLoad} memory={memory} />
      <main className="main-content">
        {loading && <div className="spinner" />}
        {error && <div>{error}</div>}
        <MarketSummary data={data} />
        <SystemMetrics fps={fps} memory={memory} />
        <div className="activity-log-section">
          <div className="activity-log-header">
            <h2 className="title-heading">
              <span>Activity Log (Last Updates)</span>
            </h2>
            <button className="clear-btn" onClick={() => setLogs([])}>
              Clear
            </button>
          </div>

          <div className="table-container">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Old Price</th>
                  <th>New Price</th>
                  <th style={{ textAlign: "right" }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "20px",
                      }}
                    >
                      Waiting for live updates...
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="time-cell">{log.time}</td>
                      <td>{log.symbol}</td>
                      <td style={{ color: "#9ca3af" }}>Update</td>
                      <td>${log.oldPrice}</td>
                      <td className="price-cell">${log.newPrice}</td>
                      <td style={{ textAlign: "right" }}>
                        {log.isPositive && (
                          <span className="badge badge-positive">
                            ▲ +{log.change}%
                          </span>
                        )}
                        {log.isNegative && (
                          <span className="badge badge-negative">
                            ▼ {log.change}%
                          </span>
                        )}
                        {!log.isPositive && !log.isNegative && (
                          <span className="badge badge-neutral">0.00%</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h2 className="title-heading">
            <span>Benchmark Dataset (Synthetic)</span>
          </h2>

          <div className="table-container">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Price ($)</th>
                  <th style={{ textAlign: "right" }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const prevItem = data[index + 1];
                  const price = parseFloat(item.close);
                  const prevPrice = prevItem
                    ? parseFloat(prevItem.close)
                    : price;

                  const diff = price - prevPrice;
                  const percentage =
                    prevPrice !== 0
                      ? ((diff / prevPrice) * 100).toFixed(2)
                      : "0.00";

                  const isPositive = diff > 0;
                  const isNegative = diff < 0;

                  const timeFormatted =
                    item.datetime && item.datetime.includes(" ")
                      ? item.datetime.split(" ")[1]
                      : item.datetime || "12:00:00";

                  let flashClass = "";
                  if (item.flashDirection === "up")
                    flashClass = "price-flash-up";
                  if (item.flashDirection === "down")
                    flashClass = "price-flash-down";

                  return (
                    <tr key={item.id}>
                      <td className="time-cell">{timeFormatted}</td>
                      <td>{item.symbol || item.name || "AAPL"}</td>
                      <td
                        className={`price-cell ${flashClass}`}
                        key={item.lastUpdated || item.id}
                      >
                        ${price.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {isPositive && (
                          <span className="badge badge-positive">
                            ▲ +{percentage}%
                          </span>
                        )}
                        {isNegative && (
                          <span className="badge badge-negative">
                            ▼ {percentage}%
                          </span>
                        )}
                        {!isPositive && !isNegative && (
                          <span className="badge badge-neutral">0.00%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
