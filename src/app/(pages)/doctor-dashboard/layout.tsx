import DoctorSidebar from "@/src/components/DoctorSidebar";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-transparent text-white font-sans">
      {/* 1. THE SIDEBAR
        Fixed to the viewport at all times (out of document flow). On desktop
        it collapses to a 76px icon rail and expands into a full panel as a
        hover flyout that overlays content instead of pushing it.
      */}
      <DoctorSidebar />

      {/* 2. THE MAIN CONTENT AREA
        - lg:ml-[76px]: permanent left margin matching the rail's collapsed
          width, since the sidebar is no longer a flex sibling reserving space.
        - min-w-0: CRITICAL for mobile (300px-500px). It prevents wide tables or
          images inside the dashboard from breaking the screen width and causing horizontal scroll.
      */}
      <main className="w-full min-w-0 lg:ml-[76px] lg:w-[calc(100%-76px)] lg:peer-hover:ml-72 lg:peer-hover:w-[calc(100%-288px)] transition-all duration-300 ease-in-out relative overflow-hidden">
        {/* Ambient clinical-workspace backdrop: embossed grid + soft color blooms.
            Purely decorative, sits behind content and never intercepts input. */}
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40" />
        <div className="pointer-events-none absolute -top-32 right-[-10%] w-[420px] h-[420px] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/3 -left-32 w-[360px] h-[360px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-[1600px] animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}