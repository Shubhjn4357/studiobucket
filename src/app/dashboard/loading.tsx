import { VideoCardSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/skeleton-loader"

export default function Loading() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-secondary rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-secondary/50 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-secondary rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section className="space-y-4">
             <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
             <VideoCardSkeleton />
          </section>

          <section className="space-y-4">
             <div className="h-6 w-48 bg-secondary rounded animate-pulse" />
             <StatsSkeleton />
          </section>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <section className="space-y-4">
              <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
              <ListSkeleton />
           </section>
        </div>
      </div>
    </div>
  )
}
