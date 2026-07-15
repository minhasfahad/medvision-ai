import PatientSidebar from "@/src/components/PatientSidebar";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-transparent">
      {/* We import the interactive Client Component sidebar here */}
      <PatientSidebar />

      {/* Main Content Area — sidebar is fixed/out-of-flow, so main gets a
          fixed left offset matching its collapsed rail width on desktop. */}
      <main className="relative w-full min-w-0 lg:ml-[76px] lg:w-[calc(100%-76px)] lg:peer-hover:ml-72 lg:peer-hover:w-[calc(100%-288px)] overflow-hidden transition-all duration-300 ease-in-out">
        {/* Decorative ambient glows — layered + slow drifting for a more alive canvas */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[560px] h-[560px] bg-blue-600/10 rounded-full blur-[130px] -z-10 animate-float-slow" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[460px] h-[460px] bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-float-slower" />
        <div className="pointer-events-none absolute top-1/2 right-1/3 w-[280px] h-[280px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

        {/* Faint tech grid-mesh backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-grid-fade -z-10" />

        <div className="relative mx-auto w-full max-w-[1400px] animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
