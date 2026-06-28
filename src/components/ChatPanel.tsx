"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useGameStore } from "@/store/game-store";
import { createPlayerMessage } from "@/lib/bot-crupier";
import Image from "next/image";

export default function ChatPanel() {
  const { data: session } = useSession();
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
    if (!session?.user) return;
    // Create message with real user data
    const msg = {
      ...createPlayerMessage(input.trim()),
      sender: session.user.name || "Jugador",
      senderAvatar: session.user.image || "",
    };
    addChatMessage(msg);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-black/70 backdrop-blur-sm">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-white font-mono text-xs font-bold uppercase tracking-wider">
            💬 Chat Mesa
          </span>
          <span className="text-gray-500 font-mono text-[9px]">
            {botPlayers.length + 1} online
          </span>
        </div>

        {/* Online Players - circular avatars */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
          {/* Current user */}
          {session?.user && (
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.4)]">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Tu"}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                    {(session.user.name || "T")[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
            </div>
          )}

          {/* Bot players */}
          {botPlayers.map((bot) => (
            <div key={bot.id} className="relative flex-shrink-0" title={bot.name}>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
                <span className="text-lg">{bot.avatar}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {chatMessages.map((msg) => (
          <div key={msg.id}>
            {msg.isSystem ? (
              <p className="text-gray-600 text-[10px] font-mono text-center py-1 px-2 bg-white/5 rounded-full">
                {msg.text}
              </p>
            ) : (
              <div className="flex gap-2 items-start">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                  {msg.senderAvatar && msg.senderAvatar.length > 2 ? (
                    // Real image URL (Google avatar)
                    <Image
                      src={msg.senderAvatar}
                      alt={msg.sender}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Emoji avatar (bots)
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-sm">{msg.senderAvatar || "🎲"}</span>
                    </div>
                  )}
                </div>

                {/* Message content */}
                <div className="min-w-0 flex-1">
                  <span className={`text-[10px] font-mono font-bold block
                    ${msg.isBot ? "text-amber-400" : "text-teal-300"}`}>
                    {msg.sender}
                    {msg.sender === "Leon C8L" && (
                      <span className="ml-1.5 text-[7px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded">
                        CASA
                      </span>
                    )}
                  </span>
                  <p className="text-gray-200 text-[11px] break-words leading-relaxed mt-0.5">
                    {msg.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input / Login area */}
      <div className="p-3 border-t border-white/10">
        {session?.user ? (
          <div>
            {/* User info bar */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-teal-400/50">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-700 flex items-center justify-center text-[8px] text-white font-bold">
                    {(session.user.name || "T")[0]}
                  </div>
                )}
              </div>
              <span className="text-teal-300 text-[9px] font-mono flex-1 truncate">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-gray-600 text-[8px] font-mono hover:text-red-400 transition-colors"
              >
                Salir
              </button>
            </div>

            {/* Chat input */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-white/5 text-white text-xs px-3 py-2 rounded-lg
                           border border-white/10 focus:border-teal-500/50
                           focus:outline-none font-mono placeholder:text-gray-600"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-3 py-2 bg-teal-600 rounded-lg text-white text-xs font-mono font-bold
                           hover:bg-teal-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        ) : (
          /* Login prompt */
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                       bg-white/10 border border-white/20 hover:bg-white/15
                       transition-all group"
          >
            {/* Google icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white text-xs font-mono group-hover:text-teal-200 transition-colors">
              Entrar con Google para chatear
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
