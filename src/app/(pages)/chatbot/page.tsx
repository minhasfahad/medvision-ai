"use client";

import api from "@/src/lib/axios";
import { useState, useRef, useEffect } from "react";

// Define the shape of a message
interface Message {
  role: "user" | "bot";
  text: string;
}

const ChatBotPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hello! I am MedVision AI. I can assist you with general medical questions or details about our tumor detection system. How can I help?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom ONLY when there are new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only scroll if there is more than just the initial welcome message
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Make POST request with Axios
      const response = await api.post("/api/chat", { message: input });

      // Axios automatically parses JSON, so data is already in response.data
      const data = response.data;

      // Only add message if 'reply' exists
      const botMessage = {
        role: "bot" as const,
        text: data.reply || "No response received.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat Error:", error);

      // Axios errors can be in error.response.data, or general error.message
      const errorMsg =
        error.response?.data?.error || error.message || "Server Error";

      // Show error in chat bubble
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `⚠️ Error: Could not connect to MedVision AI. ${errorMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen text-white">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Chat Container */}
        <div className="w-full max-w-4xl bg-[#1a163a] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] border border-white/10">
          {/* Header */}
          <div className="bg-[#2d2858] p-4 flex items-center border-b border-white/5">
            <div className="bg-purple-600/20 p-2 rounded-full mr-3">
              <i className="fa-solid fa-robot text-purple-400 text-xl"></i>
            </div>
            <div>
              <h2 className="font-bold">MedVision AI Assistant</h2>
              <p className="text-xs text-green-400 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>{" "}
                Online
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-[#2d2858] text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#2d2858] p-4 rounded-2xl rounded-bl-none flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-[#1a163a] border-t border-white/5 flex gap-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about brain tumors or upload help..."
              className="flex-grow bg-[#0f0c29] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatBotPage;
