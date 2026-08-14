import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <section id="inicio" className="w-full">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 md:gap-12 lg:gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Texto principal */}
        <div className="space-y-4  text-center md:text-left max-w-xl mx-auto md:mx-0">
          <header className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold text-teal-600 tracking-wider uppercase">
              Bienvenidos al GIMAE
            </h2>
            <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-slate-800">
              Grupo de Monitoreo Ambiental y{" "}
              <span className="text-teal-600 block mt-1 sm:mt-2">
                Entomología Aplicada
              </span>
            </h1>
          </header>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto md:mx-0">
            Somos un equipo interdisciplinario de biólogos y especialistas en
            ciencias ambientales con sede en Corrientes, Argentina. Integramos
            investigación científica, tecnología e innovación para brindar
            soluciones integrales.
          </p>

          {/* Botón */}
          <div className="flex justify-center md:justify-start pt-2 sm:pt-4">
            <a
              href="#servicios"
              aria-label="Descubrir nuestros servicios"
              className="w-full sm:w-auto"
            >
              <Button
                className="w-full sm:w-auto bg-teal-600/80 hover:bg-teal-600 text-white rounded-full px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium shadow-sm hover:shadow transition-colors duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
                type="button"
              >
                Descubrir nuestros servicios
                <ArrowDown className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Imagen */}
        <div className="hidden md:flex justify-center md:justify-end">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
            <Image
              src="/logo-GIEMA-02.png"
              alt="Logo GEMA"
              width={600}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
