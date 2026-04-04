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
        setTimeout(() => {
          setVisible(prev => [...prev, line]);
          if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
          if (i === lines.length - 1 && onComplete) {
            setTimeout(onComplete, 600);
          }
        }, (i + 1) * msPerLine),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [lines, msPerLine, onComplete]);

  return (
    <div className="agent-loading">
      <div className="agent-spinner" />
      {status && <div className="agent-status">{status}</div>}
      <div className="agent-log" ref={logRef}>
        {visible.map((line, i) => (
          <div key={i} className="log-line">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
