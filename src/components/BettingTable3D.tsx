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

  // Count chips on a specific number
  const getChipsOnNumber = (num: number) => {
    return currentBets.filter(b => b.type === "straight" && b.numbers[0] === num);
  };

  const getChipsOnType = (type: string) => {
    return currentBets.filter(b => b.type === type);
  };

  // Render turquoise chip on cell - stacked and clearly visible
  const renderChip = (bets: typeof currentBets) => {
    if (bets.length === 0) return null;
    const count = bets.length;
    const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative">
          {/* Stack of chips */}
          {bets.slice(0, 5).map((bet, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translateY(${-i * 3}px)`,
                zIndex: 20 + i,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #5eead4, #14b8a6, #0d9488)",
                  border: "3px dashed rgba(56, 189, 248, 0.8)",
                  boxShadow: `0 ${2 + i}px ${4 + i * 2}px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)`,
                }}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-sky-200" />
              </div>
            </div>
          ))}
          {/* Amount label */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-teal-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap border border-teal-500/30"
            style={{ zIndex: 30 }}
          >
            {totalAmount >= 1000 ? `${(totalAmount / 1000).toFixed(1)}K` : totalAmount}
          </div>
          {/* Count badge if multiple */}
          {count > 1 && (
            <div
              className="absolute -top-1 -right-1 bg-white text-black text-[7px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-gray-300"
              style={{ zIndex: 30 }}
            >
              x{count}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Grid layout: 3 rows x 12 columns
  const rows = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  return (
    <div className={`transition-opacity duration-300 ${!isActive ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="bg-[#2d8c3e] rounded-lg p-3 border-4 border-white/20">
        <div className="flex">
          {/* Zero cell */}
          <div className="flex flex-col justify-center mr-1">
            <button
              onClick={() => handleBet(() => createStraightBet(0, selectedChipValue))}
              className="relative w-14 h-full bg-[#1a8a2e] rounded-lg border-2 border-white
                         flex items-center justify-center hover:brightness-110
                         transition-all duration-100 active:scale-95"
            >
              <span className="text-white font-bold text-2xl font-sans">0</span>
              {renderChip(getChipsOnNumber(0))}
            </button>
          </div>

          {/* Number grid */}
          <div className="flex-1">
            <div className="grid grid-rows-3 gap-[2px]">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-12 gap-[2px]">
                  {row.map((num) => {
                    const color = getNumberColor(num);
                    const bgColor = color === "red" ? "bg-[#c0392b]" : "bg-[#1a1a2e]";
                    return (
                      <button
                        key={num}
                        onClick={() => handleBet(() => createStraightBet(num, selectedChipValue))}
                        className={`relative h-12 flex items-center justify-center
                                   rounded-full border-2 border-white
                                   ${bgColor} hover:brightness-125
                                   transition-all duration-100 active:scale-90`}
                      >
                        <span className="text-white font-bold text-sm font-sans">{num}</span>
                        {renderChip(getChipsOnNumber(num))}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Dozens row */}
            <div className="grid grid-cols-3 gap-[2px] mt-1">
              {[
                { label: "1st 12", fn: () => createDozenBet(1, selectedChipValue) },
                { label: "2nd 12", fn: () => createDozenBet(2, selectedChipValue) },
                { label: "3rd 12", fn: () => createDozenBet(3, selectedChipValue) },
              ].map((d, i) => (
                <button
                  key={i}
                  onClick={() => handleBet(d.fn)}
                  className="relative h-9 bg-[#2d8c3e] border-2 border-white rounded
                             flex items-center justify-center hover:brightness-110
                             transition-all active:scale-95"
                >
                  <span className="text-white font-bold text-xs font-sans">{d.label}</span>
                  {renderChip(getChipsOnType("dozen"))}
                </button>
              ))}
            </div>

            {/* Outside bets */}
            <div className="grid grid-cols-6 gap-[2px] mt-1">
              {[
                { label: "1-18", fn: () => createLowBet(selectedChipValue), type: "low" },
                { label: "EVEN", fn: () => createEvenBet(selectedChipValue), type: "even" },
                { label: null, fn: () => createRedBet(selectedChipValue), type: "red", color: "red" },
                { label: null, fn: () => createBlackBet(selectedChipValue), type: "black", color: "black" },
                { label: "ODD", fn: () => createOddBet(selectedChipValue), type: "odd" },
                { label: "19-36", fn: () => createHighBet(selectedChipValue), type: "high" },
              ].map((bet, i) => (
                <button
                  key={i}
                  onClick={() => handleBet(bet.fn)}
                  className="relative h-9 bg-[#2d8c3e] border-2 border-white rounded
                             flex items-center justify-center hover:brightness-110
                             transition-all active:scale-95"
                >
                  {bet.label ? (
                    <span className="text-white font-bold text-[10px] font-sans">{bet.label}</span>
                  ) : (
                    <div className={`w-5 h-5 rotate-45 ${bet.color === "red" ? "bg-[#c0392b]" : "bg-[#1a1a2e]"}`} />
                  )}
                  {renderChip(getChipsOnType(bet.type))}
                </button>
              ))}
            </div>
          </div>

          {/* Column bets - rotated text */}
          <div className="flex flex-col gap-[2px] ml-1">
            {[3, 2, 1].map((col) => (
              <button
                key={col}
                onClick={() => handleBet(() => createColumnBet(col as 1 | 2 | 3, selectedChipValue))}
                className="relative flex-1 w-10 bg-[#2d8c3e] border-2 border-white rounded
                           flex items-center justify-center hover:brightness-110
                           transition-all active:scale-95"
              >
                <span className="text-white font-bold text-[9px] font-sans [writing-mode:vertical-rl] rotate-180">
                  2 to 1
                </span>
                {renderChip(getChipsOnType("column").filter(b => b.numbers[0] === col))}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
