"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { forceLogout } from "@/lib/api/config";

export function SessionValidator() {
  const { session, status } = useAuth();

  useEffect(() => {
    // Si NextAuth dice que hay sesión, verificar periódicamente
    if (status === "authenticated" && session?.user?.accessToken) {
      const validateToken = async () => {
        try {
          // Verificar si el token tiene una fecha de expiración
          // Los tokens JWT típicamente tienen exp en el payload
          const tokenParts = session.user.accessToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              // Si el token expiró o está por expirar (con 5 min de margen)
              if (payload.exp && payload.exp <= currentTime + 300) {
                console.log("❌ Token expirado detectado, forzando logout...");
                await forceLogout();
                return;
              }
            } catch (jwtError) {
              // Si no podemos decodificar el JWT, no hacer nada
              console.log("⚠️ No se pudo decodificar JWT:", jwtError);
            }
          }
        } catch (error) {
          console.error("❌ Error validando token:", error);
        }
      };

      // Validar token inmediatamente
      validateToken();

      // Y luego validar cada 60 segundos (no cada 30 para evitar sobrecarga)
      const interval = setInterval(validateToken, 60000);

      return () => clearInterval(interval);
    }
  }, [session, status]);

  // Si no hay sesión o está cargando, no mostrar nada
  if (status !== "authenticated") {
    return null;
  }

  // Componente invisible que solo valida la sesión
  return <div style={{ display: "none" }} />;
}
