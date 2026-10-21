import { useState, useEffect } from 'react';

export function useCpuLoad(datasetSize, updateRate, fps) {
    const [cpuLoad, setCpuLoad] = useState(15);

    useEffect(() => {
        const baseLoad = Math.min(100, Math.round((datasetSize / 10000) * (updateRate / 10) * 0.5 + (updateRate > 100 ? 40 : 10)));
        const fpsPenalty = fps < 30 ? Math.round((30 - fps) * 2) : 0;
        const calculatedLoad = Math.min(99, Math.max(5, baseLoad + fpsPenalty));
        const jitter = Math.floor(Math.random() * 5) - 2;
        setCpuLoad(Math.min(100, Math.max(5, calculatedLoad + jitter)));
    }, [datasetSize, updateRate, fps]);

    return cpuLoad;
}