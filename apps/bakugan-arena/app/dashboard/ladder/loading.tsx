import { Skeleton } from "@/components/ui/skeleton"

export default function LadderLoading() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}
