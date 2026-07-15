"use client";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // <-- 1. Imported ReactMarkdown
import { Bot, Send, Sparkles, User as UserIcon } from "lucide-react";
import AmbientBackground from "@/src/components/AmbientBackground";
import Reveal from "@/src/components/Reveal";

interface Message {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "What is a glioma?",
  "How accurate is the AI model?",
  "How do I upload an MRI scan?",
];

const ChatBotPage = () => {
  const { user, token } = useAuthStore();
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
      console.log("Token being sent:", token);
      console.log("User:", user);
      const response = await api.post("/api/chat", {
        message: input,
        username: user?.name || "there",
        userRole: user?.role || null,
        token: token || null,
        history: messages.slice(-20).map((msg) => ({
          role: msg.role,
          text: msg.text,
        })),
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
    <div className="relative min-h-[calc(100vh-100px)] text-white w-full font-sans tracking-wide flex flex-col justify-center items-center px-2 sm:px-4">
      <AmbientBackground />

      <main className="relative w-full flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl mx-auto">
        <Reveal className="mb-4 sm:mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> DistilBERT Medical Assistant
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
            Ask MedVision AI
          </h1>
        </Reveal>

        {/* Chat Container Wrapper */}
        <Reveal delay={80} className="w-full">
          <div className="w-full bg-[#0f1123]/70 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[75vh] sm:h-[80vh] border border-white/10 relative">
            {/* Header */}
            <div className="relative bg-[#0d1128] bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-3 sm:p-4 flex items-center justify-between border-b border-white/10 flex-none overflow-hidden">
              <div className="relative flex items-center min-w-0">
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl mr-2.5 sm:mr-3 flex-none shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-[#0f1123] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm sm:text-base truncate text-white">
                    MedVision AI Assistant
                  </h2>
                  <p className="text-[11px] sm:text-xs text-green-400 flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1 flex-none animate-pulse"></span>{" "}
                    Online
                  </p>
                </div>
              </div>

              <span className="relative hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-900/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 flex-none">
                <Sparkles className="w-3 h-3" />
                Medical NLP
              </span>
            </div>

            {/* Messages Area */}
            <div
              ref={chatMessagesContainerRef}
              className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scroll-smooth"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 sm:gap-3 animate-fade-in-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center flex-none">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-4 text-sm sm:text-base break-words shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md shadow-[0_0_15px_rgba(37,99,235,0.25)]"
                        : "bg-white/5 border border-white/10 backdrop-blur-sm text-gray-200 rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {/* 2. Added Markdown parsing exclusively for bot messages */}
                    {/* Markdown rendering logic applied only to the bot messages */}
                    {msg.role === "bot" ? (
                      <div className="[&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-bold [&>strong]:text-purple-300">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-none shadow-[0_0_10px_rgba(37,99,235,0.35)]">
                      <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2 sm:gap-3 justify-start animate-fade-in-up">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center flex-none">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
                  </div>
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl rounded-bl-md flex space-x-1.5 sm:space-x-2 items-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pl-9 sm:pl-11 animate-fade-in-up">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-400/40 text-gray-300 hover:text-white transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 bg-[#0f1123]/80 border-t border-white/10 flex gap-2 sm:gap-4 items-center flex-none"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about brain tumors or upload help..."
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-w-0"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.35)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex-none flex items-center justify-center min-h-[40px] min-w-[40px]"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        </Reveal>
      </main>
    </div>
  );
};

export default ChatBotPage;
