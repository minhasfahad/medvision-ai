"use client";

import Link from "next/link";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { AboutCards } from "../components/AboutCards";
import { useAuthStore } from "../lib/store/useAuthStore";

export default function LandingPage() {
  const authState = useAuthStore();
  return (
    <>
      <Navbar />

      <div className="text-center text-white px-4">
        <header className="header py-10 sm:py-14 max-w-4xl mx-auto">
          <h1 className="header-h1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2">MedVision AI</h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-200 mb-4">The Future of Neuro-Diagnostics</h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Empowering doctors with real-time, high-accuracy brain tumor
            detection using specialized Deep Learning models.
          </p>
        </header>

        {authState.isAuthenticated ? (
          <div className="mb-6 px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-medium">
              Logged in as {authState.user?.name}{" "}
              <span className="text-red-500 font-semibold block sm:inline sm:ml-2">
                (Role: {authState.user?.role} )
              </span>
            </h1>
          </div>
        ) : (
          <></>
        )}

        <div className="py-6 px-2 max-w-md mx-auto">
          {authState.isAuthenticated ? (
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Scan an MRI Now</h1>
          ) : (
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Try Live Demo: Scan an MRI Now</h1>
          )}
          {authState.isAuthenticated ? (
            <Link href="/try-demo" className="block w-full">
              <button className="login-signup-btn w-full px-6 py-3 text-sm sm:text-base font-semibold">
                Test AI Diagnostic Capabilities
              </button>
            </Link>
          ) : (
            <Link href="/login" className="block w-full">
              <button className="login-signup-btn w-full px-6 py-3 text-sm sm:text-base font-semibold">Login to Scan an MRI</button>
            </Link>
          )}
        </div>

        <hr className="my-8 border-white/10 max-w-6xl mx-auto" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold py-6 sm:py-10">Features</h1>
        
        {/* Responsive layout box handling structural transitions */}
        <section className="flex flex-col md:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto px-2 pb-16 justify-center md:justify-evenly items-center md:items-stretch">
          <AboutCards
            icon="fa-solid fa-cloud-arrow-up"
            title="Smart Upload"
            description="Securely upload MRI scans in standard formats (DICOM, JPG, PNG) with drag-and-drop simplicity."
          />
          <AboutCards
            icon="fa-solid fa-brain"
            title="AI Analysis"
            description="Our YOLOv11 model analyzes scans in milliseconds, identifying tumor regions with high precision."
          />
          <AboutCards
            icon="fa-solid fa-user-doctor"
            title="Doctor Connect"
            description="Generate PDF reports and instantly share diagnostic results with medical professionals."
          />
        </section>
      </div>
      <Footer />
    </>
  );
}