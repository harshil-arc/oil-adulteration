export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          {/* Skeleton Hero Image 16:9 */}
          <div className="h-48 bg-gray-800 w-full" />
          
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-800 rounded w-3/4" />
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-800/70 rounded w-full" />
              <div className="h-3 bg-gray-800/70 rounded w-5/6" />
              <div className="h-3 bg-gray-800/70 rounded w-2/3" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800 rounded w-1/4" />
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-800">
              <div className="h-9 bg-gray-800 rounded-xl flex-1" />
              <div className="h-9 bg-gray-800 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
