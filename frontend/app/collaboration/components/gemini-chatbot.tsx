"use client";

import { useState } from "react";
import { sendAIChat } from "../../../services/chatbot/aiService";

export default function GeminiChatBox({ question, code }: { question: string; code: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg, { role: "ai", text: "🧠 Please wait... Gemini is working ✨" }]);
    setInput("");

    try {
      const res = await sendAIChat(question, code, input);
      const replyText =
        res.reply.length > 1500 ? res.reply.slice(0, 1500) + "..." : res.reply;

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove the placeholder
        { role: "ai", text: replyText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "⚠️ Gemini is unavailable right now." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Gemini button */}
      {!isOpen ? (
        <button
          className="bg-gray-100 hover:bg-gray-200 p-4 rounded-xl shadow-md border border-gray-300 flex items-center justify-center transition-all"
          onClick={() => setIsOpen(true)}
        >
          <img
            src="/gemini-logo.png"
            alt="Gemini"
            className="w-12 h-12 object-contain"
          />
        </button>
      ) : (
        <div className="w-80 h-[550px] bg-white border rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-2 bg-blue-600 text-white rounded-t-2xl">
            <span>AI Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-lg">–</button>
          </div>

          {/* Scrollable chat messages */}
          <div className="flex-1 overflow-y-auto p-3 max-h-[400px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-10">
                Hi Gemini, how do I get started?
              </p>
            )}
            {messages.map((m, i) => (
              <p
                key={i}
                className={`my-1 text-sm leading-relaxed ${
                  m.role === "user" ? "text-right text-blue-700" : "text-left text-gray-800"
                }`}
              >
                {m.text}
              </p>
            ))}
          </div>

          {/* Input */}
          <div className="flex p-2 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini..."
              className="flex-1 border rounded-lg px-2 py-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-600 text-white px-3 rounded-lg"
            >
              Send
            </button>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-gray-400 text-center py-1">
            Powered by Gemini ✨
          </p>
        </div>
      )}
    </div>
  );
}
