export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`shimmer rounded ${className || ""}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-xl space-y-3" style={{ background: "var(--color-skeleton)", borderColor: "var(--color-skeleton)" }}>
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3 rounded" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
