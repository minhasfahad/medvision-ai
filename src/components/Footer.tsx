import Link from "next/link";
export default function Footer() {
  return (
    <>
      {/* CLEANED UP COMPLETELY: 
        px-3 (12px) on mobile (< 640px)
        sm:px-6 (24px) on small tablets
        md:px-8 (32px) on medium laptop layouts 
      */}
      <footer className="mt-12 md:mt-15 bg-[#060b30]/90 foot py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 text-white w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-[1600px] mx-auto text-center md:text-left">
          
          {/* Section 1: Logo & Mission */}
          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide">MedVisionAI</h1>
            <h3 className="text-sm font-medium text-blue-400">Empowering early diagnosis with precision AI.</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0">
              An advanced deep-learning platform designed to assist medical
              professionals in the early detection of brain tumors.
            </p>
          </div>

          {/* Section 2: Legal & Buttons */}
          <div className="flex flex-col gap-3 items-center md:items-start">
            <h2 className="text-lg font-semibold">Disclaimer</h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0">
              MedVision AI is a research prototype designed for educational
              purposes only. It is not a certified medical device and should not
              be used as a substitute for professional medical diagnosis or
              treatment.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start w-full mt-1">
              <Link href="#" className="w-full sm:w-auto">
                <button className="footer-buttons w-full sm:w-auto text-xs sm:text-sm px-4 py-2 font-semibold">Privacy Policy</button>
              </Link>

              <Link href="#" className="w-full sm:w-auto">
                <button className="footer-buttons w-full sm:w-auto text-xs sm:text-sm px-4 py-2 font-semibold">Terms of Service</button>
              </Link>
            </div>
          </div>

          {/* Section 3: Contact & Links */}
          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1 items-center md:items-start">
            <h2 className="text-base sm:text-lg font-semibold break-all">Email: support@medvision.ai</h2>
            <h3 className="text-sm text-gray-300">Location: UMT, Lahore, Pakistan</h3>
            <div className="foot-icons flex gap-4 mt-3 justify-center md:justify-start">
              <Link href="#" className="text-xl sm:text-2xl transition-transform hover:scale-110">
                <i className="text-white fa-brands fa-github"></i>
              </Link>
              <Link href="#" className="text-xl sm:text-2xl transition-transform hover:scale-110">
                <i className="text-white fa-brands fa-linkedin"></i>
              </Link>
              <Link href="#" className="text-xl sm:text-2xl transition-transform hover:scale-110">
                <i className="text-white fa-brands fa-facebook"></i>
              </Link>
            </div>
          </div>

        </div>

        {/* Lower Row Copyright */}
        <hr className="my-4 sm:my-6 border-white/10 max-w-[1600px] mx-auto" />
        <h2 className="text-center text-xs sm:text-sm text-gray-400 px-2 leading-relaxed">
          © 2026 MedVision AI. All rights reserved. | Designed by MedVision AI
          Team
        </h2>
      </footer>
    </>
  );
}