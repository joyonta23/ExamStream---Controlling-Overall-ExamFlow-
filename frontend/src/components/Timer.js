import React, { useState, useEffect } from "react";

const Timer = ({ targetTime, label, onExpire, warningThreshold = 300000 }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return 0;
      }

      return difference;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return "00:00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (isExpired) return "timer";
    if (timeLeft <= warningThreshold) return "timer warning";
    return "timer success";
  };

  return (
    <div className={getTimerClass()}>
      <div style={{ fontSize: "18px", marginBottom: "10px" }}>{label}</div>
      <div style={{ fontSize: "36px", fontFamily: "monospace" }}>
        {isExpired ? "TIME EXPIRED" : formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default Timer;
