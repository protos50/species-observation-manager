import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAutores() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
