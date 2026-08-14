import { locationApi } from "@/lib/api/location";
import { ProvincesClient } from "@/app/dashboard/ubicacion/components/ProvincesClient";
import { notFound } from "next/navigation";

interface ProvincesPageProps {
  params: Promise<{ countryId: string }>;
}

export default async function ProvincesPage({ params }: ProvincesPageProps) {
  const { countryId } = await params;

  try {
    const [provincesData, countryData, departmentsData] = await Promise.all([
      locationApi.provinces.getByCountry(countryId),
      locationApi.countries.getById(countryId),
      locationApi.departments.getAll(),
    ]);

    const provincesWithCount = provincesData.map((province: any) => ({
      ...province,
      Department: departmentsData.filter(
        (d: any) => d.id_province === province.id_province
      ),
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6">
            <ProvincesClient
              countryId={Number(countryId)}
              initialProvinces={provincesWithCount}
              country={countryData}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading provinces:", error);
    notFound();
  }
}
