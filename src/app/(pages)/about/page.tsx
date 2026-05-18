"use client";

import React from "react";
import { AboutCards } from "@/src/components/AboutCards"; // Ensure this path is correct
import { Shield, Cpu, Activity, Zap, CheckCircle, BrainCircuit } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="w-full text-white font-sans selection:bg-blue-500/30">
      
      {/* 1. INTRO / MISSION SECTION */}
      <div className="relative max-w-4xl mx-auto my-10 sm:my-16 px-6 sm:px-8 py-10 sm:py-12 bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl text-center overflow-hidden">
        {/* Subtle background radial glow inheriting your global purple canvas layout */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-400 mb-3 tracking-tight">
          About MedVision AI
        </h1>
        <h3 className="text-base sm:text-xl font-medium text-gray-200 mb-6 tracking-wide">
          Bridging Medical Expertise with Artificial Intelligence
        </h3>
        <p className="max-w-xl md:max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
          MedVision AI is a cutting-edge research project designed to assist
          radiologists in the early detection of brain tumors. By combining the
          speed of the MERN stack with the precision of the YOLOv11 Deep
          Learning model, we aim to make neuro-diagnostics faster, more
          accessible, and highly accurate.
        </p>
      </div>

      {/* 2. SYSTEM ARCHITECTURE CARDS GRID */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 mb-20">
        <div className="text-center md:text-left mb-8 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight mb-2">Core Project Pillars</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">The underlying technical foundation supporting our real-time deep learning neuro-inference pipeline.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
          <AboutCards
            icon="/About_Cards/card1.png"
            title="Frontend Architecture"
            description="Built with React.js and Next.js to ensure a responsive, high-performance, and user-friendly interface."
          />
          <AboutCards
            icon="/About_Cards/card2.jpg"
            title="Backend Systems"
            description="Powered by Node.js and Express.js, providing secure RESTful APIs to handle data processing and authentication."
          />
          <AboutCards
            icon="/About_Cards/card3.PNG"
            title="AI Diagnostic Model"
            description="Utilizing the YOLOv11 Deep Learning architecture, trained on thousands of MRI scans to detect tumors with high precision."
          />
          <AboutCards
            icon="/About_Cards/card4.png"
            title="Secure Data Storage"
            description="Integrated with MongoDB for scalable, document-based storage of patient records and diagnostic history." 
          />
        </div>
      </div>

      {/* 3. NEW SECTION: DUAL-ENGINE MODEL SPECIFICATIONS */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 mb-20">
        <div className="bg-[#0b0e24]/80 border border-blue-900/40 rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-2">Core Intelligence</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Our Multi-Stage AI Pipeline</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                To guarantee safety in a digital health ecosystem, MedVision AI uses a multi-tiered neural approach. Scans undergo structural validation before deep learning inferencing begins.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <Cpu className="w-6 h-6 text-purple-400 flex-none mt-1" />
                  <div>
                    <h4 className="text-base font-bold text-gray-100">MobileNetV3 Validation Layer</h4>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Acts as an intelligent guardrail. Validates input data in milliseconds to confirm the upload is a legitimate brain MRI, preventing data corruption.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <BrainCircuit className="w-6 h-6 text-blue-400 flex-none mt-1" />
                  <div>
                    <h4 className="text-base font-bold text-gray-100">YOLOv11s-seg Segmentation Engine</h4>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Executes deep spatial mapping. It localizes irregular abnormal masses and draws precise pixel-level bounds to assist clinical visualization.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Specs Performance Metrics Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                <Zap className="w-6 h-6 text-yellow-400 mb-4" />
                <div>
                  <h4 className="text-2xl font-black text-white mb-1">&lt; 1.5s</h4>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Inference Speed</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                <Shield className="w-6 h-6 text-green-400 mb-4" />
                <div>
                  <h4 className="text-2xl font-black text-white mb-1">AES-256</h4>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Data Encryption</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                <Activity className="w-6 h-6 text-blue-400 mb-4" />
                <div>
                  <h4 className="text-2xl font-black text-white mb-1">96.4%</h4>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Model Precision</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                <CheckCircle className="w-6 h-6 text-purple-400 mb-4" />
                <div>
                  <h4 className="text-2xl font-black text-white mb-1">3 Classes</h4>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tumor Types Covered</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. NEW SECTION: CLINICAL SAFETY & PRINCIPLES */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 pb-20">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight mb-3">Our Core Principles</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">How we approach code safety, research integrity, and medical tool constraints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0f1123]/40 border border-white/5 rounded-2xl text-center md:text-left">
            <h4 className="text-lg font-bold text-white mb-2">Research-First Approach</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed m-0">Developed using public healthcare datasets to explore the boundaries of computer vision in computer-aided diagnostics (CAD).</p>
          </div>

          <div className="p-6 bg-[#0f1123]/40 border border-white/5 rounded-2xl text-center md:text-left">
            <h4 className="text-lg font-bold text-white mb-2">Data Privacy Integrity</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed m-0">Patient privacy is paramount. Scans uploaded are exclusively bound to encrypted local authentication tokens to prevent external tracking leaks.</p>
          </div>

          <div className="p-6 bg-[#0f1123]/40 border border-white/5 rounded-2xl text-center md:text-left">
            <h4 className="text-lg font-bold text-white mb-2">Decision Support Goal</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed m-0">Engineered to serve as a reliable second pair of eyes to accelerate clinical triage without replacing the essential expertise of radiologists.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

// THIS LINE FIXES YOUR ERROR
export default AboutPage;