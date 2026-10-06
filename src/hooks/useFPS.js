import { useEffect, useState } from "react";

export const useFPS = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let frameId;

    const loop = (currentTime) => {
      frames++;

      if (currentTime - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = currentTime;
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return fps;
};