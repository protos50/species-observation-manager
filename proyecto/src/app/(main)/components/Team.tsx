import { IconCard } from "./TeamItem";

export function Team() {
  return (
    <div className="flex flex-col items-center gap-10 max-w-6xl mx-auto">
      {/* Primera fila (2 miembros) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        <IconCard
          imageSrc="/Larrea-SEA.jpg"
          imageAlt="Dr. Darío Larrea"
          title="Dr. Darío Larrea"
          description="Entomólogo especializado en monitoreo de ambientes terrestres. Amplia experiencia en análisis de datos con R, diseño de mapas, sistemas embebidos y monitoreo ambiental. Ilustrador científico."
        />
        <IconCard
          imageSrc="/Matías-Dufek.jpeg"
          imageAlt="Dr. Matías Dufek"
          title="Dr. Matías Dufek"
          description="Entomólogo especializado en ecología de comunidades de dípteros (Calliphoridae y Sarcophagidae). Amplia experiencia en estudios de biodiversidad, conservación de ecosistemas y aplicaciones forenses-veterinarias."
        />
      </div>

      {/* Segunda fila (3 miembros) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        <IconCard
          imageSrc="/Mina-Lucas.png"
          imageAlt="Dipl. Lucas Mina"
          title="Dipl. Lucas Mina"
          description="Especialista en análisis estadístico con R y desarrollo de sistemas embebidos orientados a la investigación ambiental."
        />
        <IconCard
          imageSrc="/Monti-Areco.jpg"
          imageAlt="Lic. Florencia Monti Areco"
          title="Lic. Florencia Monti Areco"
          description="Especialista en comunidades acuáticas continentales. Experiencia en fotografía científica, análisis en R y elaboración de cartografía ambiental."
        />
        <IconCard
          imageSrc="/Cabral-Richard.png"
          imageAlt="Lic. Richard Cabral"
          title="Lic. Richard Cabral"
          description="Especialista en taxonomía de insectos, muestreo de suelos e ilustración científica."
        />
      </div>
    </div>
  );
}
