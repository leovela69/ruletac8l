"use client";

import { useEffect, useState } from "react";
import RouletteWheel3D from "@/components/RouletteWheel3D";
import BettingTable3D from "@/components/BettingTable3D";
import ControlBar from "@/components/ControlBar";
import ResultOverlay from "@/components/ResultOverlay";
import ChatPanel from "@/components/ChatPanel";
import HUD from "@/components/HUD";
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
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-white font-sans text-lg font-bold tracking-widest">
            C8L RULETA
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex bg-black overflow-hidden">
      {/* HUD Stats */}
      <HUD />

      {/* Main game area - horizontal layout */}
      <div className="flex-1 flex items-center justify-center p-4 gap-6">
        {/* LEFT: Betting Table */}
        <div className="flex flex-col gap-3 max-w-[520px]">
          <BettingTable3D />
          <ControlBar />
        </div>

        {/* RIGHT: Roulette Wheel */}
        <RouletteWheel3D />
      </div>

      {/* Chat Panel (right sidebar) */}
      <div className="w-64 flex-shrink-0 border-l border-white/5 h-screen">
        <ChatPanel />
      </div>

      {/* Result Overlay */}
      <ResultOverlay />
    </main>
  );
}
