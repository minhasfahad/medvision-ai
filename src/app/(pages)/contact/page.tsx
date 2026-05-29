"use client";

import { useState } from "react";

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
      <div className="min-h-screen text-white flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-[#1a163a] p-5 sm:p-10 rounded-2xl shadow-2xl border border-gray-800">
          {/* LEFT SIDE: Contact Information */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-3 sm:mb-4">
                Get in Touch
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Have questions about the project, the YOLO model, or our
                research? Fill out the form and we will get back to you.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Email Item */}
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600/20 p-3 rounded-full text-purple-400 flex-none">
                  <i className="fa-solid fa-envelope text-lg sm:text-xl"></i>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base">Email</h3>
                  <p className="text-gray-400 text-sm sm:text-base truncate">
                    support@medvision.ai
                  </p>
                </div>
              </div>

              {/* Location Item */}
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600/20 p-3 rounded-full text-purple-400 flex-none">
                  <i className="fa-solid fa-location-dot text-lg sm:text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Location</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    UMT, Lahore, Pakistan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="bg-[#0f0c29] p-5 sm:p-8 rounded-xl shadow-inner border border-gray-800 w-full">
            {submitted ? (
              // Success Message State
              <div className="text-center h-full min-h-[300px] flex flex-col justify-center items-center p-4">
                <div className="text-4xl sm:text-5xl mb-4">✅</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Message Sent!
                </h3>
                <p className="text-gray-400 text-sm sm:text-base mt-2">
                  Thank you for reaching out.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  // Added bg-transparent to remove the white box
                  className="mt-6 bg-transparent text-sm sm:text-base text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Send another message?
                </button>
              </div>
            ) : (
              // The Form State
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Display an error message if something fails */}
                {error && (
                  <p className="text-red-500 text-sm font-semibold">{error}</p>
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
                    className="w-full bg-[#1a163a] border border-gray-700 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-gray-600"
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
                    className="w-full bg-[#1a163a] border border-gray-700 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-gray-600"
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
                    className="w-full bg-[#1a163a] border border-gray-700 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-gray-600"
                    placeholder="I have a question about the YOLO11 model..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading} // Prevent double-clicking while it sends
                  className="w-full bg-gradient-to-r flex justify-center items-center from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition transform active:scale-95 hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
