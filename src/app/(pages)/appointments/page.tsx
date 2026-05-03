"use client";

import React, { useState, useEffect } from 'react';
import { User, BotMessageSquare } from 'lucide-react'; 
// --- NEW IMPORTS ADDED ---
import api from "@/src/lib/axios"; // Backend par data bhejne ke liye
import { useAuthStore } from "@/src/lib/store/useAuthStore"; // User details ke liye
// -------------------------

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  nextSlot: string;
  fee: string;
  badge?: string;
  image?: string;
}

export default function AppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- NEW STATE FOR BOOKING ---
  const [bookingId, setBookingId] = useState<string | null>(null); 
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchExternalDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://randomuser.me/api/?results=4'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }

        const result = await response.json();
        
        const specialties = ["Neuro-Oncologist", "Neurologist", "Neuro-Surgeon", "Oncologist"];
        const doctorsData = [
            { name: "Dr. Sarah Chen", badge: "Best Match for Meningioma", clinic: "City General Hospital, Lahore", exp: "15 Yrs Exp", fee: "$150", time: "Today, 4:30 PM" },
            { name: "Dr. Ali Khan", badge: "Highly Experienced with Brain Tumors", clinic: "Medicare Clinic, Lahore", exp: "10 Yrs Exp", fee: "$120", time: "Tomorrow, 10:00 AM" },
            { name: "Dr. Fatima Ahmed", badge: "", clinic: "University Hospital", exp: "8 Yrs Exp", fee: "$200", time: "Mon, 2:15 PM" },
            { name: "Dr. Bilal Hassan", badge: "Available for Tele-consult", clinic: "Virtual Clinic", exp: "12 Yrs Exp", fee: "$100", time: "Today, 6:00 PM" },
        ];

        const formattedDoctors = result.results.map((apiUser: any, index: number) => {
          const staticData = doctorsData[index] || doctorsData[0];
          return {
            _id: apiUser.login.uuid,
            name: staticData.name,
            specialty: specialties[index],
            clinic: staticData.clinic,
            experience: staticData.exp,
            nextSlot: staticData.time,
            fee: staticData.fee,
            badge: staticData.badge,
            image: apiUser.picture.large
          };
        });

        setDoctors(formattedDoctors);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExternalDoctors();
  }, []);

  // --- NEW BOOKING FUNCTION ---
  const handleBookAppointment = async (doctor: Doctor) => {
    // 1. Check if user is logged in
    if (!user || !user.id) {
      alert("Please login first to book an appointment.");
      return;
    }

    // 2. Set loading state for this specific doctor's button
    setBookingId(doctor._id);

    try {
      // 3. Prepare data to send to backend database
      const appointmentData = {
        userId: user.id,
        doctorId: doctor._id,
        doctorName: doctor.name,
        clinic: doctor.clinic,
        appointmentDate: doctor.nextSlot,
        fee: doctor.fee,
        status: "Confirmed"
      };

      // REAL API CALL TO YOUR BACKEND (Uncomment when backend route is ready)
      /*
      const response = await api.post("/api/appointments/book", appointmentData);
      if (response.data.success) {
         alert(`Success! Your appointment with ${doctor.name} is confirmed for ${doctor.nextSlot}.`);
      }
      */

      // SIMULATION FOR NOW (Wait for 1.5 seconds to show loading UI)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`✅ Success! Your appointment with ${doctor.name} is confirmed for ${doctor.nextSlot}. You will receive an email shortly.`);
      
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      // 4. Remove loading state
      setBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b13] text-white font-sans pb-10"> 
      <nav className="bg-[#0f111a] border-b border-gray-800 p-4 lg:px-12 flex justify-between items-center fixed top-0 w-full z-50">
        <h1 className="text-2xl font-bold text-gray-100 tracking-wide">MedVision AI</h1> 
        <div className="hidden md:flex gap-8 items-center">
            <span className="text-gray-400 cursor-pointer hover:text-white transition-colors text-sm font-medium">Dashboard</span>
            <span className="text-gray-400 cursor-pointer hover:text-white transition-colors text-sm font-medium">My History</span>
            <button className="bg-[#1e293b] border border-gray-600 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <BotMessageSquare size={16} className="text-blue-400" />
                AI Chatbot
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center cursor-pointer">
                <User size={20} className="text-gray-800" />
            </div>
        </div>
      </nav>

      <div className="pt-32 px-6 lg:px-12 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-[220px] flex-none">
          <h2 className="text-lg font-semibold mb-6 text-gray-200">Filter by:</h2>
          <div className="space-y-4">
            {['Date', 'Time', 'Fee Range', 'Hospital'].map((filter) => (
              <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded bg-[#1e2235] border border-gray-600 flex items-center justify-center group-hover:border-gray-400">
                  <input type="checkbox" className="opacity-0 absolute" />
                </div>
                <span className="text-gray-400 group-hover:text-white text-sm font-medium">{filter}</span>
              </label>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-gray-100 mb-1">Recommended Specialists for Meningioma</h1>
            <p className="text-gray-400 text-sm">Based on your scan analysis, our AI suggests these specialists.</p>
          </div>

          {isLoading && <div className="text-blue-400">Loading specialists...</div>}
          
          {!isLoading && !error && doctors.length > 0 && (
            <div className="space-y-5">
              {doctors.map((doc) => (
                <div key={doc._id} className="bg-[#121726] p-5 rounded-2xl border border-[#2a3655] flex flex-col md:flex-row items-center gap-6 shadow-md hover:border-[#3b4b75] transition-all">
                  
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-none bg-gray-800">
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-100">{doc.name}</h3>
                        {doc.badge && (
                          <span className="bg-[#2a2f42] text-gray-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                            {doc.badge}
                          </span>
                        )}
                    </div>
                    <p className="text-[#8498c7] text-sm font-medium mb-1">{doc.specialty}</p> 
                    <p className="text-gray-400 text-sm mb-1">Clinic info: {doc.clinic} - {doc.experience}</p> 
                    <p className="text-sm mt-2 text-gray-400">
                      <strong className="text-gray-200">Next Slot:</strong> {doc.nextSlot} <span className="mx-1">|</span> <strong className="text-gray-200">Fee:</strong> {doc.fee}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full md:w-[180px] flex-none mt-4 md:mt-0">
                    
                    {/* --- UPDATED CONFIRM BUTTON --- */}
                    <button 
                      onClick={() => handleBookAppointment(doc)}
                      disabled={bookingId === doc._id}
                      className="bg-[#00b85c] hover:bg-[#00a050] text-white w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-wait flex justify-center items-center gap-2"
                    >
                      {/* Show spinner icon if this specific button is clicked */}
                      {bookingId === doc._id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Booking...
                        </>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </button>
                    {/* ------------------------------ */}

                    <button className="bg-[#4b5563] hover:bg-[#374151] text-white w-full py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        Cancel 
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}