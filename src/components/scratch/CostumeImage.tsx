import { costumeUrl } from "../../lib/scratch/spriteAssets";

/** One costume's picture, for the editor screens (library pictures, painted pictures, or an old emoji). */
const CostumeImage = ({ src, className = "w-full h-full object-contain" }: { src: string; className?: string }) => {
  const url = costumeUrl(src);
  if (url) return <img src={url} alt="" className={className} draggable={false} />;
  const emoji = src.startsWith("emoji:") ? src.slice(6) : "❓";
  return <span className="text-3xl leading-none" aria-hidden="true">{emoji}</span>;
};

export default CostumeImage;
