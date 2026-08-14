import { serviceApi } from "@/lib/api/service";
import { ServiceClient } from "./components/ServiceClient";

export default async function ServiciosPage() {
  const services = await serviceApi.service.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de servicios
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los servicios que se brindarán a los usuarios que ingresen
          a la página informativa
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <ServiceClient services={services} />
      </div>
    </div>
  );
}
