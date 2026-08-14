import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCard } from "./MessageCard";
import { Separator } from "@/components/ui/separator";
import { Contact } from "@/lib/api/contact";

interface MessageListProps {
  messages: Contact[];
  selectedMessageId: string | null;
  onSelectMessage?: (message: Contact) => void;
}

export function MessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="space-y-2">
          <h3 className="font-medium text-muted-foreground">No hay mensajes</h3>
          <p className="text-sm text-muted-foreground">
            Los mensajes de contacto aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {messages.map((message, index) => (
          <div key={message.id_contact}>
            <MessageCard
              message={message}
              isSelected={selectedMessageId === message.id_contact.toString()}
              onClick={() => onSelectMessage?.(message)}
            />
            {index < messages.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
