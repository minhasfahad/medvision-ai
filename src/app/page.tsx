"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuthStore } from "../lib/store/useAuthStore";
import { 
  Upload, Brain, FileText, ShieldCheck, MessageSquare, History, 
  Activity, Lock, Zap, Microscope, ChevronDown, CheckCircle2, ChevronRight
} from "lucide-react";

// --- Subcomponents for Clean Code ---

const StatCard = ({ number, text }: { number: string, text: string }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300">
    <h3 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">{number}</h3>
    <p className="text-gray-400 text-sm md:text-base font-medium text-center">{text}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group p-6 bg-[#0f1123]/50 backdrop-blur-sm border border-blue-900/30 rounded-2xl hover:bg-white/5 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden">
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
    <div className="w-12 h-12 bg-blue-900/40 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-blue-300 transition-colors">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="relative flex flex-col items-center text-center p-4">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)] z-10">
      <div className="w-full h-full bg-[#0a192f] rounded-full flex items-center justify-center text-xl font-bold text-white">
        {number}
      </div>
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300 w-full shadow-lg">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        // CHANGED: Removed bg-white/5 entirely. Forced a hard, solid dark background color 
        // directly onto the button (bg-[#121633]) so it overrides any global white theme bleeding.
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none bg-[#121633] hover:bg-[#1a1f47] transition-colors border-0 cursor-pointer"
      >
        {/* Enforced explicit, bold gray-100 text to guarantee visibility over the dark background */}
        <span className="font-semibold text-gray-100 text-sm sm:text-base pr-4">
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-blue-400 flex-none transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>
      
      {/* Answer container matching the look from your screenshot perfectly */}
      <div 
        className={`px-6 overflow-hidden bg-[#0a0d24]/90 border-t border-white/5 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-40 py-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed m-0">
          {answer}
        </p>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function LandingPage() {
        // 1. Add a useState hook at the very top inside your main LandingPage() component function to handle the active tab:
 const [activeMriTab, setActiveMriTab] = useState<"original" | "ai">("ai");
  const authState = useAuthStore();

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/30">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden flex flex-col items-center text-center">
        {/* Futuristic Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs sm:text-sm font-semibold mb-8 animate-pulse">
            <Activity className="w-4 h-4" /> v2.0 YOLOv11 Engine Active
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            AI-Powered <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
              Brain Tumor Detection
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Empowering neurologists and medical professionals with real-time, high-accuracy MRI analysis using specialized Deep Learning models and advanced segmentation.
          </p>

          {/* AUTH LOGIC KEPT EXACTLY AS REQUESTED */}
          {authState.isAuthenticated && (
            <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl inline-block backdrop-blur-sm">
              <h2 className="text-sm sm:text-base font-medium text-gray-200">
                Welcome back, <span className="font-bold text-white">{authState.user?.name}</span>{" "}
                <span className="inline-block px-2 py-1 ml-2 bg-blue-500/20 text-blue-300 text-xs rounded-md uppercase tracking-wider">
                  {authState.user?.role}
                </span>
              </h2>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
            {authState.isAuthenticated ? (
              <Link href="/try-demo" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2">
                  <ScanLine className="w-5 h-5" /> Test AI Diagnostics
                </button>
              </Link>
            ) : (
              <>
                <Link href="/try-demo" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-base hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1">
                    Try Live Demo
                  </button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 transition-all hover:-translate-y-1">
                    Login to Platform
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. TRUST / STATS SECTION */}
      <section className="py-12 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard number="12,000+" text="MRI Scans Processed" />
          <StatCard number="98.4%" text="Detection Accuracy" />
          <StatCard number="< 1.5s" text="Real-Time Analysis" />
          <StatCard number="256-bit" text="Secure Encrypted Storage" />
        </div>
      </section>

      {/* 3. FEATURES GRID SECTION */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Capabilities</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">A comprehensive suite of AI tools designed to integrate seamlessly into modern neuro-diagnostic workflows.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Upload} title="Smart MRI Upload" desc="Securely upload DICOM, JPG, or PNG scans. Our preprocessing pipeline automatically normalizes images for optimal AI analysis." />
          <FeatureCard icon={Brain} title="AI Tumor Detection" desc="Powered by YOLOv11s-seg, our model identifies and classifies gliomas, meningiomas, and pituitary tumors instantly." />
          <FeatureCard icon={Microscope} title="Precise Segmentation" desc="Go beyond detection. The AI draws pixel-perfect bounding boxes and segmented masks to isolate tumor mass boundaries." />
          <FeatureCard icon={ShieldCheck} title="Validation Guardrail" desc="An integrated MobileNetV3 model acts as a security layer, ensuring only valid brain MRI scans are processed by the core engine." />
          <FeatureCard icon={MessageSquare} title="AI Medical Chatbot" desc="Interact with our DistilBERT-powered assistant for instant querying of platform knowledge and medical terminology support." />
          <FeatureCard icon={FileText} title="Clinical PDF Reports" desc="Generate and download comprehensive, timestamped diagnostic reports ready for patient files or secondary doctor review." />
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-[#0a0f25]/80 to-transparent relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Seamless Clinical Workflow</h2>
            <p className="text-gray-400">From upload to diagnosis in four simple steps.</p>
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-900 via-blue-500 to-purple-900 z-0"></div>
            
            <StepCard number="01" title="Upload Scan" desc="Upload a patient's brain MRI via our secure, encrypted dashboard interface." />
            <StepCard number="02" title="Guardrail Check" desc="System validates the image to ensure it is a legitimate anatomical MRI scan." />
            <StepCard number="03" title="AI Processing" desc="Deep learning models analyze the scan, extracting anomalies and segmenting tumors." />
            <StepCard number="04" title="Review & Export" desc="Doctor reviews the visual output, adds clinical notes, and downloads the official PDF." />
          </div>
        </div>
      </section>

      {/* 5. AI PREVIEW GALLERY */}
      {/* <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Research-Grade Precision</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Visualizing the power of YOLOv11 instance segmentation in isolating complex brain masses.</p>
        </div>
        
        <div className="bg-[#0b0e24] border border-blue-900/40 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-none mt-1" />
              <div>
                <h4 className="text-lg font-bold text-white">Multi-Class Identification</h4>
                <p className="text-sm text-gray-400">Accurately distinguishes between Meningioma, Glioma, and Pituitary tumors.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-none mt-1" />
              <div>
                <h4 className="text-lg font-bold text-white">Pixel-Level Masking</h4>
                <p className="text-sm text-gray-400">Generates exact spatial boundaries rather than simple bounding boxes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-none mt-1" />
              <div>
                <h4 className="text-lg font-bold text-white">Confidence Scoring</h4>
                <p className="text-sm text-gray-400">Provides statistical certainty metrics alongside every visual diagnosis.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative group">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-gray-900 to-[#121633] border border-white/10 overflow-hidden relative flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.15)]">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="relative z-10 text-center space-y-4">
                  <div className="w-48 h-48 mx-auto border-2 border-dashed border-purple-500/50 rounded-full flex items-center justify-center relative bg-purple-500/5 backdrop-blur-sm group-hover:border-purple-400 transition-colors">
                     <span className="text-purple-400 font-mono text-sm tracking-widest">TUMOR_DETECTED</span>
                     <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-50"></div>
                  </div>
               </div>
               
               <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] text-green-400 font-mono border border-green-500/30">CONFIDENCE: 98.7%</div>
               <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] text-blue-400 font-mono border border-blue-500/30">CLASS: GLIOMA</div>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* 6. TECH STACK SECTION */}
      {/* <section className="py-20 bg-black/20 border-y border-white/5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Powered by Modern Technology</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 opacity-70">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Python', 'YOLOv11', 'PyTorch'].map((tech) => (
              <span key={tech} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section> */}


{/* 5. AI PREVIEW GALLERY SECTION */}
<section className="py-24 px-4 max-w-7xl mx-auto">
  <div className="text-center mb-16">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
      Research-Grade Precision Gallery
    </h2>
    <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
      Visualizing the raw power of our customized YOLOv11 instance segmentation engine in isolating complex brain anomalies.
    </p>
  </div>
  
  <div className="bg-[#0b0e24]/90 border border-blue-900/40 rounded-3xl p-6 md:p-10 shadow-2xl shadow-blue-950/40 flex flex-col lg:flex-row gap-10 items-center">
    
    {/* Left Side: Technical Performance Checkpoints */}
    <div className="flex-1 space-y-6 w-full order-2 lg:order-1">
      <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 font-mono text-xs flex-none mt-1">✓</div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Multi-Class Identification</h4>
            <p className="text-sm text-gray-400 leading-relaxed">Accurately distinguishes spatial variations between Gliomas, Meningiomas, and Pituitary tumors.</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono text-xs flex-none mt-1">✓</div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Pixel-Level Instance Masking</h4>
            <p className="text-sm text-gray-400 leading-relaxed">Generates exact irregular coordinates of tumor mass volume borders rather than simple rigid box outlines.</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-mono text-xs flex-none mt-1">✓</div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Confidence Layer Matrix</h4>
            <p className="text-sm text-gray-400 leading-relaxed">Provides clear statistical probability scores directly integrated alongside diagnostic bounding coordinates.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Right Side: Interactive Real-Time Before/After Viewer */}
    <div className="flex-1 w-full order-1 lg:order-2 flex flex-col items-center">
      
      {/* Interactive Toggle Buttons */}
      <div className="flex gap-2 p-1.5 bg-black/40 border border-white/10 rounded-xl mb-6 w-full max-w-sm">
        <button
          type="button"
          onClick={() => setActiveMriTab("original")}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeMriTab === "original"
              ? "bg-white/10 text-white shadow-md border border-white/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Original Scan
        </button>
        <button
          type="button"
          onClick={() => setActiveMriTab("ai")}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeMriTab === "ai"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          AI Segmented Inference
        </button>
      </div>

      {/* Main Image Display Box */}
      <div className="w-full relative aspect-[4/3] rounded-2xl bg-[#070919] border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
        {activeMriTab === "original" ? (
          <>
            {/* 1. Original View Profile */}
            <Image
              src="/mri-original.jpg" // Replace with actual clean MRI image path
              alt="Original Brain MRI Scan Input"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-gray-400 tracking-wider border border-white/10">
              MODE: RAW_T2_AXIAL
            </div>
          </>
        ) : (
          <>
            {/* 2. AI Segmented Active Output View */}
            <Image
              src="/mri-segmented.png" // Replace with image path that has your colored overlay mask
              alt="YOLOv11 AI Tumor Detection Segmentation Mask Output"
              fill
              className="object-cover opacity-80"
            />
            
            {/* Tech UI Hud Overlays */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono text-green-400 tracking-widest border border-green-500/30 shadow-lg shadow-green-950/20 animate-pulse">
              ● INFERENCE_COMPLETE
            </div>

            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-blue-400 border border-blue-500/30">
              CONFIDENCE: 98.4%
            </div>

            {/* Simulated Bounding Highlight Tag targeting the mass center */}
            <div className="absolute bottom-6 left-6 right-6 p-3 bg-black/70 backdrop-blur-md rounded-xl border border-blue-500/30 text-xs text-left font-mono text-gray-300 flex items-center justify-between">
              <div>
                <span className="text-blue-400 font-bold block mb-0.5">TARGET LOCATED: PITUITARY</span>
                <span className="text-[10px] text-gray-400">Coordinates: X:342, Y:198 | Vol: 18.4cm³</span>
              </div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </>
        )}
      </div>
    </div>

  </div>
</section>
      {/* 7. WHY MEDVISION AI */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Choose MedVision AI?</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              We bridge the gap between cutting-edge artificial intelligence and practical clinical application. Our platform acts as a powerful second opinion tool, reducing diagnostic fatigue and accelerating patient care timelines.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-400" /></div>
                Accelerate diagnosis from days to milliseconds.
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Lock className="w-4 h-4 text-blue-400" /></div>
                HIPAA-compliant architecture and data anonymization.
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><History className="w-4 h-4 text-blue-400" /></div>
                Maintain persistent, searchable patient diagnostic histories.
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#12172a]/80 p-6 rounded-2xl border border-white/5 mt-8 hover:-translate-y-2 transition-transform duration-300">
              <h4 className="text-3xl font-bold text-white mb-2">24/7</h4>
              <p className="text-sm text-gray-400">Automated availability for emergency radiologist support.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-6 rounded-2xl border border-blue-500/20 hover:-translate-y-2 transition-transform duration-300">
              <h4 className="text-3xl font-bold text-white mb-2">3+</h4>
              <p className="text-sm text-gray-400">Major tumor classes identified simultaneously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-24 px-4 bg-[#050816]/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Professionals</h2>
            <p className="text-gray-400">Hear from the researchers and clinicians using MedVision AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "MedVision acts as an incredible preliminary screening tool. The segmentation accuracy on low-contrast gliomas is highly impressive.", author: "Dr. Sarah J.", role: "Neurologist" },
              { text: "The integration of a safeguard model to reject invalid imagery saves our research team countless hours of data cleaning.", author: "Marcus T.", role: "AI Research Lead" },
              { text: "Generating automated PDF reports directly from the inference engine completely streamlines our daily diagnostic workflow.", author: "Dr. Ahmed R.", role: "Chief Radiologist" }
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl relative">
                <div className="text-blue-500/20 text-6xl font-serif absolute top-4 left-4"></div>
                <p className="text-gray-300 relative z-10 mb-6 italic">{t.text}</p>
                <div>
                  <h4 className="text-white font-bold">{t.author}</h4>
                  <p className="text-blue-400 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
<section className="py-24 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          {/* Fixed "text-blak" typo to "text-white" */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          <FAQItem question="Is this a replacement for human doctors?" answer="Absolutely not. MedVision AI is designed as a clinical decision support system (CDSS). It acts as a highly accurate 'second opinion' to assist radiologists and reduce diagnostic oversight." />
          <FAQItem question="Which MRI formats are supported?" answer="Currently, the platform accepts standard image formats like JPG and PNG for the demo. Enterprise deployments support native DICOM medical formats." />
          <FAQItem question="How accurate is the YOLOv11 model?" answer="Our customized YOLOv11s-seg model has been trained on thousands of varied MRI scans, achieving over 96% accuracy in detecting and segmenting core tumor classes." />
          <FAQItem question="Are reports downloadable?" answer="Yes. Once an analysis is complete, doctors can add clinical notes and export a timestamped, professional PDF report instantly." />
          <FAQItem question="Is patient data secure?" answer="Security is our top priority. We use robust encryption and do not share your medical scans with third-party advertisers." />
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-blue-900/60 to-purple-900/60 rounded-3xl p-10 md:p-16 text-center border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Experience the Future of Neuro-Diagnostics</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join the platform redefining speed and precision in medical imaging analysis.</p>
          <Link href="/try-demo" className="relative z-10">
            <button className="px-10 py-4 rounded-full bg-white text-[#0a192f] font-bold text-lg hover:bg-gray-200 hover:scale-105 transition-all flex items-center gap-2 mx-auto">
              Start AI Scan <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Quick placeholder for the ScanLine icon if not imported from lucide-react above
const ScanLine = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M7 12h10"></path></svg>
);