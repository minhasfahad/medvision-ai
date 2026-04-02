import Image from "next/image";

interface AboutCardsProps {
    icon: string;
    title: string;
    description: string;
}

export const AboutCards = ({ icon, title, description }: AboutCardsProps) => {
    const isIcon = icon.includes("fa")
  return (
    <div className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10 shadow-[0_0_40px_#5ed4ff,0_0_40px_#5ed4ff]">
      
      {isIcon ? (
        <i className={`${icon} text-7xl`}></i>
      ): (
        <Image    
        className="rounded-base"
        src={icon}
        alt={title}
        width={150}   
        height={150}
      />
      )}

      <h3 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">
        {title}
      </h3>

      <p className="mb-6 text-body">
        {description}
      </p>
    </div>
  );
};