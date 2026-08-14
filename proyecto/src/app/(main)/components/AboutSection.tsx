import { Card } from "@/components/ui/card";

export function AboutSection() {
  return (
    <Card className="relative overflow-hidden bg-white/30 backdrop-blur-lg rounded-[2rem] shadow-md">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 to-white/60 pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 items-start justify-items-center py-10">
            {/* Texto principal */}
            <div className="space-y-6 max-w-xl">
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
                <blockquote className="text-xl text-slate-700 italic pl-8 leading-relaxed">
                  "Somos un grupo de investigación dedicado al estudio y
                  monitoreo de organismos acuáticos y terrestres, con especial
                  énfasis en protistas, insectos y otros invertebrados."
                </blockquote>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                Nuestro trabajo aporta soluciones innovadoras que contribuyen al
                desarrollo de proyectos de investigación, tanto públicos como
                privados, así como a la divulgación científica y educativa.
              </p>
            </div>

            {/* Tarjetas info */}
            <div className="space-y-6 max-w-xl">
              <div className="bg-white/50 border border-white/30 backdrop-blur-md rounded-[2rem] p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📍</span> Alcance
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Trabajamos a escala local y regional en colaboración con
                  instituciones académicas y diversos actores clave.
                </p>
              </div>

              <div className="bg-white/50 border border-white/30 backdrop-blur-md rounded-[2rem] p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📊</span> Impacto
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Nuestras investigaciones contribuyen al desarrollo sostenible
                  y la conservación de la biodiversidad en la región.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
