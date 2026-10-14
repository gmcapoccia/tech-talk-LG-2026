import { useState, useEffect } from 'react';

export function useCpuLoad(datasetSize, updateRate, fps) {
    const [cpuLoad, setCpuLoad] = useState(15);

    useEffect(() => {
        // Logica di stima del carico CPU per la demo:
        // Più il dataset è grande e l'updateRate è alto, più la CPU sale.
        // Se gli FPS crollano (< 30), la CPU satura quasi al 100%.
        const baseLoad = Math.min(100, Math.round((datasetSize / 10000) * (updateRate / 10) * 0.5 + (updateRate > 100 ? 40 : 10)));
        
        // Se gli FPS scendono sotto i 30, spingiamo la CPU verso l'alto (saturazione)
        const fpsPenalty = fps < 30 ? Math.round((30 - fps) * 2) : 0;
        
        const calculatedLoad = Math.min(99, Math.max(5, baseLoad + fpsPenalty));
        
        // Aggiungiamo un minimo di movimento casuale realistico ma controllato
        const jitter = Math.floor(Math.random() * 5) - 2;
        setCpuLoad(Math.min(100, Math.max(5, calculatedLoad + jitter)));
    }, [datasetSize, updateRate, fps]);

    return cpuLoad;
}