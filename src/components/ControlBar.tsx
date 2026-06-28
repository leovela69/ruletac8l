"use client";

import { useGameStore } from "@/store/game-store";
import { formatBalance, isBankrupt, canClaimDailyBonus } from "@/lib/economy";
import { audioEngine } from "@/lib/audio-engine";

const CHIP_VALUES = [50, 100, 500, 1000, 5000];
const CHIP_COLORS: Record<number, { bg: string; ring: string }> = {
  50: { bg: "bg-blue-600", ring: "ring-blue-400" },
  100: { bg: "bg-green-600", ring: "ring-green-400" },
  500: { bg: "bg-red-600", ring: "ring-red-400" },
  1000: { bg: "bg-purple-600", ring: "ring-purple-400" },
  5000: { bg: "bg-yellow-500", ring: "ring-yellow-300" },
};

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
    <div className="w-full">
      {/* Chip selector */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {CHIP_VALUES.map((value) => {
          const colors = CHIP_COLORS[value];
          const isSelected = selectedChipValue === value;
          return (
            <button
              key={value}
              onClick={() => setChipValue(value)}
              className={`chip w-12 h-12 flex items-center justify-center
                         text-white font-bold text-[10px] font-game border-[3px] border-white/40
                         relative overflow-hidden
                         ${colors.bg}
                         ${isSelected ? `ring-2 ${colors.ring} ring-offset-2 ring-offset-black scale-115 shadow-gold` : "opacity-60 hover:opacity-80"}`}
              style={{
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Chip pattern */}
              <div className="absolute inset-1 rounded-full border border-dashed border-white/30" />
              <span className="relative z-10">
                {value >= 1000 ? `${value / 1000}K` : value}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main control strip */}
      <div className="flex items-center justify-between gap-4 bg-black/60 backdrop-blur-sm rounded-2xl p-4 gold-border">
        {/* Balance */}
        <div className="flex flex-col items-center min-w-[110px]">
          <span className="text-gray-500 font-game text-[9px] uppercase tracking-wider">Saldo</span>
          <span className="text-casino-goldLight font-game text-xl font-bold">
            {formatBalance(player.balance)}
          </span>
        </div>

        {/* Total bet */}
        <div className="flex flex-col items-center min-w-[90px]">
          <span className="text-gray-500 font-game text-[9px] uppercase tracking-wider">Apuesta</span>
          <span className="text-white font-game text-lg font-bold">
            {formatBalance(totalBet)}
          </span>
        </div>

        {/* SPIN button */}
        <button
          onClick={handleSpin}
          disabled={!canSpin()}
          className={`relative px-10 py-4 rounded-full font-game text-xl font-bold uppercase
                     overflow-hidden transition-all duration-300
                     ${canSpin()
                       ? "bg-gradient-to-b from-green-400 to-green-700 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95"
                       : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
        >
          {/* Glow effect */}
          {canSpin() && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
          )}
          <span className="relative z-10">
            {phase === "spinning" ? "⏳" : phase === "result" ? "✨" : "GIRAR"}
          </span>
        </button>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={repeatLastBets}
            disabled={phase !== "betting" || !lastResult}
            className="px-3 py-2 rounded-lg bg-black/50 border border-casino-gold/30
                       text-casino-gold font-game text-[9px] uppercase
                       hover:border-casino-gold/60 hover:bg-black/70 transition-all
                       disabled:opacity-20 disabled:cursor-not-allowed"
            title="Repetir ultima apuesta"
          >
            🔄 Repetir
          </button>

          <button
            onClick={clearBets}
            disabled={phase !== "betting" || currentBets.length === 0}
            className="px-3 py-2 rounded-lg bg-black/50 border border-red-900/30
                       text-red-400 font-game text-[9px] uppercase
                       hover:border-red-700/60 hover:bg-black/70 transition-all
                       disabled:opacity-20 disabled:cursor-not-allowed"
            title="Borrar apuestas"
          >
            ✕ Borrar
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-gray-500 font-game text-[9px] uppercase tracking-wider">Giros</span>
          <span className="text-gray-300 font-game text-lg">{player.spinsCount}</span>
        </div>
      </div>

      {/* Bonus/Recovery */}
      {(bankrupt || canBonus) && phase === "betting" && (
        <div className="mt-3 flex items-center justify-center gap-3">
          {bankrupt && (
            <button
              onClick={claimBankruptcyRecovery}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800
                         text-white font-game text-xs uppercase shadow-lg
                         hover:from-amber-500 hover:to-amber-700 hover:scale-105 transition-all
                         animate-pulse"
            >
              💰 Reclamar Recuperacion (+10K)
            </button>
          )}
          {canBonus && !bankrupt && (
            <button
              onClick={claimBonus}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-800
                         text-white font-game text-xs uppercase shadow-lg
                         hover:from-green-500 hover:to-green-700 hover:scale-105 transition-all"
            >
              🎁 Bono Diario +25K
            </button>
          )}
        </div>
      )}
    </div>
  );
}
