import Image from "next/image";

interface AboutCardsProps {
    icon: string;
    title: string;
    description: string;
}

export const AboutCards = ({ icon, title, description }: AboutCardsProps) => {
    const isIcon = icon.includes("fa")
  return (
    <div className="group w-full p-6 border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl rounded-2xl flex flex-col items-center text-center md:items-start md:text-left h-full transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.07] animate-fade-in-up">

      <div className="flex items-center justify-center h-[150px] w-full flex-none rounded-xl bg-black/20 border border-white/5 overflow-hidden">
        {isIcon ? (
          <i className={`${icon} text-5xl sm:text-7xl text-purple-400 group-hover:scale-110 transition-transform duration-300`}></i>
        ) : (
          <Image
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            src={icon}
            alt={title}
            width={150}
            height={150}
            unoptimized
          />
        )}
      </div>

      <h3 className="mt-6 mb-2 text-xl sm:text-2xl font-bold tracking-tight text-white break-words w-full">
        {title}
      </h3>

      <p className="mb-2 text-sm sm:text-base text-gray-400 leading-relaxed break-words w-full">
        {description}
      </p>
    </div>
  );
};