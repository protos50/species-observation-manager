import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar } from "lucide-react";
import { formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { Contact } from "@/lib/api/contact";

interface MessageCardProps {
  message: Contact;
  isSelected: boolean;
  onClick: () => void;
}

export function MessageCard({
  message,
  isSelected,
  onClick,
}: MessageCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4
        ${
          isSelected
            ? "border-l-primary bg-accent/50 shadow-md"
            : "border-l-transparent hover:border-l-primary/30"
        }
        ${message.status ? "bg-gray-100/80" : ""}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3
              className={`font-medium text-sm leading-none ${
                !message.status ? "font-semibold" : ""
              }`}
            >
              {message.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{message.email}</span>
            </div>
          </div>
          <Badge variant={message.status ? "secondary" : "default"}>
            {message.status ? "Leído" : "Sin leer"}
          </Badge>
        </div>

        <div className="space-y-2">
          <p
            className={`text-sm font-medium truncate ${
              !message.status ? "font-semibold" : ""
            }`}
          >
            {message.service.service_name}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {message.message}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDateTimeLocalFromUtc(message.created_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
