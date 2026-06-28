"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { createPlayerMessage } from "@/lib/bot-crupier";

export default function ChatPanel() {
  const { chatMessages, addChatMessage, botPlayers } = useGameStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    addChatMessage(createPlayerMessage(input.trim()));
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="glass-panel flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-white font-mono text-xs font-bold uppercase">Chat</span>
          <span className="text-gray-600 font-mono text-[9px]">
            {botPlayers.length + 1} online
          </span>
        </div>
        {/* Players */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-sm" title="Tu">🎲</span>
          {botPlayers.map((bot) => (
            <span key={bot.id} className="text-sm" title={bot.name}>{bot.avatar}</span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {chatMessages.map((msg) => (
          <div key={msg.id}>
            {msg.isSystem ? (
              <p className="text-gray-600 text-[10px] font-mono text-center py-1">
                {msg.text}
              </p>
            ) : (
              <div className="flex gap-2 items-start">
                <span className="text-xs flex-shrink-0">{msg.senderAvatar}</span>
                <div className="min-w-0">
                  <span className={`text-[9px] font-mono font-bold
                    ${msg.isBot ? "text-yellow-500" : "text-teal-400"}`}>
                    {msg.sender}
                  </span>
                  <p className="text-gray-300 text-[11px] font-mono break-words leading-tight">
                    {msg.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-white/5">
        <div className="flex gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type..."
            className="flex-1 bg-black/50 text-white text-xs px-2 py-1.5 rounded
                       border border-white/10 focus:border-teal-500/50
                       focus:outline-none font-mono placeholder:text-gray-700"
          />
          <button
            onClick={handleSend}
            className="px-2 py-1.5 bg-teal-600 rounded text-white text-xs font-mono
                       hover:bg-teal-500 transition-colors"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
