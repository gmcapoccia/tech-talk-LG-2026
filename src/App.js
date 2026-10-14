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
import ActivityLogSection from "./components/activityLogSection/ActivityLogSection";
import Benchmark from "./components/benchmark/Benchmark";

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
      <div className="metrics-container">
        <Section fps={fps} cpuLoad={cpuLoad} memory={memory} />
        <SystemMetrics fps={fps} memory={memory} />
      </div>

      <main className="main-content">
        {loading && <div className="spinner" />}
        {error && <div>{error}</div>}
        <ActivityLogSection logs={logs} setLogs={setLogs} />
        <Benchmark data={data} logs={logs} setLogs={setLogs} />
      </main>

      <MarketSummary data={data} />
    </div>
  );
}

export default App;
