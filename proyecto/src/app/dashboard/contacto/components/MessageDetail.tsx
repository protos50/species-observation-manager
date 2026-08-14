"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Contact } from "@/lib/api/contact";
import { useRoleAuth } from "@/hooks/use-role-auth";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";

import {
  Mail,
  Calendar,
  MailIcon,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

interface MessageDetailProps {
  message: Contact | null;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
}

export function MessageDetail({
  message,
  onMarkAsRead,
  onMarkAsUnread,
}: MessageDetailProps) {
  const { isAdmin } = useRoleAuth(); // Hook para verificar si el usuario es administrador
  if (!message) {
    return (
      <div className="flex items-center justify-center h-full text-center p-6 sm:p-8">
        <div className="space-y-4">
          <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="font-medium text-muted-foreground text-base sm:text-lg">
              Selecciona un mensaje
            </h3>
            <p className="text-sm text-muted-foreground">
              Elige un mensaje de la lista para ver los detalles
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Info servicio */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold leading-none">
                  {message.service.service_name}
                </h1>
                <div className="flex items-center flex-wrap gap-2">
                  {!message.status && (
                    <Badge variant="default" className="text-xs">
                      Nuevo
                    </Badge>
                  )}
                </div>
              </div>

              {/* Botones */}
              {isAdmin() && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {message.status ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onMarkAsUnread?.(message.id_contact.toString())
                      }
                      className="gap-2 w-full sm:w-auto cursor-pointer"
                    >
                      <MailIcon className="h-4 w-4" />
                      Marcar como no leído
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onMarkAsRead?.(message.id_contact.toString())
                      }
                      className="gap-2 w-full sm:w-auto cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Marcar como leído
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Grid info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {message.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{message.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{message.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Recibido {formatDateLocal(message.created_at, 'es', { month: 'long' })} a las {formatDateTimeLocalFromUtc(message.created_at).split(' ')[1]}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium">Mensaje:</h4>
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
