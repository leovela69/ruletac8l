"use client";

import { useGameStore } from "@/store/game-store";
import { formatBalance } from "@/lib/economy";
import { getNumberColor } from "@/lib/roulette-engine";

export default function ResultOverlay() {
  const { phase, lastResult } = useGameStore();

  if (phase !== "result" || !lastResult) return null;

  const isWin = lastResult.totalWin > 0;
  const color = getNumberColor(lastResult.number);
  const isBigWin = lastResult.totalWin > 5000;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Result card */}
      <div
        className={`relative p-8 flex flex-col items-center gap-4 rounded-2xl
                    border-2 backdrop-blur-md
                    ${isWin ? "border-green-400/60 bg-green-900/20" : "border-red-500/30 bg-red-900/10"}`}
        style={{ animation: "resultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Big win particles */}
        {isBigWin && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-casino-gold rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `particle ${1 + Math.random()}s ease-out infinite`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Number ball */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center
                     text-4xl font-bold font-numbers border-4 shadow-2xl
                     ${color === "red" ? "bg-gradient-to-b from-red-500 to-red-800 border-red-400" :
                       color === "green" ? "bg-gradient-to-b from-green-500 to-green-800 border-green-400" :
                       "bg-gradient-to-b from-gray-600 to-gray-900 border-gray-500"}`}
        >
          <span className="text-white drop-shadow-lg">{lastResult.number}</span>
        </div>

        {/* Win/Lose text */}
        {isWin ? (
          <div className="text-center">
            <p className="text-green-300 font-game text-xl uppercase tracking-wider">
              {isBigWin ? "🎉 GRAN VICTORIA! 🎉" : "Ganaste!"}
            </p>
            <p className="text-casino-goldLight font-game text-3xl font-bold mt-1">
              +{formatBalance(lastResult.totalWin)}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-300 font-game text-xl uppercase">Sin Suerte</p>
            <p className="text-gray-500 font-game text-sm mt-1">La proxima sera la tuya</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes resultPop {
          from { opacity: 0; transform: scale(0.5) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes particle {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0); }
        }
      `}</style>
    </div>
  );
}
