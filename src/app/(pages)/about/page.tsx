import { AboutCards } from "@/src/components/AboutCards"; // Ensure this path is correct

// REMOVED "export" from here. We do it at the bottom.
const AboutPage = () => {
  return (
    <>
      {/* Intro Section with proper padding and centering */}
      <div className="text-center py-10 sm:py-16 px-4 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-4">About MedVision AI</h1>
        <h3 className="text-lg sm:text-xl text-gray-300 mb-6">Bridging Medical Expertise with Artificial Intelligence</h3>
        <p className="max-w-xl md:max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed">
          MedVision AI is a cutting-edge research project designed to assist
          radiologists in the early detection of brain tumors. By combining the
          speed of the MERN stack with the precision of the YOLOv11 Deep
          Learning model, we aim to make neuro-diagnostics faster, more
          accessible, and highly accurate.
        </p>
      </div>

      {/* Cards Section - Added GRID classes here so they stand side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-6 md:px-10 pb-16">
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
    </>
  );
};

// THIS LINE FIXES YOUR ERROR
export default AboutPage;