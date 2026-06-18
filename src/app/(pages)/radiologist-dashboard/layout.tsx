import RadiologistSidebar from "@/src/components/RadiologistSidebar";


export default function RadiologistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060b30] text-white">
      <div className="flex">
        <RadiologistSidebar />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}