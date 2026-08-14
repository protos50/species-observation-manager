"use client";

import { MessageClient } from "./components/MessageClient";

export default function ContactoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de mensajes de contacto
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los mensajes recibidos desde el formulario de contacto
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <MessageClient />
      </div>
    </div>
  );
}
