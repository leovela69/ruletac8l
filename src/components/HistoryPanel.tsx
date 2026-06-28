"use client";

import { useGameStore } from "@/store/game-store";

export default function HistoryPanel() {
  const { player } = useGameStore();

  const getColorClass = (color: string) => {
    switch (color) {
      case "red":
        return "bg-gradient-to-b from-red-600 to-red-800 text-white";
      case "black":
        return "bg-gradient-to-b from-gray-700 to-gray-900 text-white";
      case "green":
        return "bg-gradient-to-b from-green-600 to-green-800 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="glass-panel p-3 w-20 flex flex-col items-center">
      {/* Title */}
      <h3 className="text-casino-gold font-game text-[8px] text-center mb-2 uppercase tracking-wider leading-tight">
        Historial
      </h3>

      {/* Number list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px] w-full scrollbar-thin">
        {player.history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-gray-600 text-2xl">🎲</span>
            <p className="text-gray-600 text-[8px] text-center font-game leading-tight">
              Sin<br/>giros
            </p>
          </div>
        ) : (
          player.history.slice(0, 15).map((entry, idx) => (
            <div
              key={idx}
              className={`w-full h-7 rounded-md flex items-center justify-center
                         font-bold text-sm font-numbers shadow-md
                         ${getColorClass(entry.color)}
                         ${idx === 0 ? "ring-1 ring-casino-gold/50 scale-105" : "opacity-80"}
                         border border-white/10`}
              style={{
                animation: idx === 0 ? "resultPop 0.3s ease-out" : undefined,
              }}
            >
              {entry.number}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {player.history.length > 0 && (
        <div className="mt-2 pt-2 border-t border-casino-gold/10 w-full">
          <div className="flex justify-between text-[7px] font-game text-gray-500">
            <span className="text-red-400">
              {player.history.filter(h => h.color === "red").length}R
            </span>
            <span className="text-gray-400">
              {player.history.filter(h => h.color === "black").length}N
            </span>
            <span className="text-green-400">
              {player.history.filter(h => h.color === "green").length}V
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes resultPop {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
