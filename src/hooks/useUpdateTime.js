import { useCallback, useRef, useState } from "react";

export const useUpdateTime = () => {
  const [updateTime, setUpdateTime] = useState(0);
  const measurements = useRef([]);

  const measureUpdate = useCallback((updateFunction) => {
    const start = performance.now();

    updateFunction();

    requestAnimationFrame(() => {
      const duration = performance.now() - start;

      measurements.current.push(duration);

      if (measurements.current.length > 30) {
        measurements.current.shift();
      }

      const average =
        measurements.current.reduce((sum, value) => sum + value, 0) /
        measurements.current.length;

      setUpdateTime(Number(average.toFixed(2)));
    });
  }, []);

  return {
    updateTime,
    measureUpdate
  };
};