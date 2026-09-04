import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function SkeletonCard() {
  return (
    <SkeletonTheme baseColor="rgba(255,255,255,0.04)" highlightColor="rgba(255,255,255,0.08)">
      <div className="flex flex-col rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden p-4 space-y-3 shadow-sm">
        <Skeleton height={140} borderRadius={12} />
        <div className="flex items-center gap-3 mt-2">
          <Skeleton circle width={28} height={28} />
          <div className="flex-1">
            <Skeleton height={14} width="70%" />
            <Skeleton height={10} width="40%" className="mt-1" />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}

export function SkeletonProjectList({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonSidebarList({ count = 4 }) {
  return (
    <SkeletonTheme baseColor="rgba(255,255,255,0.04)" highlightColor="rgba(255,255,255,0.08)">
      <div className="flex flex-col space-y-2 p-2 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} height={28} borderRadius={8} />
        ))}
      </div>
    </SkeletonTheme>
  );
}
