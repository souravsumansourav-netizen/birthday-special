'use client';

import { useEffect, useState } from 'react';

const TARGET_DATE = new Date('2026-10-01T00:00:00').getTime();

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!isClient) {
    return <div className="text-2xl font-bold text-sky-400 min-h-[100px] flex items-center justify-center">Loading timer...</div>;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div className="text-4xl sm:text-5xl font-bold text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-sm uppercase tracking-widest mt-2 text-slate-300 font-sans">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center my-8">
      <TimeBlock value={timeLeft.days} label="Days" />
      <div className="text-4xl text-sky-400 mb-6 font-bold">:</div>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <div className="text-4xl text-sky-400 mb-6 font-bold">:</div>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <div className="text-4xl text-sky-400 mb-6 font-bold">:</div>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
