'use client';

import { useEffect, useState } from 'react';

type FrostElement = {
  id: number;
  left: string;
  animationDuration: string;
  fontSize: string;
  icon: string;
};

export default function Snowflakes() {
  const [elements, setElements] = useState<FrostElement[]>([]);

  useEffect(() => {
    // Generate some random snowflakes and sparkles
    const newElements: FrostElement[] = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${10 + Math.random() * 15}s`, // Between 10s and 25s
      fontSize: `${0.8 + Math.random() * 1.5}em`,
      icon: Math.random() > 0.5 ? '❄️' : (Math.random() > 0.5 ? '✧' : '🌸'),
    }));
    setElements(newElements);
  }, []);

  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="frost-element"
          style={{
            left: el.left,
            animationDuration: el.animationDuration,
            fontSize: el.fontSize,
          }}
        >
          {el.icon}
        </div>
      ))}
    </>
  );
}
