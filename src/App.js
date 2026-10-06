import { useEffect, useState } from "react";
import { getTimeSeries } from "./services/twelveDataService";
import Header from "./components/header/Header"

function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datasetSize, setDatasetSize] = useState(100);
    const [updateRate, setUpdateRate] = useState(10);
    const [mode, setMode] = useState("live");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const limit = mode === "live" ? 1 : datasetSize;
                const response = await getTimeSeries("AAPL", "1min", limit);
                setData(response.values ?? []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [datasetSize, mode]);

    useEffect(() => {
        if (mode !== "benchmark" || data.length === 0) return;

        const intervalMs = 1000 / updateRate;

        const interval = setInterval(() => {
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
        }, intervalMs);

        return () => clearInterval(interval);
    }, [mode, updateRate, data.length]);

    return (
        <div className="App">
            <Header 
                datasetSize={datasetSize} 
                setDatasetSize={setDatasetSize} 
                updateRate={updateRate} 
                setUpdateRate={setUpdateRate} 
                mode={mode}
                setMode={setMode}
            />

            <main className="main-content">
                {loading && <div>Loading...</div>}
                {error && <div>{error}</div>}
                {
                    mode === "live" ? (
                        <div>
                            <h1>Apple - AAPL</h1>
                            {data[0] && (
                                <div>
                                    <p>Ultimo aggiornamento: {data[0].datetime}</p>
                                    <h2>{data[0].close} USD</h2>
                                </div>
                            )}
                        </div>
                    )
                    :
                    (
                        <div>
                            <h1>Apple - AAPL</h1>
                            {data.map((item) => (
                                <div key={item.datetime}>
                                    {item.datetime} - {item.close}
                                </div>
                            ))}
                        </div>
                    )
                }

            </main>
        </div>
    );
}

export default App;