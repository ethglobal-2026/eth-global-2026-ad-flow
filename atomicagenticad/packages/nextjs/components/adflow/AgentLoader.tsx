"use client";

import { useEffect, useRef, useState } from "react";

type AgentLoaderProps = {
  lines: string[];
  msPerLine?: number;
  onComplete?: () => void;
  status?: string;
};

export const AgentLoader = ({ lines, msPerLine = 700, onComplete, status }: AgentLoaderProps) => {
  const [visible, setVisible] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible([]);
    const timers: ReturnType<typeof setTimeout>[] = [];

    lines.forEach((line, i) => {
      timers.push(
        setTimeout(
          () => {
            setVisible(prev => [...prev, line]);
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
            if (i === lines.length - 1 && onComplete) {
              setTimeout(onComplete, 600);
            }
          },
          (i + 1) * msPerLine,
        ),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [lines, msPerLine, onComplete]);

  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <span className="loading loading-spinner loading-lg text-primary" />
      {status && <p className="text-sm text-base-content/60 m-0">{status}</p>}
      <div
        ref={logRef}
        className="w-full max-w-xl bg-base-200 rounded-lg p-4 font-mono text-sm text-primary leading-loose max-h-44 overflow-y-auto border border-base-300"
      >
        {visible.map((line, i) => (
          <div key={i}>
            <span className="text-base-content/40">&gt; </span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
