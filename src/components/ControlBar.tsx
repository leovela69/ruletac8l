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

  return (
    <div className="w-full space-y-3">
      {/* === BIG SPIN BUTTON - always visible === */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleSpin}
          disabled={!canSpin()}
          className={`relative w-full max-w-[300px] py-4 rounded-2xl font-bold text-2xl uppercase tracking-wider transition-all
                     ${canSpin()
                       ? "bg-gradient-to-b from-teal-400 to-teal-600 text-white hover:from-teal-300 hover:to-teal-500 active:scale-95 shadow-[0_0_30px_rgba(45,212,191,0.4)] border-2 border-teal-300/50"
                       : phase === "spinning"
                         ? "bg-gradient-to-b from-amber-500 to-amber-700 text-white border-2 border-amber-400/50 animate-pulse"
                         : "bg-[#2a2a2a] text-gray-600 cursor-not-allowed border-2 border-white/5"}`}
        >
          {phase === "spinning" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin text-xl">🎱</span>
              GIRANDO...
            </span>
          ) : phase === "result" ? (
            "VER RESULTADO"
          ) : currentBets.length === 0 ? (
            <span className="text-lg">👆 COLOCA FICHAS Y GIRA</span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🎰 TIRAR BOLA
            </span>
          )}
        </button>
      </div>

      {/* === PLAYER PANEL: Balance + Chips + Actions === */}
      <div className="bg-[#111]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-3">
        {/* Balance & Bet Info */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-500 text-[9px] font-mono uppercase">Tu Balance</span>
            <span className="text-white font-mono text-xl font-bold">
              {formatBalance(player.balance)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[9px] font-mono uppercase">Apuesta</span>
            <span className="text-teal-400 font-mono text-xl font-bold">
              {totalBet > 0 ? formatBalance(totalBet) : "—"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[9px] font-mono uppercase">Giros</span>
            <span className="text-gray-300 font-mono text-xl">
              {player.spinsCount}
            </span>
          </div>
        </div>

        {/* Chip Selector */}
        <div>
          <span className="text-gray-500 text-[8px] font-mono uppercase block mb-1.5">Selecciona ficha:</span>
          <div className="flex items-center justify-center gap-3">
            {CHIP_VALUES.map((value) => {
              const isSelected = selectedChipValue === value;
              return (
                <button
                  key={value}
                  onClick={() => setChipValue(value)}
                  className={`chip w-12 h-12 flex items-center justify-center text-white font-bold text-[10px]
                    bg-teal-500 border-[3px] border-dashed border-sky-300
                    ${isSelected
                      ? "ring-3 ring-white ring-offset-2 ring-offset-black scale-115 brightness-125 shadow-[0_0_12px_rgba(45,212,191,0.5)]"
                      : "opacity-50 hover:opacity-75"}`}
                >
                  {value >= 1000 ? `${value / 1000}K` : value}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={repeatLastBets}
            disabled={phase !== "betting" || !lastResult}
            className="px-4 py-2 rounded-lg bg-[#222] border border-white/10
                       text-white text-xs font-mono flex items-center gap-1.5
                       hover:bg-[#333] transition-colors
                       disabled:opacity-20 disabled:cursor-not-allowed"
          >
            🔄 Repetir
          </button>
          <button
            onClick={clearBets}
            disabled={phase !== "betting" || currentBets.length === 0}
            className="px-4 py-2 rounded-lg bg-[#222] border border-red-900/30
                       text-red-400 text-xs font-mono flex items-center gap-1.5
                       hover:bg-[#333] transition-colors
                       disabled:opacity-20 disabled:cursor-not-allowed"
          >
            ✕ Borrar
          </button>
        </div>
      </div>

      {/* Bonus/Recovery */}
      {(bankrupt || canBonus) && phase === "betting" && (
        <div className="flex items-center justify-center gap-3">
          {bankrupt && (
            <button
              onClick={claimBankruptcyRecovery}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800
                         text-white text-xs font-mono font-bold
                         hover:from-amber-500 hover:to-amber-700 transition-all animate-pulse"
            >
              💰 RECUPERACION +10K
            </button>
          )}
          {canBonus && !bankrupt && (
            <button
              onClick={claimBonus}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-800
                         text-white text-xs font-mono font-bold
                         hover:from-teal-500 hover:to-teal-700 transition-all"
            >
              🎁 BONO DIARIO +25K
            </button>
          )}
        </div>
      )}
    </div>
  );
}
