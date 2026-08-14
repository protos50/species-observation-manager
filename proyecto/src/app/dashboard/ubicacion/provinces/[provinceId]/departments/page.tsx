import { locationApi } from "@/lib/api/location";
import { DepartmentsClient } from "@/app/dashboard/ubicacion/components/DepartmentsClient";
import { notFound } from "next/navigation";

interface DepartmentsPageProps {
  params: Promise<{ provinceId: string }>;
}

export default async function DepartmentsPage({ params }: DepartmentsPageProps) {
  const { provinceId } = await params;
  
  try {
    const [departmentsData, provinceData, localitiesData] = await Promise.all([
      locationApi.departments.getByProvince(provinceId),
      locationApi.provinces.getById(provinceId),
      locationApi.localities.getAll(),
    ]);

    const departmentsWithCount = departmentsData.map((department: any) => ({
      ...department,
      Locality: localitiesData.filter(
        (l: any) => l.id_department === department.id_department
      ),
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6">
            <DepartmentsClient
              provinceId={Number(provinceId)}
              initialDepartments={departmentsWithCount}
              province={provinceData}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading departments:", error);
    notFound();
  }
}

