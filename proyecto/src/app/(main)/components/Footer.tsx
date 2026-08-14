import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200 text-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
        {/* Logo y descripción */}
        <div className="flex flex-col items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-slate-800 hover:text-teal-600 transition-colors"
          >
            GIMAE
          </Link>
          <p className="text-sm mt-4 text-slate-600 leading-relaxed max-w-xs">
            Grupo de Monitoreo Ambiental y Entomología Aplicada. Investigación,
            tecnología y ciencia desde Corrientes, Argentina.
          </p>
          {/* Redes sociales */}
          <div className="flex gap-4 mt-6">
            <a
              href="#"
              className="text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Enlaces */}
        <div className="flex flex-col items-center">
          <h4 className="font-semibold text-lg mb-4 text-slate-800">
            Enlaces Rápidos
          </h4>
          <ul className="text-sm space-y-3">
            <li>
              <Link href="/" className="hover:text-teal-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="#servicios"
                className="hover:text-teal-600 transition-colors"
              >
                Servicios
              </Link>
            </li>
            <li>
              <Link
                href="#nosotros"
                className="hover:text-teal-600 transition-colors"
              >
                Nosotros
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="flex flex-col items-center">
          <h4 className="font-semibold text-lg mb-4 text-slate-800">
            Información de Contacto
          </h4>
          <div className="space-y-3">
            <p className="text-sm">
              <a
                href="mailto:email@gimae.com"
                className="hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
              >
                email@GIMAE.com
              </a>
            </p>
            <p className="text-sm">
              <a
                href="tel:+1234567890"
                className="hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
              >
                +123 456 7890
              </a>
            </p>
            <p className="text-sm text-slate-600">Corrientes, Argentina</p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      <div className="text-center text-sm text-slate-500 py-6 bg-slate-50/50">
        © {new Date().getFullYear()} GIMAE. Todos los derechos reservados.
      </div>
    </footer>
  );
}
