"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageList } from "./MessageList";
import { MessageDetail } from "./MessageDetail";
import { Contact } from "@/lib/api/contact";
import { contactApi } from "@/lib/api/contact";

import { Search, Filter, Mail, MailOpen, RefreshCw } from "lucide-react";

interface MessageClientProps {
  initialMessages?: Contact[];
}

export function MessageClient({ initialMessages = [] }: MessageClientProps) {
  const [messages, setMessages] = useState<Contact[]>(initialMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contactApi.contact.getAll();
      setMessages(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los mensajes"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente si no hay datos iniciales
  useEffect(() => {
    if (initialMessages.length === 0) {
      fetchMessages();
    } else {
      setIsLoading(false);
    }
  }, [initialMessages.length, fetchMessages]);

  const handleSelectMessage = useCallback((message: Contact) => {
    setSelectedMessageId(message.id_contact.toString());
  }, []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await contactApi.contact.update(id, { status: true });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id_contact.toString() === id ? { ...msg, status: true } : msg
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al marcar como leído"
      );
    }
  }, []);

  const handleMarkAsUnread = useCallback(async (id: string) => {
    try {
      await contactApi.contact.update(id, { status: false });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id_contact.toString() === id ? { ...msg, status: false } : msg
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al marcar como no leído"
      );
    }
  }, []);

  const selectedMessage =
    messages.find((m) => m.id_contact.toString() === selectedMessageId) || null;

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.service.service_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && !message.status) ||
      (filterStatus === "read" && message.status);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => !m.status).length;

  if (isLoading) {
    return (
      <div className="text-center space-y-4 py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">Cargando mensajes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchMessages} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Mensajes de contacto
          </h2>
        </div>
        <Button
          onClick={fetchMessages}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="flex flex-wrap gap-4 ">
        <Badge variant="secondary" className="opacity-90">
          <Mail className="h-3 w-3" />
          {messages.length} Total
        </Badge>
        {unreadCount > 0 && (
          <Badge variant="default" className=" opacity-70">
            <MailOpen className="h-3 w-3" />
            {unreadCount} Sin leer
          </Badge>
        )}
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, servicio o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Todos
          </Button>
          <Button
            variant={filterStatus === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("unread")}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Sin leer
          </Button>
          <Button
            variant={filterStatus === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("read")}
            className="gap-2"
          >
            <MailOpen className="h-4 w-4" />
            Leídos
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalle del mensaje */}
        <Card className="overflow-hidden h-[510px] order-1 sm:order-1 lg:order-2">
          <MessageDetail
            message={selectedMessage}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
          />
        </Card>

        {/* Lista de mensajes */}
        <Card className="overflow-hidden h-[510px] order-2 sm:order-2 lg:order-1">
          <MessageList
            messages={filteredMessages}
            selectedMessageId={selectedMessageId}
            onSelectMessage={handleSelectMessage}
          />
        </Card>
      </div>
    </div>
  );
}
