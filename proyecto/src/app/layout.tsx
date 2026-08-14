import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../auth";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"]
});

export const metadata: Metadata = {
  title: "GIMAE | Grupo de Investigación en Monitoreo Ambiental y Entomología Aplicada",
  description:
    "Grupo interdisciplinario dedicado al monitoreo ambiental, análisis de datos ecológicos y divulgación científica desde Corrientes, Argentina.",
  icons: {
    icon: "/favicon.ico",
  },
  // Agregar URL canónica base
  metadataBase: new URL("https://gimae.com"), // REEMPLAZAR POR EL DOMINIO REAL
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen`}>
        <SessionProvider 
          refetchInterval={5 * 60}
          refetchOnWindowFocus={true}
          session={session}
        >
          {session?.user?.accessToken ? (
            <script
              dangerouslySetInnerHTML={{
                __html: `try{localStorage.setItem('auth_token', ${JSON.stringify(
                  session?.user?.accessToken ?? ""
                )});}catch(_){}{}`,
              }}
            />
          ) : null}
          <div className="flex flex-col min-h-screen">
            <NextTopLoader />
            <Toaster richColors position="top-center" />
            <main className="flex-grow">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
