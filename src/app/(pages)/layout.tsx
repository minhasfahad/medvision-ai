import Footer from "@/src/components/Footer";
import { Navbar } from "@/src/components/Navbar";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
