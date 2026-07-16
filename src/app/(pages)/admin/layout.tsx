import AdminSidebar from "@/src/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-transparent text-white font-sans">
      {/* We import the interactive Client Component sidebar here */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 transition-all duration-300 ease-in-out relative">
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}