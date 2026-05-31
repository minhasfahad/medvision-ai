import DoctorSidebar from "@/src/components/DoctorSidebar";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full bg-transparent">
      {/* 1. THE SIDEBAR
        This component is identical to your Admin sidebar.
        - Mobile (320px - 1023px): Hidden off-screen, accessible via floating button.
        - Desktop (1024px+): Locks firmly to the left side at 64 units wide.
      */}
      <DoctorSidebar />

      {/* 2. THE MAIN CONTENT AREA
        - flex-1: Automatically takes up all remaining width next to the sidebar.
        - min-w-0: CRITICAL for mobile (300px-500px). It prevents wide tables or 
          images inside the dashboard from breaking the screen width and causing horizontal scroll.
      */}
      <main className="flex-1 w-full min-w-0 transition-all duration-300 ease-in-out relative">
        <div className="mx-auto w-full max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}