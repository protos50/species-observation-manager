import { locationApi } from "@/lib/api/location";
import { LocalitiesClient } from "@/app/dashboard/ubicacion/components/LocalitiesClient";
import { notFound } from "next/navigation";

interface LocalitiesPageProps {
  params: Promise<{ departmentId: string }>;
}

export default async function LocalitiesPage({ params }: LocalitiesPageProps) {
  const { departmentId } = await params;
  
  try {
    const [localitiesData, departmentData] = await Promise.all([
      locationApi.localities.getByDepartment(departmentId),
      locationApi.departments.getById(departmentId),
    ]);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6">
            <LocalitiesClient
              departmentId={Number(departmentId)}
              initialLocalities={localitiesData}
              department={departmentData}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading localities:", error);
    notFound();
  }
}

