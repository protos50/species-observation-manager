import { Database, Bug, BookOpen, Cpu } from "lucide-react";
import { ServiceItem } from "./ServiceItem";

export function Services() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
      <ServiceItem
        icon={Database}
        title="Procesamiento de datos (QGIS y R)"
        description="Transformamos datos crudos en información accionable: análisis geoespacial, estadístico y modelos predictivos de biodiversidad. También brindamos capacitación."
      />
      <ServiceItem
        icon={Bug}
        title="Consultoría ambiental"
        description="Monitoreamos ecosistemas acuáticos y terrestres. Realizamos análisis de biodiversidad con informes detallados para conservación y gestión ambiental."
      />
      <ServiceItem
        icon={BookOpen}
        title="Divulgación científica"
        description="Creamos ilustraciones, fotografías científicas y diseño de infografías para comunicar ciencia de forma clara, estética y efectiva."
      />
      <ServiceItem
        icon={Cpu}
        title="Diseño de sistemas embebidos"
        description="Desarrollamos dispositivos personalizados para medición ambiental con Arduino, Raspberry Pi y soluciones embebidas adaptadas a cada proyecto."
      />
    </div>
  );
}
