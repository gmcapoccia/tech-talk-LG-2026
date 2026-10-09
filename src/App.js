import { useEffect, useState } from "react";
import { getTimeSeries } from "./services/twelveDataService";
import Header from "./components/header/Header"
import Section from "./components/section/Section";
import { useFPS } from "./hooks/useFPS";
import { useUpdateTime } from "./hooks/useUpdateTime";
import { useMemory } from "./hooks/useMemory";
import "./App.scss";
import SystemMetrics from "./components/systemMetrics/SystemMetrics";
import MarketSummary from "./components/marketSummary/MarketSummary";

const createBenchmarkDataset = (sourceData, datasetSize) => {
    if (!sourceData.length) return [];

    return Array.from({ length: datasetSize }, (_, index) => {
        const sourceItem = sourceData[index % sourceData.length];
        return {
            ...sourceItem,
            id: `${sourceItem.datetime}-${index}`
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
    const fps = useFPS();
    const { updateTime, measureUpdate } = useUpdateTime();
    const memory = useMemory();

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
    }, [measureUpdate]);

    useEffect(() => {
        measureUpdate(() => setData(createBenchmarkDataset(sourceData, datasetSize)));
    }, [sourceData, datasetSize, measureUpdate]);

    useEffect(() => {
        const intervalMs = 1000 / updateRate;

        const interval = setInterval(() => {
            measureUpdate(() => {
                setData((prevData) => {
                    if (prevData.length === 0) return prevData;

                    const randomIndex = Math.floor(Math.random() * prevData.length);
                    const updated = [...prevData];
                    const currentItem = updated[randomIndex];

                    const currentClose = parseFloat(currentItem.close) || 0;
                    const newClose = (currentClose + (Math.random() - 0.5)).toFixed(2);

                    updated[randomIndex] = {
                        ...currentItem,
                        close: newClose
                    };

                    return updated;
                });
            });
        }, intervalMs);

        return () => clearInterval(interval);
    }, [updateRate, data.length, measureUpdate]);

    return (
        <div className="App">
            <Header
                datasetSize={datasetSize}
                setDatasetSize={setDatasetSize}
                updateRate={updateRate}
                setUpdateRate={setUpdateRate}
            />
            <Section
                datasetSize={datasetSize}
                updateRate={updateRate}
                fps={fps}
                updateTime={updateTime}
                memory={memory}
            />
            <main className="main-content">
                {loading && <div className="spinner" />}
                {error && <div>{error}</div>} 
                <MarketSummary data={data} />
                <SystemMetrics fps={fps} updateTime={updateTime} memory={memory} />         
                <div>
                    <h2 className="title-heading">
                        <span>Benchmark Dataset (Synthetic)</span>
                    </h2>
                    
                    <div className="table-container">
                        <table className="market-table">
                            <thead>
                                <tr>
                                    <th>Ora</th>
                                    <th>Simbolo</th>
                                    <th>Prezzo ($)</th>
                                    <th style={{ textAlign: 'right' }}>Variazione</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => {
                                    const prevItem = data[index + 1];
                                    const price = parseFloat(item.close);
                                    const prevPrice = prevItem ? parseFloat(prevItem.close) : price;
                                    
                                    const diff = price - prevPrice;
                                    const percentage = prevPrice !== 0 ? ((diff / prevPrice) * 100).toFixed(2) : '0.00';
                                    
                                    const isPositive = diff > 0;
                                    const isNegative = diff < 0;

                                    const timeFormatted = item.datetime.includes(' ') 
                                        ? item.datetime.split(' ')[1] 
                                        : item.datetime;

                                    return (
                                        <tr key={item.id}>
                                            <td className="time-cell">
                                                {timeFormatted}
                                            </td>
                                            <td>
                                                {item.symbol || "AAPL"}
                                            </td>
                                            <td className="price-cell">
                                                {price.toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
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
                                                    <span className="badge badge-neutral">
                                                        0.00%
                                                    </span>
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