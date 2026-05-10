import { UploadCenter } from "@/components/dashboard/upload-center"

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Upload Center</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Mission Critical Ingestion</p>
      </div>
      <UploadCenter />
    </div>
  )
}
