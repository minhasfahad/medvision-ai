import RadiologistSidebar from "@/src/components/RadiologistSidebar";


export default function RadiologistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-x-hidden">
      {/* Ambient background language: faint tech grid + layered drifting glows,
          matching the site-wide dark navy/purple palette */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-fade opacity-60" />
      <div className="pointer-events-none fixed -top-24 left-1/4 w-[560px] h-[560px] bg-blue-600/10 rounded-full blur-[130px] -z-10 animate-float-slow" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[440px] h-[440px] bg-purple-600/10 rounded-full blur-[130px] -z-10 animate-float-slower" />
      <div className="pointer-events-none fixed top-1/3 -right-24 w-[320px] h-[320px] bg-blue-500/5 rounded-full blur-[110px] -z-10" />

      <RadiologistSidebar />

      <main className="w-full min-w-0 lg:ml-[76px] lg:w-[calc(100%-76px)] lg:peer-hover:ml-72 lg:peer-hover:w-[calc(100%-288px)] transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}