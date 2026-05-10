import { VideoStudio } from "@/components/dashboard/video-studio"

export default function StudioPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">Integrated Studio</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Non-Destructive Editing • AI Pipeline</p>
          </div>
        </div>
      </div>

      <VideoStudio />
    </div>
  )
}

import { Icons } from "@/components/ui/icons"
