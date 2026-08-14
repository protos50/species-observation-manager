import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

interface IconCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

export function IconCard({
  imageSrc,
  imageAlt,
  title,
  description,
}: IconCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm w-full border border-teal-600/20">
      <CardHeader className="text-center p-4">
        <div className="flex justify-center mb-4">
          <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-teal-600/20 group-hover:ring-teal-600/50 transition-all duration-300">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 112px) 100vw, 112px"
            />
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors duration-300">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed text-sm">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
