import AdminSidebar from "@/src/components/AdminSidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#060b30] text-white font-sans">
      {/* We import the interactive Client Component sidebar here */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-[#0a0f38] shadow-inner">{children}</main>
    </div>
  );
}