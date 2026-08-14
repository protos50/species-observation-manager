import { LucideIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ServiceItem({
  icon: Icon,
  title,
  description,
}: ServiceItemProps) {
  return (
    <Card className="border border-white/30 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-md w-full h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="text-center p-6 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-teal-600/10 rounded-xl">
            <Icon className="w-10 h-10 text-teal-600" />
          </div>
        </div>
        <CardTitle className="text-xl font-semibold text-slate-800 tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-700 leading-relaxed text-sm">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
