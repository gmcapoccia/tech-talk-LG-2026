import { useEffect, useState, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import "./SystemMetrics.scss";

const parseMetricValue = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
};

const SystemMetrics = ({ fps, updateTime, memory }) => {
    const [history, setHistory] = useState([]);
    const metricsRef = useRef({ fps, updateTime, memory });

    useEffect(() => {
        metricsRef.current = { fps, updateTime, memory };
    }, [fps, updateTime, memory]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            const currentMetrics = metricsRef.current;

            setHistory((prev) => {
                const newPoint = {
                    time: timeStr,
                    fps: parseMetricValue(currentMetrics.fps),
                    updateTime: parseMetricValue(currentMetrics.updateTime),
                    memory: parseMetricValue(currentMetrics.memory)
                };

                const updated = [...prev, newPoint];
                return updated.slice(-30);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="system-metrics-card">
            <h3>System Metrics (Real-time)</h3>

            <div className="chart-container" style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ right: 20 }}>
                        <defs>
                            <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend 
                            layout="vertical" 
                            align="right" 
                            verticalAlign="middle" 
                            iconType="circle"
                            wrapperStyle={{ paddingLeft: '20px', fontSize: '12px', color: '#94a3b8' }}
                        />
                        <Area type="monotone" dataKey="memory" name="Memory (MB)" stroke="#00ff88" fillOpacity={1} fill="url(#colorMemory)" strokeWidth={2} />
                        <Area type="monotone" dataKey="fps" name="FPS" stroke="#38bdf8" fillOpacity={1} fill="url(#colorFps)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SystemMetrics;