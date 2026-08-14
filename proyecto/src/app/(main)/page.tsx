import { HeroSection } from "./components/heroSection";
import { Services } from "./components/Services";
import { FormServices } from "./components/FormServices";
import { Team } from "./components/Team";
import { AboutSection } from "./components/AboutSection";
import { Sparkles, Users } from "lucide-react";

export default function Page() {
  return (
    <main className="bg-white">
      <HeroSection />

      {/* Sobre el Proyecto */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-100">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-teal-700">
              Sobre el proyecto
            </span>
          </div>
          <h2 className="text-5xl font-extrabold text-slate-800 mt-4">
            ¿Qué es GIMAE?
          </h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <AboutSection />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-teal-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-100">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">Servicios</span>
          </div>
          <h2 className="text-5xl font-extrabold text-slate-800 mt-4">
            Nuestros servicios
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Services />
          <FormServices />
        </div>
      </section>

      {/* Equipo */}
      <section id="nosotros" className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Nosotros</span>
          </div>
          <h2 className="text-5xl font-extrabold text-slate-800 mt-4">
            Nuestro equipo
          </h2>
        </div>
        <Team />
      </section>
    </main>
  );
}
