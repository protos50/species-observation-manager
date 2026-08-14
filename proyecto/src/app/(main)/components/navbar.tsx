"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, LogIn } from "lucide-react";
import { useRoleAuth } from "@/hooks/use-role-auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useRoleAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { href: "#inicio", label: "Inicio" },
    { href: "#servicios", label: "Servicios" },
    { href: "#nosotros", label: "Nosotros" },
  ];

  const linkClass =
    "text-[15px] text-slate-700 font-medium tracking-wide hover:text-teal-600 hover:underline underline-offset-4 transition-all active:scale-95";

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const elementId = href.replace("#", "");
      if (window.location.pathname === "/") {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          setIsOpen(false);
        }
      } else {
        window.location.href = `/#${elementId}`;
        setIsOpen(false);
      }
    }
  };

  const AuthButton = mounted ? (
    <Button
      asChild
      className="rounded-full px-5 py-2 text-sm font-semibold border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white transition-all flex items-center gap-2"
      variant="outline"
    >
      <Link
        href={isAuthenticated ? "/dashboard" : "/login"}
        onClick={() => setIsOpen(false)}
      >
        <LogIn className="w-4 h-4" />
        {isAuthenticated ? "Ir al dashboard" : "Iniciar Sesión"}
      </Link>
    </Button>
  ) : null;

  return (
    <nav
      className="w-full bg-white/60 backdrop-blur-lg border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sticky top-0 z-50 px-6 py-4 rounded-b-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-3xl font-bold text-slate-800 hover:text-teal-600 transition-colors tracking-tight"
        >
          GIMAE
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-8">
          {links.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={linkClass}
              onClick={(e) => handleClick(e, href)}
            >
              {label}
            </Link>
          ))}
          {AuthButton}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[260px] sm:w-[300px] bg-white pt-6 transition-transform duration-300"
            >
              <SheetTitle
                id="mobile-menu-title"
                className="text-slate-800 text-xl font-semibold px-4"
              >
                Menú
              </SheetTitle>
              <div className="flex flex-col space-y-4 px-4 mt-6">
                {links.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className={linkClass}
                    onClick={(e) => handleClick(e, href)}
                  >
                    {label}
                  </Link>
                ))}
                <hr className="border-slate-200 my-2" />
                {AuthButton}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
