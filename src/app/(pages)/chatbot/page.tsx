"use client";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const ChatBotPage = () => {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hello! I am MedVision AI. I can assist you with general medical questions or details about our tumor detection system. How can I help?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Focus ref explicitly assigned to the inner conversation message container boundaries
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only execute inner layout alignment shifts if there is real text flow history
    if (messages.length > 1 && chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      // Performs an isolated container scroll-to-bottom instead of snapping the main window page viewpoint
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Replace your existing handleSend function
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/api/chat", {
        message: input,
        username: user?.name || "there", // ← sends username to route.ts
      });
      const data = response.data;

      const botMessage = {
        role: "bot" as const,
        text: data.reply || "No response received.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Server Error";

      setMessages((prev) => [
        ...prev,
        {
          role: "bot" as const,
          text: `⚠️ Error: Could not connect to MedVision AI. ${errorMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIXED: Adjusted h-screen down to an isolated fluid dynamic viewport layout wrapper
    <div className="min-h-[calc(100vh-100px)] text-white w-full font-sans tracking-wide flex flex-col justify-center items-center">
      <main className="w-full flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl mx-auto">
        {/* Chat Container Wrapper */}
        <div className="w-full bg-[#1a163a] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh] sm:h-[80vh] border border-white/10 relative">
          {/* Header */}
          <div className="bg-[#2d2858] p-3 sm:p-4 flex items-center border-b border-white/5 flex-none">
            <div className="bg-purple-600/20 p-2 rounded-full mr-2.5 sm:mr-3 flex-none">
              <i className="fa-solid fa-robot text-purple-400 text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base truncate">
                MedVision AI Assistant
              </h2>
              <p className="text-[11px] sm:text-xs text-green-400 flex items-center mt-0.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1 flex-none animate-pulse"></span>{" "}
                Online
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={chatMessagesContainerRef}
            className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm sm:text-base break-words shadow-sm ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-[#2d2858] text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#2d2858] p-3 sm:p-4 rounded-2xl rounded-bl-none flex space-x-1.5 sm:space-x-2 items-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-[#1a163a] border-t border-white/5 flex gap-2 sm:gap-4 items-center flex-none"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about brain tumors or upload help..."
              className="flex-grow bg-[#0f0c29] border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition min-w-0 placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex-none flex items-center justify-center min-h-[40px] min-w-[40px]"
            >
              <i className="fa-solid fa-paper-plane text-sm sm:text-base"></i>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatBotPage;
