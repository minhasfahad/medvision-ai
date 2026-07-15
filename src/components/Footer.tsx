import Image from "next/image";
import Link from "next/link";
import Marquee from "./Marquee";

const TECH_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "MongoDB",
  "Python",
  "YOLOv11",
  "PyTorch",
];

export default function Footer() {
  return (
    <footer className="relative bg-[#060b30]/90 pt-10 md:pt-14 pb-8 px-4 md:px-12 text-white w-full font-sans tracking-wide border-t border-white/5 overflow-hidden">
      {/* Ambient glow accents echoing the hero/section backgrounds */}
      <div className="absolute -top-24 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* Tech marquee strip */}
      <div className="max-w-[1600px] mx-auto mb-10">
        <p className="text-center md:text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
          Engineered With
        </p>
        <Marquee className="py-1">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="mx-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap"
            >
              {tech}
            </span>
          ))}
        </Marquee>
      </div>

      {/* Bento-style grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-[1600px] mx-auto">
        {/* Cell 1: Logo, Mission, and Technical Specificity */}
        <div className="md:col-span-5 flex flex-col gap-2.5 p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-sm text-center md:text-left items-center md:items-start animate-fade-in-up">
          <Link
            href="/"
            className="no-underline flex items-center space-x-2 rtl:space-x-reverse flex-none"
          >
            <Image
              src="/logo-mark.png"
              alt="MedVision Logo"
              width={100}
              height={50}
              className="w-auto h-10 sm:h-12 object-contain"
            />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
              MedVision <span className="text-blue-500 font-medium">AI</span>
            </h1>
          </Link>
          <h3 className="text-xs sm:text-sm font-semibold text-blue-400 leading-normal m-0">
            Empowering Neuro-Diagnostics with Deep Learning Systems.
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0 m-0 font-normal">
            An advanced, multi-tiered instance segmentation infrastructure
            designed to provide auxiliary verification pipelines for secondary
            clinical tumor mapping workflows.
          </p>
        </div>

        {/* Cell 2: Legal Disclaimer & Direct Operational Routing Buttons */}
        <div
          className="md:col-span-4 flex flex-col gap-3 items-center md:items-start p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest m-0">
            Research Disclaimer
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0 m-0 font-normal">
            MedVision AI functions strictly as a diagnostic support prototype
            model for research environments. It does not replace clinical
            evaluation or official radiologist analysis pipelines.
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start w-full mt-2">
            <Link
              href="/privacy-policy"
              className="w-full sm:w-auto no-underline"
            >
              <button className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                Privacy Policy
              </button>
            </Link>

            <Link
              href="/terms-of-service"
              className="w-full sm:w-auto no-underline"
            >
              <button className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white rounded-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                Terms of Service
              </button>
            </Link>
          </div>
        </div>

        {/* Cell 3: Contact Channels & Premium Scaled Interactive Icons */}
        <div
          className="md:col-span-3 flex flex-col gap-2.5 items-center md:items-start p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: "160ms" }}
        >
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest m-0">
            Clinical Network Support
          </h2>
          <div className="text-xs text-gray-400 space-y-1">
            <p className="m-0 font-medium text-gray-300">
              Email:{" "}
              <span className="text-blue-400 select-all font-mono">
                support@medvision.ai
              </span>
            </p>
            <p className="m-0">
              Location: Department of Computer Science, UMT, Lahore, Pakistan
            </p>
          </div>

          <div className="flex gap-3 mt-3 justify-center md:justify-start">
            <Link
              href="https://github.com/minhasfahad"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              aria-label="Github Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-github text-base"></i>
            </Link>
            <Link
              href="https://www.linkedin.com/in/fahad-hamza-minhas/"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-blue-400 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              aria-label="LinkedIn Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-linkedin text-base"></i>
            </Link>
            <Link
              href="#"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-blue-500 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              aria-label="Facebook Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-facebook text-base"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Row Copyright Detail */}
      <hr className="my-6 border-white/5 max-w-[1600px] mx-auto" />
      <h4 className="text-center text-[11px] sm:text-xs font-medium tracking-wide text-gray-500 px-2 leading-relaxed m-0">
        © 2026 MedVision AI. All rights reserved. | Developed and Engineered
        by the MedVision AI Research Team.
      </h4>
    </footer>
  );
}
