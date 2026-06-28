"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/game-store";

// Tips the bot gives to players
const GAME_TIPS = [
  "Apuesta en numeros externos (rojo/negro) para mas probabilidad de ganar.",
  "Las apuestas 'pleno' pagan 35:1 pero la probabilidad es baja.",
  "Gestiona tu saldo: no apuestes mas del 5% en un giro.",
  "Las docenas pagan 2:1 — buen equilibrio riesgo/recompensa.",
  "Reclama tu bono diario de +25K fichas cada 24 horas.",
  "Si te quedas sin fichas, espera 1 hora para la recuperacion.",
  "Puedes repetir la ultima apuesta con el boton REPEAT.",
  "Columna 2:1 — cubre 12 numeros de golpe.",
  "El 0 (verde) da ventaja a la casa. Evitalo si quieres ir seguro.",
  "Combina apuestas internas y externas para diversificar.",
];

const BOT_REACTIONS: Record<string, string[]> = {
  betting: [
    "Tomad vuestro tiempo... la ruleta no tiene prisa.",
    "Hagan sus apuestas, damas y caballeros.",
    "Confiad en vuestro instinto.",
  ],
  spinning: [
    "Rien ne va plus! No mas apuestas.",
    "La bola esta en juego... buena suerte!",
    "Vamos a ver que dice la rueda...",
  ],
  result: [
    "Resultado confirmado. Nueva ronda en breve.",
    "La suerte es caprichosa. Seguimos!",
  ],
};

export default function BotModerator() {
  const { phase, lastResult } = useGameStore();
  const [currentTip, setCurrentTip] = useState(0);
  const [botMessage, setBotMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % GAME_TIPS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // React to game phases
  useEffect(() => {
    const reactions = BOT_REACTIONS[phase] || [];
    if (reactions.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setBotMessage(reactions[Math.floor(Math.random() * reactions.length)]);
        setIsTyping(false);
      }, 800);
    }
  }, [phase]);

  return (
    <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 max-w-[220px]">
      {/* Bot avatar + name */}
      <div className="flex items-center gap-2">
        {/* Bot icon - Blue lion */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)",
              border: "2px solid #93c5fd",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
            }}
          >
            <span className="text-2xl">🦁</span>
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-black" />
        </div>
        <div>
          <p className="text-blue-300 font-mono text-xs font-bold">Leon C8L</p>
          <p className="text-blue-500/60 font-mono text-[8px]">@leon_leo_bot</p>
          <p className="text-gray-500 font-mono text-[8px]">MODERADOR</p>
        </div>
      </div>

      {/* Bot speech bubble */}
      <div className="relative bg-blue-950/80 border border-blue-500/30 rounded-lg rounded-tl-none p-2.5 backdrop-blur-sm">
        {/* Arrow */}
        <div className="absolute -top-0 -left-0 w-0 h-0 border-r-[8px] border-r-blue-500/30 border-b-[8px] border-b-transparent" />
        
        {isTyping ? (
          <div className="flex gap-1 items-center py-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <p className="text-blue-100 text-[11px] font-mono leading-tight">
            {botMessage || "Bienvenido a la mesa. Estoy aqui para ayudarte."}
          </p>
        )}
      </div>

      {/* Tip card */}
      <div className="bg-black/60 border border-blue-900/30 rounded-lg p-2 backdrop-blur-sm">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px]">💡</span>
          <span className="text-blue-400 font-mono text-[8px] font-bold uppercase">Consejo</span>
        </div>
        <p className="text-gray-400 text-[10px] font-mono leading-tight">
          {GAME_TIPS[currentTip]}
        </p>
      </div>
    </div>
  );
}
