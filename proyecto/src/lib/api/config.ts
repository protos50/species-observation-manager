import { auth } from "../../../auth";

const isServer = typeof window === "undefined";
const publicBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const serverBase = process.env.API_BASE_URL_SERVER;

// En SSR/SSG usar un origen absoluto si está disponible
export const API_BASE_URL = isServer ? serverBase || publicBase : publicBase;

// Función helper para manejar errores
export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    // Handle 401 Unauthorized o token expirado - forzar logout completo
    if (response.status === 401 || error.message === "Invalid or expired token") {
      if (typeof window !== "undefined") {
        console.log("🔴 Detectado error 401 o token expirado, ejecutando forceLogout...");
        // Llamar directamente a forceLogout (definida abajo)
        await forceLogout();
        return; // No continuar
      }
    }
    
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
};

// Función helper para crear headers con JWT token
export const createHeaders = async (additionalHeaders?: Record<string, string>) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  // Get JWT token from NextAuth session
  if (isServer) {
    // Server-side: use auth() function
    const session = await auth();
    if (session?.user?.accessToken) {
      headers["Authorization"] = `Bearer ${session.user.accessToken}`;
    }
  } else {
    // Client-side: use session from sessionStorage or fetch from API
    const token = await getClientToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// ---- Client-side token cache to avoid repeated /api/auth/session fetches ----
let cachedToken: string | null = null;
let lastTokenAt = 0;
let inflightTokenPromise: Promise<string | null> | null = null;
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Helper function to get token on client-side with caching and dedupe
async function getClientToken(): Promise<string | null> {
  if (isServer) return null;

  const now = Date.now();

  // 1) Return cached token if still fresh
  if (cachedToken && now - lastTokenAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

  // 2) Try localStorage first (persists across browser sessions)
  try {
    const stored = localStorage.getItem("auth_token");
    if (stored) {
      cachedToken = stored;
      lastTokenAt = now;
      return cachedToken;
    }
  } catch (_) {
    // ignore storage errors (e.g., SSR)
  }

  // 3) Dedupe concurrent fetches
  if (inflightTokenPromise) return inflightTokenPromise;

  // 4) Fallback: fetch session ONCE and cache
  inflightTokenPromise = (async () => {
    try {
      const response = await fetch("/api/auth/session", { credentials: "same-origin" });
      if (response.ok) {
        const session = await response.json();
        const token = session?.user?.accessToken || null;
        cachedToken = token;
        lastTokenAt = Date.now();
        try {
          if (token) localStorage.setItem("auth_token", token);
        } catch (_) {}
        return token;
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      inflightTokenPromise = null;
    }
    return null;
  })();

  return inflightTokenPromise;
}

// Función para forzar logout completo
export const forceLogout = async () => {
  if (typeof window !== "undefined") {
    console.log("🔄 Iniciando forceLogout completo...");
    
    // 1. Limpiar almacenamiento local
    console.log("1. Limpiando almacenamiento local...");
    sessionStorage.clear();
    localStorage.clear();
    
    // 2. Limpiar cookies agresivamente
    console.log("2. Limpiando cookies...");
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        // Eliminar cookie en todos los paths posibles
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        if (window.location.hostname === 'localhost') {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
        }
      }
    });
    
    // 3. Llamar a signOut de NextAuth si está disponible
    console.log("3. Llamando a signOut de NextAuth...");
    try {
      // Importar dinámicamente signOut
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: false });
      console.log("✅ SignOut de NextAuth completado");
    } catch (error) {
      console.error("⚠️ Error en signOut de NextAuth:", error);
    }
    
    // 4. Forzar recarga completa
    console.log("4. Forzando recarga completa...");
    window.location.href = "/";
  }
};
