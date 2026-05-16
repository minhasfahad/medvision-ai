import Image from "next/image";

interface AboutCardsProps {
    icon: string;
    title: string;
    description: string;
}

export const AboutCards = ({ icon, title, description }: AboutCardsProps) => {
    const isIcon = icon.includes("fa")
  return (
    <div className="bg-neutral-primary-soft w-full p-6 border border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10 shadow-[0_0_40px_#5ed4ff,0_0_40px_#5ed4ff] flex flex-col items-center text-center md:items-start md:text-left h-full transition-all duration-300">
      
      <div className="flex items-center justify-center min-h-[150px] flex-none">
        {isIcon ? (
          <i className={`${icon} text-5xl sm:text-7xl text-purple-400`}></i>
        ) : (
          <Image    
            className="rounded-lg object-cover"
            src={icon}
            alt={title}
            width={150}   
            height={150}
            unoptimized
          />
        )}
      </div>

      <h3 className="mt-6 mb-2 text-xl sm:text-2xl font-semibold tracking-tight text-heading text-gray-100 break-words w-full">
        {title}
      </h3>

      <p className="mb-2 text-body text-sm sm:text-base text-gray-400 leading-relaxed break-words w-full">
        {description}
      </p>
    </div>
  );
};