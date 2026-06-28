"use client";

import { useEffect, useState } from "react";
import RouletteWheel3D from "@/components/RouletteWheel3D";
import BettingTable3D from "@/components/BettingTable3D";
import HistoryPanel from "@/components/HistoryPanel";
import ControlBar from "@/components/ControlBar";
import ResultOverlay from "@/components/ResultOverlay";
import ChatPanel from "@/components/ChatPanel";
import Logo from "@/components/Logo";
import { useGameStore } from "@/store/game-store";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { initGame } = useGameStore();

  useEffect(() => {
    setMounted(true);
    initGame();
  }, [initGame]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-casino-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-casino-gold font-game text-lg tracking-widest">
            C8L CASINO
          </span>
          <span className="text-gray-500 font-game text-xs">Cargando mesa...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-stretch overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 felt-texture" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Main game area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-4 px-4 min-w-0">
        {/* Header with Logo */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-2">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-game text-[10px] flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              EN VIVO
            </span>
            <span className="text-gray-600 font-game text-[9px]">
              Mesa #1
            </span>
          </div>
        </div>

        {/* Wheel + History area */}
        <div className="flex items-center justify-center gap-6 w-full max-w-4xl">
          {/* History Panel (Left) */}
          <HistoryPanel />

          {/* Roulette Wheel (Center) */}
          <div className="flex-shrink-0">
            <RouletteWheel3D />
          </div>

          {/* Bot Players info (Right) */}
          <BotPlayersPanel />
        </div>

        {/* Betting Table */}
        <div className="w-full max-w-3xl mt-4">
          <BettingTable3D />
        </div>

        {/* Control Bar */}
        <div className="w-full max-w-3xl mt-3">
          <ControlBar />
        </div>

        {/* Result Overlay */}
        <ResultOverlay />
      </div>

      {/* Chat Panel (Right side) */}
      <div className="relative z-10 w-72 flex-shrink-0 border-l border-casino-gold/10">
        <ChatPanel />
      </div>

      {/* Decorative corners */}
      <div className="fixed top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-casino-gold/20 rounded-br-2xl pointer-events-none z-20" />
      <div className="fixed top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-casino-gold/20 rounded-bl-2xl pointer-events-none z-20" />
      <div className="fixed bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-casino-gold/20 rounded-tr-2xl pointer-events-none z-20" />
      <div className="fixed bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-casino-gold/20 rounded-tl-2xl pointer-events-none z-20" />
    </main>
  );
}

// Bot players mini panel
function BotPlayersPanel() {
  const { botPlayers } = useGameStore();

  return (
    <div className="glass-panel p-3 w-28 flex flex-col items-center gap-2">
      <h3 className="text-casino-gold font-game text-[9px] text-center uppercase tracking-wider">
        Jugadores
      </h3>
      <div className="flex flex-col gap-2 w-full">
        {/* Player */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎲</span>
          <div className="min-w-0">
            <p className="text-green-400 text-[9px] font-game truncate">Tu</p>
          </div>
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-auto flex-shrink-0" />
        </div>
        {/* Bots */}
        {botPlayers.slice(0, 4).map((bot) => (
          <div key={bot.id} className="flex items-center gap-1.5">
            <span className="text-sm">{bot.avatar}</span>
            <div className="min-w-0">
              <p className={`text-[9px] font-game truncate ${bot.isHouse ? "text-casino-gold" : "text-gray-400"}`}>
                {bot.name.split("_")[0]}
              </p>
            </div>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
