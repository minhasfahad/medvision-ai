export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 -z-30 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-grid-fade" />
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-blue-600/20 rounded-full blur-[130px] animate-float-slow" />
      <div
        className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] animate-float-slower"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-[-15%] left-[15%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[140px] animate-float-slow"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
