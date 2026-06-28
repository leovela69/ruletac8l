"use client";

import { useGameStore } from "@/store/game-store";
import { formatBalance, isBankrupt, canClaimDailyBonus } from "@/lib/economy";
import { audioEngine } from "@/lib/audio-engine";

const CHIP_VALUES = [50, 100, 500, 1000, 5000];

export default function ControlBar() {
  const {
    player,
    phase,
    selectedChipValue,
    currentBets,
    lastResult,
    spin,
    clearBets,
    repeatLastBets,
    setChipValue,
    canSpin,
    getTotalBetAmount,
    claimBonus,
    claimBankruptcyRecovery,
  } = useGameStore();

  const totalBet = getTotalBetAmount();
  const bankrupt = isBankrupt(player);
  const canBonus = canClaimDailyBonus(player);

  const handleSpin = () => {
    audioEngine.init();
    spin();
  };

  // Turquoise chip selector style matching the reference
  const getChipStyle = (value: number) => {
    const isSelected = selectedChipValue === value;
    return `chip w-11 h-11 flex items-center justify-center text-white font-bold text-[9px]
            bg-teal-500 border-[3px] border-dashed border-sky-300
            ${isSelected ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-115 brightness-110" : "opacity-60"}`;
  };

  return (
    <div className="w-full">
      {/* Chip selector */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {CHIP_VALUES.map((value) => (
          <button
            key={value}
            onClick={() => setChipValue(value)}
            className={getChipStyle(value)}
          >
            {value >= 1000 ? `${value / 1000}K` : value}
          </button>
        ))}
      </div>

      {/* Control strip */}
      <div className="flex items-center justify-between gap-3 bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
        {/* Balance */}
        <div className="flex flex-col items-center min-w-[90px]">
          <span className="text-gray-500 text-[9px] font-mono uppercase">Balance</span>
          <span className="text-white font-mono text-base font-bold">
            {formatBalance(player.balance)}
          </span>
        </div>

        {/* Total bet */}
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-gray-500 text-[9px] font-mono uppercase">Bet</span>
          <span className="text-teal-400 font-mono text-base font-bold">
            {formatBalance(totalBet)}
          </span>
        </div>

        {/* SPIN */}
        <button
          onClick={handleSpin}
          disabled={!canSpin()}
          className={`px-8 py-3 rounded-full font-bold text-lg uppercase transition-all
                     ${canSpin()
                       ? "bg-teal-500 text-white hover:bg-teal-400 active:scale-95 shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                       : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
        >
          {phase === "spinning" ? "..." : phase === "result" ? "OK" : "SPIN"}
        </button>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={repeatLastBets}
            disabled={phase !== "betting" || !lastResult}
            className="px-3 py-2 rounded bg-[#2a2a2a] border border-white/10
                       text-white text-[10px] font-mono
                       hover:bg-[#333] transition-colors
                       disabled:opacity-20 disabled:cursor-not-allowed"
          >
            REPEAT
          </button>
          <button
            onClick={clearBets}
            disabled={phase !== "betting" || currentBets.length === 0}
            className="px-3 py-2 rounded bg-[#2a2a2a] border border-red-900/30
                       text-red-400 text-[10px] font-mono
                       hover:bg-[#333] transition-colors
                       disabled:opacity-20 disabled:cursor-not-allowed"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Bonus/Recovery */}
      {(bankrupt || canBonus) && phase === "betting" && (
        <div className="mt-2 flex items-center justify-center gap-3">
          {bankrupt && (
            <button
              onClick={claimBankruptcyRecovery}
              className="px-4 py-2 rounded bg-amber-700 text-white text-xs font-mono
                         hover:bg-amber-600 transition-colors"
            >
              RECOVERY +10K
            </button>
          )}
          {canBonus && !bankrupt && (
            <button
              onClick={claimBonus}
              className="px-4 py-2 rounded bg-teal-700 text-white text-xs font-mono
                         hover:bg-teal-600 transition-colors"
            >
              DAILY BONUS +25K
            </button>
          )}
        </div>
      )}
    </div>
  );
}
