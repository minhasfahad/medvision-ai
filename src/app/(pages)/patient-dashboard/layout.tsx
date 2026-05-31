import PatientSidebar from "@/src/components/PatientSidebar";
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full bg-transparent">
      {/* Sidebar - Will lock to left on large screens */}
      <PatientSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 transition-all duration-300">
        <div className="mx-auto w-full max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}