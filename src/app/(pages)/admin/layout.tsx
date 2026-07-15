import AdminSidebar from "@/src/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-transparent text-white font-sans">
      {/* We import the interactive Client Component sidebar here */}
      <AdminSidebar />

      {/* Main Content Area — sidebar is fixed/out-of-flow, so main gets a
          fixed left offset matching its collapsed rail width on desktop.
          `peer-hover` (triggered by the sidebar's own `peer` class) shifts
          this over responsively while the rail is hover-expanded, instead of
          letting the expanded panel just cover the content. */}
      <main className="w-full min-w-0 lg:ml-[76px] lg:w-[calc(100%-76px)] lg:peer-hover:ml-72 lg:peer-hover:w-[calc(100%-288px)] transition-all duration-300 ease-in-out relative">
        {/* Ambient decorative layer — purely visual, sits behind all page content */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-[-8%] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[130px] animate-float-slow" />
          <div className="absolute top-1/2 left-[-10%] h-[380px] w-[380px] rounded-full bg-purple-600/10 blur-[130px] animate-float-slower" />
          <div className="absolute inset-0 bg-grid-fade" />
        </div>

        <div className="relative mx-auto w-full max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}