"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession({
    required: false,
  });

  // Persist JWT token in localStorage to let API client reuse it and persist across browser sessions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = session?.user?.accessToken as string | undefined;
    try {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (_) {
      // ignore storage errors
    }
  }, [session?.user?.accessToken]);

  return (
    <AuthContext.Provider value={{ session, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Retornar valores por defecto en vez de lanzar error
    // Esto permite usar useAuth en componentes fuera del AuthProvider
    return {
      session: null,
      status: "unauthenticated" as const,
    };
  }
  return context;
}
