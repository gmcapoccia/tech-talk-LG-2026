import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import "./SystemMetrics.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const parseMetricValue = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
};

const SystemMetrics = ({ fps, updateTime, memory }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Memory (MB)',
                data: [],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6
            },
            {
                label: 'FPS',
                data: [],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6
            }
        ]
    });

    const metricsRef = useRef({ fps, updateTime, memory });

    useEffect(() => {
        metricsRef.current = { fps, updateTime, memory };
    }, [fps, updateTime, memory]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { 
                ticks: { color: '#64748b', font: { size: 11 } }, 
                grid: { display: false } 
            },
            y: { 
                ticks: { color: '#64748b', font: { size: 11 } }, 
                grid: { color: 'rgba(255, 255, 255, 0.03)' },
                border: { dash: [4, 4] }
            }
        },
        plugins: {
            legend: { 
                position: 'right', 
                align: 'center',
                labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 8, usePointStyle: true } 
            },
            tooltip: { 
                backgroundColor: '#0f172a', 
                borderColor: '#1e293b', 
                borderWidth: 1,
                bodyFont: { size: 12 },
                titleFont: { size: 12 },
                padding: 10
            }
        },
        animation: false
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            const current = metricsRef.current;
            const newFps = parseMetricValue(current.fps);
            const newMemory = parseMetricValue(current.memory);

            setChartData(prev => {
                const newLabels = [...prev.labels, timeStr].slice(-30);
                const newMemoryData = [...prev.datasets[0].data, newMemory].slice(-30);
                const newFpsData = [...prev.datasets[1].data, newFps].slice(-30);

                return {
                    labels: newLabels,
                    datasets: [
                        { ...prev.datasets[0], data: newMemoryData },
                        { ...prev.datasets[1], data: newFpsData }
                    ]
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="system-metrics-card">
            <h3>System Metrics (Real-time)</h3>

            <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default SystemMetrics;