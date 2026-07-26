import { Skeleton } from "@/components/ui/skeleton"

export default function BattlefieldLoading() {
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <Skeleton className="h-[65%] w-full rounded-lg md:h-[68%]" />
      <Skeleton className="min-h-0 flex-1 w-full rounded-lg" />
    </div>
  )
}
