import PatientSidebar from "@/src/components/PatientSidebar";
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full bg-transparent">
      {/* Sidebar - Will lock to left on large screens */}
      <PatientSidebar />

      {/* Main Content Area */}
      <main className="relative flex-1 w-full min-w-0 overflow-hidden transition-all duration-300">
        {/* Decorative ambient glows */}
        <div className="pointer-events-none absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[110px] -z-10" />

        <div className="relative mx-auto w-full max-w-[1400px] animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}