"use client";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { AboutCards } from "../components/AboutCards";
import { useAuthStore } from "../lib/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const authState = useAuthStore();
  return (
    <>
      <Navbar />

      <div className="text-center">
        <header className="header">
          <h1 className="header-h1">MedVision AI</h1>
          <h1>The Future of Neuro-Diagnostics</h1>
          <p>
            Empowering doctors with real-time, high-accuracy brain tumor
            detection <br></br>using specialized Deep Learning models.
          </p>
        </header>
        {authState.isAuthenticated ? (
          <h1 className="">Logged in as {authState.user?.name}</h1>
        ) : (
          <></>
        )}
        <div>
          {authState.isAuthenticated ? (
            <h1>Scan an MRI Now</h1>
          ) : (
            <h1>Try Live Demo: Scan an MRI Now</h1>
          )}
          {authState.isAuthenticated ? (
            <Link href="/try-demo">
              <button className="login-signup-btn">
                Test AI Diagnostic Capabilities
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="login-signup-btn">Login to Scan an MRI</button>
            </Link>
          )}
        </div>
        <hr></hr>
        <h1 className="text-5xl p-10">Features</h1>
        {/* grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 flex */}
        <section className="flex gap-20 justify-evenly">
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
