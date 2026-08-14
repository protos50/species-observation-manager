export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-2"></div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
