// import React from 'react';
// import Header from './components/header/Header';
// import Footer from './components/footer/Footer';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <Header />
//       <div>dashboard 1</div>
//       <div>dashboard 2</div>
//       <div>dashboard 3</div>
//       <div>dashboard 4</div>
//       <div>dashboard 5</div>
//       <div>dashboard 6</div>
//       <div>dashboard 7</div>
//       <div>dashboard 8</div>
//       <Footer/>
//     </div>
//   );
// }

// export default App;

import { useEffect, useState } from "react";
import { getTimeSeries } from "./services/twelveDataService";

function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getTimeSeries("AAPL", "1min", 30);

                setData(response.values ?? []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Apple - AAPL</h1>

            {data.map((item) => (
                <div key={item.datetime}>
                    {item.datetime} — ${item.close}
                </div>
            ))}
        </div>
    );
}

export default App;