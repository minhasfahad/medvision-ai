import Image from "next/image";
import SpotlightCard from "./SpotlightCard";

interface AboutCardsProps {
    icon: string;
    title: string;
    description: string;
}

export const AboutCards = ({ icon, title, description }: AboutCardsProps) => {
    const isIcon = icon.includes("fa")
  return (
    <SpotlightCard
      color="96,165,250"
      className="group relative h-full w-full min-h-[280px] sm:min-h-[320px] rounded-2xl border border-white/10 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 animate-fade-in-up"
    >
      {/* Full-bleed background: image fills the entire card, text overlays on top */}
      <div className="absolute inset-0">
        {isIcon ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-950 to-purple-950 flex items-center justify-center">
            <i
              className={`${icon} text-6xl sm:text-7xl text-purple-400 group-hover:scale-110 transition-transform duration-500`}
            ></i>
          </div>
        ) : (
          <Image
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            src={icon}
            alt={title}
            fill
            unoptimized
          />
        )}
      </div>

      {/* Gradient scrim so the overlaid text stays readable against any image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5 group-hover:from-black/90 transition-colors duration-300"></div>

      {/* Text overlay, pinned to the bottom of the card */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center md:items-start md:text-left">
        <h3 className="mb-2 text-lg sm:text-xl font-bold tracking-tight text-white break-words w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-gray-300 leading-relaxed break-words w-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          {description}
        </p>
      </div>
    </SpotlightCard>
  );
};
