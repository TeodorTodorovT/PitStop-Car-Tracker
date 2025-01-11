import Skeleton from "../ui/Skeleton";

const CarSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-48" />
      </div>
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
};

export default CarSkeleton; 