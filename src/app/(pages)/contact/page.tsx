"use client"; // Required because we use a "form" with interactivity

import { useState } from "react";

const ContactPage = () => {
  // Simple state to handle the "fake" submission
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page refresh
    setSubmitted(true); // Show success message
    // In a real app, you would send data to backend here
  };

  return (
    <>
      <div className="min-h-screen  text-white flex items-center justify-center p-6">
        
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#1a163a] p-10 rounded-2xl shadow-2xl border border-gray-800">
          
          {/* LEFT SIDE: Contact Information */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-purple-400 mb-4">Get in Touch</h1>
              <p className="text-gray-400 text-lg">
                Have questions about the project, the YOLO model, or our research? 
                Fill out the form and we will get back to you.
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Item */}
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600/20 p-3 rounded-full text-purple-400">
                  <i className="fa-solid fa-envelope text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-gray-400">support@medvision.ai</p>
                </div>
              </div>

              {/* Location Item */}
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600/20 p-3 rounded-full text-purple-400">
                  <i className="fa-solid fa-location-dot text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold">Location</h3>
                  <p className="text-gray-400">UMT, Lahore, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="bg-[#0f0c29] p-8 rounded-xl shadow-inner border border-gray-800">
            {submitted ? (
              // Success Message State
              <div className="text-center h-full flex flex-col justify-center items-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                <p className="text-gray-400 mt-2">Thank you for reaching out.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-purple-400 underline hover:text-purple-300"
                >
                  Send another message
                </button>
              </div>
            ) : (
              // The Form State
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-[#1a163a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    placeholder="Fahad Hamza"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-[#1a163a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    placeholder="fahad@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    required 
                    className="w-full bg-[#1a163a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    placeholder="I have a question about the demo..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02]"
                >
                  Send Message
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