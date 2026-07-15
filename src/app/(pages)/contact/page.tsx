"use client";

import { useState } from "react";
import { Mail, MapPin, CheckCircle2, Loader2, Send, MessageCircle, Clock } from "lucide-react";
import AmbientBackground from "@/src/components/AmbientBackground";
import Reveal from "@/src/components/Reveal";

const ContactPage = () => {
  // 1. We added state to track what the user types into the form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // 2. We track the submission status, loading state, and any errors
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any old errors

    try {
      // 3. We send the data to the new API route you just created!
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If the backend threw an error (like the 400 or 500 we wrote), catch it here
        setError(data.message || "Failed to send message.");
        return;
      }

      // 4. Success! Show the checkmark screen and clear the form fields
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.log(err)
      setError("A network error occurred. Please try again.",);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Oversized background watermark typography */}
        <div
          aria-hidden="true"
          className="absolute top-6 sm:top-0 left-1/2 -translate-x-1/2 text-[22vw] sm:text-[10rem] lg:text-[12rem] font-black leading-none tracking-tighter text-white/[0.035] select-none pointer-events-none whitespace-nowrap -z-10"
        >
          SAY HELLO
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-start">
          {/* LEFT: ambient hero / contact info, full-bleed feel */}
          <Reveal variant="left" className="lg:col-span-7">
            <div className="lg:pr-10 lg:pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs sm:text-sm font-semibold mb-6">
                <MessageCircle className="w-4 h-4" /> Let&apos;s Talk
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                Get in Touch
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg mb-10 sm:mb-14">
                Have questions about the project, the YOLO model, or our
                research? Fill out the form and we will get back to you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Email Item */}
                <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300">
                  <div className="bg-purple-600/20 w-11 h-11 rounded-full text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Email</h3>
                  <p className="text-gray-400 text-sm sm:text-base truncate">
                    support@medvision.ai
                  </p>
                </div>

                {/* Location Item */}
                <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300">
                  <div className="bg-purple-600/20 w-11 h-11 rounded-full text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-all duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Location</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    UMT, Lahore, Pakistan
                  </p>
                </div>

                {/* Decorative supporting tile */}
                <div className="sm:col-span-2 flex items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <Clock className="w-5 h-5 text-blue-400 flex-none" />
                  <p className="text-gray-400 text-xs sm:text-sm">
                    We typically respond to research and partnership inquiries within 24&ndash;48 hours.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* RIGHT: the form, presented as a floating card */}
          <Reveal variant="right" delay={120} className="lg:col-span-5">
            <div className="relative lg:-mt-4">
              <div className="relative bg-[#12172a]/80 backdrop-blur-xl p-5 sm:p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Scanning beam sweep, tying the contact card into the site's diagnostic-scan motif */}
                <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                  <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent animate-scan-sweep"></div>
                </div>

                {submitted ? (
                  // Success Message State
                  <div className="text-center h-full min-h-[340px] flex flex-col justify-center items-center p-4 animate-fade-in-up">
                    <div className="w-16 h-16 mb-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Message Sent!
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base mt-2">
                      Thank you for reaching out.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 bg-transparent text-sm sm:text-base text-purple-400 hover:text-purple-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border-0"
                    >
                      Send another message?
                    </button>
                  </div>
                ) : (
                  // The Form State
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Send a Message</h2>

                    {/* Display an error message if something fails */}
                    {error && (
                      <p className="text-red-400 text-sm font-semibold bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)} // Bind input to React state
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
                        placeholder="Fahad Hamza"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Bind input to React state
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
                        placeholder="fahad@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} // Bind input to React state
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
                        placeholder="I have a question about the YOLO11 model..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading} // Prevent double-clicking while it sends
                      className="w-full bg-gradient-to-r flex justify-center items-center gap-2 from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer border-0"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
