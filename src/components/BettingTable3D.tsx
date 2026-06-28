"use client";

import { useGameStore } from "@/store/game-store";
import { audioEngine } from "@/lib/audio-engine";
import {
  getNumberColor,
  createStraightBet,
  createRedBet,
  createBlackBet,
  createEvenBet,
  createOddBet,
  createLowBet,
  createHighBet,
  createDozenBet,
  createColumnBet,
} from "@/lib/roulette-engine";

export default function BettingTable3D() {
  const { phase, selectedChipValue, placeBet, currentBets } = useGameStore();
  const isActive = phase === "betting";

  const handleBet = (betFn: () => ReturnType<typeof createStraightBet>) => {
    if (!isActive) return;
    audioEngine.init();
    const success = placeBet(betFn());
    if (success) audioEngine.playChipPlace();
  };

  // Count chips on a specific bet position
  const getChipsOnNumber = (num: number) => {
    return currentBets.filter(b => b.type === "straight" && b.numbers[0] === num);
  };

  const getChipsOnType = (type: string) => {
    return currentBets.filter(b => b.type === type);
  };

  const getCellBg = (num: number) => {
    const color = getNumberColor(num);
    if (color === "red") return "bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800";
    if (color === "black") return "bg-gradient-to-b from-gray-800 to-gray-950 hover:from-gray-700 hover:to-gray-900";
    return "bg-gradient-to-b from-green-700 to-green-900 hover:from-green-600 hover:to-green-800";
  };

  const chipColorMap: Record<number, string> = {
    50: "#3b82f6",
    100: "#22c55e",
    500: "#ef4444",
    1000: "#a855f7",
    5000: "#eab308",
  };

  // Render chip stack on a cell
  const renderChips = (bets: typeof currentBets) => {
    if (bets.length === 0) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        {bets.slice(0, 5).map((bet, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-white/60 shadow-lg"
            style={{
              width: 22,
              height: 22,
              backgroundColor: chipColorMap[bet.amount] || "#22c55e",
              bottom: `${50 + i * 4}%`,
              left: "50%",
              transform: `translateX(-50%) translateY(${i * -3}px)`,
              boxShadow: `0 ${2 + i}px ${4 + i * 2}px rgba(0,0,0,0.4)`,
            }}
          >
            <span className="text-[7px] text-white font-bold flex items-center justify-center h-full">
              {bet.amount >= 1000 ? `${bet.amount / 1000}K` : bet.amount}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const rows = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  return (
    <div className={`w-full transition-opacity duration-300 ${!isActive ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="gold-border rounded-xl p-4 felt-texture relative overflow-visible"
           style={{ transform: "perspective(1000px) rotateX(2deg)" }}>
        
        {/* Felt texture glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-green-900/20 to-transparent pointer-events-none" />

        <div className="relative flex gap-0.5">
          {/* Zero */}
          <div className="flex flex-col justify-center mr-1">
            <button
              onClick={() => handleBet(() => createStraightBet(0, selectedChipValue))}
              className="relative w-14 h-full bg-gradient-to-b from-green-600 to-green-900 rounded-l-lg
                         flex items-center justify-center gold-border-thin
                         text-white font-bold text-2xl font-numbers hover:from-green-500
                         transition-all duration-150 active:scale-95"
            >
              0
              {renderChips(getChipsOnNumber(0))}
            </button>
          </div>

          {/* Main grid */}
          <div className="flex-1">
            <div className="grid grid-rows-3 gap-0.5">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-12 gap-0.5">
                  {row.map((num) => (
                    <button
                      key={num}
                      onClick={() => handleBet(() => createStraightBet(num, selectedChipValue))}
                      className={`relative number-cell h-12 flex items-center justify-center
                                  rounded gold-border-thin text-white font-bold 
                                  text-sm font-numbers transition-all duration-150
                                  active:scale-90 ${getCellBg(num)}`}
                    >
                      {num}
                      {renderChips(getChipsOnNumber(num))}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Dozens */}
            <div className="grid grid-cols-3 gap-0.5 mt-1.5">
              {[
                { label: "1st 12", type: "dozen1", fn: () => createDozenBet(1, selectedChipValue) },
                { label: "2nd 12", type: "dozen2", fn: () => createDozenBet(2, selectedChipValue) },
                { label: "3rd 12", type: "dozen3", fn: () => createDozenBet(3, selectedChipValue) },
              ].map((d) => (
                <button
                  key={d.type}
                  onClick={() => handleBet(d.fn)}
                  className="relative number-cell h-10 bg-gradient-to-b from-gray-800 to-gray-950
                             rounded gold-border-thin text-casino-gold font-game text-xs
                             flex items-center justify-center hover:from-gray-700 transition-all active:scale-95"
                >
                  {d.label}
                  {renderChips(getChipsOnType("dozen"))}
                </button>
              ))}
            </div>

            {/* Outside bets */}
            <div className="grid grid-cols-6 gap-0.5 mt-1.5">
              {[
                { label: "1-18", fn: () => createLowBet(selectedChipValue), type: "low" },
                { label: "PAR", fn: () => createEvenBet(selectedChipValue), type: "even" },
                { label: "", fn: () => createRedBet(selectedChipValue), type: "red", isColor: true, color: "red" },
                { label: "", fn: () => createBlackBet(selectedChipValue), type: "black", isColor: true, color: "black" },
                { label: "IMPAR", fn: () => createOddBet(selectedChipValue), type: "odd" },
                { label: "19-36", fn: () => createHighBet(selectedChipValue), type: "high" },
              ].map((bet, i) => (
                <button
                  key={i}
                  onClick={() => handleBet(bet.fn)}
                  className="relative number-cell h-10 bg-gradient-to-b from-gray-800 to-gray-950
                             rounded gold-border-thin text-white font-game text-[11px]
                             flex items-center justify-center hover:from-gray-700 transition-all active:scale-95"
                >
                  {bet.isColor ? (
                    <div className={`w-6 h-6 rotate-45 border border-casino-gold/50 rounded-sm
                                    ${bet.color === "red" ? "bg-red-700" : "bg-gray-900"}`} />
                  ) : bet.label}
                  {renderChips(getChipsOnType(bet.type))}
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="flex flex-col gap-0.5 ml-1">
            {[3, 2, 1].map((col) => (
              <button
                key={col}
                onClick={() => handleBet(() => createColumnBet(col as 1 | 2 | 3, selectedChipValue))}
                className="relative number-cell flex-1 w-11 bg-gradient-to-b from-gray-800 to-gray-950
                           rounded-r gold-border-thin text-casino-gold font-game text-[9px]
                           flex items-center justify-center hover:from-gray-700 transition-all active:scale-95"
              >
                2:1
                {renderChips(getChipsOnType("column").filter(b => b.numbers[0] === col))}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
