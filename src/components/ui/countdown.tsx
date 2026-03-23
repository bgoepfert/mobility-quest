import React, { useState, useEffect } from 'react';

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseTimestamp, setPauseTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
    }
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const togglePause = () => {
    const now = Date.now();
    if (isPaused) {
      if (pauseTimestamp && now - pauseTimestamp < 1000) return; // Rate limit pause/unpause to once per second
      setIsPaused(false);
    } else {
      setIsPaused(true);
      setPauseTimestamp(now);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
      <div className="text-6xl">{timeLeft}</div>
      <button onClick={togglePause} className="ml-4 p-2 bg-white text-black rounded">
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};

export default Countdown;
