import { useEffect, useState } from "react";

export const useMemory = () => {
  const [memory, setMemory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const memoryMB =
          performance.memory.usedJSHeapSize / 1024 / 1024;

        setMemory(memoryMB);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return memory;
};