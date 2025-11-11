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
    setMessages([...messages, userMsg]);
    setInput("");

    try {

      const res = await sendAIChat(question, code, input);
      const aiMsg = { role: "ai", text: res.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Gemini is unavailable right now." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      {/* Floating toggle button */}
      {!isOpen ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          💬 Gemini
        </button>
      ) : (
        <div className="w-80 bg-white border rounded-2xl shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-2 bg-blue-600 text-white rounded-t-2xl">
            <span>AI Assistant</span>
            <button onClick={() => setIsOpen(false)}>–</button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 h-80">
            {messages.map((m, i) => (
              <p
                key={i}
                className={`my-1 text-sm ${
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
            />
            <button onClick={handleSend} className="ml-2 bg-blue-600 text-white px-3 rounded-lg">
              Send
            </button>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-gray-400 text-center py-1">Powered by Gemini ✨</p>
        </div>
      )}
    </div>
  );
}
