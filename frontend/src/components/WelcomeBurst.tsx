import React from "react";

interface WelcomeBurstProps {
  message: string;
  onDone?: () => void;
  durationMs?: number;
}

export const WelcomeBurst: React.FC<WelcomeBurstProps> = ({ message, onDone, durationMs = 600 }) => {
  React.useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pb-12 pointer-events-none">
      <div className="absolute inset-0 bg-black/30 animate-fadeOut" />
      <div className="relative">
        {/* Burst */}
        <div className="welcome-burst" />
        {/* Floating icons */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4">
            <span className="float-up">🌿</span>
            <span className="float-up [animation-delay:100ms]">🐼</span>
            <span className="float-up [animation-delay:200ms]">🌎</span>
          </div>
        </div>
        {/* Message */}
        <div className="relative mt-6 text-center">
          <div className="inline-block bg-white/90 backdrop-blur rounded-2xl px-6 py-3 shadow-xl animate-popIn">
            <div className="text-xl font-extrabold text-emerald-700">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};


