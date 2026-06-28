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
        {/* LEFT: Betting Table + Controls */}
        <div className="flex flex-col gap-3 max-w-[540px]">
          <BettingTable3D />
          <ControlBar />
        </div>

        {/* RIGHT: Roulette Wheel */}
        <RouletteWheel3D />
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
