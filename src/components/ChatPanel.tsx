"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { ChatMessage, createPlayerMessage } from "@/lib/bot-crupier";

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
    <div className="glass-panel flex flex-col w-72 h-full">
      {/* Header */}
      <div className="p-3 border-b border-casino-gold/20">
        <h3 className="text-casino-gold font-game text-xs uppercase tracking-wider flex items-center gap-2">
          <span>💬</span> Mesa de Chat
        </h3>
        {/* Online players */}
        <div className="flex items-center gap-1 mt-2">
          {botPlayers.map((bot) => (
            <div
              key={bot.id}
              className="relative group"
              title={bot.name}
            >
              <span className="text-lg cursor-default">{bot.avatar}</span>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black" />
            </div>
          ))}
          <div className="relative">
            <span className="text-lg">🎲</span>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black" />
          </div>
          <span className="text-gray-400 text-[10px] font-game ml-1">
            {botPlayers.length + 1} en mesa
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.isSystem ? "justify-center" : ""}`}>
            {msg.isSystem ? (
              <p className="text-gray-500 text-[10px] font-game italic bg-black/30 px-2 py-1 rounded">
                {msg.text}
              </p>
            ) : (
              <>
                <span className="text-sm flex-shrink-0">{msg.senderAvatar}</span>
                <div className="min-w-0">
                  <span className={`text-[10px] font-game font-bold block
                    ${msg.isBot ? "text-casino-gold" : "text-green-400"}`}>
                    {msg.sender}
                    {msg.sender === "Leon C8L" && (
                      <span className="ml-1 text-[8px] bg-casino-gold/20 text-casino-gold px-1 rounded">
                        CASA
                      </span>
                    )}
                  </span>
                  <p className="text-gray-300 text-[11px] break-words leading-tight mt-0.5">
                    {msg.text}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-casino-gold/20">
        <div className="flex gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe..."
            className="flex-1 bg-black/50 text-white text-xs px-2 py-1.5 rounded
                       border border-casino-gold/20 focus:border-casino-gold/50
                       focus:outline-none font-game placeholder:text-gray-600"
          />
          <button
            onClick={handleSend}
            className="px-2 py-1.5 bg-casino-gold/20 border border-casino-gold/40
                       rounded text-casino-gold text-xs font-game hover:bg-casino-gold/30
                       transition-colors"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
