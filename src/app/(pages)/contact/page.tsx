"use client";

import { useState } from "react";
import { Mail, MapPin, CheckCircle2, Loader2, Send } from "lucide-react";
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
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className="min-h-screen text-white flex items-center justify-center p-3 sm:p-6">
        <Reveal className="max-w-6xl w-full">
        <div className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-[#0f1123]/60 backdrop-blur-md p-5 sm:p-10 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Scanning beam sweep, tying the contact card into the site's diagnostic-scan motif */}
          <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent animate-scan-sweep"></div>
          </div>
          {/* LEFT SIDE: Contact Information */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                Get in Touch
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Have questions about the project, the YOLO model, or our
                research? Fill out the form and we will get back to you.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Email Item */}
              <div className="flex items-center space-x-4 group">
                <div className="bg-purple-600/20 p-3 rounded-full text-purple-400 flex-none group-hover:bg-purple-600/30 group-hover:-translate-y-0.5 transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-white">Email</h3>
                  <p className="text-gray-400 text-sm sm:text-base truncate">
                    support@medvision.ai
                  </p>
                </div>
              </div>

              {/* Location Item */}
              <div className="flex items-center space-x-4 group">
                <div className="bg-purple-600/20 p-3 rounded-full text-purple-400 flex-none group-hover:bg-purple-600/30 group-hover:-translate-y-0.5 transition-all duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Location</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    UMT, Lahore, Pakistan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="bg-black/20 backdrop-blur-sm p-5 sm:p-8 rounded-xl shadow-inner border border-white/10 w-full">
            {submitted ? (
              // Success Message State
              <div className="text-center h-full min-h-[300px] flex flex-col justify-center items-center p-4 animate-fade-in-up">
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
                  // Added bg-transparent to remove the white box
                  className="mt-6 bg-transparent text-sm sm:text-base text-purple-400 hover:text-purple-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border-0"
                >
                  Send another message?
                </button>
              </div>
            ) : (
              // The Form State
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
    </>
  );
};

export default ContactPage;
