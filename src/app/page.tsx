"use client";

import { useEffect, useState } from "react";
import RouletteWheel3D from "@/components/RouletteWheel3D";
import BettingTable3D from "@/components/BettingTable3D";
import ControlBar from "@/components/ControlBar";
import ResultOverlay from "@/components/ResultOverlay";
import ChatPanel from "@/components/ChatPanel";
import HUD from "@/components/HUD";
import BotModerator from "@/components/BotModerator";
import PlayersBar from "@/components/PlayersBar";
import PlayerBubbles from "@/components/PlayerBubbles";
import CasinoBackground from "@/components/CasinoBackground";
import { useGameStore } from "@/store/game-store";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { initGame, chatOpen } = useGameStore();

  useEffect(() => {
    setMounted(true);
    initGame();
  }, [initGame]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white font-sans text-lg font-bold tracking-widest">
            C8L RULETA
          </span>
          <span className="text-gray-500 font-mono text-xs">Conectando a la mesa...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex overflow-hidden">
      {/* Casino Background with C8L Logo */}
      <CasinoBackground />

      {/* Bot Moderator (top-left, doesn't obstruct) */}
      <BotModerator />

      {/* HUD Stats (top-right) */}
      <HUD />

      {/* Players Bar (bottom-left) */}
      <PlayersBar />

      {/* Player chat bubbles (floating above seats) */}
      <PlayerBubbles />

      {/* Main game area - horizontal layout: Table LEFT, Wheel RIGHT */}
      <div className={`flex-1 flex items-center justify-center p-4 gap-8 pl-[240px] transition-all duration-300
        ${chatOpen ? "pr-[16px]" : "pr-4"}`}>
        {/* Tapete negro con borde dorado - solo envuelve mesa + ruleta */}
        <div className="relative rounded-2xl p-6
                        bg-gradient-to-b from-[#1a1a1a] via-[#0d0d0d] to-[#111111]
                        border-2 border-amber-500/50
                        shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,215,0,0.1)]">
          {/* Inner gold accent line */}
          <div className="absolute inset-[6px] rounded-xl border border-amber-600/20 pointer-events-none" />

          {/* Corner ornaments */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg" />

          {/* Content: Table + Wheel */}
          <div className="flex items-center gap-8">
            {/* LEFT: Betting Table + Controls */}
            <div className="flex flex-col gap-3 max-w-[540px]">
              <BettingTable3D />
              <ControlBar />
            </div>

            {/* RIGHT: Roulette Wheel */}
            <RouletteWheel3D />
          </div>
        </div>
      </div>

      {/* Chat Panel (right sidebar) - conditionally rendered */}
      {chatOpen ? (
        <div className="w-72 flex-shrink-0 h-screen transition-all duration-300 ease-in-out">
          <ChatPanel />
        </div>
      ) : (
        <ChatPanel />
      )}

      {/* Result Overlay */}
      <ResultOverlay />
    </main>
  );
}
