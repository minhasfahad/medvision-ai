import Link from "next/link";
export default function Footer() {
  return (
    <>
      <footer className="mt-15 bg-[#060b30]/90 foot">
        <div className=" grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 ">
          <div className="p-4">
            <h1> MedVisionAI</h1>
            <h3>Empowering early diagnosis with precision AI.</h3>
            An advanced deep-learning platform designed to assist medical
            professionals in the early detection of brain tumors.
          </div>
          <div className="p-4">
            <h2>Disclaimer</h2>
            <p>
              MedVision AI is a research prototype designed for educational
              purposes only. It is not a certified medical device and should not
              be used as a substitute for professional medical diagnosis or
              treatment.
            </p>

            <Link href="#">
              <button className="footer-buttons">Privacy Policy</button>
            </Link>

            <Link href="#">
              <button className="footer-buttons">Terms of Service</button>
            </Link>
          </div>
          <div className="p-4">
            <h2>Email: support@medvision.ai</h2>
            <h3>Location: UMT, Lahore, Pakistan</h3>
            <div className="foot-icons">
              <Link href="#">
                <i className="text-white fa-brands fa-github "></i>
              </Link>
              <Link href="#">
                <i className="text-white fa-brands fa-linkedin"></i>
              </Link>
              <Link href="#">
                <i className="text-white fa-brands fa-facebook"></i>
              </Link>
            </div>
          </div>
        </div>
        <h2 className="text-center">
          © 2026 MedVision AI. All rights reserved. | Designed by MedVision AI
          Team
        </h2>
      </footer>
    </>
  );
}
